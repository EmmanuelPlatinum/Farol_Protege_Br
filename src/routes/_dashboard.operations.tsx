import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Siren,
  UserRound,
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
      { title: "Gestão de Operações — Farol Protege" },
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

function Operations() {
  const cases = useCases();
  const [visitStatuses, setVisitStatuses] = useState<Record<string, VisitStatus>>({});
  const [escutaScheduled, setEscutaScheduled] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const [handoffRead, setHandoffRead] = useState(false);

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
        Painel demonstrativo. Estados e notificações são locais e não enviam dados a órgãos, equipes
        externas ou serviços de emergência.
      </div>
      <Tabs defaultValue="visits">
        <TabsList className="mb-4 h-auto flex-wrap justify-start">
          <TabsTrigger value="visits">Visitas de campo</TabsTrigger>
          <TabsTrigger value="deadlines">Prazos e escuta</TabsTrigger>
          <TabsTrigger value="handoff">Passagem de plantão</TabsTrigger>
        </TabsList>
        <TabsContent value="visits" className="space-y-4">
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
                          setVisitStatuses((previous) => ({
                            ...previous,
                            [visit.id]: "checked-in",
                          }));
                          toast.success("Check-in de demonstração registrado.");
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
                          setVisitStatuses((previous) => ({
                            ...previous,
                            [visit.id]: "checked-out",
                          }));
                          toast.success("Check-out de demonstração registrado.");
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
      </Tabs>
    </>
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
