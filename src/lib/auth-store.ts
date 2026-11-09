import { useSyncExternalStore } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, type CouncilRegion } from "@/lib/supabase";

export type AppRole = "counselor" | "coordinator" | "admin" | "prosecutor" | "juvenile_court";
export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  employee_registration: string | null;
  council_region: CouncilRegion | null;
  role: AppRole;
  approved_at: string | null;
};

type AuthSnapshot = {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  demoMode: boolean;
  error: string | null;
};

const DEMO_SESSION_KEY = "farol_demo_session";
const initialSnapshot: AuthSnapshot = {
  loading: true,
  session: null,
  user: null,
  profile: null,
  demoMode: false,
  error: null,
};
let snapshot = initialSnapshot;
let initialized = false;
let authSubscription: { unsubscribe: () => void } | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(next: AuthSnapshot) {
  snapshot = next;
  emit();
}

function readDemoMode() {
  try {
    return sessionStorage.getItem(DEMO_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

async function updateFromSession(session: Session | null) {
  if (!session) {
    setSnapshot({
      loading: false,
      session: null,
      user: null,
      profile: null,
      demoMode: readDemoMode(),
      error: null,
    });
    return;
  }

  setSnapshot({
    loading: true,
    session,
    user: session.user,
    profile: null,
    demoMode: false,
    error: null,
  });
  if (!supabase) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, employee_registration, council_region, role, approved_at")
    .eq("id", session.user.id)
    .maybeSingle();

  setSnapshot({
    loading: false,
    session,
    user: session.user,
    profile: (data as UserProfile | null) ?? null,
    demoMode: false,
    error: error?.message ?? null,
  });
}

function initialize() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const demoMode = readDemoMode();

  if (!supabase) {
    setSnapshot({
      ...initialSnapshot,
      loading: false,
      demoMode,
      error: null,
    });
    return;
  }

  void supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      setSnapshot({
        ...initialSnapshot,
        loading: false,
        demoMode,
        error: error.message,
      });
      return;
    }
    void updateFromSession(data.session);
  });
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    queueMicrotask(() => void updateFromSession(session));
  });
  authSubscription = data.subscription;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  initialize();
  return () => listeners.delete(listener);
}

export function useAuth() {
  return useSyncExternalStore(subscribe, () => snapshot, () => initialSnapshot);
}

export function getAuthSnapshot() {
  return snapshot;
}

export async function startDemoSession() {
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(DEMO_SESSION_KEY, "true");
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Não foi possível iniciar a sessão demonstrativa: ${error.message}`
          : "Não foi possível iniciar a sessão demonstrativa.",
      );
    }
  }
  setSnapshot({
    loading: false,
    session: null,
    user: null,
    profile: null,
    demoMode: true,
    error: null,
  });
}

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) throw new Error("O Lovable Cloud não está configurado neste ambiente.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await updateFromSession(data.session);
  return data;
}

export async function registerAccount(input: {
  email: string;
  password: string;
  fullName: string;
  employeeRegistration: string;
  councilRegion: CouncilRegion;
}) {
  if (!supabase) throw new Error("O Lovable Cloud não está configurado neste ambiente.");
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
        employee_registration: input.employeeRegistration.trim(),
        council_region: input.councilRegion,
      },
    },
  });
  if (error) throw error;
  if (data.session) await updateFromSession(data.session);
  return data;
}

export async function requestPasswordReset(email: string) {
  if (!supabase) throw new Error("O Lovable Cloud não está configurado neste ambiente.");
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw error;
}

export async function signOut() {
  try {
    sessionStorage.removeItem(DEMO_SESSION_KEY);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Não foi possível encerrar a sessão demonstrativa: ${error.message}`
        : "Não foi possível encerrar a sessão demonstrativa.",
    );
  }
  if (supabase) {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
  setSnapshot({
    loading: false,
    session: null,
    user: null,
    profile: null,
    demoMode: false,
    error: null,
  });
}

export function disposeAuthSubscriptionForTests() {
  authSubscription?.unsubscribe();
  authSubscription = null;
  initialized = false;
  snapshot = initialSnapshot;
}
