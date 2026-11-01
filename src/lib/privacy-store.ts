import { useSyncExternalStore } from "react";

const LGPD_STORAGE_KEY = "farol_lgpd_mode";

let lgpdMode = false;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(LGPD_STORAGE_KEY);
    // Default to true for enhanced ECA / LGPD privacy if not set, or restore saved preference
    lgpdMode = raw !== null ? raw === "true" : true;
  } catch {
    lgpdMode = true;
  }
}

function save() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LGPD_STORAGE_KEY, String(lgpdMode));
  } catch {
    /* ignore */
  }
}

const emit = () => {
  save();
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (!loaded) {
    load();
    queueMicrotask(() => listeners.forEach((l) => l()));
  }
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => lgpdMode;
const getServerSnapshot = () => true;

/**
 * Pure helper to mask the name of minors into initials.
 * Examples:
 * - "Lucas Silva" -> "L. S."
 * - "Maria Eduarda Santos" -> "M. E. S."
 * - "J. S." -> "J. S."
 */
export function maskName(name: string, enabled = true): string {
  if (!enabled || !name) return name;
  const trimmed = name.trim();
  if (!trimmed) return "";

  // Normalize formats like "A.S." to "A. S."
  const normalized = trimmed.replace(/\./g, ". ");
  const parts = normalized.split(/\s+/).filter(Boolean);

  // If already initials like "J. S." or "L. S."
  const isAlreadyInitials = parts.every(
    (p) => p.length <= 2 && (p.endsWith(".") || p.length === 1)
  );
  if (isAlreadyInitials) {
    return parts.map((p) => (p.endsWith(".") ? p : `${p}.`)).join(" ");
  }

  // Convert to initials: "Lucas Silva" -> "L. S."
  return parts.map((p) => `${p.charAt(0).toUpperCase()}.`).join(" ");
}

/**
 * Pure helper to mask family surnames when in LGPD mode.
 * Example: "Silva" -> "S."
 */
export function maskFamily(family: string, enabled = true): string {
  if (!enabled || !family) return family;
  const trimmed = family.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 2 && trimmed.endsWith(".")) return trimmed;
  return `${trimmed.charAt(0).toUpperCase()}.`;
}

export function setLgpdMode(val: boolean) {
  lgpdMode = val;
  emit();
}

export function toggleLgpdMode() {
  lgpdMode = !lgpdMode;
  emit();
}

export function usePrivacy() {
  const isLgpdActive = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    lgpdMode: isLgpdActive,
    setLgpdMode,
    toggleLgpdMode,
    maskName: (name: string) => maskName(name, isLgpdActive),
    maskFamily: (fam: string) => maskFamily(fam, isLgpdActive),
  };
}
