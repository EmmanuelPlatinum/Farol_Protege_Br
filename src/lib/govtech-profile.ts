import { useSyncExternalStore } from "react";

export type GovtechProfile = "counselor" | "prosecutor" | "juvenile_court";

const STORAGE_KEY = "farol_govtech_demo_profile";
let profile: GovtechProfile = "counselor";
let loaded = false;
const listeners = new Set<() => void>();

function isProfile(value: string | null): value is GovtechProfile {
  return value === "counselor" || value === "prosecutor" || value === "juvenile_court";
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isProfile(stored)) profile = stored;
  } catch {
    profile = "counselor";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    load();
    queueMicrotask(() => listeners.forEach((current) => current()));
  }
  return () => listeners.delete(listener);
}

export function setGovtechProfile(next: GovtechProfile) {
  profile = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The active selection still applies for this session if storage is unavailable.
    }
  }
  listeners.forEach((listener) => listener());
}

export function useGovtechProfile() {
  const activeProfile = useSyncExternalStore<GovtechProfile>(
    subscribe,
    () => profile,
    () => "counselor",
  );
  return {
    profile: activeProfile,
    isReadOnly: activeProfile !== "counselor",
    setProfile: setGovtechProfile,
  };
}
