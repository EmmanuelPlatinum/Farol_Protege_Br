import { useSyncExternalStore } from "react";
import type { SupportNeed } from "@/lib/protection-types";
import { supabase } from "@/lib/supabase";

export type ReportStatus =
  | "received"
  | "screening"
  | "visit_scheduled"
  | "visit_completed"
  | "referred_network"
  | "referred_mp"
  | "protective_action";

type PublicTrackingStatus = "received" | "processing" | "finalized";

export type ReportTimelineStep = {
  date: string;
  title: string;
  description: string;
  stepNumber: number;
  completed: boolean;
};

export type PublicReport = {
  pin: string; // e.g. "#PROT-8921"
  date: string; // YYYY-MM-DD HH:mm
  type: string; // e.g. "Violência doméstica"
  supportNeed?: SupportNeed;
  region: string; // e.g. "Centro"
  status: ReportStatus;
  statusLabel: string;
  summary: string;
  timeline: ReportTimelineStep[];
};

export async function submitCloudPublicReport(input: {
  councilRegion: string;
  type: string;
  approximateArea: string;
  supportNeed: SupportNeed;
  description: string;
}) {
  if (!supabase) throw new Error("O Lovable Cloud não está configurado neste ambiente.");
  const { data, error } = await supabase.rpc("submit_public_report", {
    p_council_region: input.councilRegion,
    p_violation_type: input.type,
    p_approximate_area: input.approximateArea,
    p_support_need: input.supportNeed,
    p_description: input.description,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.protocol !== "string") {
    throw new Error("O servidor não retornou o protocolo da denúncia.");
  }
  return { protocol: row.protocol as string, createdAt: row.created_at as string };
}

export async function getCloudPublicReportStatus(rawProtocol: string) {
  if (!supabase) throw new Error("O Lovable Cloud não está configurado neste ambiente.");
  const { data, error } = await supabase.rpc("get_public_report_status", {
    p_protocol: rawProtocol.trim().toUpperCase(),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.protocol !== "string") return null;
  const statuses: Record<PublicTrackingStatus, { status: ReportStatus; label: string }> = {
    received: { status: "received", label: "Recebido" },
    processing: { status: "screening", label: "Em processamento" },
    finalized: { status: "protective_action", label: "Finalizado" },
  };
  const publicStatus = Object.hasOwn(statuses, row.status)
    ? statuses[row.status as PublicTrackingStatus]
    : undefined;
  if (!publicStatus) throw new Error("O servidor retornou um status público inválido.");
  return {
    pin: row.protocol as string,
    date: "",
    type: "Denúncia cidadã",
    region: "",
    status: publicStatus.status,
    statusLabel: publicStatus.label,
    summary: "A consulta pública informa somente o estado geral do protocolo.",
    timeline: [],
  } satisfies PublicReport;
}

const seedReports = (): PublicReport[] => [
  {
    pin: "#PROT-8921",
    date: "2026-10-24 09:12",
    type: "Violência doméstica",
    region: "Centro",
    status: "referred_network",
    statusLabel: "Encaminhado à Rede de Proteção (CRAS/CREAS)",
    summary: "Diligência realizada pelo Conselho Tutelar. Medidas protetivas aplicadas e família em acompanhamento psicossocial.",
    timeline: [
      {
        stepNumber: 1,
        date: "24/10/2026 09:12",
        title: "Denúncia acolhida de forma anônima",
        description: "Protocolo gerado e criptografado com garantia integral de sigilo e não identificação do denunciante.",
        completed: true,
      },
      {
        stepNumber: 2,
        date: "24/10/2026 14:30",
        title: "Triagem técnica do Conselho Tutelar",
        description: "Classificado em nível de prioridade pela equipe técnica e distribuído ao conselheiro responsável.",
        completed: true,
      },
      {
        stepNumber: 3,
        date: "25/10/2026 10:00",
        title: "Visita e averiguação no local",
        description: "Equipe do Conselho Tutelar realizou averiguação in loco para verificação da integridade física e emocional.",
        completed: true,
      },
      {
        stepNumber: 4,
        date: "26/10/2026 16:45",
        title: "Encaminhamento aos serviços especializados",
        description: "Aplicação de medida do Art. 101 do ECA com inserção no serviço de convivência e acompanhamento continuado.",
        completed: true,
      },
    ],
  },
  {
    pin: "#PROT-1042",
    date: "2026-10-20 08:30",
    type: "Evasão escolar",
    region: "Jardim América",
    status: "visit_scheduled",
    statusLabel: "Visita e notificação agendada",
    summary: "Comunicação formal emitida à unidade escolar parceira. Escuta qualificada dos responsáveis agendada.",
    timeline: [
      {
        stepNumber: 1,
        date: "20/10/2026 08:30",
        title: "Denúncia registrada sob sigilo",
        description: "Informações sobre infrequência escolar recebidas e protocoladas no sistema.",
        completed: true,
      },
      {
        stepNumber: 2,
        date: "21/10/2026 11:00",
        title: "Triagem e verificação cadastral",
        description: "Ofício expedido à direção da escola para levantamento da ficha FICAI de infrequência.",
        completed: true,
      },
      {
        stepNumber: 3,
        date: "25/10/2026 09:00",
        title: "Escuta e visita aos responsáveis agendada",
        description: "Notificação dos responsáveis legais para assinatura de termo de garantia de frequência escolar.",
        completed: true,
      },
      {
        stepNumber: 4,
        date: "Previsão: 05/11/2026",
        title: "Conclusão de acompanhamento escolar",
        description: "Verificação do retorno às aulas e monitoramento bimensal junto à equipe pedagógica.",
        completed: false,
      },
    ],
  },
  {
    pin: "#PROT-3388",
    date: "2026-10-27 15:40",
    type: "Negligência",
    region: "Vila Nova",
    status: "screening",
    statusLabel: "Em triagem e análise técnica",
    summary: "Relato recebido pelo plantão do Conselho Tutelar. Aguardando parecer de diligência preliminar.",
    timeline: [
      {
        stepNumber: 1,
        date: "27/10/2026 15:40",
        title: "Denúncia recebida pelo plantão",
        description: "Protocolo emitido com preservação total de identidade nos termos do art. 17 do ECA.",
        completed: true,
      },
      {
        stepNumber: 2,
        date: "28/10/2026 08:15",
        title: "Análise técnica da denúncia",
        description: "Equipe técnica avaliando histórico de atendimentos e definindo cronograma de averiguação.",
        completed: true,
      },
      {
        stepNumber: 3,
        date: "Em andamento",
        title: "Diligência de averiguação",
        description: "Deslocamento de conselheiros para verificar as condições e garantir a integridade.",
        completed: false,
      },
      {
        stepNumber: 4,
        date: "Pendente",
        title: "Aplicação de medidas de proteção",
        description: "Encaminhamentos formais se constatada situação de vulnerabilidade.",
        completed: false,
      },
    ],
  },
  {
    pin: "#PROT-7714",
    date: "2026-10-22 14:00",
    type: "Trabalho infantil",
    region: "Zona Rural",
    status: "referred_mp",
    statusLabel: "Encaminhado ao Ministério Público",
    summary: "Fiscalização realizada em conjunto com órgãos de fiscalização do trabalho. Notícia de fato enviada à Promotoria.",
    timeline: [
      {
        stepNumber: 1,
        date: "22/10/2026 14:00",
        title: "Denúncia registrada",
        description: "Indicação de atividade irregular incompatível com a faixa etária da infância/adolescência.",
        completed: true,
      },
      {
        stepNumber: 2,
        date: "23/10/2026 10:00",
        title: "Diligência fiscalizatória",
        description: "Constatação no local e imediato afastamento de qualquer atividade laboral prejudicial.",
        completed: true,
      },
      {
        stepNumber: 3,
        date: "24/10/2026 16:00",
        title: "Ofício ao Ministério Público (Art. 136, IV, ECA)",
        description: "Envio de comunicação fundamentada para apuração de responsabilidades e medidas judiciais cabíveis.",
        completed: true,
      },
      {
        stepNumber: 4,
        date: "25/10/2026 14:00",
        title: "Inclusão em programa de aprendizagem/bolsa",
        description: "Família encaminhada para benefícios socioassistenciais municipais.",
        completed: true,
      },
    ],
  },
];

const STORAGE_KEY = "farol_public_reports";
let reports: PublicReport[] = seedReports();
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        reports = parsed;
      }
    }
  } catch {
    /* ignore */
  }
}

