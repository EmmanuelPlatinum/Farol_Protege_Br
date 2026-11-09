import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, LockKeyhole, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { PublicPageIntro } from "@/components/public-site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n, useTx } from "@/lib/i18n";
import { landing } from "@/lib/landing-i18n";
import { addPublicReport, submitCloudPublicReport } from "@/lib/reports-store";
import { isSupportNeed, type SupportNeed } from "@/lib/protection-types";
import { councilRegions, isLovableCloudConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/_public/report")({
  head: () => ({ meta: [{ title: "Denúncia — Farol Protege" }] }),
  component: Report,
});

function Report() {
  const { lang } = useI18n();
  const tx = useTx();
  const content = landing[lang];
  const [type, setType] = useState("0");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");
  const [supportNeed, setSupportNeed] = useState<SupportNeed>("unknown");
  const [councilRegion, setCouncilRegion] = useState("");
  const [pin, setPin] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (description.trim().length < 5) {
      toast.error(
        tx(
          "Descreva a situação com pelo menos 5 caracteres.",
          "Describe the situation using at least 5 characters.",
          "Describa la situación con al menos 5 caracteres.",
        ),
      );
      return;
    }

    if (isLovableCloudConfigured && !councilRegion) {
      toast.error(tx("Selecione a regional para encaminhar a denúncia.", "Select a region to route the report.", "Seleccione la regional para enviar la denuncia."));
      return;
    }

    try {
      const report = isLovableCloudConfigured
        ? await submitCloudPublicReport({
            councilRegion,
            type: content.types[Number(type)] ?? "Outro",
            approximateArea: place,
            description,
            supportNeed,
          })
        : addPublicReport({
            type: content.types[Number(type)] ?? "Outro",
            place,
            desc: description,
            supportNeed,
          });
      setPin("protocol" in report ? report.protocol : report.pin);
      setPlace("");
      setDescription("");
      setType("0");
      setSupportNeed("unknown");
      toast.success(
        isLovableCloudConfigured
          ? tx("Denúncia recebida na fila de triagem da regional.", "Report received in the regional triage queue.", "Denuncia recibida en la cola de triage regional.")
          : tx("Protocolo de demonstração criado neste navegador.", "Demo protocol created in this browser.", "Protocolo de demostración creado en este navegador."),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tx("Não foi possível enviar a denúncia.", "Could not submit report.", "No se pudo enviar la denuncia."));
    }
  };

  return (
    <>
      <PublicPageIntro
        eyebrow={tx("CANAL DE PROTEÇÃO", "PROTECTION CHANNEL", "CANAL DE PROTECCIÓN")}
        title={content.formTitle}
        description={content.formSub}
      />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)] md:px-6 md:py-14">
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>
                {isLovableCloudConfigured
                  ? tx("Denúncia cidadã", "Citizen report", "Denuncia ciudadana")
                  : tx("Formulário demonstrativo", "Demonstration form", "Formulario demostrativo")}
              </CardTitle>
              <Badge variant="outline">Sem envio ao Conselho</Badge>
            </div>
            <CardDescription>
              {tx(
                isLovableCloudConfigured
                  ? "A denúncia será encaminhada à fila restrita da regional selecionada. Não informe nomes, documentos ou dados clínicos desnecessários."
                  : "Este protótipo salva o exemplo apenas neste navegador. Não use para registrar uma denúncia real.",
                isLovableCloudConfigured
                  ? "The report will be sent to the restricted queue for the selected region. Do not include names, IDs, or unnecessary clinical data."
                  : "This prototype stores the example only in this browser. Do not use it to submit a real report.",
                isLovableCloudConfigured
                  ? "La denuncia se enviará a la cola restringida de la regional seleccionada. No incluya nombres, documentos ni datos clínicos innecesarios."
                  : "Este prototipo guarda el ejemplo solo en este navegador. No lo use para una denuncia real.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">{content.fType}</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {content.types.map((item, index) => (
                      <SelectItem key={item} value={String(index)}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-place">{content.fPlace}</Label>
                <Input
                  id="report-place"
                  value={place}
                  onChange={(event) => setPlace(event.target.value)}
                  placeholder={tx(
                    "Informe apenas uma região aproximada",
                    "Provide only an approximate area",
                    "Indique solo una zona aproximada",
                  )}
                />
              </div>
              {isLovableCloudConfigured && (
                <div className="space-y-2">
                  <Label htmlFor="report-region">{tx("Regional do Conselho Tutelar responsável", "Responsible Child Protection Council region", "Regional responsable del Consejo Tutelar")}</Label>
                  <Select value={councilRegion} onValueChange={setCouncilRegion}>
                    <SelectTrigger id="report-region">
                      <SelectValue placeholder={tx("Selecione a regional de Cuiabá", "Select a Cuiabá region", "Seleccione una regional de Cuiabá")} />
                    </SelectTrigger>
                    <SelectContent>
                      {councilRegions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>{region.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="report-support-need">
                  {tx(
                    "Criança possui laudo/suspeita de TEA ou deficiência física, intelectual ou sensorial?",
                    "Does the child have a diagnosis/suspected autism or physical, intellectual, or sensory disability?",
                    "¿El niño tiene diagnóstico/sospecha de autismo o discapacidad física, intelectual o sensorial?",
                  )}
                </Label>
                <Select
                  value={supportNeed}
                  onValueChange={(value) => {
                    if (isSupportNeed(value)) setSupportNeed(value);
                  }}
                >
                  <SelectTrigger id="report-support-need">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">
                      {tx("Sim, há laudo", "Yes, diagnosed", "Sí, con diagnóstico")}
                    </SelectItem>
                    <SelectItem value="suspected">
                      {tx("Há suspeita, sem laudo", "Suspected, no diagnosis", "Hay sospecha, sin diagnóstico")}
                    </SelectItem>
                    <SelectItem value="none">{tx("Não", "No", "No")}</SelectItem>
                    <SelectItem value="unknown">
                      {tx("Não informado", "Not informed", "No informado")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {tx(
                    "Não inclua detalhes do laudo neste formulário demonstrativo.",
                    "Do not include diagnosis details in this demonstration form.",
                    "No incluya detalles del diagnóstico en este formulario demostrativo.",
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-description">{content.fDesc}</Label>
                <Textarea
                  id="report-description"
                  rows={6}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={content.fDescPh}
                  required
                  minLength={5}
                />
              </div>
              <Button type="submit" className="w-full">
                {content.send}
              </Button>
            </form>
            {pin && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4"
              >
                <p className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="size-5 text-primary" />
                  {tx(
                    "Protocolo de demonstração",
                    "Demonstration protocol",
                    "Protocolo de demostración",
                  )}
                </p>
                <p className="mt-2 font-mono text-2xl font-bold">{pin}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {tx(
                    "O protocolo está somente neste navegador. Não foi enviado nem recebido por uma equipe.",
                    "This protocol exists only in this browser. It was not sent to or received by a team.",
                    "Este protocolo existe solo en este navegador. No fue enviado ni recibido por un equipo.",
                  )}
                </p>
                <Button asChild variant="link" className="mt-2 h-auto p-0">
                  <Link to="/tracking">
                    {tx("Ir para acompanhar PIN", "Go to PIN tracking", "Consultar PIN")}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="h-fit border-amber-500/30 bg-amber-500/5 shadow-none">
          <CardContent className="p-5">
            <ShieldAlert className="size-6 text-amber-600" />
            <h2 className="mt-3 font-semibold">{tx("Importante", "Important", "Importante")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tx(
                "Este formulário é uma demonstração de interface, não um canal oficial. Para uma situação real, procure diretamente o Conselho Tutelar ou os serviços oficiais de emergência da sua região.",
                "This form is a UI demonstration, not an official reporting channel. For a real situation, contact your local Child Protection Council or official emergency services directly.",
                "Este formulario es una demostración, no un canal oficial. Para una situación real, contacte directamente con el Consejo Tutelar o los servicios oficiales de emergencia.",
              )}
            </p>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <LockKeyhole className="size-4" />
              {tx(
                "O indicador de TEA/deficiência fica salvo apenas neste navegador. Não inclua nomes nem detalhes clínicos no relato.",
                "The autism/disability indicator is stored only in this browser. Do not include names or clinical details in the report.",
                "El indicador de autismo/discapacidad se guarda solo en este navegador. No incluya nombres ni detalles clínicos en el relato.",
              )}
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
