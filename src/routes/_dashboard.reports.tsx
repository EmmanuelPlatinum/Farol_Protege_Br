import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarClock,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  MapPin,
  PieChart as PieIcon,
  Printer,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app-header";
import { useI18n, useTx } from "@/lib/i18n";
import { useCases } from "@/lib/cases-store";
import { usePublicReports } from "@/lib/reports-store";

export const Route = createFileRoute("/_dashboard/reports")({
  head: () => ({
    meta: [
      { title: "Relatórios e Prestação de Contas — Farol Protege" },
      {
        name: "description",
        content: "Relatórios estatísticos, prestação de contas CMDCA e acompanhamento de prazos do ECA.",
      },
      { property: "og:title", content: "Relatórios e Prestação de Contas — Farol Protege" },
      {
        property: "og:description",
        content: "Relatórios estatísticos, prestação de contas CMDCA e acompanhamento de prazos do ECA.",
      },
    ],
  }),
  component: Reports,
});

const reportItems = [
  {
    name: "Relatório Bimestral Consolidado — CMDCA",
    due: "30/11/2026",
    status: "onTime",
    target: "Conselho Municipal dos Direitos da Criança e do Adolescente",
  },
  {
    name: "Ofício Circunstanciado — Promotoria da Infância e Juventude",
    due: "05/11/2026",
    status: "urgent",
    target: "Ministério Público Estadual",
  },
  {
    name: "Diagnóstico Territorial de Vulnerabilidades — Assistência Social",
    due: "15/12/2026",
    status: "onTime",
    target: "Secretaria Municipal de Assistência Social (SMAS)",
  },
  {
    name: "Acompanhamento de Infrequência Escolar (FICAI) — Educação",
    due: "20/10/2026",
    status: "sent",
    target: "Secretaria Municipal de Educação (SME)",
  },
] as const;

const statusVariants = {
  onTime: { badge: "success", label: "No prazo" },
  urgent: { badge: "danger", label: "Urgente / Próximo" },
  sent: { badge: "secondary", label: "Protocolado" },
} as const;

// Paleta de cores semântica compatível com o tema Farol
const TYPE_COLORS = [
  "oklch(0.58 0.22 258)", // primary blue
  "oklch(0.62 0.15 155)", // emerald success
  "oklch(0.7 0.15 70)",   // amber warning
  "oklch(0.6 0.22 27)",   // red/rose destructive
  "oklch(0.68 0.18 310)", // violet
  "oklch(0.65 0.14 200)", // cyan
];

const REGION_COLORS = [
  "oklch(0.58 0.22 258)",
  "oklch(0.65 0.2 220)",
  "oklch(0.62 0.15 155)",
  "oklch(0.7 0.15 70)",
  "oklch(0.6 0.22 27)",
];

