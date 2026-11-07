import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeftRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageCircle,
  Phone,
  PhoneCall,
  Radio,
  Settings2,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/app-header";
import { useI18n, useTx } from "@/lib/i18n";
import {
  assignedCounselor,
  counselors,
  dateKey,
  formatPhoneDisplay,
  normalizePhone,
  onCall,
  resolveActiveCounselor,
  shiftKey,
  weekDates,
  type SwapRequest,
} from "@/lib/shift-schedule";
import c1 from "@/assets/c1.jpg";
import c2 from "@/assets/c2.jpg";
import c3 from "@/assets/c3.jpg";
import c4 from "@/assets/c4.jpg";

export const Route = createFileRoute("/_dashboard/shifts")({
  head: () => ({
    meta: [
      { title: "Plantões — Farol Protege" },
      {
        name: "description",
        content: "Escala semanal e sobreaviso demonstrativo do Conselho Tutelar.",
      },
      { property: "og:title", content: "Plantões — Farol Protege" },
      {
        property: "og:description",
        content: "Escala semanal e sobreaviso demonstrativo do Conselho Tutelar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Shifts,
});

const photos = [c1, c2, c3, c4];

type SwapSelection = {
  key: string;
  date: Date;
  period: number;
  counselor: number;
};

function Shifts() {
  const { t, lang } = useI18n();
  const tx = useTx();

  const [now, setNow] = useState<Date | null>(null);
  const [offset, setOffset] = useState(0);

  // Swap modal state
  const [swapSelection, setSwapSelection] = useState<SwapSelection | null>(null);
  const [replacement, setReplacement] = useState("");
  const [reason, setReason] = useState("");

  // Swap requests map: key -> SwapRequest
  const [swapRequests, setSwapRequests] = useState<Record<string, SwapRequest>>({});

  // Council phone configuration dialog
  const [contactOpen, setContactOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60_000);
    try {
      const savedPhone = localStorage.getItem("farol_shift_phone");
      if (savedPhone) setPhone(savedPhone);
    } catch {
      /* optional preference */
    }
    return () => clearInterval(timer);
  }, []);

  const locale = lang === "pt" ? "pt-BR" : lang === "en" ? "en-US" : lang;
  const formatShortDate = (date: Date) =>
    date.toLocaleDateString(locale, { day: "2-digit", month: "short" });

  const currentOnCall = now ? onCall(now) : null;
  const dates = now ? weekDates(now, offset) : [];

  // Strictly validated phone contact using pure helper normalizePhone
  const validContact = normalizePhone(phone);

  // Submit simulated shift swap request
  const handleSwapSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!swapSelection || !replacement || replacement === String(swapSelection.counselor)) {
      return;
    }

    const newRequest: SwapRequest = {
      key: swapSelection.key,
      dateKey: dateKey(swapSelection.date),
      period: swapSelection.period,
      originalCounselor: swapSelection.counselor,
      replacementCounselor: Number(replacement),
      reason,
      status: "pending_approval",
      requestedAt: new Date().toISOString(),
    };

    setSwapRequests((prev) => ({
      ...prev,
      [swapSelection.key]: newRequest,
    }));

    setSwapSelection(null);
    setReplacement("");
    setReason("");

    toast.success(
      tx(
        "Solicitação de troca registrada. Em conformidade com as regras do conselho, o pedido aguarda aprovação da coordenação e a escala titular não foi alterada.",
        "Shift swap requested. In accordance with council rules, the request awaits coordination approval and the schedule remains unchanged.",
        "Solicitud de cambio registrada. De acuerdo con las normas del consejo, el pedido espera la aprobación de la coordinación y el titular no cambió."
      )
    );
  };

  const handleCancelSwap = (key: string) => {
    setSwapRequests((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    toast.info(
      tx(
        "Solicitação de troca cancelada.",
        "Swap request canceled.",
        "Solicitud de cambio cancelada."
      )
    );
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizePhone(phoneDraft);
    if (!normalized) {
      toast.error(
        tx(
          "Informe um telefone brasileiro válido com DDD (ex: 11 98888-7777).",
          "Please enter a valid Brazilian phone with area code (e.g. 11 98888-7777).",
          "Ingrese un teléfono brasileño válido con código de área (ej: 11 98888-7777)."
        )
      );
      return;
    }
    setPhone(phoneDraft);
    try {
      localStorage.setItem("farol_shift_phone", phoneDraft);
    } catch {
      /* optional preference */
    }
    setContactOpen(false);
    toast.success(
      tx(
        "Telefone oficial de plantão cadastrado com sucesso!",
        "Official on-call phone registered successfully!",
        "¡Teléfono oficial de guardia registrado con éxito!"
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t.shifts.title} subtitle={t.shifts.sub} />

      {/* Card de Destaque no Topo: Plantão de Emergência de Hoje */}
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-card via-card to-accent/20 shadow-md">
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-3 rounded-full bg-emerald-500" />
              </span>
              <CardTitle className="flex items-center gap-2 text-lg font-bold sm:text-xl">
                <Radio className="size-5 text-primary" />
                <span>
                  {tx(
                    "Plantão de Emergência de Hoje",
                    "Today's Emergency On-Call",
                    "Guardia de Emergencia de Hoy"
                  )}
                </span>
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
              >
                <ShieldCheck className="mr-1 size-3.5" />
                {tx("Sobreaviso Ativo · ECA 24h", "Active On-Call · 24h", "Guardia Activa · 24h")}
              </Badge>
            </div>
          </div>
          <CardDescription className="text-xs">
            {tx(
              "Conselheiro tutelar titular escalado para pronto atendimento a chamados emergenciais.",
              "Titular child counselor assigned for prompt emergency response.",
              "Consejero tutelar titular asignado para atención inmediata de emergencias."
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          {currentOnCall ? (
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              {/* Active Counselor Info */}
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative">
                  <img
                    src={photos[currentOnCall.counselor]}
                    alt={counselors[currentOnCall.counselor]}
                    className="size-16 rounded-full border-2 border-primary object-cover shadow-sm sm:size-20"
                  />
                  <span
                    className="absolute bottom-0 right-0 size-4 rounded-full border-2 border-card bg-emerald-500"
                    title={tx("Disponível", "Available", "Disponible")}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
                      {counselors[currentOnCall.counselor]}
                    </h3>
                    <Badge variant="secondary" className="text-[11px] font-medium">
                      <UserCheck className="mr-1 size-3 text-primary" />
                      {tx("Titular", "Titular", "Titular")}
                    </Badge>
                  </div>
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="size-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {t.periods[currentOnCall.period]}
                    </span>
                    <span>·</span>
                    <span>{formatShortDate(currentOnCall.date)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {validContact ? (
                      <span className="font-mono font-medium text-foreground">
                        {formatPhoneDisplay(phone)}
                      </span>
                    ) : (
                      <span className="italic text-muted-foreground">
                        {tx(
                          "Telefone de emergência ainda não configurado",
                          "Emergency phone not configured yet",
                          "Teléfono de emergencia aún no configurado"
                        )}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Direct Call / WhatsApp Buttons (Rules strictly respected) */}
              <div className="flex flex-wrap items-center gap-2.5">
                {validContact ? (
                  <>
                    <Button
                      asChild
                      size="default"
                      className="gap-2 bg-primary font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                    >
                      <a href={`tel:+${validContact}`}>
                        <Phone className="size-4" />
                        <span>{tx("Ligar para Plantonista", "Call Counselor", "Llamar a Guardia")}</span>
                      </a>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      size="default"
                      className="gap-2 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                    >
                      <a
                        href={`https://wa.me/${validContact}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="size-4" />
                        <span>WhatsApp</span>
                      </a>
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      title={tx("Alterar número de emergência", "Change emergency phone", "Cambiar teléfono")}
                      aria-label={tx("Alterar número de emergência", "Change emergency phone", "Cambiar teléfono")}
                      onClick={() => {
                        setPhoneDraft(phone);
                        setContactOpen(true);
                      }}
                    >
                      <Settings2 className="size-4 text-muted-foreground" />
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <Button
                      variant="outline"
                      size="default"
                      className="gap-2 border-primary/40 bg-accent text-accent-foreground hover:bg-accent/80 font-medium"
                      onClick={() => {
                        setPhoneDraft(phone);
                        setContactOpen(true);
                      }}
                    >
                      <PhoneCall className="size-4 text-primary" />
                      <span>
                        {tx(
                          "Configurar Telefone de Emergência",
                          "Set Emergency Phone",
                          "Configurar Teléfono de Emergencia"
                        )}
                      </span>
                    </Button>
                    <span className="text-[11px] text-muted-foreground">
                      {tx(
                        "Canais de Ligar e WhatsApp serão liberados após informar o número.",
                        "Call and WhatsApp channels will be unlocked after adding the number.",
                        "Los canales de Llamar y WhatsApp se habilitarán al informar el número."
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {tx("Carregando escala de sobreaviso…", "Loading shift schedule…", "Cargando escala de guardia…")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Grade Semanal Dinâmica de Plantões */}
      <div className="space-y-4">
        {/* Navigation and Week Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold sm:text-lg">
              <CalendarDays className="size-5 text-primary" />
              <span>{tx("Escala Semanal de Plantões", "Weekly Shifts Schedule", "Turnos Semanales de Guardia")}</span>
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {dates[0] && dates[6]
                ? `${formatShortDate(dates[0])} — ${formatShortDate(dates[6])} · ${dates[0].getFullYear()}`
                : "…"}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              aria-label={tx("Semana anterior", "Previous week", "Semana anterior")}
              title={tx("Semana anterior", "Previous week", "Semana anterior")}
              onClick={() => setOffset(offset - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant={offset === 0 ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setOffset(0)}
              className="text-xs font-medium"
            >
              {t.shifts.today}
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label={tx("Próxima semana", "Next week", "Próxima semana")}
              title={tx("Próxima semana", "Next week", "Próxima semana")}
              onClick={() => setOffset(offset + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead>
                <tr className="border-b bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="w-40 px-5 py-3.5">{t.shifts.day}</th>
                  {t.periods.map((periodName) => (
                    <th key={periodName} className="px-5 py-3.5">
                      {periodName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dates.map((date) => {
                  const isToday = !!now && dateKey(date) === dateKey(now);
                  const weekdayName = date.toLocaleDateString(locale, { weekday: "long" });

                  return (
                    <tr
                      key={dateKey(date)}
                      className={
                        isToday
                          ? "bg-primary/5 dark:bg-primary/10 transition-colors"
                          : "hover:bg-muted/30 transition-colors"
                      }
                    >
                      {/* Day Column with Badge 'Hoje' */}
                      <th className="px-5 py-4 font-normal align-top">
                        <div className="flex flex-col">
                          <span className="font-semibold capitalize text-foreground">
                            {weekdayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatShortDate(date)}
                          </span>
                          {isToday && (
                            <Badge className="mt-2 w-fit bg-primary text-[10px] font-bold text-primary-foreground shadow-xs">
                              {t.shifts.today}
                            </Badge>
                          )}
                        </div>
                      </th>

                      {/* Shifts Columns (0: Diurno, 1: Noturno) */}
                      {([0, 1] as const).map((period) => {
                        const assignedIndex = assignedCounselor(date, period);
                        const key = shiftKey(date, period);
                        const existingRequest = swapRequests[key];
                        const periodLabel =
                          t.periods[period]?.split(" ")[0] ??
                          tx("Turno", "Shift", "Turno");

                        // Pure helper guarantees active counselor is retained unless approved
                        const activeIndex = resolveActiveCounselor(assignedIndex, existingRequest);

                        return (
                          <td key={period} className="px-5 py-4 align-top">
                            <div className="flex items-center gap-3">
                              <img
                                src={photos[activeIndex]}
                                alt={counselors[activeIndex]}
                                className="size-9 rounded-full object-cover shadow-xs border border-border"
                              />
                              <div>
                                <span className="font-medium text-foreground block">
                                  {counselors[activeIndex]}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  {periodLabel}
                                </span>
                              </div>
                            </div>

                            {/* Status or Swap Action Button */}
                            {existingRequest ? (
                              <div className="mt-2.5 rounded-md border border-warning/40 bg-warning/10 p-2 text-xs">
                                <div className="flex items-center gap-1 font-semibold text-warning">
                                  <Clock className="size-3.5" />
                                  <span>
                                    {tx(
                                      "Troca pendente de aprovação",
                                      "Swap pending approval",
                                      "Cambio pendiente de aprobación"
                                    )}
                                  </span>
                                </div>
                                <p className="mt-1 text-[11px] text-muted-foreground">
                                  {tx("Substituto sugerido:", "Proposed substitute:", "Sustituto propuesto:")}{" "}
                                  <strong className="text-foreground">
                                    {counselors[existingRequest.replacementCounselor]}
                                  </strong>
                                </p>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="h-auto p-0 mt-1 text-[11px] text-muted-foreground hover:text-destructive"
                                  onClick={() => handleCancelSwap(key)}
                                >
                                  <XCircle className="size-3 mr-1" />
                                  {tx("Cancelar solicitação", "Cancel request", "Cancelar solicitud")}
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="mt-2 h-7 px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary gap-1"
                                onClick={() => {
                                  setSwapSelection({
                                    key,
                                    date,
                                    period,
                                    counselor: assignedIndex,
                                  });
                                  setReplacement("");
                                  setReason("");
                                }}
                              >
                                <ArrowLeftRight className="size-3" />
                                <span>
                                  {tx(
                                    "Solicitar Troca de Turno",
                                    "Request Shift Swap",
                                    "Solicitar Cambio de Turno"
                                  )}
                                </span>
                              </Button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Information Notice about Legal Compliance */}
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 shrink-0 text-primary" />
          <span>
            {tx(
              "Escala e sobreaviso em conformidade com o ECA (Lei Federal nº 8.069/1990). Solicitações de troca registradas na demonstração permanecem pendentes e não alteram a titularidade sem despacho da coordenação.",
              "Schedule and on-call duty in compliance with the ECA. Swap requests in demo mode remain pending and do not replace the titular counselor without coordination approval.",
              "Escala y guardia en conformidad con el ECA. Las solicitudes de cambio registradas en la demostración permanecen pendientes y no alteran la titularidad sin autorización de la coordinación."
            )}
          </span>
        </p>
      </div>

      {/* Dialog: Solicitar Troca de Turno */}
      <Dialog
        open={!!swapSelection}
        onOpenChange={(open) => {
          if (!open) setSwapSelection(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeftRight className="size-5 text-primary" />
              <span>
                {tx(
                  "Solicitar Troca de Turno",
                  "Request Shift Swap",
                  "Solicitar Cambio de Turno"
                )}
              </span>
            </DialogTitle>
            <DialogDescription>
              {swapSelection &&
                `${formatShortDate(swapSelection.date)} · ${t.periods[swapSelection.period]} · ${tx("Titular Atual:", "Current Titular:", "Titular Actual:")} ${counselors[swapSelection.counselor]}`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSwapSubmit} className="space-y-4">
            <div className="rounded-md border border-primary/20 bg-accent/40 p-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <AlertCircle className="size-4 text-primary" />
                <span>{tx("Regimento Interno", "Internal Regulation", "Reglamento Interno")}</span>
              </div>
              <p className="mt-1 leading-relaxed">
                {tx(
                  "A solicitação entrará em status 'Pendente de Aprovação'. O conselheiro titular permanece responsável pelo plantão até a homologação formal.",
                  "The request will be saved with status 'Pending Approval'. The titular counselor remains responsible until formal approval.",
                  "La solicitud entrará en estado 'Pendiente de Aprobación'. El consejero titular sigue siendo responsable hasta la aprobación formal."
                )}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="replacement-select">
                {tx("Conselheiro Substituto", "Replacement Counselor", "Consejero Sustituto")}
              </Label>
              <Select value={replacement} onValueChange={setReplacement}>
                <SelectTrigger id="replacement-select">
                  <SelectValue
                    placeholder={tx(
                      "Selecione o(a) conselheiro(a)",
                      "Select replacement counselor",
                      "Seleccione el consejero sustituto"
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {counselors.map((name, index) =>
                    index !== swapSelection?.counselor ? (
                      <SelectItem key={name} value={String(index)}>
                        {name}
                      </SelectItem>
                    ) : null
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="swap-reason">
                {tx("Justificativa da Troca", "Reason for Swap", "Motivo del Cambio")}
              </Label>
              <Textarea
                id="swap-reason"
                required
                rows={3}
                placeholder={tx(
                  "ex: Audiência judicial, compromisso inadiável, compensação acordada...",
                  "e.g.: Judicial hearing, urgent commitment, agreed compensation...",
                  "ej: Audiencia judicial, compromiso inaplazable, compensación acordada..."
                )}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSwapSelection(null)}
              >
                {tx("Cancelar", "Cancel", "Cancelar")}
              </Button>
              <Button
                type="submit"
                disabled={!replacement || !reason.trim()}
                className="gap-2"
              >
                <CheckCircle2 className="size-4" />
                <span>
                  {tx(
                    "Registrar Solicitação",
                    "Record Request",
                    "Registrar Solicitud"
                  )}
                </span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cadastrar / Alterar Telefone Oficial de Plantão */}
      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <PhoneCall className="size-5 text-primary" />
            </div>
            <DialogTitle>
              {tx(
                "Telefone Oficial de Emergência do Conselho",
                "Official Council Emergency Phone",
                "Teléfono Oficial de Emergencia del Consejo"
              )}
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              {tx(
                "Informe o número oficial com DDD brasileiro (ex: 11 98888-7777). Esse número será vinculado aos botões rápidos de Ligar e WhatsApp durante o plantão.",
                "Enter the official Brazilian phone with area code (e.g. 11 98888-7777). It will be linked to Call and WhatsApp buttons during duty.",
                "Ingrese el número oficial brasileño con código de área (ej: 11 98888-7777). Se vinculará a los botones de Llamar y WhatsApp."
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePhone} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="emergency-phone-input">
                {tx("Telefone com DDD", "Phone with Area Code", "Teléfono con Código de Área")}
              </Label>
              <Input
                id="emergency-phone-input"
                type="tel"
                required
                placeholder="(11) 98888-7777"
                value={phoneDraft}
                onChange={(e) => setPhoneDraft(e.target.value)}
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground">
                {tx(
                  "Padrão brasileiro: DDD + 8 ou 9 dígitos.",
                  "Brazilian format: 2-digit DDD + 8 or 9 digits.",
                  "Formato brasileño: código de área + 8 o 9 dígitos."
                )}
              </p>
            </div>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setContactOpen(false)}
              >
                {tx("Cancelar", "Cancel", "Cancelar")}
              </Button>
              <Button type="submit">
                {tx("Salvar Telefone", "Save Phone", "Guardar Teléfono")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
