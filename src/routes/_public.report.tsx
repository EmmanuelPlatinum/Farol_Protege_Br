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
import { addPublicReport } from "@/lib/reports-store";

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
  const [pin, setPin] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
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

    const report = addPublicReport({
      type: content.types[Number(type)] ?? "Outro",
      place,
      desc: description,
    });
    setPin(report.pin);
    setPlace("");
    setDescription("");
    setType("0");
    toast.success(
      tx(
        "Protocolo de demonstração criado neste navegador.",
        "Demo protocol created in this browser.",
        "Protocolo de demostración creado en este navegador.",
      ),
    );
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
                {tx("Formulário demonstrativo", "Demonstration form", "Formulario demostrativo")}
              </CardTitle>
              <Badge variant="outline">Sem envio ao Conselho</Badge>
            </div>
            <CardDescription>
              {tx(
                "Este protótipo salva o exemplo apenas neste navegador. Não use para registrar uma denúncia real.",
                "This prototype stores the example only in this browser. Do not use it to submit a real report.",
                "Este prototipo guarda el ejemplo solo en este navegador. No lo use para una denuncia real.",
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
                "Não informe nomes completos ou dados sensíveis neste protótipo.",
                "Do not enter full names or sensitive information in this prototype.",
                "No incluya nombres completos ni datos sensibles en este prototipo.",
              )}
            </p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