function save() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    /* ignore */
  }
}

const emit = () => {
  save();
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  if (!loaded) {
    load();
    queueMicrotask(() => listeners.forEach((x) => x()));
  }
  return () => {
    listeners.delete(l);
  };
};

const getSnapshot = () => reports;
const getServerSnapshot = () => seedReports();

export function normalizePin(pin: string): string {
  const clean = pin.trim().toUpperCase().replace(/[\s-]/g, "");
  // If user typed only numbers like "8921"
  if (/^\d{4,6}$/.test(clean)) {
    return `#PROT-${clean}`;
  }
  // If user typed "PROT8921" or "#PROT8921"
  const digitsMatch = clean.match(/\d{4,6}$/);
  if (digitsMatch) {
    return `#PROT-${digitsMatch[0]}`;
  }
  return pin.trim().toUpperCase();
}

export function findPublicReportByPin(rawPin: string): PublicReport | null {
  if (!rawPin || !rawPin.trim()) return null;
  load();
  const target = normalizePin(rawPin);
  const cleanTarget = target.replace(/[^A-Z0-9]/g, "");

  const report =
    reports.find((r) => {
      const cur = r.pin.replace(/[^A-Z0-9]/g, "");
      return cur === cleanTarget || cur.endsWith(cleanTarget) || cleanTarget.endsWith(cur);
    }) ?? null;
  if (!report) return null;

  const status: PublicTrackingStatus =
    report.status === "received"
      ? "received"
      : report.status === "protective_action"
        ? "finalized"
        : "processing";
  const labels: Record<PublicTrackingStatus, string> = {
    received: "Recebido",
    processing: "Em processamento",
    finalized: "Finalizado",
  };
  return {
    pin: report.pin,
    date: "",
    type: "Denúncia cidadã",
    region: "",
    status: status === "received" ? "received" : status === "finalized" ? "protective_action" : "screening",
    statusLabel: labels[status],
    summary: "A consulta pública informa somente o estado geral do protocolo.",
    timeline: [],
  };
}

