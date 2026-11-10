import { supabase } from "@/lib/supabase";

export type CmdcaReportRow = {
  period: string;
  region: string;
  category: string;
  status: string;
  total: number;
};

export async function getCmdcaReportSummary(): Promise<CmdcaReportRow[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("get_cmdca_report_summary");
  if (error) throw error;
  if (!Array.isArray(data)) {
    throw new Error("O servidor não retornou o resumo agregado do CMDCA.");
  }

  return data.map((row: Record<string, unknown>) => {
    const total =
      typeof row["total"] === "number"
        ? row["total"]
        : typeof row["total"] === "string" && /^\d+$/.test(row["total"])
          ? Number(row["total"])
          : Number.NaN;
    if (
      typeof row["period"] !== "string" ||
      typeof row["region"] !== "string" ||
      typeof row["category"] !== "string" ||
      typeof row["status"] !== "string" ||
      !Number.isSafeInteger(total) ||
      total <= 0
    ) {
      throw new Error("O servidor retornou uma linha inválida no resumo do CMDCA.");
    }
    return {
      period: row["period"],
      region: row["region"],
      category: row["category"],
      status: row["status"],
      total,
    };
  });
}

export function summarizeCmdcaRows(
  records: Array<{
    date: string;
    region: string;
    category: string;
    status: string;
  }>,
): CmdcaReportRow[] {
  const groups = new Map<string, CmdcaReportRow>();
  for (const record of records) {
    const isoDate = record.date.match(/^(\d{4}-\d{2})/)?.[1];
    const localizedDate = record.date.match(/^\d{2}\/\d{2}\/(\d{4})/);
    const period =
      isoDate ??
      (localizedDate ? `${localizedDate[1]}-${record.date.slice(3, 5)}` : "data-indisponivel");
    const key = [period, record.region, record.category, record.status].join("\u0000");
    const existing = groups.get(key);
    if (existing) {
      existing.total += 1;
    } else {
      groups.set(key, {
        period,
        region: record.region,
        category: record.category,
        status: record.status,
        total: 1,
      });
    }
  }
  return [...groups.values()].sort(
    (left, right) =>
      left.period.localeCompare(right.period) ||
      left.region.localeCompare(right.region) ||
      left.category.localeCompare(right.category) ||
      left.status.localeCompare(right.status),
  );
}
