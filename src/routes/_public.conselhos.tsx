import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Building2,
  Clock3,
  Copy,
  Crosshair,
  HeartHandshake,
  MapPin,
  Navigation,
  Phone,
  Scale,
  Search,
  School,
  Stethoscope,
} from "lucide-react";
import { PublicPageIntro } from "@/components/public-site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTx } from "@/lib/i18n";
import { councils } from "@/lib/cuiaba-councils";

const CitizenCouncilMap = lazy(() => import("@/components/citizen-council-map"));

const supportPoints = [
  {
    name: "CAPSi",
    icon: HeartHandshake,
    mapQuery: "CAPSi Cuiabá MT",
    description: [
      "Centro de Atenção Psicossocial Infantil. Apoio psicossocial em saúde mental para crianças e adolescentes.",
      "Child and Adolescent Psychosocial Care Center. Mental health support for children and adolescents.",
      "Centro de Atención Psicosocial Infantil. Apoyo en salud mental para niños y adolescentes.",
    ],
  },
  {
    name: "CER II / CER IV",
    icon: Stethoscope,
    mapQuery: "Centro Especializado em Reabilitação Cuiabá MT",
    description: [
      "Centros Especializados em Reabilitação. Consulte a unidade e as modalidades de reabilitação disponíveis.",
      "Specialized Rehabilitation Centers. Check the unit and available rehabilitation services.",
      "Centros Especializados en Rehabilitación. Consulte la unidad y los servicios disponibles.",
    ],
  },
  {
    name: "APAE Cuiabá",
    icon: Building2,
    mapQuery: "APAE Cuiabá MT",
    description: [
      "Associação de Pais e Amigos dos Excepcionais. Consulte diretamente os serviços e critérios de atendimento.",
      "Association of Parents and Friends of People with Disabilities. Check services and eligibility directly.",
      "Asociación de Padres y Amigos de Personas con Discapacidad. Consulte servicios y criterios directamente.",
    ],
  },
  {
    name: "Defensoria Pública — Defesa da Criança",
    icon: Scale,
    mapQuery: "Defensoria Pública Núcleo Defesa Criança Cuiabá MT",
    description: [
      "Orientação e defesa de direitos de crianças e adolescentes. Confirme o núcleo responsável e os canais oficiais.",
      "Legal guidance and rights protection for children and adolescents. Confirm the responsible office and official channels.",
      "Orientación y defensa de los derechos de niños y adolescentes. Confirme la unidad responsable y los canales oficiales.",
    ],
  },
] as const;

