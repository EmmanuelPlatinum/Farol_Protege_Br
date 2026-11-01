import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bot, Check, FolderPlus, Webhook } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app-header";
import { RiskBadge } from "@/components/risk-badge";
import { addCase, markAlertConverted, useConvertedAlerts, type Risk } from "@/lib/cases-store";
import { useTx } from "@/lib/i18n";

export const Route = createFileRoute("/_dashboard/alerts")({
  head: () => ({
    meta: [
      { title: "Alertas Digitais — Farol Protege" },
      { name: "description", content: "Alertas automáticos de riscos cibernéticos vindos de plataformas como Discord e Roblox." },
      { property: "og:title", content: "Alertas Digitais — Farol Protege" },
      { property: "og:description", content: "Alertas automáticos de riscos cibernéticos vindos de plataformas como Discord e Roblox." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Alerts,
});

type Alert = { id: string; platform: string; event: string; detail: string; user: string; risk: Risk; at: string; score: number };
const feed: Alert[] = [
  { id: "wh_9f21", platform: "Discord", event: "grooming.suspected", detail: "Adulto solicitando fotos e encontro presencial com usuário de 12 anos em mensagens privadas.", user: "menor_4471 · 12 anos", risk: "critical", at: "há 4 min", score: 97 },
  { id: "wh_9f1c", platform: "Roblox", event: "chat.sexual_content", detail: "Conteúdo sexual explícito enviado a menor em servidor público.", user: "pixelkid_09 · 10 anos", risk: "critical", at: "há 22 min", score: 92 },
  { id: "wh_9e88", platform: "Discord", event: "self_harm.signal", detail: "Mensagens com sinais de automutilação em canal de servidor escolar.", user: "lua.sz · 14 anos", risk: "high", at: "há 1 h", score: 81 },
  { id: "wh_9e40", platform: "Roblox", event: "cyberbullying.repeated", detail: "Ataques recorrentes de grupo contra um mesmo jogador.", user: "bruninho_br · 11 anos", risk: "high", at: "há 3 h", score: 74 },
  { id: "wh_9d02", platform: "Roblox", event: "scam.robux", detail: "Tentativa de golpe pedindo dados de pagamento dos responsáveis.", user: "gamer_mt · 13 anos", risk: "routine", at: "há 6 h", score: 48 },
];

function Alerts() {
  const tx = useTx();
  const navigate = useNavigate();
  const converted = useConvertedAlerts();

  const convert = (a: Alert) => {
    const c = addCase({ family: `Usuário ${a.platform}`, child: a.user.split(" · ")[0]!, age: Number(a.user.match(/(\d+) anos/)?.[1] ?? 0), type: "Risco cibernético", counselor: "Ana Costa", status: a.risk === "routine" ? "open" : "urgent", risk: a.risk, address: "—", description: `${a.platform}: ${a.detail}`, timelineNote: `Convertido do alerta ${a.id} (${a.platform} · ${a.event}).` });
    markAlertConverted(a.id, c.id);
    toast.success(tx(`Caso #${c.id} aberto`, `Case #${c.id} opened`, `Caso #${c.id} abierto`), { action: { label: tx("Abrir", "Open", "Abrir"), onClick: () => navigate({ to: "/case/$caseId", params: { caseId: c.id } }) } });
  };

  return (
    <>
      <PageHeader title={tx("Alertas Digitais (API)", "Digital API Alerts", "Alertas Digitales (API)")} subtitle={tx("Webhooks automáticos de plataformas parceiras sinalizando riscos online.", "Automated webhooks from partner platforms flagging online risks.", "Webhooks automáticos de plataformas asociadas que señalan riesgos en línea.")}
        action={<Badge variant="success" className="gap-1.5 px-3 py-1"><span className="size-2 animate-pulse rounded-full bg-current" /> {tx("Webhook ativo", "Webhook live", "Webhook activo")}</Badge>} />
      <div className="space-y-3">
        {feed.map((a) => (
          <Card key={a.id} className={a.risk === "critical" ? "shadow-card border-destructive/40" : "shadow-card"}>
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">{a.platform === "Discord" ? <Bot className="size-5" /> : <Webhook className="size-5" />}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{a.platform}</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{a.event}</code>
                  <RiskBadge risk={a.risk} />
                  <span className="text-xs text-muted-foreground">{a.at} · {tx("confiança", "confidence", "confianza")} {a.score}%</span>
                </div>
                <p className="mt-1.5 text-sm">{a.detail}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.user} · {a.id}</p>
              </div>
              {converted[a.id] ? (
                <Button variant="outline" onClick={() => navigate({ to: "/case/$caseId", params: { caseId: converted[a.id]! } })}><Check /> {tx(`Caso #${converted[a.id]}`, `Case #${converted[a.id]}`, `Caso #${converted[a.id]}`)}</Button>
              ) : (
                <Button onClick={() => convert(a)}><FolderPlus /> {tx("Converter em Caso Ativo", "Convert to Active Case", "Convertir en Caso Activo")}</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
