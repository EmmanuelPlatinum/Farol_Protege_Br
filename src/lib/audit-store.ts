import { useEffect, useState, useSyncExternalStore } from "react";
import type { GovtechProfile } from "@/lib/govtech-profile";
import { getAuthSnapshot, useAuth } from "@/lib/auth-store";
import { supabase } from "@/lib/supabase";

export type AuditAction =
  | "case_viewed_unmasked"
  | "csv_exported"
  | "letter_generated"
  | "case_status_changed"
  | "protective_measure_status_changed"
  | "privacy_mode_disabled";

export type AuditEventInput = {
  caseId: string | null;
  action: AuditAction;
  summary: string;
  actorProfile: GovtechProfile;
};

export type AuditEvent = AuditEventInput & {
  id: string;
  timestampUtc: string;
  actor: string;
  counselorRegistration: string;
  simulatedIp: string;
  simulatedBrowser: string;
};

const STORAGE_KEY = "farol_lgpd_audit_events";
const EMPTY_EVENTS: AuditEvent[] = [];
let events: AuditEvent[] = EMPTY_EVENTS;
let loaded = false;
let loadError: string | null = null;
const listeners = new Set<() => void>();
let activeCaseId: string | null = null;

export function setActiveAuditCase(caseId: string | null) {
  activeCaseId = caseId;
}

export function getActiveAuditCase() {
  return activeCaseId;
}

function notify() {
  listeners.forEach((listener) => listener());
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Formato de auditoria inválido.");
      events = parsed as AuditEvent[];
    }
  } catch (error) {
    loadError =
      error instanceof Error
        ? `Não foi possível carregar o histórico local de auditoria: ${error.message}`
        : "Não foi possível carregar o histórico local de auditoria.";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    load();
    queueMicrotask(notify);
  }
  return () => listeners.delete(listener);
}

export async function appendAuditEvents(inputs: AuditEventInput[]) {
  if (typeof window === "undefined") {
    throw new Error("O registro de auditoria só pode ser gravado no navegador.");
  }
  const auth = getAuthSnapshot();
  if (auth.user) {
    if (!supabase || !auth.profile?.approved_at) {
      throw new Error("Perfil autenticado sem autorização para gravar auditoria.");
    }
    const records = inputs.map((input) => ({
      case_id: input.caseId,
      actor_user_id: auth.user!.id,
      action: input.action,
      summary: input.summary,
      client_metadata: {
        profile_role: auth.profile!.role,
        user_agent: navigator.userAgent,
      },
    }));
    const { data, error } = await supabase
      .from("audit_events")
      .insert(records)
      .select("id, case_id, actor_user_id, action, summary, occurred_at, client_metadata");
    if (error) throw error;
    const mapped = (data ?? []).map((row, index): AuditEvent => ({
      ...inputs[index]!,
      id: row.id,
      caseId: row.case_id,
      timestampUtc: row.occurred_at,
      actor: auth.profile!.full_name,
      counselorRegistration: auth.profile!.employee_registration ?? "Matrícula não informada",
      simulatedIp: "IP não coletado pelo cliente",
      simulatedBrowser: navigator.userAgent,
    }));
    return mapped;
  }

  load();
  if (loadError) throw new Error(loadError);

  const timestampUtc = new Date().toISOString();
  const records = inputs.map((input): AuditEvent => {
    const id = globalThis.crypto?.randomUUID?.();
    if (!id) throw new Error("Não foi possível gerar um identificador para o evento de auditoria.");
    return {
      ...input,
      id,
      timestampUtc,
      actor: "Ana Costa · usuário demonstrativo",
      counselorRegistration: "Matrícula não configurada",
      simulatedIp: "192.0.2.1 · IP reservado para documentação (simulado)",
      simulatedBrowser: "Cliente web do Farol Protege · ambiente demonstrativo",
    };
  });
  const next = [...events, ...records];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Não foi possível persistir o registro de auditoria: ${error.message}`
        : "Não foi possível persistir o registro de auditoria.",
    );
  }
  events = next;
  notify();
  return records;
}

export function useAuditEvents(caseId?: string) {
  const auth = useAuth();
  const snapshot = useSyncExternalStore(subscribe, () => events, () => EMPTY_EVENTS);
  const localError = useSyncExternalStore(subscribe, () => loadError, () => null);
  const [cloudEvents, setCloudEvents] = useState<AuditEvent[]>([]);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [cloudLoading, setCloudLoading] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!auth.user) {
      setCloudEvents([]);
      setCloudError(null);
      setCloudLoading(false);
      return;
    }
    if (!client) {
      setCloudEvents([]);
      setCloudError("O Lovable Cloud não está configurado neste ambiente.");
      setCloudLoading(false);
      return;
    }
    let active = true;
    setCloudLoading(true);
    const loadEvents = async () => {
      try {
        let query = client
          .from("audit_events")
          .select("id, case_id, actor_user_id, action, summary, occurred_at, client_metadata")
          .order("occurred_at", { ascending: false });
        if (caseId) query = query.or(`case_id.eq.${caseId},case_id.is.null`);
        const { data, error } = await query;
        if (!active) return;
        if (error) {
          setCloudError(error.message);
          setCloudLoading(false);
          return;
        }
        setCloudError(null);
        setCloudLoading(false);
        setCloudEvents((data ?? []).map((row): AuditEvent => {
          const metadata = row.client_metadata as Record<string, unknown> | null;
          const profileRole = metadata?.profile_role;
          return {
            id: row.id,
            caseId: row.case_id,
            action: row.action as AuditAction,
            summary: row.summary,
            actorProfile:
              profileRole === "prosecutor" || profileRole === "juvenile_court"
                ? profileRole
                : "counselor",
            timestampUtc: row.occurred_at,
            actor: row.actor_user_id === auth.user?.id
              ? auth.profile?.full_name ?? "Usuário autenticado"
              : `Usuário ${row.actor_user_id.slice(0, 8)}`,
            counselorRegistration:
              row.actor_user_id === auth.user?.id
                ? auth.profile?.employee_registration ?? "Matrícula não informada"
                : "Matrícula restrita",
            simulatedIp: "IP não coletado pelo cliente",
            simulatedBrowser:
              typeof metadata?.user_agent === "string"
                ? metadata.user_agent
                : "Navegador não informado",
          };
        }));
      } catch (loadError) {
        if (!active) return;
        setCloudError(
          loadError instanceof Error
            ? loadError.message
            : "Falha inesperada ao carregar eventos de auditoria.",
        );
        setCloudLoading(false);
      }
    };
    void loadEvents();
    const channel = client
      .channel(`audit-events-${auth.user.id}-${caseId ?? "all"}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "audit_events" }, () => void loadEvents())
      .subscribe();
    return () => {
      active = false;
      void client.removeChannel(channel);
    };
  }, [auth.profile?.employee_registration, auth.profile?.full_name, auth.user, caseId]);

  return {
    events: auth.user
      ? cloudEvents
      : caseId
        ? snapshot.filter((event) => event.caseId === caseId || event.caseId === null)
        : snapshot,
    error: auth.user ? cloudError : localError,
    loading: auth.user ? cloudLoading : false,
  };
}
