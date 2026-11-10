import { describe, expect, it } from "vitest";
import { buildCsv, csvCell } from "@/lib/csv";
import { summarizeCmdcaRows } from "@/lib/cmdca-report";

describe("CSV export safety", () => {
  it("quotes values and escapes embedded quotes", () => {
    expect(csvCell('Casa "Azul"')).toBe('"Casa ""Azul"""');
  });

  it("neutralizes spreadsheet formula prefixes, including after whitespace", () => {
    expect(csvCell("=1+1")).toBe('"\'=1+1"');
    expect(csvCell("  @SUM(A1:A2)")).toBe('"\'  @SUM(A1:A2)"');
    expect(csvCell("-2")).toBe('"\'-2"');
  });

  it("builds semicolon-delimited UTF-8 CSV", () => {
    expect(buildCsv(["Região", "Total"], [["Centro", 5]])).toBe(
      '\uFEFF"Região";"Total"\r\n"Centro";"5"',
    );
  });

  it("aggregates records without including individual identifiers", () => {
    const summary = summarizeCmdcaRows([
      { date: "2026-10-24", region: "Centro", category: "Violência", status: "Em processamento" },
      { date: "2026-10-25", region: "Centro", category: "Violência", status: "Em processamento" },
    ]);

    expect(summary).toEqual([
      {
        period: "2026-10",
        region: "Centro",
        category: "Violência",
        status: "Em processamento",
        total: 2,
      },
    ]);
  });
});
