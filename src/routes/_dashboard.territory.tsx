import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import { MapPin, Users, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app-header";
import { useTx } from "@/lib/i18n";
import { councils, totalCases, hotspots, type Violation } from "@/lib/cuiaba-councils";

const TerritoryMap = lazy(() => import("@/components/territory-map"));

export const Route = createFileRoute("/_dashboard/territory")({
  head: () => ({
    meta: [
      { title: "Mapa Territorial de Cuiabá — Farol Infantil" },
      { name: "description", content: "Conselhos Tutelares de Cuiabá, conselheiros e concentração de violações por bairro." },
      { property: "og:title", content: "Mapa Territorial de Cuiabá — Farol Infantil" },
      { property: "og:description", content: "Conselhos Tutelares de Cuiabá, conselheiros e concentração de violações por bairro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Territory,
});

function Territory() {
  const tx = useTx();
  const [selected, setSelected] = useState("r1");
  const council = councils.find((c) => c.id === selected)!;
  const vLabel: Record<Violation, string> = {
    neglect: tx("Negligência", "Neglect", "Negligencia"),
    dropout: tx("Evasão escolar", "School dropout", "Abandono escolar"),
    violence: tx("Violência intrafamiliar", "Domestic violence", "Violencia intrafamiliar"),
    labor: tx("Trabalho infantil", "Child labor", "Trabajo infantil"),
  };
  const fallback = <div className="h-full w-full animate-pulse rounded-lg bg-muted" />;

  return (
    <>
      <PageHeader
        title={tx("Mapa Territorial — Cuiabá", "Territorial Map — Cuiabá", "Mapa Territorial — Cuiabá")}
        subtitle={tx("Dados fictícios de demonstração.", "Fictitious demonstration data.", "Datos ficticios de demostración.")}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardContent className="h-[460px] p-2">
            <ClientOnly fallback={fallback}>
              <Suspense fallback={fallback}>
                <TerritoryMap selected={selected} onSelect={setSelected} />
              </Suspense>
            </ClientOnly>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="size-4" />{council.name}</CardTitle>
            <CardDescription>{council.address}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {tx("Plantão 24h: telefone ainda não informado", "24h duty: phone not yet provided", "Guardia 24h: teléfono aún no informado")}
            </p>
            <div>
              <p className="mb-2 flex items-center gap-2 text-sm font-medium"><Users className="size-4" />{tx("Conselheiros", "Counselors", "Consejeros")}</p>
              <ul className="space-y-2">
                {council.counselors.map((p) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {p.name.split(" ").map((w) => w[0]).join("")}
                    </div>
                    <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.shift}</p></div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">{tx("Bairros atendidos", "Neighborhoods", "Barrios")} · {totalCases(council)}</p>
              <ul className="space-y-1 text-sm">
                {council.neighborhoods.map((n) => (
                  <li key={n.name} className="flex justify-between gap-2">
                    <span>{n.name}</span><span className="text-muted-foreground">{n.cases} · {vLabel[n.main]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="mt-6 shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="size-4 text-destructive" />{tx("Pontos cegos", "Blind spots", "Puntos ciegos")}</CardTitle>
          <CardDescription>{tx("Bairros com 15 casos ou mais.", "Neighborhoods with 15+ cases.", "Barrios con 15 casos o más.")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hotspots().map((h) => (
            <div key={h.name} className="rounded-lg border p-4">
              <div className="flex items-center justify-between"><p className="font-medium">{h.name}</p><Badge variant="danger">{h.cases}</Badge></div>
              <p className="text-xs text-muted-foreground">{h.council}</p>
              <p className="mt-1 text-sm">{vLabel[h.main]}</p>
              <Button size="sm" variant="outline" className="mt-3 w-full"
                onClick={() => toast.success(tx(`Ação preventiva planejada em ${h.name} com escolas e CRAS.`, `Preventive action planned in ${h.name}.`, `Acción preventiva planificada en ${h.name}.`))}>
                {tx("Planejar Ação Preventiva", "Plan Preventive Action", "Planificar Acción Preventiva")}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
