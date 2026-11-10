import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Info, ShieldCheck } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/app-header";
import { useTx } from "@/lib/i18n";

export const Route = createFileRoute("/_dashboard/dashboard/predictive-analytics")({
  head: () => ({
    meta: [
      { title: "Indicadores e cenários — Farol Infantil" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PredictiveAnalytics,
});

const demonstrationSeries = [
  { period: "Mai", reports: 14, followUps: 9 },
  { period: "Jun", reports: 18, followUps: 11 },
  { period: "Jul", reports: 16, followUps: 13 },
  { period: "Ago", reports: 22, followUps: 15 },
  { period: "Set", reports: 19, followUps: 16 },
  { period: "Out", reports: 24, followUps: 18 },
];

const demonstrationRegions = [
  { name: "Norte / CPA", schoolAbsences: 18, lightingRequests: 12, communityReferrals: 15 },
  { name: "Sul / Pedra 90", schoolAbsences: 14, lightingRequests: 19, communityReferrals: 13 },
  { name: "Leste / Planalto", schoolAbsences: 12, lightingRequests: 10, communityReferrals: 11 },
  { name: "Oeste / Santa Izabel", schoolAbsences: 9, lightingRequests: 8, communityReferrals: 10 },
  { name: "Centro / Dom Aquino", schoolAbsences: 11, lightingRequests: 13, communityReferrals: 12 },
  { name: "Distritos / Rural", schoolAbsences: 7, lightingRequests: 6, communityReferrals: 8 },
];

function PredictiveAnalytics() {
  const tx = useTx();
  return (
    <div className="space-y-6">
      <PageHeader
        title={tx(
          "Indicadores e cenários territoriais",
          "Territorial indicators & scenarios",
          "Indicadores y escenarios territoriales",
        )}
        subtitle={tx(
          "Apoio ao planejamento comunitário, sem classificação individual de crianças ou famílias.",
          "Support for community planning, without individual scoring of children or families.",
          "Apoyo a la planificación comunitaria, sin clasificar a niños ni familias.",
        )}
      />
      <div
        role="note"
        className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p>
          {tx(
            "Demonstração com números sintéticos, não dados da Prefeitura, SME, Saúde ou Polícia. Não existe modelo preditivo ativo nem estimativa de risco. Indicadores agregados não provam causa, negligência ou violência e não devem justificar fiscalização, abordagem ou decisão sobre uma família.",
            "Demonstration with synthetic figures, not City Hall, school, health, or police data. No predictive model or risk estimate is active. Aggregate indicators do not establish cause, neglect, or violence and must not justify surveillance, contact, or decisions about a family.",
            "Demostración con cifras sintéticas, no datos municipales, escolares, sanitarios ni policiales. No hay un modelo predictivo ni estimaciones de riesgo activos. Los indicadores agregados no prueban causas, negligencia ni violencia ni deben justificar vigilancia o decisiones sobre una familia.",
          )}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title={tx("Relatos recebidos", "Reports received", "Relatos recibidos")}
          value="24"
          note={tx(
            "Série sintética · outubro",
            "Synthetic series · October",
            "Serie sintética · octubre",
          )}
          positive
        />
        <MetricCard
          title={tx(
            "Acompanhamentos comunitários",
            "Community follow-ups",
            "Seguimientos comunitarios",
          )}
          value="18"
          note={tx(
            "Série sintética · outubro",
            "Synthetic series · October",
            "Serie sintética · octubre",
          )}
          positive
        />
        <MetricCard
          title={tx(
            "Integrações municipais",
            "Municipal integrations",
            "Integraciones municipales",
          )}
          value={tx("Nenhuma", "None", "Ninguna")}
          note={tx("Sem conexões externas", "No external connections", "Sin conexiones externas")}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {tx("Séries demonstrativas", "Demonstration series", "Series demostrativas")}
          </CardTitle>
          <CardDescription>
            {tx(
              "Contagens fictícias para ilustrar tendências observadas, não previsões.",
              "Fictional counts illustrating observed trends, not forecasts.",
              "Conteos ficticios para ilustrar tendencias observadas, no predicciones.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="h-72 w-full"
            role="img"
            aria-label={tx(
              "Gráfico demonstrativo de relatos e acompanhamentos mensais",
              "Demonstration chart of monthly reports and follow-ups",
              "Gráfico demostrativo de relatos y seguimientos mensuales",
            )}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={demonstrationSeries}
                margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="reports"
                  name={tx("Relatos", "Reports", "Relatos")}
                  stroke="var(--primary)"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="followUps"
                  name={tx("Acompanhamentos", "Follow-ups", "Seguimientos")}
                  stroke="var(--chart-2)"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {tx(
              "Indicadores agregados de demonstração por região",
              "Synthetic aggregate indicators by region",
              "Indicadores agregados sintéticos por región",
            )}
          </CardTitle>
          <CardDescription>
            {tx(
              "Dados não verificados e sem conexão com bases públicas; use somente para demonstrar a interface.",
              "Unverified figures with no public-data connection; for interface demonstration only.",
              "Cifras no verificadas y sin conexión a bases públicas; solo para mostrar la interfaz.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {demonstrationRegions.map((region) => (
            <div
              key={region.name}
              className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[minmax(130px,1fr)_repeat(3,minmax(100px,0.7fr))] sm:items-center"
            >
              <p className="font-medium">{region.name}</p>
              <Indicator
                label={tx("Faltas (demo)", "Absences (demo)", "Faltas (demo)")}
                value={region.schoolAbsences}
              />
              <Indicator
                label={tx("Iluminação (demo)", "Lighting (demo)", "Iluminación (demo)")}
                value={region.lightingRequests}
              />
              <Indicator
                label={tx("Encaminhamentos (demo)", "Referrals (demo)", "Derivaciones (demo)")}
                value={region.communityReferrals}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            {tx(
              "Ação preventiva centrada na comunidade",
              "Community-centered preventive action",
              "Acción preventiva centrada en la comunidad",
            )}
          </CardTitle>
          <CardDescription>
            {tx(
              "Use dados validados e avaliação profissional para planejar serviços universais e voluntários.",
              "Use verified data and professional judgment to plan universal, voluntary services.",
              "Use datos verificados y criterio profesional para planificar servicios universales y voluntarios.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {tx(
            "Exemplo: discutir com a rede local ações abertas de apoio escolar e acesso a serviços, sem identificar ou pontuar famílias.",
            "Example: discuss open school-support and service-access activities with the local network, without identifying or scoring families.",
            "Ejemplo: coordinar actividades abiertas de apoyo escolar y acceso a servicios, sin identificar ni puntuar familias.",
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  note,
  positive = false,
}: {
  title: string;
  value: string;
  note: string;
  positive?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 flex items-center gap-2 text-3xl font-semibold">
          {value}
          {positive ? (
            <ArrowUpRight aria-hidden="true" className="size-5 text-primary" />
          ) : (
            <ArrowDownRight aria-hidden="true" className="size-5 text-muted-foreground" />
          )}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function Indicator({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm sm:block">
      <span className="text-muted-foreground">{label}</span>
      <Badge variant="outline">{value}</Badge>
    </div>
  );
}
