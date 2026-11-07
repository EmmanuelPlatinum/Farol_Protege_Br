import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Info, ShieldCheck } from "lucide-react";
import { PublicPageIntro } from "@/components/public-site-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTx } from "@/lib/i18n";
import { usePublicReports } from "@/lib/reports-store";

export const Route = createFileRoute("/_public/transparency")({
  head: () => ({ meta: [{ title: "Transparência — Farol Protege" }] }),
  component: Transparency,
});

function Transparency() {
  const tx = useTx();
  const reports = usePublicReports();
  const byStatus = reports.reduce<Record<string, number>>((summary, report) => {
    summary[report.statusLabel] = (summary[report.statusLabel] ?? 0) + 1;
    return summary;
  }, {});

  return (
    <>
      <PublicPageIntro
        eyebrow={tx("DADOS AGREGADOS", "AGGREGATE DATA", "DATOS AGREGADOS")}
        title={tx("Transparência", "Transparency", "Transparencia")}
        description={tx(
          "Uma visão agregada e sem identificadores pessoais. Neste protótipo, os números são exemplos locais, não estatísticas oficiais.",
          "An aggregate view with no personal identifiers. In this prototype, figures are local examples, not official statistics.",
          "Vista agregada sin identificadores personales. En este prototipo, las cifras son ejemplos locales, no estadísticas oficiales.",
        )}
      />
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <Card className="mb-5 border-sky-500/30 bg-sky-500/5 shadow-none">
          <CardContent className="flex gap-3 p-4">
            <Info className="mt-0.5 size-5 shrink-0 text-sky-600" />
            <p className="text-sm text-muted-foreground">
              {tx(
                "Não há integração com sistemas municipais nem publicação de dados oficiais nesta demonstração. Não utilize estes valores para prestação de contas.",
                "This demo is not connected to municipal systems and does not publish official data. Do not use these figures for formal reporting.",
                "Esta demostración no está conectada con sistemas municipales ni publica datos oficiales. No use estas cifras para rendición de cuentas.",
              )}
            </p>
          </CardContent>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                {tx("Protocolos de exemplo", "Demo protocols", "Protocolos de ejemplo")}
              </p>
              <p className="mt-2 text-3xl font-bold">{reports.length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">
                {tx("Status demonstrados", "Demo statuses", "Estados demostrados")}
              </p>
              <p className="mt-2 text-3xl font-bold">{Object.keys(byStatus).length}</p>
            </CardContent>
          </Card>
          <Card className="shadow-card sm:col-span-2">
            <CardContent className="flex items-center gap-3 p-5">
              <ShieldCheck className="size-6 text-primary" />
              <p className="text-sm text-muted-foreground">
                {tx(
                  "Nenhum PIN, endereço ou identificação de família é publicado nesta visão.",
                  "No PIN, address or family identity is published in this view.",
                  "No se publica ningún PIN, dirección ni identidad familiar en esta vista.",
                )}
              </p>
            </CardContent>
          </Card>
        </div>
        <Card className="mt-5 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="size-5 text-primary" />
              {tx(
                "Distribuição ilustrativa por status",
                "Illustrative distribution by status",
                "Distribución ilustrativa por estado",
              )}
            </CardTitle>
            <CardDescription>
              {tx(
                "Contagem derivada exclusivamente dos dados fictícios pré-carregados neste navegador.",
                "Count based only on fictional sample data preloaded in this browser.",
                "Recuento basado únicamente en datos ficticios precargados en este navegador.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {Object.entries(byStatus).map(([label, count]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{label}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
