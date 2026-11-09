export type ProtectiveMeasureCategory = "child" | "caregiver";
export type ProtectiveMeasureStatus = "pending" | "in_progress" | "completed" | "breached";

export type ProtectiveMeasure = {
  id: string;
  templateId: string;
  title: string;
  category: ProtectiveMeasureCategory;
  legalBasis: string;
  status: ProtectiveMeasureStatus;
  createdAt: string;
  deadlineDays: number;
};

export const protectiveMeasureTemplates = [
  {
    id: "school-enrollment",
    title: "Matrícula e frequência escolar",
    category: "child",
    defaultDeadlineDays: 15,
    legalBasis: "ECA, art. 101, III",
  },
  {
    id: "health-treatment",
    title: "Tratamento médico ou psicológico",
    category: "child",
    defaultDeadlineDays: 15,
    legalBasis: "ECA, art. 101, V",
  },
  {
    id: "shelter",
    title: "Acolhimento institucional ou familiar",
    category: "child",
    defaultDeadlineDays: 1,
    legalBasis: "ECA, art. 101, VII e VIII",
  },
  {
    id: "family-support",
    title: "Encaminhamento a programa de proteção e apoio familiar",
    category: "caregiver",
    defaultDeadlineDays: 30,
    legalBasis: "ECA, art. 129, I e IV",
  },
  {
    id: "substance-treatment",
    title: "Tratamento para dependência de álcool ou outras drogas",
    category: "caregiver",
    defaultDeadlineDays: 30,
    legalBasis: "ECA, art. 129, II",
  },
  {
    id: "parenting-guidance",
    title: "Curso ou programa de orientação",
    category: "caregiver",
    defaultDeadlineDays: 30,
    legalBasis: "ECA, art. 129, IV",
  },
] as const satisfies readonly {
  id: string;
  title: string;
  category: ProtectiveMeasureCategory;
  defaultDeadlineDays: number;
  legalBasis: string;
}[];

export function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getMeasureDeadline(measure: ProtectiveMeasure): string {
  return addDaysToDateKey(measure.createdAt.slice(0, 10), measure.deadlineDays);
}

export function getDaysUntilDeadline(
  measure: ProtectiveMeasure,
  today = getDateKey(new Date()),
): number {
  const todayDate = new Date(`${today}T00:00:00.000Z`).getTime();
  const deadlineDate = new Date(`${getMeasureDeadline(measure)}T00:00:00.000Z`).getTime();
  return Math.ceil((deadlineDate - todayDate) / 86_400_000);
}

export function isActiveMeasureStatus(status: ProtectiveMeasureStatus): boolean {
  return status === "pending" || status === "in_progress";
}

export function isDueWithinDays(
  measure: ProtectiveMeasure,
  days: number,
  today = getDateKey(new Date()),
): boolean {
  const remaining = getDaysUntilDeadline(measure, today);
  return isActiveMeasureStatus(measure.status) && remaining >= 0 && remaining <= days;
}

export function formatDateKey(dateKey: string, locale = "pt-BR"): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(year!, month! - 1, day!)),
  );
}
