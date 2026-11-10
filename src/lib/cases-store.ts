import { useEffect, useSyncExternalStore } from "react";
import type { SupportNeed } from "@/lib/protection-types";
import type { ProtectiveMeasure } from "@/lib/protective-measures";
import type { GovtechProfile } from "@/lib/govtech-profile";
import { appendAuditEvents } from "@/lib/audit-store";
import { getAuthSnapshot, useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";

export type Risk = "critical" | "high" | "routine";
export type CaseStatus = "open" | "urgent" | "closed";
export type TimelineEvent = { date: string; title: string; note: string };
export type OfficialActType =
  | "Ofício Enviado ao MP"
  | "Decisão Liminar Recebida da Vara da Infância"
  | "Audiência Concentrada Agendada"
  | "Despacho (simulação)"
  | "Deferimento de medida de urgência (simulação)"
  | "Ofício gerado para revisão";
export type OfficialCommunication = {
  id: string;
  date: string;
  protocol: string;
  type: OfficialActType;
  verificationKey: string;
  actorProfile: GovtechProfile;
};
export type OfficialCommunicationDraft = Omit<OfficialCommunication, "id"> & { id: string };
export type Case = {
  id: string;
  family: string;
  child: string;
  age: number;
  type: string;
  supportNeed?: SupportNeed;
  protectiveMeasures?: ProtectiveMeasure[];
  officialCommunications?: OfficialCommunication[];
  councilRegion?: string;
  counselor: string;
  status: CaseStatus;
  risk: Risk;
  date: string; // YYYY-MM-DD
  address: string;
  description: string;
  timeline: TimelineEvent[];
};

export const riskOrder: Record<Risk, number> = { critical: 0, high: 1, routine: 2 };
export const sortByRisk = (list: Case[]) =>
  [...list].sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk] || b.date.localeCompare(a.date));

const seed = (): Case[] => [
  { id: "1042", family: "Silva", child: "J. S.", age: 9, type: "Violência doméstica", counselor: "Ana Costa", status: "urgent", risk: "critical", date: "2026-10-26", address: "Rua das Flores, 120 — Centro", description: "Denúncia anônima de agressões frequentes relatadas por vizinhos.",
    timeline: [
      { date: "2026-10-24 09:12", title: "Denúncia recebida", note: "Denúncia anônima pelo portal Farol Protege (PIN #PROT-8921)." },
      { date: "2026-10-24 14:30", title: "Triagem realizada", note: "Classificado como risco crítico pela conselheira Ana Costa." },
      { date: "2026-10-25 10:00", title: "Visita domiciliar", note: "Visita realizada; criança encaminhada para avaliação médica." },
      { date: "2026-10-26 16:45", title: "Encaminhamento ao CRAS", note: "Família inserida no acompanhamento psicossocial." },
    ] },
  { id: "1041", family: "Souza", child: "M. S.", age: 13, type: "Evasão escolar", counselor: "Marcos Lima", status: "open", risk: "routine", date: "2026-10-25", address: "Av. Brasil, 455 — Jardim América", description: "Escola informou 25 faltas consecutivas sem justificativa.",
    timeline: [
      { date: "2026-10-20 08:00", title: "Comunicado da escola", note: "E.E. Dom Pedro II notificou faltas recorrentes." },
      { date: "2026-10-25 11:00", title: "Contato com responsáveis", note: "Mãe compareceu ao conselho e assinou termo." },
    ] },
  { id: "1039", family: "Oliveira", child: "L. O.", age: 6, type: "Negligência", counselor: "Ana Costa", status: "urgent", risk: "high", date: "2026-10-23", address: "Rua Ipê, 33 — Vila Nova", description: "Criança encontrada sozinha em casa por longos períodos.",
    timeline: [
      { date: "2026-10-22 19:20", title: "Denúncia telefônica", note: "Recebida pelo plantão noturno." },
      { date: "2026-10-23 09:00", title: "Visita domiciliar", note: "Situação confirmada; aplicada medida de proteção (Art. 101)." },
    ] },
  { id: "1038", family: "Pereira", child: "R. P.", age: 15, type: "Trabalho infantil", counselor: "Júlia Rocha", status: "open", risk: "high", date: "2026-10-21", address: "Estrada Velha, km 4 — Zona Rural", description: "Adolescente trabalhando em carvoaria durante o período escolar.",
    timeline: [{ date: "2026-10-21 10:15", title: "Denúncia recebida", note: "Encaminhada pelo Ministério do Trabalho." }] },
  { id: "1035", family: "Santos", child: "A. S.", age: 11, type: "Abandono", counselor: "Marcos Lima", status: "closed", risk: "routine", date: "2026-10-12", address: "Rua 7 de Setembro, 88 — Centro", description: "Caso resolvido com guarda concedida à avó materna.",
    timeline: [
      { date: "2026-10-01 13:00", title: "Caso aberto", note: "Abandono relatado pela escola." },
      { date: "2026-10-12 15:00", title: "Caso arquivado", note: "Guarda definida pela Vara da Infância." },
    ] },
];

