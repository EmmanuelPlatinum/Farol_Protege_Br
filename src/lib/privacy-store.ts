/**
 * Masks the name of minors into initials.
 * Examples:
 * - "Lucas Silva" -> "L. S."
 * - "Maria Eduarda Santos" -> "M. E. S."
 * - "J. S." -> "J. S."
 */
export function maskName(name: string): string {
  if (!name) return name;
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
 * Masks family surnames.
 * Example: "Silva" -> "S."
 */
export function maskFamily(family: string): string {
  if (!family) return family;
  const trimmed = family.trim();
  if (!trimmed) return "";
  if (trimmed.length <= 2 && trimmed.endsWith(".")) return trimmed;
  return `${trimmed.charAt(0).toUpperCase()}.`;
}

/** Hides street-level address details, keeping only the last segment (e.g. neighbourhood). */
export function maskAddress(address: string): string {
  if (!address) return address;
  const parts = address.split(/[,\-–—]/).map((p) => p.trim()).filter(Boolean);
  const tail = parts.length > 1 ? parts[parts.length - 1] : "";
  return tail && !/\d/.test(tail) ? `Endereço sigiloso · ${tail}` : "Endereço sigiloso";
}

export function usePrivacy() {
  return {
    lgpdMode: true as const,
    maskName,
    maskFamily,
    maskAddress,
  };
}
