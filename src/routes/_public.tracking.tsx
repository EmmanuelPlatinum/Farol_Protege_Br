import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PublicPageIntro } from "@/components/public-site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTx } from "@/lib/i18n";
import { findPublicReportByPin, getCloudPublicReportStatus, type PublicReport } from "@/lib/reports-store";
import { isLovableCloudConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/_public/tracking")({
  head: () => ({ meta: [{ title: "Acompanhar protocolo — Farol Infantil" }] }),
  component: Tracking,
});

function Tracking() {
  const tx = useTx();
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<PublicReport | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const search = async (value = pin) => {
    if (!value.trim()) {
      toast.error(
        tx(
          "Digite o código do protocolo.",
          "Enter the protocol code.",
          "Ingrese el código del protocolo.",
        ),
      );
      return;
    }
    setSearching(true);
    try {
      const report = isLovableCloudConfigured
        ? await getCloudPublicReportStatus(value)
        : findPublicReportByPin(value);
      setResult(report);
      setSearched(true);
      if (!report)
        toast.error(
          isLovableCloudConfigured
            ? tx("Protocolo não localizado.", "Protocol not found.", "Protocolo no encontrado.")
            : tx("Protocolo não localizado neste exemplo.", "Protocol not found in this demo.", "Protocolo no encontrado en este ejemplo."),
        );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tx("Não foi possível consultar o protocolo.", "Could not look up the protocol.", "No se pudo consultar el protocolo."));
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <PublicPageIntro
        eyebrow={tx("CONSULTA DE PROTOCOLO", "PROTOCOL TRACKING", "CONSULTA DE PROTOCOLO")}
        title={tx("Acompanhe um protocolo", "Track a protocol", "Consulte un protocolo")}
        description={tx(
          isLovableCloudConfigured
            ? "Informe o protocolo recebido ao enviar a denúncia. A consulta exibe apenas o status, sem revelar o conteúdo ou dados pessoais."
            : "Informe o PIN gerado ao registrar o relato. A consulta demonstra apenas o fluxo local de interface.",
          isLovableCloudConfigured
            ? "Enter the protocol received when submitting the report. Only its status is shown; report content and personal data remain private."
            : "Enter the PIN generated when the report was filed. This page demonstrates a local UI flow only.",
          isLovableCloudConfigured
            ? "Ingrese el protocolo recibido al enviar la denuncia. Solo se muestra el estado, sin revelar el contenido ni datos personales."
            : "Ingrese el PIN generado al registrar el relato. Esta consulta solo demuestra un flujo local.",
        )}
      />
      <section className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="size-5 text-primary" />
              {tx("Consultar com PIN", "Look up by PIN", "Consultar con PIN")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void search();
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Input
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder={isLovableCloudConfigured ? "DEN-2026-..." : "#PROT-8921"}
                aria-label={tx("Código PIN", "PIN code", "Código PIN")}
                className="font-mono"
              />
              <Button type="submit" disabled={searching}>
                <Search className="mr-2 size-4" />
                {searching ? tx("Consultando…", "Searching…", "Consultando…") : tx("Consultar", "Search", "Consultar")}
              </Button>
            </form>
            {!isLovableCloudConfigured && <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>
                {tx("Exemplos de demonstração:", "Demo examples:", "Ejemplos de demostración:")}
              </span>
              {["#PROT-8921", "#PROT-1042", "#PROT-3388"].map((example) => (
                <Button
                  key={example}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 font-mono text-xs"
                  onClick={() => {
                    setPin(example);
                    void search(example);
                  }}
                >
                  {example}
                </Button>
              ))}
            </div>}
            {searched && (
              <div className="mt-6 border-t pt-5">
                {result ? (
                  <div className="rounded-xl border bg-muted/20 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {isLovableCloudConfigured ? tx("Protocolo", "Protocol", "Protocolo") : tx("Protocolo demonstrativo", "Demo protocol", "Protocolo demostrativo")}
                        </p>
                        <p className="mt-1 font-mono text-xl font-bold">{result.pin}</p>
                      </div>
                      <Badge variant="outline">{result.statusLabel}</Badge>
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-primary" />
                      {tx(
                        "A consulta pública exibe apenas um estado geral. Detalhes do atendimento permanecem sigilosos.",
                        "The public lookup shows only a general status. Case details remain confidential.",
                        "La consulta pública solo muestra un estado general. Los detalles permanecen confidenciales.",
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
                    <p className="flex items-center gap-2 font-semibold">
                      <ShieldAlert className="size-4 text-amber-600" />
                      {tx(
                        "Protocolo não localizado",
                        "Protocol not found",
                        "Protocolo no encontrado",
                      )}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {tx(
                        "Verifique o PIN ou utilize um dos exemplos. Esta página não consulta um sistema oficial.",
                        "Check the PIN or use a demo example. This page does not query an official system.",
                        "Verifique el PIN o utilice un ejemplo. Esta página no consulta un sistema oficial.",
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          {tx(
            "Os dados exibidos são exemplos locais; não representam o andamento de um atendimento real.",
            "Displayed data is local demo content and does not represent a real case.",
            "Los datos son ejemplos locales y no representan un caso real.",
          )}
        </p>
      </section>
    </>
  );
}