const KEY = "farol_cases";
const ALERTS_KEY = "farol_alerts_converted";
const OLD_KEY = "tutele_cases";
const OLD_ALERTS_KEY = "tutele_alerts_converted";
const initial = seed();
let cases: Case[] = initial;
let converted: Record<string, string> = {};
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(OLD_KEY);
    if (raw) cases = JSON.parse(raw);
    const a = localStorage.getItem(ALERTS_KEY) ?? localStorage.getItem(OLD_ALERTS_KEY);
    if (a) converted = JSON.parse(a);
  } catch { /* ignore */ }
}
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(cases));
    localStorage.setItem(ALERTS_KEY, JSON.stringify(converted));
  } catch { /* ignore */ }
}

const listeners = new Set<() => void>();
const emit = () => { save(); listeners.forEach((l) => l()); };
const subscribe = (l: () => void) => {
  listeners.add(l);
  if (!loaded) { load(); queueMicrotask(() => listeners.forEach((x) => x())); }
  return () => { listeners.delete(l); };
};
const getSnapshot = () => cases;
const getServerSnapshot = () => initial;
const getConverted = () => converted;
const emptyConv: Record<string, string> = {};

type CloudCaseRow = {
  id: string;
  protocol: string;
  council_region: string;
  assigned_counselor: string | null;
  family_name?: string;
  child_name?: string;
  child_age: number | null;
  violation_type: string;
  support_need: SupportNeed;
  risk: Risk;
  status: CaseStatus;
  address: string;
  description: string;
  protective_measures: ProtectiveMeasure[];
  created_at: string;
  case_timeline?: {
    title: string;
    details: string;
    event_type?: string;
    metadata?: Record<string, unknown>;
    occurred_at: string;
  }[];
};

type CloudCasesSnapshot = {
  userId: string | null;
  cases: Case[];
  loading: boolean;
  error: string | null;
};
const emptyCloudSnapshot: CloudCasesSnapshot = {
  userId: null,
  cases: [],
  loading: false,
  error: null,
};
let cloudSnapshot = emptyCloudSnapshot;
let cloudChannel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
const cloudListeners = new Set<() => void>();
const notifyCloud = () => cloudListeners.forEach((listener) => listener());
const subscribeCloud = (listener: () => void) => {
  cloudListeners.add(listener);
  return () => cloudListeners.delete(listener);
};

function mapCloudCase(row: CloudCaseRow): Case {
  const timeline = [...(row.case_timeline ?? [])]
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
    .map((event) => ({
      date: new Date(event.occurred_at).toLocaleString("pt-BR"),
      title: event.title,
      note: event.details,
    }));
  const communications = (row.case_timeline ?? [])
    .filter((event) => event.event_type === "official_communication" && event.metadata)
    .map((event) => {
      const metadata = event.metadata!;
      return {
        id: String(metadata["id"] ?? event.occurred_at),
        date: String(metadata["date"] ?? event.occurred_at.slice(0, 10)),
        protocol: String(metadata["protocol"] ?? "Protocolo não informado"),
        type: String(metadata["type"] ?? "Ofício gerado para revisão") as OfficialActType,
        verificationKey: String(metadata["verificationKey"] ?? "N/A"),
        actorProfile: String(metadata["actorProfile"] ?? "counselor") as GovtechProfile,
      };
    });
  return {
    id: row.id,
    family: row.family_name ?? "",
    child: row.child_name ?? "",
    age: row.child_age ?? 0,
    type: row.violation_type,
    supportNeed: row.support_need,
    protectiveMeasures: row.protective_measures ?? [],
    counselor: row.assigned_counselor ?? "Atribuição pendente",
    status: row.status,
    risk: row.risk,
    date: row.created_at.slice(0, 10),
    address: row.address,
    description: row.description,
    timeline,
    officialCommunications: communications,
    councilRegion: row.council_region,
  };
}