export function addPublicReport(data: {
  type: string;
  place?: string;
  desc?: string;
  supportNeed?: SupportNeed;
}): PublicReport {
  load();
  const pinNumber = Math.floor(1000 + Math.random() * 9000);
  const pin = `#PROT-${pinNumber}`;
  const now = new Date();
  const dateFormatted = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeFormatted = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const stamp = `${dateFormatted} ${timeFormatted}`;

  const newReport: PublicReport = {
    pin,
    date: stamp,
    type: data.type || "Situação de vulnerabilidade",
    ...(data.supportNeed ? { supportNeed: data.supportNeed } : {}),
    region: data.place?.trim() || "Região Municipal",
    status: "screening",
    statusLabel: "Em triagem e análise técnica",
    summary:
      "Denúncia anônima recebida pelo portal Farol Protege e encaminhada à equipe de plantão para avaliação das medidas de proteção cabíveis.",
    timeline: [
      {
        stepNumber: 1,
        date: stamp,
        title: "Denúncia registrada com anonimato total",
        description:
          "Protocolo gerado e criptografado. Seus dados e endereço de rede não foram identificados.",
        completed: true,
      },
      {
        stepNumber: 2,
        date: stamp,
        title: "Fila de triagem técnica do Conselho Tutelar",
        description:
          "O caso está sendo analisado pelo(a) conselheiro(a) tutelar plantonista para deliberação de diligência.",
        completed: true,
      },
      {
        stepNumber: 3,
        date: "Aguardando deliberação",
        title: "Diligência no local / Averiguação",
        description:
          "Visita técnica ou contato articulado com a rede pública de saúde/educação.",
        completed: false,
      },
      {
        stepNumber: 4,
        date: "Pendente",
        title: "Medidas de proteção e encaminhamentos (Art. 101/136 ECA)",
        description:
          "Aplicação das medidas protetivas necessárias para resguardar os direitos fundamentais.",
        completed: false,
      },
    ],
  };

  reports = [newReport, ...reports];
  emit();
  return newReport;
}

export function usePublicReports() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
