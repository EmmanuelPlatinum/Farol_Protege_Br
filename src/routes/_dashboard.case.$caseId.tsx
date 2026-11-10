import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  History,
  Lock,
  MapPin,
  School,
  ShieldAlert,
  Syringe,
  User,
  Users,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RiskBadge } from "@/components/risk-badge";
import { DocumentGenerator } from "@/components/document-generator";
import { ProtectiveMeasuresChecklist } from "@/components/protective-measures-checklist";
import { InterinstitutionalCommunications } from "@/components/interinstitutional-communications";
import { LgpdAuditPanel } from "@/components/lgpd-audit-panel";
import { getCaseSensitiveData, updateCaseStatus, useCases } from "@/lib/cases-store";
import { useI18n, useTx } from "@/lib/i18n";
import { usePrivacy } from "@/lib/privacy-store";
import { useGovtechProfile } from "@/lib/govtech-profile";
import { appendAuditEvents } from "@/lib/audit-store";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/_dashboard/case/$caseId")({
  head: ({ params }) => ({
    meta: [
      { title: `Caso #${params.caseId} — Farol Infantil` },
      { name: "description", content: "Histórico completo e ofícios de um caso sigiloso." },
      { property: "og:title", content: `Caso #${params.caseId} — Farol Infantil` },
      { property: "og:description", content: "Histórico completo e ofícios de um caso sigiloso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CaseDetails,
});

const variant = { open: "warning", urgent: "danger", closed: "success" } as const;

function CaseViewAudit({ caseId }: { caseId: string }) {
  const { profile } = useGovtechProfile();
  const { user } = useAuth();
  const lastRecorded = useRef("");

  useEffect(() => {
    const key = `${caseId}:${user?.id ?? profile}`;
    if (lastRecorded.current === key) return;
    lastRecorded.current = key;
    const record = async () => {
      try {
        if (user) {
          if (!supabase) throw new Error("O Lovable Cloud não está configurado neste ambiente.");
          const { error } = await supabase.rpc("record_case_view", {
            p_case_id: caseId,
          });
          if (error) throw error;
        } else {
          await appendAuditEvents([
            {
              caseId,
              action: "case_viewed",
              summary: "Caso aberto no ambiente demonstrativo.",
              actorProfile: profile,
            },
          ]);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Falha ao registrar acesso ao caso.");
      }
    };
    void record();
  }, [caseId, profile, user]);

  return null;
}

function CaseDetails() {
  const { caseId } = Route.useParams();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { t } = useI18n();
  const tx = useTx();
  const { maskFamily, maskName, maskAddress, lgpdMode } = usePrivacy();
  const { profile, isReadOnly } = useGovtechProfile();
  const auth = useAuth();
  const [sensitiveData, setSensitiveData] = useState<
    { caseId: string; userId: string; child: string; family: string } | null
  >(null);
  const [loadingSensitiveData, setLoadingSensitiveData] = useState(false);
  const c = useCases().find((x) => x.id === caseId);
  if (path.endsWith("/blockchain-timeline")) return <Outlet />;
  const visibleSensitiveData =
    auth.user &&
    sensitiveData?.caseId === caseId &&
    sensitiveData.userId === auth.user.id
      ? sensitiveData
      : null;
  const revealSensitiveData = async () => {
    setLoadingSensitiveData(true);
    try {
      if (!auth.user) throw new Error("É necessário estar autenticado para visualizar estes dados.");
      setSensitiveData({
        caseId,
        userId: auth.user.id,
        ...(await getCaseSensitiveData(caseId)),
      });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : tx("Não foi possível carregar os dados identificáveis.", "Could not load identifying data.", "No se pudieron cargar los datos identificables."),
      );
    } finally {
      setLoadingSensitiveData(false);
    }
  };
  const back = (
    <Button asChild variant="ghost" className="mb-4 -ml-3">
      <Link to="/cases" search={{}}>
        <ArrowLeft /> {tx("Voltar para casos", "Back to cases", "Volver a los casos")}
      </Link>
    </Button>
  );
  if (!c)
    return (
      <>
        {back}
        <p className="text-muted-foreground">
          {tx("Caso não encontrado.", "Case not found.", "Caso no encontrado.")}
        </p>
      </>
    );

  return (
    <>
      {back}
      <CaseViewAudit caseId={c.id} />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <Lock className="size-3" /> {tx("Sigiloso", "Confidential", "Confidencial")} · #{c.id}
            </p>
            {lgpdMode && (
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]"
              >
                {tx("Sigilo LGPD Ativo", "LGPD Privacy Active", "Sigilo LGPD Activo")}
              </Badge>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {t.cases.family}{" "}
            {visibleSensitiveData
              ? visibleSensitiveData.family
              : maskFamily(c.family) || tx("protegida", "protected", "protegida")}
          </h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <RiskBadge risk={c.risk} />
            {!isReadOnly ? (
              <Select
                value={c.status}
                onValueChange={(value) => {
                  if (value !== "open" && value !== "urgent" && value !== "closed") return;
                  void updateCaseStatus(c.id, value).then((changed) => {
                    if (changed) {
                      toast.success(tx("Status do caso atualizado e auditado.", "Case status updated and audited.", "Estado del caso actualizado y auditado."));
                    }
                  }).catch((error: unknown) => {
                    toast.error(error instanceof Error ? error.message : tx("Não foi possível registrar a alteração de status.", "Could not record the status change.", "No se pudo registrar el cambio de estado."));
                  });
                }}
              >
                <SelectTrigger aria-label={tx("Alterar status do caso", "Change case status", "Cambiar estado del caso")} className="h-6 w-auto gap-1 px-2 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["open", "urgent", "closed"] as const).map((status) => (
                    <SelectItem key={status} value={status}>{t.status[status]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : <Badge variant={variant[c.status]}>{t.status[c.status]}</Badge>}
            <Badge variant="outline">{c.type}</Badge>
          </div>
        </div>
        {!isReadOnly && <DocumentGenerator c={c} />}
      </div>
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link to="/case/$caseId/blockchain-timeline" params={{ caseId: c.id }}>
            <History className="mr-2 size-4" />
            {tx("Trilha de integridade (demonstração)", "Integrity trail (demo)", "Cadena de integridad (demostración)")}
          </Link>
        </Button>
      </div>
      {isReadOnly && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 text-sm">
          <Eye aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-blue-600" />
          <div>
            <p className="font-medium">
              {profile === "prosecutor"
                ? tx("Perfil simulado: Promotoria da Infância (MP)", "Simulated profile: Children's Prosecutor (MP)", "Perfil simulado: Fiscalía de Infancia (MP)")
                : tx("Perfil simulado: Juizado da Infância", "Simulated profile: Juvenile Court", "Perfil simulado: Juzgado de Infancia")}
            </p>
            <p className="text-muted-foreground">
              {tx(
                "Visualização somente leitura. Nenhum acesso institucional, autenticação ou poder decisório é concedido por esta seleção.",
                "Read-only view. This selection grants no institutional access, authentication, or decision-making authority.",
                "Vista de solo lectura. Esta selección no concede acceso institucional, autenticación ni autoridad para decidir.",
              )}
            </p>
          </div>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>{tx("Dados do caso", "Case data", "Datos del caso")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Info
              icon={User}
              label={tx("Criança / adolescente", "Child / teen", "Niño / adolescente")}
              value={`${visibleSensitiveData ? visibleSensitiveData.child : maskName(c.child) || tx("Identificação protegida", "Identity protected", "Identidad protegida")} · ${c.age} ${tx("anos", "years", "años")}`}
            />
            {auth.user && auth.profile?.approved_at && !isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void revealSensitiveData()}
                disabled={loadingSensitiveData || Boolean(visibleSensitiveData)}
              >
                <Eye aria-hidden="true" className="mr-2 size-4" />
                {loadingSensitiveData
                  ? tx("Registrando acesso…", "Recording access…", "Registrando acceso…")
                  : visibleSensitiveData
                    ? tx("Acesso identificado e auditado", "Identified access audited", "Acceso identificado auditado")
                    : tx("Visualizar dados completos · acesso auditado", "View full data · audited access", "Ver datos completos · acceso auditado")}
              </Button>
            )}
            {c.supportNeed && (
              <Info
                icon={ShieldAlert}
                label={tx("Laudo/suspeita de TEA ou deficiência", "Autism/disability diagnosis or suspicion", "Diagnóstico/sospecha de autismo o discapacidad")}
                value={
                  c.supportNeed === "confirmed"
                    ? tx("Laudo informado", "Diagnosis reported", "Diagnóstico informado")
                    : c.supportNeed === "suspected"
                      ? tx("Suspeita informada", "Suspicion reported", "Sospecha informada")
                      : c.supportNeed === "none"
                        ? tx("Não", "No", "No")
                        : tx("Não informado", "Not informed", "No informado")
                }
              />
            )}
            <Info
              icon={MapPin}
              label={tx("Endereço", "Address", "Dirección")}
              value={c.address ? maskAddress(c.address) : "—"}
            />
            <Info icon={User} label={t.cases.counselor} value={c.counselor} />
            <div>
              <p className="text-xs text-muted-foreground">
                {tx("Relato", "Description", "Relato")}
              </p>
              <p className="mt-1">{c.description || "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>{tx("Histórico do caso", "Case timeline", "Historial del caso")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-6 border-l pl-6">
              {[...c.timeline].reverse().map((e, i) => (
                <li key={i} className="relative">
                  <span
                    className={`absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-card ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`}
                  />
                  <p className="text-xs text-muted-foreground">{e.date}</p>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{e.note}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
      <InterinstitutionalCommunications caseRecord={c} />
      <LgpdAuditPanel caseId={c.id} />
      <Card className="mt-6 shadow-card">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5 text-primary" />
                {tx(
                  "Radar de Interoperabilidade",
                  "Interoperability Radar",
                  "Radar de Interoperabilidad",
                )}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {tx(
                  "Visão demonstrativa de informações que podem apoiar a avaliação da equipe.",
                  "Demonstration view of information that may support the team's assessment.",
                  "Vista demostrativa de información que puede apoyar la evaluación del equipo.",
                )}
              </p>
            </div>
            <Badge variant="outline">
              {tx(
                "Simulação · sem conexão oficial",
                "Simulation · no official connection",
                "Simulación · sin conexión oficial",
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div
            role="note"
            className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground"
          >
            {tx(
              "Dados fictícios para demonstração. Nenhuma consulta é feita ao MEC, e-SUS/RNDS, CadÚnico/CRAS, SIPIA, SINESP, INFOSEG ou BNMP; confirme informações em canais oficiais antes de qualquer decisão.",
              "Fictional demo data. No queries are made to MEC, e-SUS/RNDS, CadÚnico/CRAS, SIPIA, SINESP, INFOSEG or BNMP; verify through official channels before any decision.",
              "Datos ficticios de demostración. No se consulta MEC, e-SUS/RNDS, CadÚnico/CRAS, SIPIA, SINESP, INFOSEG ni BNMP; verifique en canales oficiales antes de decidir.",
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <RadarItem
              icon={School}
              title={tx(
                "Busca Ativa Escolar · MEC",
                "Busca ativa escolar · MEC",
                "Búsqueda Escolar Activa · MEC",
              )}
              value={tx(
                "Frequência simulada: 68% nos últimos 30 dias",
                "Simulated attendance: 68% in the last 30 days",
                "Asistencia simulada: 68% en los últimos 30 días",
              )}
              warning={tx(
                "Abaixo de 75% · verificar com a escola (Art. 56 do ECA)",
                "Below 75% · verify with the school (ECA Art. 56)",
                "Por debajo del 75% · verificar con la escuela (Art. 56 ECA)",
              )}
            />
            <RadarItem
              icon={Syringe}
              title={tx("Saúde · e-SUS / RNDS", "Health · e-SUS / RNDS", "Salud · e-SUS / RNDS")}
              value={tx(
                "Vacinação: pendência a confirmar · Puericultura: acompanhamento em aberto",
                "Vaccination: pending, to confirm · Well-child care: follow-up open",
                "Vacunación: pendiente de confirmar · Puericultura: seguimiento abierto",
              )}
            />
            <RadarItem
              icon={Users}
              title={tx("CadÚnico · CRAS", "CadÚnico · CRAS", "CadÚnico · CRAS")}
              value={tx(
                "Renda per capita: R$ 420 · benefício ativo: não confirmado · CRAS: cadastro demonstrativo",
                "Per-capita income: R$ 420 · active benefit: unconfirmed · CRAS: demo registration",
                "Ingreso per cápita: R$ 420 · beneficio activo: sin confirmar · CRAS: registro demostrativo",
              )}
            />
            <RadarItem
              icon={History}
              title={tx("SIPIA Web", "SIPIA Web", "SIPIA Web")}
              value={tx(
                "Histórico em outros municípios: não consultado",
                "History in other municipalities: not queried",
                "Historial en otros municipios: no consultado",
              )}
            />
            <RadarItem
              icon={ShieldAlert}
              title={tx(
                "SINESP / INFOSEG · BNMP",
                "SINESP / INFOSEG · BNMP",
                "SINESP / INFOSEG · BNMP",
              )}
              value={tx(
                "Ocorrências, mandados e medidas cautelares: não consultados",
                "Incidents, warrants and protective measures: not queried",
                "Incidentes, órdenes y medidas cautelares: no consultados",
              )}
            />
            <div className="flex items-start gap-3 rounded-lg border p-3">
              <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {tx("Última checagem", "Last check", "Última consulta")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {tx(
                    "Sem consultas externas · dados de demonstração",
                    "Sem consultas externas · dados demonstrativos",
                    "Sin consultas externas · datos de demostración",
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <ProtectiveMeasuresChecklist caseRecord={c} readOnly={isReadOnly} />
    </>
  );
}

function RadarItem({
  icon: Icon,
  title,
  value,
  warning,
}: {
  icon: typeof User;
  title: string;
  value: string;
  warning?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Icon className={`mt-0.5 size-4 shrink-0 ${warning ? "text-amber-600" : "text-primary"}`} />
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{value}</p>
        {warning && (
          <p className="mt-1 flex items-start gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            <CheckCircle2 className="mt-0.5 size-3 shrink-0" />
            {warning}
          </p>
        )}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
