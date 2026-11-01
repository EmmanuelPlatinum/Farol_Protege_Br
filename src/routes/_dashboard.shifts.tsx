import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, CalendarDays, ChevronLeft, ChevronRight, Clock, MessageCircle, Phone, Radio, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/app-header";
import { useI18n, useTx } from "@/lib/i18n";
import { assignedCounselor, counselors, dateKey, normalizePhone, onCall, weekDates } from "@/lib/shift-schedule";
import c1 from "@/assets/c1.jpg";
import c2 from "@/assets/c2.jpg";
import c3 from "@/assets/c3.jpg";
import c4 from "@/assets/c4.jpg";

export const Route = createFileRoute("/_dashboard/shifts")({
  head: () => ({ meta: [
    { title: "Plantões — Farol Protege" },
    { name: "description", content: "Escala semanal e sobreaviso demonstrativo do Conselho Tutelar." },
    { property: "og:title", content: "Plantões — Farol Protege" },
    { property: "og:description", content: "Escala semanal e sobreaviso demonstrativo do Conselho Tutelar." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Shifts,
});

const photos = [c1, c2, c3, c4];
type Swap = { key: string; date: Date; period: number; counselor: number };

function Shifts() {
  const { t, lang } = useI18n();
  const tx = useTx();
  const [now, setNow] = useState<Date | null>(null);
  const [offset, setOffset] = useState(0);
  const [swap, setSwap] = useState<Swap | null>(null);
  const [replacement, setReplacement] = useState("");
  const [reason, setReason] = useState("");
  const [requests, setRequests] = useState<Record<string, string>>({});
  const [contactOpen, setContactOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    try { setPhone(localStorage.getItem("farol_shift_phone") ?? ""); } catch { /* optional contact */ }
    return () => clearInterval(timer);
  }, []);
  const locale = lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : lang;
  const format = (date: Date) => date.toLocaleDateString(locale, { day: "2-digit", month: "short" });
  const current = now ? onCall(now) : null;
  const dates = now ? weekDates(now, offset) : [];
  const contact = normalizePhone(phone);
  const submitSwap = (event: React.FormEvent) => {
    event.preventDefault();
    if (!swap || !replacement || replacement === String(swap.counselor)) return;
    setRequests((prev) => ({ ...prev, [swap.key]: replacement }));
    setSwap(null);
    toast.success(tx("Troca solicitada em demonstração. Aguarda aprovação; a escala não foi alterada.", "Demo swap requested. Pending approval; schedule unchanged.", "Cambio solicitado en demostración. Pendiente de aprobación; el turno no cambió."));
  };
  return (
    <>
      <PageHeader title={t.shifts.title} subtitle={t.shifts.sub} />
      <section className="mb-8 border-y border-primary/20 bg-accent/50 px-5 py-6 sm:px-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-lg font-semibold"><Radio className="size-5 text-primary" />{tx("Plantão de Emergência de Hoje", "Today's emergency on-call", "Guardia de emergencia de hoy")}</h2><Badge variant="outline" className="border-success/30 bg-success-soft text-success">{tx("Sobreaviso", "On call", "De guardia")}</Badge></div>
        {current ? <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4"><img src={photos[current.counselor]} alt={counselors[current.counselor]} className="size-16 rounded-full object-cover" /><div><h3 className="text-xl font-semibold">{counselors[current.counselor]}</h3><p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><Clock className="size-4" />{t.periods[current.period]} · {format(current.date)}</p><p className="mt-1 text-xs text-muted-foreground">{phone || tx("Telefone de emergência não informado", "Emergency phone not provided", "Teléfono de emergencia no informado")}</p></div></div>
          <div className="flex flex-wrap gap-2">{contact ? <><Button asChild><a href={`tel:+${contact}`}><Phone />{tx("Ligar", "Call", "Llamar")}</a></Button><Button asChild variant="outline"><a href={`https://wa.me/${contact}`} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button></> : <Button variant="outline" onClick={() => { setPhoneDraft(phone); setContactOpen(true); }}><Phone />{tx("Informar telefone", "Add phone", "Informar teléfono")}</Button>}{contact && <Button variant="ghost" size="icon" title={tx("Alterar telefone", "Edit phone", "Editar teléfono")} aria-label={tx("Alterar telefone", "Edit phone", "Editar teléfono")} onClick={() => { setPhoneDraft(phone); setContactOpen(true); }}><Settings2 /></Button>}</div>
        </div> : <p className="text-sm text-muted-foreground">{tx("Carregando escala…", "Loading schedule…", "Cargando turnos…")}</p>}
      </section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold"><CalendarDays className="size-4 text-primary" />{tx("Escala semanal", "Weekly schedule", "Turnos semanales")}</h2><p className="mt-1 text-sm text-muted-foreground">{dates[0] && dates[6] ? `${format(dates[0])} — ${format(dates[6])} · ${dates[0].getFullYear()}` : "…"}</p></div><div className="flex items-center gap-1"><Button variant="outline" size="icon" aria-label={tx("Semana anterior", "Previous week", "Semana anterior")} title={tx("Semana anterior", "Previous week", "Semana anterior")} onClick={() => setOffset(offset - 1)}><ChevronLeft /></Button><Button variant="ghost" onClick={() => setOffset(0)}>{t.shifts.today}</Button><Button variant="outline" size="icon" aria-label={tx("Próxima semana", "Next week", "Próxima semana")} title={tx("Próxima semana", "Next week", "Próxima semana")} onClick={() => setOffset(offset + 1)}><ChevronRight /></Button></div></div>
      <div className="overflow-x-auto border-y"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b bg-muted/50"><th className="w-32 px-4 py-3 font-medium">{t.shifts.day}</th>{t.periods.map((period) => <th key={period} className="px-4 py-3 font-medium">{period}</th>)}</tr></thead><tbody>{dates.map((date) => {
        const today = !!now && dateKey(date) === dateKey(now);
        return <tr key={dateKey(date)} className={today ? "border-b bg-accent/40" : "border-b"}><th className="px-4 py-4 font-normal"><span className="block font-semibold">{date.toLocaleDateString(locale, { weekday: "short" })}</span><span className="text-xs text-muted-foreground">{format(date)}</span>{today && <Badge className="mt-2 block w-fit">{t.shifts.today}</Badge>}</th>{[0, 1].map((period) => {
          const index = assignedCounselor(date, period);
          const key = `${dateKey(date)}-${period}`;
          return <td key={period} className="px-4 py-4"><div className="flex items-center gap-2"><img src={photos[index]} alt="" className="size-8 rounded-full object-cover" /><span className="font-medium">{counselors[index]}</span></div>{requests[key] !== undefined ? <p role="status" className="mt-2 text-xs text-warning">{tx("Troca pendente", "Swap pending", "Cambio pendiente")} · {counselors[Number(requests[key])]}</p> : <Button size="sm" variant="ghost" className="mt-1 h-auto whitespace-normal px-0 py-2 text-xs text-primary" onClick={() => { setSwap({ key, date, period, counselor: index }); setReplacement(""); setReason(""); }}><ArrowLeftRight className="size-3" />{tx("Solicitar Troca de Turno", "Request shift swap", "Solicitar cambio de turno")}</Button>}</td>;
        })}</tr>;
      })}</tbody></table></div>
      <p className="mt-4 text-xs text-muted-foreground">{tx("Escala e conselheiros de exemplo. Solicitações simuladas não são enviadas e não alteram o plantão.", "Sample schedule and counselors. Simulated requests are not sent and do not change shifts.", "Turnos y consejeros de ejemplo. Las solicitudes simuladas no se envían ni cambian la guardia.")}</p>
      <Dialog open={!!swap} onOpenChange={(open) => { if (!open) setSwap(null); }}><DialogContent><DialogHeader><DialogTitle>{tx("Solicitar Troca de Turno", "Request shift swap", "Solicitar cambio de turno")}</DialogTitle><DialogDescription>{swap && `${format(swap.date)} · ${t.periods[swap.period]} · ${counselors[swap.counselor]}`}</DialogDescription></DialogHeader><form onSubmit={submitSwap} className="space-y-4"><div className="space-y-2"><Label htmlFor="replacement">{tx("Conselheiro substituto", "Replacement counselor", "Consejero sustituto")}</Label><Select value={replacement} onValueChange={setReplacement}><SelectTrigger id="replacement"><SelectValue placeholder={tx("Selecionar conselheiro", "Select counselor", "Seleccionar consejero")} /></SelectTrigger><SelectContent>{counselors.map((name, index) => index !== swap?.counselor && <SelectItem key={name} value={String(index)}>{name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label htmlFor="reason">{tx("Motivo", "Reason", "Motivo")}</Label><Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} required /></div><Button type="submit" disabled={!replacement || !reason.trim()} className="w-full">{tx("Registrar solicitação simulada", "Record simulated request", "Registrar solicitud simulada")}</Button></form></DialogContent></Dialog>
      <Dialog open={contactOpen} onOpenChange={setContactOpen}><DialogContent><DialogHeader><DialogTitle>{tx("Telefone de emergência do conselho", "Council emergency phone", "Teléfono de emergencia del consejo")}</DialogTitle><DialogDescription>{tx("Informe o número real do conselho, com DDD. Ele será usado nos botões Ligar e WhatsApp.", "Enter the council's real Brazilian phone with area code, for Call and WhatsApp.", "Ingresa el número brasileño real del consejo con código de área para Llamar y WhatsApp.")}</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!normalizePhone(phoneDraft)) { toast.error(tx("Informe um telefone válido com DDD.", "Enter a valid phone with area code.", "Ingresa un teléfono válido con código de área.")); return; } setPhone(phoneDraft); try { localStorage.setItem("farol_shift_phone", phoneDraft); } catch { /* optional contact */ } setContactOpen(false); }}><Label htmlFor="emergency-phone">{tx("Telefone com DDD", "Phone with area code", "Teléfono con código de área")}</Label><Input id="emergency-phone" type="tel" required value={phoneDraft} onChange={(e) => setPhoneDraft(e.target.value)} /><Button type="submit" className="w-full">{tx("Salvar telefone", "Save phone", "Guardar teléfono")}</Button></form></DialogContent></Dialog>
    </>
  );
}
