import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/app-header";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_dashboard/shifts")({
  head: () => ({
    meta: [
      { title: "Plantões — Farol Protege" },
      { name: "description", content: "Escala de plantão integrada do Conselho Tutelar." },
      { property: "og:title", content: "Plantões — Farol Protege" },
      { property: "og:description", content: "Escala de plantão integrada do Conselho Tutelar." },
    ],
  }),
  component: Shifts,
});

const rows = [
  { day: 0, counselor: "Ana Costa", period: 0, today: true },
  { day: 0, counselor: "Marcos Lima", period: 1, today: true },
  { day: 1, counselor: "Júlia Rocha", period: 0 },
  { day: 1, counselor: "Paulo Mendes", period: 1 },
  { day: 2, counselor: "Ana Costa", period: 0 },
  { day: 2, counselor: "Júlia Rocha", period: 1 },
];

function Shifts() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t.shifts.title} subtitle={t.shifts.sub} />
      <Card className="overflow-hidden shadow-card">
        <Table>
          <TableHeader><TableRow><TableHead>{t.shifts.day}</TableHead><TableHead>{t.shifts.counselor}</TableHead><TableHead>{t.shifts.period}</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{t.days[r.day]} {r.today && <Badge className="ml-2">{t.shifts.today}</Badge>}</TableCell>
                <TableCell>{r.counselor}</TableCell>
                <TableCell className="text-muted-foreground">{t.periods[r.period]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
