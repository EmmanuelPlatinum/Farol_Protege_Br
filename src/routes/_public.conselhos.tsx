import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Crosshair, MapPin, Navigation, Phone, Search, Clock } from "lucide-react";
import { PublicPageIntro } from "@/components/public-site-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTx } from "@/lib/i18n";
import { councils } from "@/lib/cuiaba-councils";

const CitizenCouncilMap = lazy(() => import("@/components/citizen-council-map"));

export const Route = createFileRoute("/_public/conselhos")({
  head: () => ({
    meta: [
      { title: "Encontre seu Conselho Tutelar em Cuiabá — Farol Protege" },
      { name: "description", content: "Localize o Conselho Tutelar que atende seu bairro em Cuiabá, copie o endereço e trace a rota." },
      { property: "og:title", content: "Encontre seu Conselho Tutelar em Cuiabá — Farol Protege" },
      { property: "og:description", content: "Localize o Conselho Tutelar que atende seu bairro em Cuiabá, copie o endereço e trace a rota." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConselhosPage,
});

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function distKm(a: number, b: number, c: number, d: number) {
  const r = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

function ConselhosPage() {
  const tx = useTx();
  const [selected, setSelected] = useState("r1");
  const [query, setQuery] = useState("");
  const council = councils.find((c) => c.id === selected)!;

  const matches = useMemo(() => {
    const q = norm(query);
    if (!q) return councils;
    return councils.filter((c) => norm(c.name).includes(q) || c.neighborhoods.some((n) => norm(n.name).includes(q)));
  }, [query]);

  const onSearch = (v: string) => {
    setQuery(v);
    const q = norm(v);
    if (!q) return;
    const hit = councils.find((c) => c.neighborhoods.some((n) => norm(n.name).includes(q)) || norm(c.name).includes(q));
    if (hit) setSelected(hit.id);
  };

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(msg);
    } catch {
      toast.error(tx("Não foi possível copiar.", "Could not copy.", "No se pudo copiar."));
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error(tx("Localização indisponível neste navegador.", "Location unavailable in this browser.", "Ubicación no disponible en este navegador."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const near = [...councils].sort(
          (a, b) => distKm(coords.latitude, coords.longitude, a.lat, a.lng) - distKm(coords.latitude, coords.longitude, b.lat, b.lng),
        )[0];
        setSelected(near.id);
        toast.success(tx(`Mais próximo: ${near.name}`, `Nearest: ${near.name}`, `Más cercano: ${near.name}`));
      },
      () => toast.error(tx("Permissão de localização negada.", "Location permission denied.", "Permiso de ubicación denegado.")),
    );
  };

  const fullAddress = `${council.address}, Cuiabá - MT`;
  const fallback = <div className="h-full w-full animate-pulse rounded-lg bg-muted" />;

  return (
    <>
      <PublicPageIntro
        eyebrow={tx("Atendimento ao cidadão", "Citizen service", "Atención al ciudadano")}
        title={tx("Encontre seu Conselho Tutelar", "Find your Guardianship Council", "Encuentre su Consejo Tutelar")}
        description={tx(
          "Descubra qual das 6 unidades regionais de Cuiabá atende o seu bairro. Endereços de demonstração.",
          "Find which of Cuiabá's 6 regional units serves your neighborhood. Demonstration addresses.",
          "Descubra cuál de las 6 unidades regionales de Cuiabá atiende su barrio. Direcciones de demostración.",
        )}
      />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => onSearch(e.target.value)}
              className="h-11 pl-9"
              aria-label={tx("Buscar bairro", "Search neighborhood", "Buscar barrio")}
              placeholder={tx(
                "Digite seu bairro em Cuiabá (ex: CPA, Pedra 90, Tijucal, Dom Aquino...)",
                "Type your neighborhood in Cuiabá (e.g. CPA, Pedra 90, Tijucal...)",
                "Escriba su barrio en Cuiabá (ej: CPA, Pedra 90, Tijucal...)",
              )}
            />
          </div>
          <Button onClick={locate} variant="outline" className="h-11">
            <Crosshair className="mr-2 size-4" />
            {tx("Usar minha localização", "Use my location", "Usar mi ubicación")}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr_360px]">
          <ul className="space-y-2" aria-label={tx("Conselhos", "Councils", "Consejos")}>
            {matches.length === 0 && (
              <li className="text-sm text-muted-foreground">{tx("Nenhum bairro encontrado.", "No neighborhood found.", "Ningún barrio encontrado.")}</li>
            )}
            {matches.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelected(c.id)}
                  aria-pressed={selected === c.id}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${selected === c.id ? "border-primary bg-primary/10" : "hover:bg-muted"}`}
                >
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.region}</p>
                </button>
              </li>
            ))}
          </ul>

          <Card className="h-[420px] p-2 lg:h-auto lg:min-h-[480px]">
            <ClientOnly fallback={fallback}>
              <Suspense fallback={fallback}>
                <CitizenCouncilMap selected={selected} onSelect={setSelected} />
              </Suspense>
            </ClientOnly>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="size-4 text-primary" />{council.name}</CardTitle>
              <CardDescription>{fullAddress}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => copy(fullAddress, tx("Endereço copiado!", "Address copied!", "¡Dirección copiada!"))}>
                  <Copy className="mr-1.5 size-4" />{tx("Copiar Endereço", "Copy Address", "Copiar Dirección")}
                </Button>
                <Button size="sm" asChild>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${council.lat},${council.lng}`} target="_blank" rel="noopener noreferrer">
                    <Navigation className="mr-1.5 size-4" />{tx("Como Chegar", "Directions", "Cómo Llegar")}
                  </a>
                </Button>
              </div>

              <div className="rounded-lg border p-3 text-sm">
                <p className="flex items-center gap-2 font-medium"><Phone className="size-4" />{tx("Telefone da unidade", "Unit phone", "Teléfono de la unidad")}</p>
                <p className="mt-1 text-muted-foreground">{tx("Número ainda não informado pelo conselho.", "Number not yet provided by the council.", "Número aún no informado por el consejo.")}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" disabled><Copy className="mr-1.5 size-4" />{tx("Copiar Número", "Copy Number", "Copiar Número")}</Button>
                  <Button size="sm" variant="outline" disabled><Phone className="mr-1.5 size-4" />{tx("Ligar", "Call", "Llamar")}</Button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 rounded-md bg-primary/10 p-2">
                  <span className="text-xs">{tx("Disque 100 — Direitos Humanos, gratuito e 24h", "Dial 100 — Human Rights, free 24h", "Disque 100 — Derechos Humanos, gratuito 24h")}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => copy("100", tx("Número copiado!", "Number copied!", "¡Número copiado!"))} aria-label={tx("Copiar Número", "Copy Number", "Copiar Número")}><Copy className="size-4" /></Button>
                    <Button size="sm" asChild><a href="tel:100">100</a></Button>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">{tx("Bairros atendidos", "Neighborhoods served", "Barrios atendidos")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {council.neighborhoods.map((n) => <Badge key={n.name} variant="secondary">{n.name}</Badge>)}
                </div>
              </div>

              <div className="flex gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                <Clock className="size-4 shrink-0 text-primary" />
                <p>{tx(
                  "Expediente regular: segunda a sexta, 08h às 18h. Fora desse horário, o atendimento é encaminhado ao plantão noturno de sobreaviso.",
                  "Regular hours: Mon–Fri, 8am–6pm. After hours, calls go to the night on-call duty.",
                  "Horario regular: lunes a viernes, 08h a 18h. Fuera de ese horario, se deriva a la guardia nocturna.",
                )}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