async function loadCloudCases(userId: string, region: string) {
  if (!supabase) return;
  const { data, error } = await supabase.rpc("get_authorized_cases");
  if (cloudSnapshot.userId !== userId) return;
  if (error) {
    cloudSnapshot = { ...cloudSnapshot, loading: false, error: error.message };
  } else {
    cloudSnapshot = {
      userId,
      cases: ((data ?? []) as CloudCaseRow[]).map(mapCloudCase),
      loading: false,
      error: null,
    };
  }
  notifyCloud();
}

function useRemoteCases() {
  const auth = useAuth();
  useEffect(() => {
    if (!auth.user || !auth.profile?.approved_at || !auth.profile.council_region || !supabase) {
      if (cloudChannel && supabase) void supabase.removeChannel(cloudChannel);
      cloudChannel = null;
      cloudSnapshot = emptyCloudSnapshot;
      notifyCloud();
      return;
    }

    const userId = auth.user.id;
    const region = auth.profile.council_region;
    if (cloudSnapshot.userId !== userId) {
      if (cloudChannel && supabase) void supabase.removeChannel(cloudChannel);
      cloudSnapshot = { userId, cases: [], loading: true, error: null };
      notifyCloud();
      void loadCloudCases(userId, region);
      cloudChannel = supabase
        .channel(`case-signals-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "case_change_signals",
            filter: `council_region=eq.${region}`,
          },
          () => void loadCloudCases(userId, region),
        )
        .subscribe();
    }
  }, [auth.profile?.approved_at, auth.profile?.council_region, auth.user]);
  return useSyncExternalStore(subscribeCloud, () => cloudSnapshot, () => emptyCloudSnapshot);
}

export function useConvertedAlerts() {
  return useSyncExternalStore(subscribe, getConverted, () => emptyConv);
}
export function markAlertConverted(alertId: string, caseId: string) {
  converted = { ...converted, [alertId]: caseId };
  emit();
}
export function resetDemoData() {
  cases = seed();
  converted = {};
  emit();
}

export function useCases() {
  const localCases = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const remote = useRemoteCases();
  const auth = useAuth();
  return auth.user ? remote.userId === auth.user.id ? remote.cases : [] : localCases;
}

export async function getCaseSensitiveData(caseId: string) {
  const auth = getAuthSnapshot();
  if (!auth.user || !auth.profile?.approved_at) {
    throw new Error("É necessário ter um perfil autenticado e aprovado para visualizar estes dados.");
  }
  if (!supabase) throw new Error("O Lovable Cloud não está configurado neste ambiente.");

  const { data, error } = await supabase.rpc("get_case_sensitive_data", {
    p_case_id: caseId,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (
    !row ||
    typeof row.child_name !== "string" ||
    typeof row.family_name !== "string"
  ) {
    throw new Error("O servidor não retornou os dados identificáveis do caso.");
  }
  return { child: row.child_name, family: row.family_name };
}

export function addCase(data: Omit<Case, "id" | "timeline" | "date"> & { timelineNote?: string }) {
  const id = String(Math.max(...cases.map((c) => Number(c.id))) + 1);
  const now = new Date();
  const stamp = now.toISOString().slice(0, 16).replace("T", " ");
  const { timelineNote, ...rest } = data;
  const c: Case = { ...rest, id, date: now.toISOString().slice(0, 10), timeline: [{ date: stamp, title: "Caso aberto", note: timelineNote ?? "Cadastro realizado no painel." }] };
  cases = [c, ...cases];
  emit();
  return c;
}

export async function createCase(
  data: Omit<Case, "id" | "timeline" | "date" | "councilRegion"> & { timelineNote?: string },
) {
  const auth = getAuthSnapshot();
  if (!auth.user) return addCase(data);
  if (!supabase || !auth.profile?.approved_at || !auth.profile.council_region) {
    throw new Error("O perfil autenticado não está aprovado para criar casos.");
  }
  const { data: response, error } = await supabase.rpc("create_case", {
    p_child_name: data.child,
    p_family_name: data.family,
    p_child_age: data.age,
    p_violation_type: data.type,
    p_support_need: data.supportNeed ?? "unknown",
    p_risk: data.risk,
    p_status: data.status,
    p_address: data.address,
    p_description: data.description,
  });
  if (error) throw error;
  const row = Array.isArray(response) ? response[0] : response;
  if (!row || typeof row.id !== "string") {
    throw new Error("O servidor não retornou o caso criado.");
  }
  const created = mapCloudCase({
    ...(row as Omit<CloudCaseRow, "case_timeline">),
    child_name: "",
    family_name: "",
    case_timeline: [],
  });
  created.counselor = auth.profile.full_name;
  if (data.timelineNote) {
    const { error: timelineError } = await supabase.from("case_timeline").insert({
      case_id: created.id,
      actor_user_id: auth.user.id,
      event_type: "case_note",
      title: "Observação inicial",
      details: data.timelineNote,
    });
    if (timelineError) throw timelineError;
  }
  void loadCloudCases(auth.user.id, auth.profile.council_region);
  notifyCloud();
  return created;
}

export function addTimeline(id: string, title: string, note: string) {
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  cases = cases.map((c) => (c.id === id ? { ...c, timeline: [...c.timeline, { date: stamp, title, note }] } : c));
  emit();
}

async function appendCloudTimeline(
  caseId: string,
  eventType: string,
  title: string,
  details: string,
  metadata: Record<string, unknown> = {},
) {
  const auth = getAuthSnapshot();
  if (!supabase || !auth.user || !auth.profile?.approved_at) {
    throw new Error("Perfil sem autorização ativa para registrar no caso.");
  }
  const { error } = await supabase.from("case_timeline").insert({
    case_id: caseId,
    actor_user_id: auth.user.id,
    event_type: eventType,
    title,
    details,
    metadata,
  });
  if (error) throw error;
  if (auth.profile.council_region) void loadCloudCases(auth.user.id, auth.profile.council_region);
}

export async function updateCaseStatus(caseId: string, status: CaseStatus) {
  const auth = getAuthSnapshot();
  if (auth.user) {
    if (!supabase || !auth.profile?.approved_at) throw new Error("Perfil sem autorização ativa.");
    const { error } = await supabase.rpc("update_case_status", {
      p_case_id: caseId,
      p_status: status,
    });
    if (error) throw error;
    if (auth.profile.council_region) void loadCloudCases(auth.user.id, auth.profile.council_region);
    return true;
  }
  const current = cases.find((item) => item.id === caseId);
  if (!current || current.status === status) return false;
  await appendAuditEvents([
    {
      caseId,
      action: "case_status_changed",
      summary: `Status do caso alterado de ${current.status} para ${status}.`,
      actorProfile: "counselor",
    },
  ]);
  cases = cases.map((item) =>
    item.id === caseId ? { ...item, status } : item,
  );
  addTimeline(caseId, "Status do caso alterado", `${current.status} → ${status}.`);
  return true;
}

function localDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function createOfficialCommunicationDraft(
  type: OfficialActType,
  actorProfile: GovtechProfile,
  date = localDateKey(),
  protocol?: string,
): OfficialCommunicationDraft {
  const id = globalThis.crypto?.randomUUID?.();
  if (!id) throw new Error("Não foi possível gerar uma chave aleatória para a demonstração.");

  const serial = id.replaceAll("-", "").slice(0, 8).toUpperCase();
  return {
    id,
    date,
    protocol: protocol?.trim() || `DEMO-ECA-${date.slice(0, 4)}/${serial}`,
    type,
    verificationKey: `FP-DEMO-${id.replaceAll("-", "").slice(0, 20).toUpperCase()}`,
    actorProfile,
  };
}

export async function addOfficialCommunication(caseId: string, draft: OfficialCommunicationDraft) {
  if (getAuthSnapshot().user) {
    await appendCloudTimeline(
      caseId,
      "official_communication",
      draft.type,
      `Protocolo demonstrativo ${draft.protocol} · chave ${draft.verificationKey}. Perfil: ${draft.actorProfile}.`,
      { ...draft },
    );
    return true;
  }
  const record: OfficialCommunication = { ...draft };
  let found = false;
  cases = cases.map((item) => {
    if (item.id !== caseId) return item;
    found = true;
    return {
      ...item,
      officialCommunications: [...(item.officialCommunications ?? []), record],
      timeline: [
        ...item.timeline,
        {
          date: `${record.date} ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
          title: record.type,
          note: `Protocolo demonstrativo ${record.protocol} · chave ${record.verificationKey}. Perfil: ${record.actorProfile}.`,
        },
      ],
    };
  });
  if (!found) return false;
  emit();
  return true;
}

