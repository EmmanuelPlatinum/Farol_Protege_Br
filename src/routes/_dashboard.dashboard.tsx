import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen, Home, FileCheck, AlertTriangle, TrendingUp, FileText, Gavel, Send } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PageHeader } from "@/components/app-header";
import { useI18n } from "@/lib/i18n";
import { useCases } from "@/lib/cases-store";
import { usePrivacy } from "@/lib/privacy-store";

export const Route = createFileRoute("/_dashboard/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Farol Protege" },
      { name: "description", content: "Casos ativos, visitas pendentes e prazos de relatórios do Conselho Tutelar." },
      { property: "og:title", content: "Dashboard — Farol Protege" },
      { property: "og:description", content: "Casos ativos, visitas pendentes e prazos de relatórios do Conselho Tutelar." },
    ],
  }),
  component: Dashboard,
});

const values = [14, 9, 17, 12, 21, 8, 6];
const config = { reports: { label: "Denúncias", color: "var(--chart-1)" } } satisfies ChartConfig;
const icons = [Home, FileText, Send, Gavel, FileCheck];

function Dashboard() {
  const { t } = useI18n();
  const cases = useCases();
  const { maskFamily, lgpdMode } = usePrivacy();
  const activeCasesCount = cases.filter((c) => c.status !== "closed").length;
  const data = values.map((v, i) => ({ day: t.days[i], reports: v }));
  const chartConfig = { reports: { ...config.reports, label: t.chartLabel } } satisfies ChartConfig;
  const kpis = [
    { label: t.kpi.active, value: String(activeCasesCount || 42), delta: t.kpi.activeD, icon: FolderOpen },
    { label: t.kpi.visits, value: "8", delta: t.kpi.visitsD, icon: Home, urgent: true },
    { label: t.kpi.reports, value: "95%", delta: t.kpi.reportsD, icon: FileCheck },
  ];
  return (
    <>
      <PageHeader title={t.greeting} subtitle={t.greetingSub} />
      <div className="grid gap-4 sm:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.label} className={k.urgent ? "shadow-card border-destructive/40" : "shadow-card"}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{k.label}</p>
                <div className={k.urgent ? "flex size-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive" : "flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground"}>
                  <k.icon className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <p className="text-3xl font-semibold tracking-tight">{k.value}</p>
                {k.urgent && <Badge variant="danger" className="gap-1"><AlertTriangle className="size-3" />{t.kpi.urgent}</Badge>}
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {k.urgent ? <AlertTriangle className="size-3 text-destructive" /> : <TrendingUp className="size-3 text-success" />} {k.delta}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.chartTitle}</CardTitle>
            <CardDescription>{t.chartSub}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <AreaChart data={data} margin={{ left: -20, right: 8 }}>
                <defs>
                  <linearGradient id="fillRep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-reports)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-reports)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area type="monotone" dataKey="reports" stroke="var(--color-reports)" strokeWidth={2.5} fill="url(#fillRep)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>{t.updates}</CardTitle>
            <CardDescription>{t.updatesSub}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {t.updateItems.map((text, i) => {
                const Icon = icons[i]!;
                return (
                  <li key={i} className="flex gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"><Icon className="size-4" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug">
                        {lgpdMode
                          ? text.replace(/Família\s+([A-Za-zÀ-ÿ]+)/g, (_, name) => `Família ${maskFamily(name)}`)
                          : text}
                      </p>
                      <p className="text-xs text-muted-foreground">{t.ago[i]}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
