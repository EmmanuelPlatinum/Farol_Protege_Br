import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Clock3, ShieldAlert } from "lucide-react";
import { PublicPageIntro } from "@/components/public-site-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTx } from "@/lib/i18n";
import { assignedCounselor, counselors, dateKey, weekDates } from "@/lib/shift-schedule";

export const Route = createFileRoute("/_public/public-shifts")({
  head: () => ({ meta: [{ title: "Plantões — Farol Infantil" }] }),
  component: PublicShifts,
});

function PublicShifts() {
  const tx = useTx();
  const dates = weekDates(new Date());
  const todayKey = dateKey(new Date());

  return (
    <>
      <PublicPageIntro
        eyebrow={tx("INFORMAÇÃO PÚBLICA", "PUBLIC INFORMATION", "INFORMACIÓN PÚBLICA")}
        title={tx("Plantões do Conselho", "Council duty roster", "Guardias del Consejo")}
        description={tx(
          "Consulte a escala semanal demonstrativa do protótipo. A disponibilidade real deve ser confirmada nos canais oficiais do município.",
          "View the prototype's demonstration weekly roster. Actual availability must be confirmed through official municipal channels.",
          "Consulte el cronograma semanal demostrativo. La disponibilidad real debe confirmarse por canales oficiales del municipio.",
        )}
      />
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <Card className="mb-5 border-amber-500/30 bg-amber-500/5 shadow-none">
          <CardContent className="flex gap-3 p-4">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <p className="text-sm text-muted-foreground">
              {tx(
                "Escala fictícia de demonstração. Os nomes e turnos não confirmam serviço, sobreaviso nem disponibilidade real. Não há telefone de contato configurado.",
                "Fictional demo roster. Names and shifts do not confirm real service or availability. No contact number is configured.",
                "Cronograma ficticio. Los nombres y turnos no confirman disponibilidad real. No hay teléfono de contacto configurado.",
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-5 text-primary" />
              {tx("Visão semanal", "Weekly view", "Vista semanal")}
            </CardTitle>
            <CardDescription>
              {tx(
                "Turno diurno: 08h–18h · Turno noturno: 18h–08h",
                "Day shift: 8am–6pm · Night shift: 6pm–8am",
                "Turno diurno: 08–18 h · Turno nocturno: 18–08 h",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dates.map((date) => {
              const dateValue = dateKey(date);
              return (
                <div
                  key={dateValue}
                  className={`rounded-xl border p-4 ${dateValue === todayKey ? "border-primary/40 bg-primary/5" : "bg-card"}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="font-semibold capitalize">
                      {new Intl.DateTimeFormat("pt-BR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "short",
                      }).format(date)}
                    </p>
                    {dateValue === todayKey && (
                      <Badge variant="secondary">{tx("Hoje", "Today", "Hoy")}</Badge>
                    )}
                  </div>
                  {[0, 1].map((period) => (
                    <div
                      key={period}
                      className="flex items-center justify-between border-t py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Clock3 className="size-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {period === 0
                              ? tx("Diurno", "Day", "Diurno")
                              : tx("Noturno", "Night", "Nocturno")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {period === 0 ? "08h–18h" : "18h–08h"}
                          </p>
                        </div>
                      </div>
                      <span className="text-right text-xs text-muted-foreground">
                        {counselors[assignedCounselor(date, period)] ??
                          tx("A confirmar", "To be confirmed", "Por confirmar")}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
