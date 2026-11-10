import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CloudOff,
  Clock3,
  Download,
  Flame,
  FileText,
  MapPin,
  Check,
  ShieldAlert,
  ShieldCheck,
  Siren,
  UserRound,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCases } from "@/lib/cases-store";

export const Route = createFileRoute("/_dashboard/operations")({
  head: () => ({
    meta: [
      { title: "Gestão de Operações — Farol Infantil" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Operations,
});

type VisitStatus = "pending" | "checked-in" | "checked-out";
const visits = [
  {
    id: "v1",
    time: "09:00",
    caseId: "1042",
    address: "Rua das Flores, 120 — Centro",
    risk: "Alto",
  },
  { id: "v2", time: "11:30", caseId: "1039", address: "Rua Ipê, 33 — Vila Nova", risk: "Médio" },
  {
    id: "v3",
    time: "14:00",
    caseId: "1041",
    address: "Av. Brasil, 455 — Jardim América",
    risk: "Baixo",
  },
];

const emergencyChecklist = [
  { id: "official-alert", label: "Validar o alerta e as instruções com fonte oficial" },
  { id: "accessible-plan", label: "Planejar comunicação e transporte acessíveis com a rede local" },
  { id: "shelter-confirmation", label: "Confirmar previamente locais de acolhimento e capacidade" },
  {
    id: "family-reunification",
    label: "Definir protocolo seguro de reencontro familiar, sem listas públicas",
  },
  {
    id: "privacy",
    label: "Registrar somente dados estritamente necessários em sistema autorizado",
  },
] as const;

function Operations() {
  const cases = useCases();
  const [visitStatuses, setVisitStatuses] = useState<Record<string, VisitStatus>>({});
  const [online, setOnline] = useState(true);
  const [escutaScheduled, setEscutaScheduled] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [handoffRead, setHandoffRead] = useState(false);
  const [disasterScenario, setDisasterScenario] = useState<"flood" | "fire" | "heat">("flood");
  const [preparedItems, setPreparedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("farol_offline_visit_statuses");
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Formato de rascunhos offline inválido.");
      }
      const validEntries = Object.entries(parsed).filter(
        ([id, status]) =>
          visits.some((visit) => visit.id === id) &&
          (status === "pending" || status === "checked-in" || status === "checked-out"),
      );
      setVisitStatuses(Object.fromEntries(validEntries) as Record<string, VisitStatus>);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Não foi possível carregar os rascunhos offline: ${error.message}`
          : "Não foi possível carregar os rascunhos offline.",
      );
    }
  }, []);

  const updateVisitStatus = (visitId: string, status: VisitStatus) => {
    const next = { ...visitStatuses, [visitId]: status };
    setVisitStatuses(next);
    try {
      localStorage.setItem("farol_offline_visit_statuses", JSON.stringify(next));
      toast.success(
        online ? "Check-in salvo neste dispositivo." : "Check-in salvo offline neste dispositivo.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Não foi possível salvar o check-in neste dispositivo: ${error.message}`
          : "Não foi possível salvar o check-in neste dispositivo.",
      );
    }
  };

  const exportVisitDrafts = () => {
    const data = {
      format: "farol-visit-statuses-v1",
      exportedAt: new Date().toISOString(),
      visits: Object.entries(visitStatuses).map(([visitId, status]) => ({ visitId, status })),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "farol-rascunhos-visitas.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <PageHeader
        title="Gestão Avançada de Operações"
        subtitle="Acompanhamento de visitas, prazos legais e continuidade do plantão."
      />
      <div
        role="note"
        className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground"
      >
        Painel demonstrativo. Os status de visita ficam somente neste navegador e não são
        sincronizados com o servidor. Não registre dados identificáveis de crianças neste protótipo.
      </div>
      <Tabs defaultValue="visits">
        <TabsList className="mb-4 h-auto flex-wrap justify-start">
          <TabsTrigger value="visits">Visitas de campo</TabsTrigger>
          <TabsTrigger value="deadlines">Prazos e escuta</TabsTrigger>
          <TabsTrigger value="handoff">Passagem de plantão</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="resilience">Resiliência climática</TabsTrigger>
        </TabsList>
        <TabsContent value="visits" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
            <p className="flex items-center gap-2 text-sm" role="status" aria-live="polite">
              {online ? (
                <Wifi className="size-4 text-emerald-600" />
              ) : (
                <WifiOff className="size-4 text-amber-600" />
              )}
              {online
                ? "Conectado · rascunhos continuam locais"
                : "Sem conexão · check-ins são salvos neste dispositivo"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={Object.keys(visitStatuses).length === 0}
              onClick={exportVisitDrafts}
            >
              <Download className="mr-2 size-4" />
              Exportar status locais
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric icon={MapPin} title="Visitas na rota de hoje" value={String(visits.length)} />
            <Metric
              icon={ShieldAlert}
              title="Territórios de alto risco"
              value={String(visits.filter((visit) => visit.risk === "Alto").length)}
            />
            <Metric
              icon={ShieldCheck}
              title="Check-ins registrados"
              value={String(
                Object.values(visitStatuses).filter((status) => status === "checked-in").length,
              )}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {visits.map((visit) => {
              const status = visitStatuses[visit.id] ?? "pending";
              return (
                <Card key={visit.id} className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base">
                          {visit.time} · Caso #{visit.caseId}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1">
                          <MapPin className="size-3" />
                          {visit.address}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          visit.risk === "Alto"
                            ? "danger"
                            : visit.risk === "Médio"
                              ? "warning"
                              : "outline"
                        }
                      >
                        Risco {visit.risk}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {status === "pending" && (
                      <Button
                        onClick={() => {
                          updateVisitStatus(visit.id, "checked-in");
                        }}
                      >
                        <ShieldCheck className="mr-2 size-4" />
                        Check-in de Segurança
                      </Button>
                    )}
                    {status === "checked-in" && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          updateVisitStatus(visit.id, "checked-out");
                        }}
                      >
                        Check-out
                      </Button>
                    )}
                    {status === "checked-out" && (
                      <Badge variant="success">
                        <CheckCircle2 className="mr-1 size-3" />
                        Visita finalizada
                      </Badge>
                    )}
                    <EmergencyDialog />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="deadlines" className="space-y-4">
          <DeadlinePanel />
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-5 text-primary" />
                Escuta especializada · Lei 13.431/2017
              </CardTitle>
              <CardDescription>
                Agendamento coordenado para reduzir repetição de relatos. Articule com os serviços
                habilitados e respeite os protocolos locais.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  Caso #{cases.find((item) => item.status !== "closed")?.id ?? "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Agenda demonstrativa · não compartilhada com outros órgãos.
                </p>
              </div>
              <Button
                variant={escutaScheduled ? "outline" : "default"}
                onClick={() => {
                  setEscutaScheduled((value) => !value);
                  toast.info(
                    escutaScheduled
                      ? "Agendamento demonstrativo desmarcado."
                      : "Agendamento demonstrativo registrado localmente.",
                  );
                }}
              >
                <CalendarClock className="mr-2 size-4" />
                {escutaScheduled ? "Agendamento registrado" : "Agendar escuta especializada"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="handoff">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                Relatório de passagem de plantão
              </CardTitle>
              <CardDescription>
                Resumo local para apoiar a continuidade do atendimento entre equipes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!handoff ? (
                <Button
                  onClick={() => {
                    setHandoff(true);
                    setHandoffRead(false);
                  }}
                >
                  <FileText className="mr-2 size-4" />
                  Gerar resumo de transição
                </Button>
              ) : (
                <>
                  <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                    <p className="font-semibold">Resumo demonstrativo · Plantão atual</p>
                    <p className="mt-2">
                      {cases.filter((item) => item.status !== "closed").length} casos ativos no
                      painel. Priorizar revisão dos casos críticos, medidas com prazo próximo e
                      visitas ainda sem check-out.
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      Não contém dados transmitidos. Revise e complemente em canal institucional
                      autorizado.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertTriangle className="size-4 text-amber-600" />A equipe matutina deve
                    confirmar leitura para concluir a passagem.
                  </div>
                  <Button
                    disabled={handoffRead}
                    onClick={() => {
                      setHandoffRead(true);
                      toast.success("Leitura do turno matutino confirmada localmente.");
                    }}
                  >
                    <CheckCircle2 className="mr-2 size-4" />
                    {handoffRead ? "Leitura confirmada" : "Confirmar leitura do turno matutino"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <IntegrationCard
              title="Alertas críticos de plantão"
              status="Não conectado"
              description="O prazo de aceite de 15 minutos e o escalonamento exigem processamento no servidor e um provedor SMS/WhatsApp. Esta demonstração não envia alertas."
            />
            <IntegrationCard
              title="Limites territoriais por GPS"
              status="Aguardando fonte oficial"
              description="A seleção por coordenadas foi desativada. O sistema não atribuirá uma regional até receber e validar os polígonos oficiais aprovados."
            />
            <IntegrationCard
              title="Recibo de encaminhamento à rede"
              status="Não conectado"
              description="Os retornos de SME, CRAS e CREAS precisam de integração institucional autenticada. Nenhum link ou recibo demonstrativo é apresentado como confirmação real."
            />
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  Assinatura eletrônica do documento
                </CardTitle>
                <CardDescription>
                  A assinatura GOV.BR ainda é um fluxo manual, fora deste sistema.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Exporte o documento, confira se não contém dados desnecessários e assine no portal
                  oficial. A assinatura não é aplicada nem validada pelo Farol.
                </p>
                <Button asChild variant="outline">
                  <a href="https://assinador.iti.br/" target="_blank" rel="noopener noreferrer">
                    Abrir Assinador GOV.BR / ITI
                  </a>
                </Button>
              </CardContent>
            </Card>
            <IntegrationCard
              title="Mídia em denúncias"
              status="Não habilitada"
              description="Áudios, fotos e vídeos não são enviados neste protótipo. A recepção segura exige armazenamento privado, remoção de metadados e controles de acesso no backend."
            />
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CloudOff className="size-5 text-primary" />
                  Rascunhos de visita offline
                </CardTitle>
                <CardDescription>
                  Check-ins de demonstração persistem localmente no navegador.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                A exportação manual de status está disponível na aba Visitas. A sincronização
                automática e o armazenamento criptografado de dados reais ainda não estão
                implementados.
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="resilience" className="space-y-4">
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Siren className="size-5 text-amber-600" />
                Preparação para emergências climáticas
              </CardTitle>
              <CardDescription>
                Roteiro demonstrativo de preparação. Não recebe alertas da Defesa Civil nem consulta
                casos, abrigos ou endereços de famílias.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de cenário demonstrativo">
                {([
                  ["flood", "Alagamento / enchente"],
                  ["fire", "Queimada / fumaça"],
                  ["heat", "Onda de calor"],
                ] as const).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    variant={disasterScenario === value ? "default" : "outline"}
                    aria-pressed={disasterScenario === value}
                    onClick={() => setDisasterScenario(value)}
                  >
                    {value === "fire" ? <Flame className="mr-2 size-4" /> : <AlertTriangle className="mr-2 size-4" />}
                    {label}
                  </Button>
                ))}
              </div>
              <div className="rounded-lg border bg-background p-4">
                <p className="font-medium">
                  {disasterScenario === "flood"
                    ? "Cenário: risco de alagamento em área comunitária"
                    : disasterScenario === "fire"
                      ? "Cenário: fumaça de queimada afetando a comunidade"
                      : "Cenário: calor intenso e necessidade de hidratação"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confirme alertas e rotas com a Defesa Civil e serviços oficiais. Não use dados
                  fictícios deste protótipo para deslocar pessoas.
                </p>
              </div>
              <div className="space-y-2">
                {emergencyChecklist.map(({ id, label }) => (
                  <label key={id} className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={preparedItems[id] ?? false}
                      onChange={(event) =>
                        setPreparedItems((previous) => ({
                          ...previous,
                          [id]: event.target.checked,
                        }))
                      }
                      className="mt-1 accent-primary"
                    />
                    <span className="flex-1">{label}</span>
                    {preparedItems[id] && <Check aria-hidden="true" className="size-4 text-primary" />}
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                {Object.values(preparedItems).filter(Boolean).length} itens de preparação marcados
                nesta sessão. Não foram sincronizados nem enviados.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

function IntegrationCard({
  title,
  status,
  description,
}: {
  title: string;
  status: string;
  description: string;
}) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{status}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
    </Card>
  );
}

function DeadlinePanel() {
  const [base] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const deadlines = useMemo(
    () => [
      {
        id: "oficio-1",
        title: "Retorno do ofício · Saúde",
        due: base + 5 * 60 * 60 * 1000,
        owner: "Secretaria Municipal de Saúde",
      },
      {
        id: "oficio-2",
        title: "Acompanhamento de medida protetiva (Art. 101)",
        due: base + 27 * 60 * 60 * 1000,
        owner: "CRAS · equipe de referência",
      },
      {
        id: "oficio-3",
        title: "Resposta de requisição · Educação",
        due: base - 2 * 60 * 60 * 1000,
        owner: "Secretaria Municipal de Educação",
      },
    ],
    [base],
  );
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const formatRemaining = (due: number) => {
    const remaining = due - now;
    if (remaining <= 0) return "Prazo vencido";
    const hours = Math.floor(remaining / 3_600_000);
    const minutes = Math.floor((remaining % 3_600_000) / 60_000);
    return `${hours}h ${minutes}min`;
  };
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock3 className="size-5 text-primary" />
          Gestão de prazos · SLA ECA
        </CardTitle>
        <CardDescription>
          Prazos demonstrativos para ofícios e acompanhamento de medidas protetivas. Confirme o
          prazo aplicável no caso concreto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {deadlines.map((deadline) => {
          const overdue = deadline.due <= now;
          const urgent = overdue || deadline.due - now < 24 * 60 * 60 * 1000;
          return (
            <div
              key={deadline.id}
              className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{deadline.title}</p>
                <p className="text-sm text-muted-foreground">Órgão executor: {deadline.owner}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={urgent ? "danger" : "outline"}>
                  {formatRemaining(deadline.due)}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toast.info(
                      `Cobrança demonstrativa preparada para ${deadline.owner}. Nenhum ofício foi enviado.`,
                    )
                  }
                >
                  Preparar cobrança
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function EmergencyDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Siren className="mr-2 size-4" />
          Acionar Apoio Policial / GCM
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Acionar apoio policial / GCM</DialogTitle>
          <DialogDescription>
            Este painel não está conectado a serviços de emergência e não pode enviar equipes.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          Em risco imediato, utilize os canais oficiais locais de emergência. Nenhum telefone é
          exibido ou chamado porque não há contato municipal validado configurado.
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => toast.info("Nenhum contato foi acionado.")}>
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Metric({
  icon: Icon,
  title,
  value,
}: {
  icon: typeof MapPin;
  title: string;
  value: string;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="flex items-center gap-3 p-5">
        <Icon className="size-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
