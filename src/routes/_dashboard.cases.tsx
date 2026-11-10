import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarClock, Download, Lock, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/app-header";
import { NewCaseDialog } from "@/components/new-case-dialog";
import { RiskBadge } from "@/components/risk-badge";
import { useI18n, useTx } from "@/lib/i18n";
import { sortByRisk, useCases } from "@/lib/cases-store";
import { usePrivacy } from "@/lib/privacy-store";
import { getDateKey, isDueWithinDays } from "@/lib/protective-measures";
import { appendAuditEvents } from "@/lib/audit-store";
import { useGovtechProfile } from "@/lib/govtech-profile";
import { toast } from "sonner";
import { buildCsv } from "@/lib/csv";
import { getCmdcaReportSummary, summarizeCmdcaRows } from "@/lib/cmdca-report";

export const Route = createFileRoute("/_dashboard/cases")({
  validateSearch: (search: Record<string, unknown>): { measuresDue?: "week" | undefined } =>
    search["measuresDue"] === "week" ? { measuresDue: "week" } : {},
  head: () => ({
    meta: [
      { title: "Casos — Farol Protege" },
      { name: "description", content: "Triagem inteligente e gestão de casos sigilosos do Conselho Tutelar." },
      { property: "og:title", content: "Casos — Farol Protege" },
      { property: "og:description", content: "Triagem inteligente e gestão de casos sigilosos do Conselho Tutelar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cases,
});

const variant = { open: "warning", urgent: "danger", closed: "success" } as const;

function Cases() {
  const { t } = useI18n();
  const tx = useTx();
  const { maskFamily, maskName } = usePrivacy();
  const { profile } = useGovtechProfile();
  const navigate = useNavigate();
  const measuresDue = Route.useSearch()["measuresDue"];
  const all = useCases();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [risk, setRisk] = useState("all");
  const [period, setPeriod] = useState("all");

  const exportCsv = async () => {
    try {
      const databaseSummary = await getCmdcaReportSummary();
      const summary =
        databaseSummary ??
        summarizeCmdcaRows(
          rows.map((c) => ({
            date: c.date,
            region: c.councilRegion ?? "Não informada",
            category: c.type,
            status: c.status,
          })),
        );

      if (databaseSummary === null) {
        await appendAuditEvents([
          {
            caseId: null,
            action: "csv_exported",
            summary: `Exportação demonstrativa de resumo agregado (${summary.length} grupo(s)).`,
            actorProfile: profile,
          },
        ]);
      }

      const content = buildCsv(
        ["Período", "Região", "Categoria agregada", "Status agregado", "Total"],
        summary.map((row) => [row.period, row.region, row.category, row.status, row.total]),
      );
      const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `relatorio_mensal_cmdca_${new Date().toISOString().slice(0, 7)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : tx("Falha ao gerar o relatório agregado.", "Could not generate the aggregated report.", "No se pudo generar el informe agregado."),
      );
    }
  };

  const rows = useMemo(() => {
    const now = Date.now();
    const today = getDateKey(new Date());
    const days = period === "all" ? Infinity : Number(period);
    const term = q.toLowerCase();
    return sortByRisk(all.filter((c) =>
      (status === "all" || c.status === status) &&
      (risk === "all" || c.risk === risk) &&
      (!measuresDue ||
        (c.protectiveMeasures ?? []).some((measure) => isDueWithinDays(measure, 7, today))) &&
      (now - new Date(c.date).getTime()) / 864e5 <= days &&
      (!term || `${c.id} ${c.family} ${c.type} ${c.counselor}`.toLowerCase().includes(term)),
    ));
  }, [all, q, status, risk, period, measuresDue]);

  return (
    <>
      <PageHeader title={t.cases.title} subtitle={tx("Casos críticos ficam sempre no topo da lista.", "Critical cases always stay at the top.", "Los casos críticos siempre permanecen al inicio de la lista.")} action={<><Button variant="outline" className="gap-2" onClick={() => void exportCsv()}>
        <Download className="size-4" />{tx("Exportar Relatório Mensal", "Export Monthly Report", "Exportar Informe Mensual")}
      </Button><NewCaseDialog /></>} />
      {measuresDue === "week" && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <CalendarClock className="size-4 text-amber-600" />
            {tx(
              "Casos com medidas protetivas vencendo nos próximos 7 dias",
              "Cases with protective measures due in the next 7 days",
              "Casos con medidas de protección que vencen en los próximos 7 días",
            )}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/cases", search: { measuresDue: undefined } })}
          >
            <X className="mr-1.5 size-4" />
            {tx("Limpar filtro", "Clear filter", "Quitar filtro")}
          </Button>
        </div>
      )}
      <Card className="mb-4 grid gap-3 p-4 shadow-card sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_180px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx("Buscar por nº, família, tipo...", "Search by no., family, type...", "Buscar por n.º, familia, tipo...")} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tx("Todos os status", "All statuses", "Todos los estados")}</SelectItem>
            <SelectItem value="urgent">{t.status.urgent}</SelectItem>
            <SelectItem value="open">{t.status.open}</SelectItem>
            <SelectItem value="closed">{t.status.closed}</SelectItem>
          </SelectContent></Select>
        <Select value={risk} onValueChange={setRisk}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tx("Todos os riscos", "All risk levels", "Todos los niveles de riesgo")}</SelectItem>
            <SelectItem value="critical">{tx("Crítico", "Critical", "Crítico")}</SelectItem>
            <SelectItem value="high">{tx("Alto", "High", "Alto")}</SelectItem>
            <SelectItem value="routine">{tx("Rotina", "Routine", "Rutina")}</SelectItem>
          </SelectContent></Select>
        <Select value={period} onValueChange={setPeriod}><SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{tx("Qualquer data", "Any date", "Cualquier fecha")}</SelectItem>
            <SelectItem value="7">{tx("Últimos 7 dias", "Last 7 days", "Últimos 7 días")}</SelectItem>
            <SelectItem value="30">{tx("Últimos 30 dias", "Last 30 days", "Últimos 30 días")}</SelectItem>
          </SelectContent></Select>
      </Card>
      <Card className="overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.cases.id}</TableHead><TableHead>{t.cases.family}</TableHead>
              <TableHead>{tx("Risco", "Risk", "Riesgo")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t.cases.type}</TableHead>
              <TableHead className="hidden md:table-cell">{t.cases.counselor}</TableHead>
              <TableHead className="hidden lg:table-cell">{tx("Data", "Date", "Fecha")}</TableHead>
              <TableHead>{t.cases.status}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} className="cursor-pointer" onClick={() => navigate({ to: "/case/$caseId", params: { caseId: r.id } })}>
                <TableCell className="font-mono text-xs"><span className="inline-flex items-center gap-1"><Lock className="size-3 text-muted-foreground" />#{r.id}</span></TableCell>
                <TableCell className="font-medium">
                  <span>{t.cases.family} {maskFamily(r.family) || tx("protegida", "protected", "protegida")}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground font-normal">({maskName(r.child) || tx("identificação protegida", "identity protected", "identidad protegida")})</span>
                </TableCell>
                <TableCell><RiskBadge risk={r.risk} /></TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{r.type}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{r.counselor}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">{r.date.split("-").reverse().join("/")}</TableCell>
                <TableCell><Badge variant={variant[r.status]}>{t.status[r.status]}</Badge></TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">{tx("Nenhum caso encontrado.", "No cases found.", "No se encontraron casos.")}</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
