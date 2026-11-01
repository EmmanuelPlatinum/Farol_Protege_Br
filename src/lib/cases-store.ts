import { useSyncExternalStore } from "react";

export type Risk = "critical" | "high" | "routine";
export type CaseStatus = "open" | "urgent" | "closed";
export type TimelineEvent = { date: string; title: string; note: string };
export type Case = {
  id: string;
  family: string;
  child: string;
  age: number;
  type: string;
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
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
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

export function addTimeline(id: string, title: string, note: string) {
  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  cases = cases.map((c) => (c.id === id ? { ...c, timeline: [...c.timeline, { date: stamp, title, note }] } : c));
  emit();
}
