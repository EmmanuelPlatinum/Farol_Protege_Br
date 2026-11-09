import { useState } from "react";
import { Download, FileLock2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuditEvents, type AuditEvent } from "@/lib/audit-store";
import { useAuth } from "@/lib/auth-store";
import { useTx } from "@/lib/i18n";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character]!;
  });
}

function formatLocalTime(timestamp: string) {
  return new Date(timestamp).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function actionLabel(event: AuditEvent) {
  switch (event.action) {
    case "case_viewed_unmasked":
      return "Visualização do caso sem máscara de sigilo";
    case "csv_exported":
      return "Exportação de relatório CSV";
    case "letter_generated":
      return "Geração de minuta de ofício";
    case "case_status_changed":
      return "Alteração de status do caso";
    case "protective_measure_status_changed":
      return "Alteração de status de medida protetiva";
    case "privacy_mode_disabled":
      return "Modo Sigilo LGPD desativado após confirmação";
  }
}

export function LgpdAuditPanel({ caseId }: { caseId: string }) {
  const tx = useTx();
  const { events, error, loading } = useAuditEvents(caseId);
  const { user } = useAuth();
  const cloudBacked = Boolean(user);
  const [exporting, setExporting] = useState(false);

  const exportCertificate = () => {
    setExporting(true);
    try {
      const rows = [...events]
        .reverse()
        .map(
          (event) => `<tr>
            <td>${escapeHtml(event.timestampUtc)}</td>
            <td>${escapeHtml(formatLocalTime(event.timestampUtc))}</td>
            <td>${escapeHtml(actionLabel(event))}</td>
            <td>${escapeHtml(event.actor)}</td>
            <td>${escapeHtml(event.counselorRegistration)}</td>
            <td>${escapeHtml(event.simulatedIp)}</td>
            <td>${escapeHtml(event.simulatedBrowser)}</td>
            <td>${escapeHtml(event.summary)}</td>
          </tr>`,
        )
        .join("");
      const html = `<!doctype html>
        <html lang="pt-BR"><meta charset="utf-8"><title>Certidão demonstrativa de auditoria · Caso ${escapeHtml(caseId)}</title>
        <style>
          body{font:14px Arial,sans-serif;color:#172033;margin:32px}
          h1{font-size:20px} .warning{border:1px solid #d97706;background:#fff7ed;padding:12px}
          table{width:100%;border-collapse:collapse;margin-top:20px;font-size:11px}
          th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top}
          th{background:#e2e8f0} @media print{body{margin:12mm}}
        </style>
        <h1>Certidão demonstrativa de eventos de auditoria · Caso ${escapeHtml(caseId)}</h1>
        <p>Emitida em ${escapeHtml(new Date().toISOString())}.</p>
        <p class="warning"><strong>Relatório demonstrativo.</strong> ${cloudBacked ? "Eventos consultados no Lovable Cloud com controle de acesso; não há coleta de IP pelo cliente, assinatura digital ou validação institucional. A imutabilidade não substitui controles administrativos e backups do provedor." : "Eventos armazenados apenas neste navegador; localStorage pode ser alterado ou apagado. Identidade não autenticada, IP real não coletado e sem assinatura digital ou validação institucional."}</p>
        <table><thead><tr><th>Data/hora UTC</th><th>Data/hora local</th><th>Evento</th><th>Responsável</th><th>Matrícula</th><th>IP</th><th>Navegador</th><th>Detalhes</th></tr></thead>
        <tbody>${rows || `<tr><td colspan="8">Nenhum evento registrado para este caso.</td></tr>`}</tbody></table>
        <script>window.onload=()=>window.print()</script></html>`;
      const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `certidao-auditoria-demo-caso-${caseId}.html`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
      toast.success(
        tx(
          "Certidão demonstrativa baixada. Abra o arquivo para imprimir ou salvar em PDF.",
          "Demo certificate downloaded. Open it to print or save as PDF.",
          "Certificado de demostración descargado. Ábralo para imprimir o guardar como PDF.",
        ),
      );
    } catch (cause) {
      toast.error(
        cause instanceof Error
          ? cause.message
          : tx("Não foi possível emitir a certidão.", "Could not issue the certificate.", "No se pudo emitir el certificado."),
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="mt-6 shadow-card">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileLock2 aria-hidden="true" className="size-5 text-primary" />
              {tx("Log de Auditoria LGPD", "LGPD Audit Log", "Registro de Auditoría LGPD")}
            </CardTitle>
            <CardDescription className="mt-1">
            {cloudBacked
              ? tx(
                  "Eventos associados a este caso, consultados no Lovable Cloud.",
                  "Case events retrieved from Lovable Cloud.",
                  "Eventos asociados a este caso, consultados en Lovable Cloud.",
                )
              : tx(
                  "Registro local demonstrativo dos acessos e ações associados a este caso.",
                  "Local demo record of accesses and actions associated with this case.",
                  "Registro local demostrativo de accesos y acciones asociados a este caso.",
                )}
            </CardDescription>
          </div>
          <Button type="button" variant="outline" className="shrink-0 gap-2" onClick={exportCertificate} disabled={exporting || loading}>
            <Download aria-hidden="true" className="size-4" />
            {tx("Emitir certidão · Corregedoria / CMDCA", "Issue certificate · Oversight / CMDCA", "Emitir certificado · Contraloría / CMDCA")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div role="note" className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground">
          <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p>
            {cloudBacked
              ? tx(
                  "Eventos persistidos no Lovable Cloud e protegidos por políticas de acesso. O navegador não coleta IP; os registros não equivalem a assinatura digital nem certidão institucional.",
                  "Events are persisted in Lovable Cloud and protected by access policies. The browser does not collect IP; records are not a digital signature or institutional certificate.",
                  "Eventos persistidos en Lovable Cloud y protegidos por políticas de acceso. El navegador no recopila IP; los registros no equivalen a firma digital ni certificado institucional.",
                )
              : tx(
                  "Demonstração somente no navegador: localStorage pode ser alterado ou apagado. Identidade e matrícula não são autenticadas; IP real não é coletado. Estes dados não constituem trilha imutável nem certidão oficial.",
                  "Browser-only demo: localStorage can be altered or deleted. Identity and registration are not authenticated; real IP is not collected. This is not an immutable trail or an official certificate.",
                  "Demostración solo en navegador: localStorage puede modificarse o borrarse. La identidad y matrícula no se autentican; no se recopila IP real. No es un registro inmutable ni un certificado oficial.",
                )}
          </p>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {loading ? (
          <p role="status" className="text-sm text-muted-foreground">{tx("Carregando eventos...", "Loading events...", "Cargando eventos...")}</p>
        ) : events.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {tx("Nenhum evento de auditoria registrado para este caso.", "No audit events recorded for this case.", "No hay eventos de auditoría para este caso.")}
          </p>
        ) : (
          <ol className="space-y-3">
            {[...events].reverse().map((event) => (
              <li key={event.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{actionLabel(event)}</p>
                  <Badge variant="outline">{event.actorProfile}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{event.summary}</p>
                <dl className="mt-2 grid gap-x-4 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
                  <div><dt className="inline font-medium">UTC: </dt><dd className="inline">{event.timestampUtc}</dd></div>
                  <div><dt className="inline font-medium">Local: </dt><dd className="inline">{formatLocalTime(event.timestampUtc)}</dd></div>
                  <div><dt className="inline font-medium">Responsável: </dt><dd className="inline">{event.actor}</dd></div>
                  <div><dt className="inline font-medium">Matrícula: </dt><dd className="inline">{event.counselorRegistration}</dd></div>
                  <div><dt className="inline font-medium">IP: </dt><dd className="inline">{event.simulatedIp}</dd></div>
                  <div><dt className="inline font-medium">Navegador: </dt><dd className="inline">{event.simulatedBrowser}</dd></div>
                </dl>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
