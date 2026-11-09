import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, FileCheck2, Gavel, Plus, Scale } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DemoVerificationQr } from "@/components/demo-verification-qr";
import {
  addOfficialCommunication,
  createOfficialCommunicationDraft,
  type Case,
  type OfficialActType,
} from "@/lib/cases-store";
import { useGovtechProfile } from "@/lib/govtech-profile";
import { useTx } from "@/lib/i18n";

const actTypes: OfficialActType[] = [
  "Ofício Enviado ao MP",
  "Decisão Liminar Recebida da Vara da Infância",
  "Audiência Concentrada Agendada",
];
const defaultActType: OfficialActType = "Ofício Enviado ao MP";

function localDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function InterinstitutionalCommunications({ caseRecord }: { caseRecord: Case }) {
  const tx = useTx();
  const { profile, isReadOnly } = useGovtechProfile();
  const [actType, setActType] = useState<OfficialActType>(defaultActType);
  const [date, setDate] = useState(localDateKey);
  const [protocol, setProtocol] = useState("");
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [dispatchType, setDispatchType] = useState<OfficialActType>("Despacho (simulação)");
  const [busy, setBusy] = useState(false);
  const communications = [...(caseRecord.officialCommunications ?? [])].reverse();
  const actor = profile;
  const actorLabel =
    profile === "prosecutor"
      ? tx("Promotoria da Infância (MP)", "Children's Prosecutor (MP)", "Fiscalía de Infancia (MP)")
      : profile === "juvenile_court"
        ? tx("Juizado da Infância", "Juvenile Court", "Juzgado de Infancia")
        : tx("Conselheiro Tutelar", "Child Protection Counselor", "Consejero Tutelar");

  const saveRecord = async (type: OfficialActType) => {
    if (!date) {
      toast.error(tx("Informe a data do ato.", "Enter the act date.", "Indique la fecha del acto."));
      return false;
    }
    try {
      const draft = createOfficialCommunicationDraft(type, actor, date, protocol);
      if (!await addOfficialCommunication(caseRecord.id, draft)) {
        toast.error(tx("Caso não encontrado; registro não salvo.", "Case not found; record not saved.", "Caso no encontrado; registro no guardado."));
        return false;
      }
      setProtocol("");
      setDate(localDateKey());
      toast.success(
        tx(
          "Registro demonstrativo salvo. Não foi enviado ao MP ou ao Judiciário.",
          "Demo record saved. It was not sent to the prosecutor or court.",
          "Registro de demostración guardado. No se envió a fiscalía ni al juzgado.",
        ),
      );
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : tx("Falha ao gerar a chave de validação.", "Could not generate the validation key.", "No se pudo generar la clave de validación."),
      );
      return false;
    }
  };

  const issueSimulatedDispatch = async () => {
    setBusy(true);
    if (await saveRecord(dispatchType)) {
      setDispatchOpen(false);
    }
    setBusy(false);
  };

  return (
    <Card className="mt-6 shadow-card">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 aria-hidden="true" className="size-5 text-primary" />
              {tx(
                "Comunicação Oficial com Judiciário e MP",
                "Official Communications with Courts and Prosecutor",
                "Comunicación Oficial con Juzgado y Fiscalía",
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {tx("Linha do tempo de atos e protocolos informados pela equipe.", "Timeline of acts and protocols entered by staff.", "Historial de actos y protocolos registrados por el equipo.")}
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400">
            {tx("Demonstração · sem integração oficial", "Demo · no official integration", "Demostración · sin integración oficial")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div role="note" className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p>
            {tx(
              "Ambiente de demonstração local. Os registros e QR codes não são protocolos oficiais, não são enviados a órgãos e não comprovam autenticidade ou decisão judicial.",
              "Local demo environment. Records and QR codes are not official protocols, are not sent to institutions, and do not prove authenticity or a court decision.",
              "Entorno de demostración local. Los registros y códigos QR no son protocolos oficiales, no se envían a instituciones y no prueban autenticidad ni decisión judicial.",
            )}
          </p>
        </div>

        {isReadOnly ? (
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              {profile === "prosecutor" ? <Scale className="mt-0.5 size-4 text-primary" /> : <Gavel className="mt-0.5 size-4 text-primary" />}
              <div>
                <p className="font-medium">{actorLabel} · {tx("visualização somente leitura", "read-only view", "vista de solo lectura")}</p>
                <p className="text-xs text-muted-foreground">{tx("O botão abaixo apenas registra uma simulação local sem efeito jurídico.", "The button below only records a local simulation with no legal effect.", "El botón solo registra una simulación local sin efecto jurídico.")}</p>
              </div>
            </div>
            <Button type="button" onClick={() => setDispatchOpen(true)} className="shrink-0">
              {tx("Emitir Despacho / Deferir Medida de Urgência", "Issue Dispatch / Grant Urgent Measure", "Emitir Despacho / Conceder Medida Urgente")}
            </Button>
          </div>
        ) : (
          <form
            className="grid gap-3 rounded-lg border p-4 md:grid-cols-2"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!busy && await saveRecord(actType)) setActType(defaultActType);
            }}
          >
            <div className="md:col-span-2">
              <p className="font-medium">{tx("Registrar ato informado", "Record a reported act", "Registrar acto informado")}</p>
              <p className="text-xs text-muted-foreground">{tx("Informe o protocolo recebido do canal institucional. Se não houver, será criado um código DEMO.", "Enter the protocol received from the institution. If unavailable, a DEMO code will be created.", "Indique el protocolo recibido de la institución. Si no existe, se creará un código DEMO.")}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`act-type-${caseRecord.id}`}>{tx("Tipo de despacho", "Act type", "Tipo de acto")}</Label>
              <Select value={actType} onValueChange={(value) => {
                if (actTypes.includes(value as OfficialActType)) setActType(value as OfficialActType);
              }}>
                <SelectTrigger id={`act-type-${caseRecord.id}`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {actTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`act-date-${caseRecord.id}`}>{tx("Data do ato", "Act date", "Fecha del acto")}</Label>
              <Input id={`act-date-${caseRecord.id}`} type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor={`act-protocol-${caseRecord.id}`}>{tx("Protocolo institucional (se recebido)", "Institutional protocol (if received)", "Protocolo institucional (si se recibió)")}</Label>
              <Input
                id={`act-protocol-${caseRecord.id}`}
                value={protocol}
                onChange={(event) => setProtocol(event.target.value)}
                placeholder="Ex.: DEMO-ECA-2026/00000001"
                maxLength={100}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={busy} className="gap-2">
                <Plus aria-hidden="true" className="size-4" />
                {tx("Registrar despacho", "Record act", "Registrar acto")}
              </Button>
            </div>
          </form>
        )}

        <ol className="space-y-3">
          {communications.length === 0 ? (
            <li className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              {tx("Nenhum ato registrado nesta demonstração.", "No acts recorded in this demo.", "No hay actos registrados en esta demostración.")}
            </li>
          ) : communications.map((communication) => (
            <li key={communication.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{communication.type}</p>
                  <Badge variant="outline">{tx("DEMO · não oficial", "DEMO · not official", "DEMO · no oficial")}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{communication.date} · {communication.protocol}</p>
                <p className="mt-1 break-all font-mono text-xs">{tx("Chave de demonstração:", "Demo key:", "Clave de demostración:")} {communication.verificationKey}</p>
              </div>
              <DemoVerificationQr verificationKey={communication.verificationKey} />
            </li>
          ))}
        </ol>
      </CardContent>

      <Dialog open={dispatchOpen} onOpenChange={setDispatchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{tx("Registrar despacho simulado", "Record simulated dispatch", "Registrar despacho simulado")}</DialogTitle>
            <DialogDescription>
              {tx(
                "Esta ação não emite despacho, não defere medida e não substitui ato assinado por autoridade competente. Ela apenas registra um evento local de demonstração.",
                "This action does not issue a dispatch, grant a measure, or replace an act signed by a competent authority. It only records a local demo event.",
                "Esta acción no emite despacho, no concede medidas ni sustituye un acto firmado por autoridad competente. Solo registra un evento local de demostración.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor={`sim-dispatch-type-${caseRecord.id}`}>{tx("Ação demonstrativa", "Demo action", "Acción de demostración")}</Label>
            <Select value={dispatchType} onValueChange={(value) => {
              if (value === "Despacho (simulação)" || value === "Deferimento de medida de urgência (simulação)") {
                setDispatchType(value);
              }
            }}>
              <SelectTrigger id={`sim-dispatch-type-${caseRecord.id}`}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Despacho (simulação)">Despacho (simulação)</SelectItem>
                <SelectItem value="Deferimento de medida de urgência (simulação)">Deferimento de medida de urgência (simulação)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDispatchOpen(false)}>{tx("Cancelar", "Cancel", "Cancelar")}</Button>
            <Button type="button" onClick={() => void issueSimulatedDispatch()} disabled={busy}>{tx("Confirmar simulação", "Confirm simulation", "Confirmar simulación")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