export const Route = createFileRoute("/_public/conselhos")({
  head: () => ({
    meta: [
      { title: "Encontre seu Conselho Tutelar em Cuiabá — Farol Protege" },
      {
        name: "description",
        content: "Consulte referências demonstrativas das regiões dos Conselhos Tutelares de Cuiabá.",
      },
      { property: "og:title", content: "Encontre seu Conselho Tutelar em Cuiabá — Farol Protege" },
      {
        property: "og:description",
        content: "Consulte referências demonstrativas das regiões dos Conselhos Tutelares de Cuiabá.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConselhosPage,
});

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const haversine =
    Math.sin(radians(lat2 - lat1) / 2) ** 2 +
    Math.cos(radians(lat1)) *
      Math.cos(radians(lat2)) *
      Math.sin(radians(lon2 - lon1) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(haversine));
}

function getPhoneHref(phone?: string) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (digits.length === 10 || digits.length === 11) return `tel:${digits}`;
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    return `tel:+${digits}`;
  }
  return undefined;
}

function ConselhosPage() {
  const tx = useTx();
  const [selected, setSelected] = useState(councils[0]!.id);
  const [query, setQuery] = useState("");
  const council = councils.find((item) => item.id === selected) ?? councils[0]!;
  const normalizedQuery = normalize(query);

  const matches = useMemo(() => {
    if (!normalizedQuery) return councils;
    return councils.filter((item) => {
      const terms = [
        item.name,
        item.region,
        `${item.name} ${item.region}`,
        ...item.neighborhoods.map((neighborhood) => neighborhood.name),
      ];
      return terms.some((term) => normalize(term).includes(normalizedQuery));
    });
  }, [normalizedQuery]);

  const onSearch = (value: string) => {
    setQuery(value);
    const search = normalize(value);
    if (search.length < 2) return;

    const found = councils.find((item) =>
      [item.name, item.region, ...item.neighborhoods.map((neighborhood) => neighborhood.name)].some(
        (term) => normalize(term).startsWith(search),
      ),
    );
    if (found) setSelected(found.id);
  };

  const copy = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error(tx("Não foi possível copiar.", "Could not copy.", "No se pudo copiar."));
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error(
        tx(
          "Localização indisponível neste navegador.",
          "Location is unavailable in this browser.",
          "La ubicación no está disponible en este navegador.",
        ),
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const nearest = councils.reduce((closest, candidate) =>
          distanceKm(coords.latitude, coords.longitude, candidate.lat, candidate.lng) <
          distanceKm(coords.latitude, coords.longitude, closest.lat, closest.lng)
            ? candidate
            : closest,
        );
        setSelected(nearest.id);
        toast.success(
          tx(
            `Referência regional mais próxima: ${nearest.name}`,
            `Nearest regional reference: ${nearest.name}`,
            `Referencia regional más cercana: ${nearest.name}`,
          ),
        );
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? tx(
                "Permita o acesso à localização para usar este recurso.",
                "Allow location access to use this feature.",
                "Permita el acceso a la ubicación para usar esta función.",
              )
            : tx(
                "Não foi possível obter sua localização. Tente novamente.",
                "Could not get your location. Please try again.",
                "No se pudo obtener su ubicación. Inténtelo de nuevo.",
              );
        toast.error(message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const address = council.verifiedPublicAddress
    ? `${council.verifiedPublicAddress}, Cuiabá - MT`
    : undefined;
  const directionsUrl = address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
    : undefined;
  const phone = council.verifiedPublicPhone;
  const phoneHref = getPhoneHref(phone);
  const fallback = (
    <div className="h-full min-h-72 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
  );

  return (
    <>
      <PublicPageIntro
        eyebrow={tx("Atendimento ao cidadão", "Citizen services", "Atención al ciudadano")}
        title={tx(
          "Encontre seu Conselho Tutelar",
          "Find your Guardianship Council",
          "Encuentre su Consejo Tutelar",
        )}
        description={tx(
          "Consulte qual região de referência pode atender seu bairro em Cuiabá.",
          "Check which reference region may serve your neighborhood in Cuiabá.",
          "Consulte qué región de referencia puede atender su barrio en Cuiabá.",
        )}
      />

      <section
        className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6"
        aria-label={tx("Localizador dos Conselhos Tutelares", "Guardianship Council locator", "Localizador de los Consejos Tutelares")}
      >
        <Tabs defaultValue="councils" className="space-y-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="councils">
              {tx("Conselhos Tutelares", "Guardianship Councils", "Consejos Tutelares")}
            </TabsTrigger>
            <TabsTrigger value="inclusion">
              {tx("Rede TEA & Inclusão PCD", "Autism & Disability Support Network", "Red de apoyo para autismo y discapacidad")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="councils" className="space-y-6">
        <div
          role="note"
          className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400" />
          <p className="text-muted-foreground">
            {tx(
              "Informações demonstrativas: os pontos do mapa são referências aproximadas, não endereços das unidades. Bairros, endereços e telefones oficiais ainda precisam ser confirmados. Não se desloque com base neste mapa.",
              "Demonstration information: map points are approximate references, not unit addresses. Official neighborhoods, addresses, and phone numbers still need confirmation. Do not travel based on this map.",
              "Información demostrativa: los puntos del mapa son referencias aproximadas, no direcciones de las unidades. Los barrios, direcciones y teléfonos oficiales aún deben confirmarse. No se desplace basándose en este mapa.",
            )}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden="true"
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => onSearch(event.target.value)}
              className="h-11 pl-9"
              aria-label={tx("Buscar bairro em Cuiabá", "Search neighborhood in Cuiabá", "Buscar barrio en Cuiabá")}
              placeholder={tx(
                "Digite seu bairro em Cuiabá (ex: CPA, Pedra 90, Tijucal, Dom Aquino...)",
                "Type your neighborhood in Cuiabá (e.g. CPA, Pedra 90, Tijucal, Dom Aquino...)",
                "Escriba su barrio en Cuiabá (ej.: CPA, Pedra 90, Tijucal, Dom Aquino...)",
              )}
            />
          </div>
          <Button onClick={locate} variant="outline" className="h-11 shrink-0">
            <Crosshair aria-hidden="true" className="mr-2 size-4" />
            {tx("Usar minha localização", "Use my location", "Usar mi ubicación")}
          </Button>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(300px,360px)]">
          <div>
            <h2 className="mb-3 text-sm font-semibold">
              {tx("Regiões de referência", "Reference regions", "Regiones de referencia")}
            </h2>
            <ul className="space-y-2" aria-label={tx("Seis Conselhos Regionais", "Six Regional Councils", "Seis Consejos Regionales")}>
              {matches.length === 0 && (
                <li className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  {tx(
                    "Nenhuma região de referência encontrada para essa busca.",
                    "No reference region found for this search.",
                    "No se encontró una región de referencia para esta búsqueda.",
                  )}
                </li>
              )}
              {matches.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item.id)}
                    aria-pressed={selected === item.id}
                    className={`w-full rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selected === item.id
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="flex items-start gap-2">
                      <MapPin
                        aria-hidden="true"
                        className={`mt-0.5 size-4 shrink-0 ${
                          selected === item.id ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                      <span>
                        <span className="block text-sm font-semibold">
                          {councils.findIndex((candidate) => candidate.id === item.id) + 1}ª{" "}
                          {item.name.replace(/^\d+ª?\s*(Região\s*[—-]\s*)?/i, "")}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {item.region}
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold">
              {tx("Mapa de referências aproximadas", "Approximate reference map", "Mapa de referencias aproximadas")}
            </h2>
            <Card className="h-[360px] p-2 sm:h-[440px] lg:h-[520px]">
              <ClientOnly fallback={fallback}>
                <Suspense fallback={fallback}>
                  <CitizenCouncilMap selected={selected} onSelect={setSelected} />
                </Suspense>
              </ClientOnly>
            </Card>
          </div>

          <Card aria-live="polite">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin aria-hidden="true" className="size-5 shrink-0 text-primary" />
                {council.name}
              </CardTitle>
              <CardDescription>{council.region}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <section aria-labelledby="council-address">
                <h3 id="council-address" className="text-sm font-semibold">
                  {tx("Endereço da unidade", "Unit address", "Dirección de la unidad")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {address ??
                    tx(
                      "Endereço oficial ainda não informado.",
                      "Official address not yet provided.",
                      "Dirección oficial aún no informada.",
                    )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      address &&
                      copy(address, tx("Endereço copiado!", "Address copied!", "¡Dirección copiada!"))
                    }
                    disabled={!address}
                  >
                    <Copy aria-hidden="true" className="mr-1.5 size-4" />
                    {tx("Copiar Endereço", "Copy Address", "Copiar Dirección")}
                  </Button>
                  {directionsUrl ? (
                    <Button size="sm" asChild>
                      <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                        <Navigation aria-hidden="true" className="mr-1.5 size-4" />
                        {tx("Como Chegar", "Directions", "Cómo llegar")}
                      </a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      <Navigation aria-hidden="true" className="mr-1.5 size-4" />
                      {tx("Como Chegar", "Directions", "Cómo llegar")}
                    </Button>
                  )}
                </div>
              </section>

              <section aria-labelledby="council-contact" className="rounded-xl border p-3">
                <h3 id="council-contact" className="flex items-center gap-2 text-sm font-semibold">
                  <Phone aria-hidden="true" className="size-4" />
                  {tx("Telefone / contato", "Phone / contact", "Teléfono / contacto")}
                </h3>
                {phoneHref && phone ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copy(
                          phone,
                          tx("Número copiado!", "Number copied!", "¡Número copiado!"),
                        )
                      }
                    >
                      <Copy aria-hidden="true" className="mr-1.5 size-4" />
                      {tx("Copiar Número", "Copy Number", "Copiar número")}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={phoneHref}>
                        <Phone aria-hidden="true" className="mr-1.5 size-4" />
                        {tx("Ligar", "Call", "Llamar")}
                      </a>
                    </Button>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tx(
                        "Número oficial ainda não informado.",
                        "Official number not yet provided.",
                        "Número oficial aún no informado.",
                      )}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" disabled>
                        <Copy aria-hidden="true" className="mr-1.5 size-4" />
                        {tx("Copiar Número", "Copy Number", "Copiar número")}
                      </Button>
                      <Button size="sm" variant="outline" disabled>
                        <Phone aria-hidden="true" className="mr-1.5 size-4" />
                        {tx("Ligar", "Call", "Llamar")}
                      </Button>
                    </div>
                  </>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-primary/10 p-3">
                  <p className="min-w-0 flex-1 text-xs leading-relaxed">
                    <strong className="block">{tx("Disque 100", "Dial 100", "Disque 100")}</strong>
                    {tx(
                      "Direitos Humanos · gratuito · 24 horas",
                      "Human Rights · free · 24 hours",
                      "Derechos Humanos · gratuito · 24 horas",
                    )}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        copy("100", tx("Número copiado!", "Number copied!", "¡Número copiado!"))
                      }
                      aria-label={tx("Copiar número 100", "Copy number 100", "Copiar número 100")}
                    >
                      <Copy aria-hidden="true" className="size-4" />
                    </Button>
                    <Button size="sm" asChild>
                      <a href="tel:100">100</a>
                    </Button>
                  </div>
                </div>
              </section>

              <section aria-labelledby="council-neighborhoods">
                <h3 id="council-neighborhoods" className="mb-2 text-sm font-semibold">
                  {tx(
                    "Bairros e áreas de referência",
                    "Neighborhoods and reference areas",
                    "Barrios y áreas de referencia",
                  )}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {council.neighborhoods.map((neighborhood) => (
                    <Badge key={neighborhood.name} variant="secondary">
                      {neighborhood.name}
                    </Badge>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {tx(
                    "Lista demonstrativa; circunscrições oficiais a confirmar.",
                    "Demonstration list; official service areas to be confirmed.",
                    "Lista demostrativa; circunscripciones oficiales por confirmar.",
                  )}
                </p>
              </section>

              <div className="flex items-start gap-2 rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
                <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                <p>
                  {tx(
                    "Expediente regular informado: segunda a sexta, das 08h às 18h. Fora desse horário, procure o plantão noturno de sobreaviso.",
                    "Reported regular hours: Monday to Friday, 8am–6pm. Outside these hours, contact the night on-call service.",
                    "Horario regular informado: de lunes a viernes, de 08:00 a 18:00. Fuera de ese horario, contacte con la guardia nocturna.",
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
          </TabsContent>

          <TabsContent value="inclusion" className="space-y-6">
            <div className="max-w-3xl">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tx(
                  "Serviços de referência para crianças e adolescentes com TEA e deficiência em Cuiabá. Confirme endereço, disponibilidade, critérios de acesso e horários diretamente nos canais oficiais antes de se deslocar.",
                  "Reference services for children and adolescents with autism and disabilities in Cuiabá. Confirm address, availability, eligibility, and hours through official channels before visiting.",
                  "Servicios de referencia para niños y adolescentes con autismo y discapacidad en Cuiabá. Confirme dirección, disponibilidad, requisitos y horarios en los canales oficiales antes de acudir.",
                )}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {supportPoints.map((point) => {
                const Icon = point.icon;
                const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.mapQuery)}`;
                return (
                  <Card key={point.name} className="flex flex-col shadow-card">
                    <CardHeader>
                      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon aria-hidden="true" className="size-5" />
                      </div>
                      <CardTitle className="pt-2 text-base">{point.name}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {tx(point.description[0], point.description[1], point.description[2])}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <Button asChild size="sm" variant="outline">
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                          <MapPin aria-hidden="true" className="mr-1.5 size-4" />
                          {tx("Buscar no mapa", "Search on map", "Buscar en el mapa")}
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School aria-hidden="true" className="size-5 text-primary" />
                  {tx(
                    "Direito à educação inclusiva e ao apoio escolar",
                    "Right to inclusive education and school support",
                    "Derecho a la educación inclusiva y al apoyo escolar",
                  )}
                </CardTitle>
                <CardDescription>
                  {tx(
                    "Lei Berenice Piana (Lei 12.764/2012), Lei Brasileira de Inclusão (Lei 13.146/2015), Constituição Federal e ECA.",
                    "Berenice Piana Act (12.764/2012), Brazilian Inclusion Act (13.146/2015), Federal Constitution, and ECA.",
                    "Ley Berenice Piana (12.764/2012), Ley Brasileña de Inclusión (13.146/2015), Constitución Federal y ECA.",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed">
                <p>
                  {tx(
                    "A Constituição Federal (art. 208, III) e o ECA (art. 54, III) asseguram atendimento educacional especializado, preferencialmente na rede regular de ensino.",
                    "The Federal Constitution (Art. 208, III) and ECA (Art. 54, III) guarantee specialized educational support, preferably in regular schools.",
                    "La Constitución Federal (art. 208, III) y el ECA (art. 54, III) garantizan atención educativa especializada, preferentemente en la red regular.",
                  )}
                </p>
                <p>
                  {tx(
                    "A Lei 12.764/2012 prevê multa de 3 a 20 salários-mínimos ao gestor escolar ou autoridade competente que recusar matrícula de estudante com TEA ou qualquer outro tipo de deficiência; em caso de reincidência, pode haver perda do cargo. A Lei 13.146/2015 (LBI, art. 98, que alterou o art. 8º da Lei 7.853/1989) tipifica como crime recusar matrícula ou cobrar valor adicional em razão da deficiência, com pena de reclusão de 2 a 5 anos e multa; se a vítima for menor de 18 anos, a pena é aumentada em 1/3.",
                    "Act 12.764/2012 provides for a fine of 3 to 20 minimum wages for a school manager or authority who refuses enrollment of a student with autism or another disability; repeat offenses may result in loss of position. Act 13.146/2015 (Brazilian Inclusion Act, Art. 98, amending Art. 8 of Act 7.853/1989) makes refusing enrollment or charging extra because of disability a crime punishable by 2 to 5 years' imprisonment and a fine; if the victim is under 18, the sentence increases by one third.",
                    "La Ley 12.764/2012 prevé una multa de 3 a 20 salarios mínimos para el gestor escolar o autoridad que rechace la matrícula de un estudiante con autismo u otra discapacidad; la reincidencia puede ocasionar la pérdida del cargo. La Ley 13.146/2015 (LBI, art. 98, que modificó el art. 8 de la Ley 7.853/1989) tipifica como delito rechazar la matrícula o cobrar un importe adicional por razón de discapacidad, con pena de prisión de 2 a 5 años y multa; si la víctima es menor de 18 años, la pena aumenta en un tercio.",
                  )}
                </p>
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-muted-foreground">
                  {tx(
                    "A legislação citada não classifica esse crime como inafiançável. Cada situação depende de apuração e análise jurídica; procure a Defensoria Pública para orientação.",
                    "The cited law does not classify this crime as non-bailable. Each situation requires investigation and legal assessment; contact the Public Defender's Office for guidance.",
                    "La legislación citada no clasifica este delito como no excarcelable. Cada caso requiere investigación y análisis jurídico; consulte a la Defensoría Pública.",
                  )}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  <a
                    className="text-primary underline-offset-4 hover:underline"
                    href="https://www.planalto.gov.br/ccivil_03/leis/l12764.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx("Lei 12.764/2012", "Act 12.764/2012", "Ley 12.764/2012")}
                  </a>
                  <a
                    className="text-primary underline-offset-4 hover:underline"
                    href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx("Lei 13.146/2015 (LBI)", "Act 13.146/2015 (Brazilian Inclusion Act)", "Ley 13.146/2015 (LBI)")}
                  </a>
                  <a
                    className="text-primary underline-offset-4 hover:underline"
                    href="https://www.planalto.gov.br/ccivil_03/leis/l8069.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx("Estatuto da Criança e do Adolescente", "Child and Adolescent Statute", "Estatuto de la Niñez y Adolescencia")}
                  </a>
                </div>
                <Button asChild variant="outline">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Defensoria+P%C3%BAblica+Cuiab%C3%A1+MT"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Scale aria-hidden="true" className="mr-1.5 size-4" />
                    {tx("Localizar a Defensoria Pública", "Find the Public Defender", "Buscar la Defensoría Pública")}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}