export async function addProtectiveMeasure(caseId: string, measure: Omit<ProtectiveMeasure, "id">) {
  const id = globalThis.crypto?.randomUUID?.();
  if (!id) throw new Error("Não foi possível gerar um identificador para a medida.");
  let created: ProtectiveMeasure | undefined;
  if (getAuthSnapshot().user) {
    if (!supabase) throw new Error("O Lovable Cloud não está configurado neste ambiente.");
    created = { ...measure, id };
    const { error } = await supabase.rpc("add_case_protective_measure", {
      p_case_id: caseId,
      p_measure: created,
    });
    if (error) throw error;
    return created;
  }
  cases = cases.map((item) => {
    if (item.id !== caseId) return item;
    created = { ...measure, id };
    return { ...item, protectiveMeasures: [...(item.protectiveMeasures ?? []), created] };
  });
  if (!created) return undefined;
  addTimeline(caseId, "Medida protetiva incluída", `${created.title} · prazo de ${created.deadlineDays} dias.`);
  return created;
}

export async function updateProtectiveMeasure(
  caseId: string,
  measureId: string,
  changes: Partial<Pick<ProtectiveMeasure, "status" | "deadlineDays">>,
) {
  if (getAuthSnapshot().user) {
    if (!supabase) throw new Error("O Lovable Cloud não está configurado neste ambiente.");
    const { data, error } = await supabase.rpc("update_case_protective_measure", {
      p_case_id: caseId,
      p_measure_id: measureId,
      p_changes: changes,
    });
    if (error) throw error;
    return data === true;
  }
  const currentMeasure = cases
    .find((item) => item.id === caseId)
    ?.protectiveMeasures?.find((measure) => measure.id === measureId);
  if (!currentMeasure) return false;
  if (changes.status && changes.status !== currentMeasure.status) {
    await appendAuditEvents([
      {
        caseId,
        action: "protective_measure_status_changed",
        summary: `Status de "${currentMeasure.title}" alterado de ${currentMeasure.status} para ${changes.status}.`,
        actorProfile: "counselor",
      },
    ]);
  }
  let updatedMeasure: ProtectiveMeasure | undefined;
  cases = cases.map((item) => {
    if (item.id !== caseId) return item;
    const protectiveMeasures = (item.protectiveMeasures ?? []).map((measure) => {
      if (measure.id !== measureId) return measure;
      updatedMeasure = { ...measure, ...changes };
      return updatedMeasure;
    });
    return { ...item, protectiveMeasures };
  });
  if (!updatedMeasure) return false;
  const statusLabel: Record<ProtectiveMeasure["status"], string> = {
    pending: "Pendente",
    in_progress: "Em cumprimento",
    completed: "Cumprida",
    breached: "Descumprida",
  };
  const statusNote =
    changes.status && changes.status !== "pending"
      ? `Status atualizado: ${statusLabel[changes.status]}.`
      : changes.deadlineDays
        ? `Prazo atualizado para ${changes.deadlineDays} dias.`
        : "Medida atualizada.";
  addTimeline(caseId, updatedMeasure.title, statusNote);
  return true;
}