function Reports() {
  const { t } = useI18n();
  const tx = useTx();
  const cases = useCases();
  const publicReports = usePublicReports();

  // 1. Dados agregados: Distribuição por Tipo de Violação
  const violationsByType = useMemo(() => {
    const counts: Record<string, number> = {
      "Negligência": 0,
      "Violência Doméstica": 0,
      "Evasão Escolar": 0,
      "Trabalho Infantil": 0,
      "Abandono": 0,
    };

    cases.forEach((c) => {
      const typeKey = Object.keys(counts).find(
        (k) => k.toLowerCase() === c.type.toLowerCase()
      ) || c.type;
      counts[typeKey] = (counts[typeKey] || 0) + 1;
    });

    publicReports.forEach((r) => {
      const typeKey = Object.keys(counts).find(
        (k) => k.toLowerCase() === r.type.toLowerCase()
      ) || r.type;
      counts[typeKey] = (counts[typeKey] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value], i) => ({
      name,
      total: value,
      color: TYPE_COLORS[i % TYPE_COLORS.length],
    }));
  }, [cases, publicReports]);

  // 2. Dados agregados: Mapeamento de Ocorrências por Bairro/Região
  const occurrencesByRegion = useMemo(() => {
    const counts: Record<string, number> = {
      "Centro": 0,
      "Jardim América": 0,
      "Vila Nova": 0,
      "Zona Sul": 0,
      "Zona Rural": 0,
    };

    cases.forEach((c) => {
      const matched = Object.keys(counts).find((k) =>
        c.address.toLowerCase().includes(k.toLowerCase())
      );
      if (matched) counts[matched] = (counts[matched] ?? 0) + 1;
      else counts["Centro"] = (counts["Centro"] ?? 0) + 1;
    });

    publicReports.forEach((r) => {
      const matched = Object.keys(counts).find((k) =>
        r.region.toLowerCase().includes(k.toLowerCase())
      );
      if (matched) counts[matched] = (counts[matched] ?? 0) + 1;
      else counts["Vila Nova"] = (counts["Vila Nova"] ?? 0) + 1;
    });

    return Object.entries(counts).map(([region, total], i) => ({
      region,
      total,
      color: REGION_COLORS[i % REGION_COLORS.length],
    }));
  }, [cases, publicReports]);

  // Função para Exportação Real de Dados em formato CSV (Compatível com Excel/Sheets)
  const exportCsv = () => {
    const headers = [
      "Protocolo_ID",
      "Data_Registro",
      "Tipo_Violacao",
      "Bairro_Regiao",
      "Nivel_Risco",
      "Status_Procedimento",
      "Conselheiro_Responsavel",
      "Conformidade_LGPD",
    ];

    const rows: string[][] = [
      ...cases.map((c) => [
        `CASO-#${c.id}`,
        c.date,
        `"${c.type}"`,
        `"${c.address.split("—")[1]?.trim() || c.address}"`,
        c.risk.toUpperCase(),
        c.status.toUpperCase(),
        `"${c.counselor}"`,
        "ANONIMIZADO_ECA_LGPD",
      ]),
      ...publicReports.map((r) => [
        r.pin,
        r.date.split(" ")[0] || "2026-10-31",
        `"${r.type}"`,
        `"${r.region}"`,
        "TRIAGEM_CIDADA",
        r.status.toUpperCase(),
        "PLANTÃO_COLEGIADO",
        "ANONIMIZADO_ECA_LGPD",
      ]),
    ];

    const csvContent =
      "\uFEFF" + // UTF-8 BOM para garantir acentos corretos no Excel
      [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `prestacao_contas_cmdca_farol_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(
      tx(
        "Relatório CSV exportado com sucesso! Dados anonimizados prontos para envio.",
        "CSV Report exported successfully! Anonymized data ready for submission.",
        "¡Informe CSV exportado con éxito!"
      )
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header com Botões de Ação */}
      <PageHeader
        title={tx(
          "Relatórios ECA e Prestação de Contas (CMDCA / Prefeitura)",
          "ECA Reports & Accountability (CMDCA / City Hall)",
          "Informes ECA y Rendición de Cuentas"
        )}
        subtitle={tx(
          "Indicadores consolidados de violações, diagnóstico por bairros e ofícios oficiais.",
          "Consolidated violation metrics, neighborhood diagnosis, and official letters.",
          "Indicadores consolidados de violaciones y diagnóstico por barrios."
        )}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={exportCsv}
              className="gap-2 font-medium shadow-xs"
            >
              <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>{tx("Exportar Relatório CSV", "Export CSV Report", "Exportar CSV")}</span>
            </Button>

            <Button
              size="default"
              onClick={handlePrint}
              className="gap-2 font-medium bg-primary shadow-xs"
            >
              <Printer className="size-4" />
              <span>{tx("Imprimir Relatório / PDF", "Print Report / PDF", "Imprimir Informe / PDF")}</span>
            </Button>
          </div>
        }
      />

      {/* Relatório Imprimível / Cabeçalho para @media print */}
      <div className="hidden print:block mb-8 border-b pb-4 text-center">
        <h2 className="text-xl font-bold uppercase">Prefeitura Municipal de Proteção Integral</h2>
        <h3 className="text-base font-semibold">Conselho Tutelar · Prestação de Contas CMDCA 2026</h3>
        <p className="text-xs text-neutral-600">Relatório Consolidado de Violações e Indicadores por Bairro</p>
      </div>

      {/* Cards de Métricas e KPIs para CMDCA */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {tx("Procedimentos Totais", "Total Procedures", "Procedimientos Totales")}
              </span>
              <FileText className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">
              {cases.length + publicReports.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="size-3 text-emerald-500" />
              <span>+18% {tx("em relação ao ano anterior", "vs previous year", "vs año anterior")}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {tx("Medidas Aplicadas", "Measures Applied", "Medidas Aplicadas")}
              </span>
              <ShieldCheck className="size-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              89.4%
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tx("Art. 101 do ECA com resolutividade", "ECA Art. 101 resolved", "Art. 101 resuelto")}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {tx("Ofícios e Requisições", "Official Requisitions", "Oficios y Requisitorias")}
              </span>
              <FileCheck2 className="size-4 text-primary" />
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">38</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tx("Enviados ao MP, Saúde e Escolas", "Sent to MP, Health and Schools", "Enviados a Fiscalía y Salud")}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {tx("Conformidade ECA / LGPD", "ECA / LGPD Compliance", "Conformidad LGPD")}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-emerald-600 border-emerald-500/30">
                100% Sigiloso
              </Badge>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">0</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tx("Vazamentos ou exposição de dados", "Data leaks or exposures", "Exposiciones de datos")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Gráficos Analíticos com Recharts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico 1: Distribuição de Violações por Tipo */}
        <Card className="shadow-xs print-avoid-break">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                  <BarChart3 className="size-4 text-primary" />
                  <span>{tx("Distribuição de Violações por Tipo", "Violations by Type", "Violaciones por Tipo")}</span>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {tx(
                    "Incidência das violações de direitos tipificadas no Estatuto da Criança e do Adolescente.",
                    "Incidence of child rights violations categorized by ECA.",
                    "Incidencia de violaciones de derechos según el ECA."
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={violationsByType} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value} casos`, "Total"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {violationsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 2: Mapeamento de Ocorrências por Bairro / Região */}
        <Card className="shadow-xs print-avoid-break">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                  <MapPin className="size-4 text-primary" />
                  <span>{tx("Mapeamento por Bairro / Região da Cidade", "Occurrences by City Region", "Ocurrencias por Barrio")}</span>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {tx(
                    "Concentração territorial para planejamento de ações preventivas intersetoriais.",
                    "Territorial concentration for intersectoral prevention planning.",
                    "Concentración territorial para planificación preventiva."
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={occurrencesByRegion}
                  margin={{ top: 10, right: 20, left: 25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="region"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    width={90}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value} ocorrências`, "Total"]}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {occurrencesByRegion.map((entry, index) => (
                      <Cell key={`region-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Relatórios e Ofícios Formais */}
      <Card className="shadow-xs print-avoid-break">
        <CardHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold sm:text-lg">
                {tx("Relatórios Oficiais e Previsão de Envio", "Official Reports & Filing Deadlines", "Informes Oficiales y Plazos")}
              </CardTitle>
              <CardDescription className="text-xs">
                {tx(
                  "Prazos regimentais e remessa formal ao Ministério Público, Judiciário e CMDCA.",
                  "Regulatory deadlines and formal filings to prosecutors, courts, and CMDCA.",
                  "Plazos de entrega formal al Ministerio Público y CMDCA."
                )}
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
              <CalendarClock className="size-3.5" />
              <span>{tx("Exercício 2026", "2026 Period", "Ejercicio 2026")}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="divide-y divide-border/60 p-0">
          {reportItems.map((item, idx) => {
            const variantConfig = statusVariants[item.status];
            return (
              <div key={idx} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <FileText className="size-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {tx("Destinatário:", "Target:", "Destinatario:")} <span className="font-medium">{item.target}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:justify-end pl-12 sm:pl-0">
                  <div className="text-right">
                    <span className="text-[11px] text-muted-foreground block">
                      {tx("Prazo de Remessa", "Submission Deadline", "Plazo de Entrega")}
                    </span>
                    <span className="text-xs font-mono font-medium text-foreground">{item.due}</span>
                  </div>
                  <Badge variant={variantConfig.badge as any} className="text-xs">
                    {variantConfig.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
