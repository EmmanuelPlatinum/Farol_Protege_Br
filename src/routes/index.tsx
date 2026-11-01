import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  HeartHandshake,
  HelpCircle,
  Lock,
  PhoneCall,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GovtechAccessibilityBar } from "@/components/govtech-accessibility-bar";
import { FarolProtegeLogo } from "@/components/farol-logo";
import { useI18n, useTx } from "@/lib/i18n";
import { landing } from "@/lib/landing-i18n";
import {
  addPublicReport,
  findPublicReportByPin,
  normalizePin,
  type PublicReport,
} from "@/lib/reports-store";
import c1 from "@/assets/c1.jpg";
import c2 from "@/assets/c2.jpg";
import c3 from "@/assets/c3.jpg";
import c4 from "@/assets/c4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Farol Protege — Portal Público de Defesa da Infância e Conselho Tutelar" },
      {
        name: "description",
        content:
          "Portal GovTech oficial de acolhimento de denúncias anônimas, consulta por PIN, transparência e escalas do Conselho Tutelar.",
      },
      { property: "og:title", content: "Farol Protege — Portal Público de Defesa da Infância e Conselho Tutelar" },
      {
        property: "og:description",
        content:
          "Portal GovTech oficial de acolhimento de denúncias anônimas, consulta por PIN, transparência e escalas do Conselho Tutelar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const team = [
  {
    name: "Ana Costa",
    photo: c1,
    role: "Conselheira Tutelar Relatora",
    status: "Titular de Plantão",
    term: "Mandato 2024–2028",
  },
  {
    name: "Marcos Lima",
    photo: c2,
    role: "Coordenador Colegiado",
    status: "Sobreaviso Diurno",
    term: "Mandato 2024–2028",
  },
  {
    name: "Júlia Rocha",
    photo: c3,
    role: "Conselheira Tutelar Titular",
    status: "Sobreaviso Noturno",
    term: "Mandato 2024–2028",
  },
  {
    name: "Paulo Mendes",
    photo: c4,
    role: "Conselheiro Tutelar Titular",
    status: "Plantão Final de Semana",
    term: "Mandato 2024–2028",
  },
];

/**
 * Componente de Consulta e Acompanhamento de Denúncia por PIN
 */
function PinTrackingView({
  report,
  onReset,
}: {
  report: PublicReport;
  onReset?: () => void;
}) {
  const tx = useTx();

  const getStatusColor = (status: PublicReport["status"]) => {
    switch (status) {
      case "screening":
        return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "visit_scheduled":
        return "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400";
      case "referred_network":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "referred_mp":
        return "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400";
      default:
        return "border-primary/30 bg-primary/10 text-primary";
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho do Protocolo Sigiloso */}
      <div className="rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
              {tx("Protocolo Criptografado", "Encrypted Protocol", "Protocolo Encriptado")}
            </span>
            <p className="font-mono text-2xl font-bold tracking-wider text-sky-600 dark:text-sky-400">
              {report.pin}
            </p>
          </div>
          <Badge variant="outline" className={`text-xs px-2.5 py-1 font-semibold ${getStatusColor(report.status)}`}>
            {report.statusLabel}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-3 text-xs">
          <div>
            <span className="text-muted-foreground">{tx("Data de Registro:", "Registration Date:", "Fecha de Registro:")}</span>
            <p className="font-medium text-foreground">{report.date}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{tx("Tipo Notificado:", "Reported Type:", "Tipo Notificado:")}</span>
            <p className="font-medium text-foreground">{report.type}</p>
          </div>
        </div>
      </div>

      {/* Resumo do Procedimento */}
      <div className="rounded-lg border border-border/80 bg-card p-4 text-xs leading-relaxed text-muted-foreground shadow-xs">
        <p className="font-medium text-foreground mb-1">
          {tx("Posicionamento Oficial do Colegiado:", "Official Council Statement:", "Declaración Oficial:")}
        </p>
        <p>{report.summary}</p>
      </div>

      {/* Linha do Tempo Visual Sigilosa (Timeline Stepper) */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {tx("Linha do Tempo de Andamento", "Progress Timeline", "Línea de Tiempo")}
        </h4>

        <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {report.timeline.map((step, idx) => (
            <div key={idx} className="relative">
              <span
                className={`absolute -left-[23px] top-0.5 flex size-4.5 items-center justify-center rounded-full ring-4 ring-background ${
                  step.completed ? "bg-emerald-500 text-white" : "bg-muted-foreground/30 text-background"
                }`}
              >
                {step.completed ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3" />}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">{step.title}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">({step.date})</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aviso Legal de Proteção e Sigilo ECA / LGPD */}
      <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
        <Lock className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
        <span>
          {tx(
            "Em estrito cumprimento aos artigos 17 e 143 do ECA (Lei nº 8.069/1990) e à LGPD, dados individuais de crianças, famílias e testemunhas jamais são expostos em consultas públicas.",
            "In strict compliance with ECA Arts. 17 and 143 and LGPD, individual data of children and families are never exposed in public queries.",
            "Conforme a los Arts. 17 y 143 del ECA y la LGPD, ningún dato personal es revelado en la consulta pública."
          )}
        </span>
      </div>

      {onReset && (
        <div className="pt-2 text-center">
          <Button variant="ghost" size="sm" onClick={onReset} className="text-xs text-sky-600 hover:text-sky-700">
            {tx("Consultar outro protocolo", "Check another protocol", "Consultar otro protocolo")}
          </Button>
        </div>
      )}
    </div>
  );
}

function ReportForm({
  onOpenTrackWithPin,
}: {
  onOpenTrackWithPin?: (pin: string) => void;
}) {
  const { lang } = useI18n();
  const tx = useTx();
  const L = landing[lang];

  const [type, setType] = useState("0");
  const [place, setPlace] = useState("");
  const [desc, setDesc] = useState("");
  const [createdPin, setCreatedPin] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (desc.trim().length < 5) {
      toast.error(L.required);
      return;
    }

    const newReport = addPublicReport({
      type: L.types[Number(type)] || "Outro",
      place,
      desc,
    });

    setCreatedPin(newReport.pin);
    setPlace("");
    setDesc("");
    setType("0");

    toast.success(
      tx(
        "Denúncia recebida com sucesso e protegida com criptografia!",
        "Report received successfully with end-to-end encryption!",
        "¡Denuncia recibida con éxito y protegida!"
      )
    );
  };

  return (
    <Card className="shadow-card border-border/80 bg-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
            <ShieldCheck className="size-3.5 mr-1" />
            {tx("Canal Oficial Seguro", "Official Secure Channel", "Canal Oficial Seguro")}
          </Badge>
          <span className="text-[11px] font-mono text-muted-foreground">ECA Art. 136</span>
        </div>
        <CardTitle className="text-xl font-bold mt-2">
          {tx("Registro Anônimo de Denúncia", "Anonymous Report Form", "Registro Anónimo de Denuncia")}
        </CardTitle>
        <CardDescription className="text-xs">
          {tx(
            "Seus dados de rede ou identificadores pessoais não são gravados. Você receberá um código PIN para acompanhar.",
            "No personal data or network identity is logged. You will receive a PIN to track.",
            "No se almacenan datos personales. Recibirá un PIN de seguimiento."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{L.fType}</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {L.types.map((t, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{L.fPlace}</Label>
            <Input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder={tx("ex: Bairro Centro, Rua das Flores...", "e.g.: Downtown, Main Street...", "ej: Barrio Centro...")}
              className="h-10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{L.fDesc}</Label>
            <Textarea
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={L.fDescPh}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs"
          >
            {L.send}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3 text-emerald-600 dark:text-emerald-400" /> {L.anon}
          </p>
        </form>
      </CardContent>

      {/* Diálogo de confirmação com PIN e botão para acompanhar */}
      <Dialog open={!!createdPin} onOpenChange={(o) => !o && setCreatedPin(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="size-6" />
            </div>
            <DialogTitle className="text-center">{L.pinTitle}</DialogTitle>
            <DialogDescription className="text-center">{L.pinSub}</DialogDescription>
          </DialogHeader>

          <p className="rounded-xl border-2 border-dashed border-sky-500/40 bg-sky-50 dark:bg-sky-950/30 py-5 text-center font-mono text-3xl font-bold tracking-widest text-sky-700 dark:text-sky-300">
            {createdPin}
          </p>

          <DialogFooter className="flex-col gap-2 sm:flex-col sm:justify-center">
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="w-full gap-1.5 text-xs"
                onClick={() => {
                  navigator.clipboard?.writeText(createdPin ?? "");
                  toast.success(L.copied);
                }}
              >
                <Copy className="size-3.5" />
                <span>{L.pinCopy}</span>
              </Button>
              <Button
                className="w-full gap-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white"
                onClick={() => {
                  const targetPin = createdPin;
                  setCreatedPin(null);
                  if (targetPin && onOpenTrackWithPin) {
                    onOpenTrackWithPin(targetPin);
                  }
                }}
              >
                <Search className="size-3.5" />
                <span>{tx("Acompanhar Agora", "Track Now", "Seguir Ahora")}</span>
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCreatedPin(null)}>
              {L.close}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Landing() {
  const { lang } = useI18n();
  const tx = useTx();
  const L = landing[lang];

  // Estado de busca de denúncia por PIN
  const [pinQuery, setPinQuery] = useState("");
  const [activeReport, setActiveReport] = useState<PublicReport | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);

  const handleSearchPin = (targetCode?: string) => {
    const code = targetCode ?? pinQuery;
    if (!code || !code.trim()) {
      toast.error(
        tx(
          "Digite o código da denúncia (ex: #PROT-8921).",
          "Enter your report code (e.g. #PROT-8921).",
          "Ingresa el código de la denuncia."
        )
      );
      return;
    }

    const found = findPublicReportByPin(code);
    setActiveReport(found);
    setSearchAttempted(true);

    if (found) {
      toast.success(
        tx(
          `Protocolo ${found.pin} localizado!`,
          `Protocol ${found.pin} located!`,
          `¡Protocolo ${found.pin} localizado!`
        )
      );
    } else {
      toast.error(
        tx(
          "Protocolo não encontrado. Verifique o código digitado ou teste um dos exemplos.",
          "Protocol not found. Check the code or try one of the samples.",
          "Protocolo no encontrado. Verifica el código ingresado."
        )
      );
    }
  };

  const openTrackWithSpecificPin = (pin: string) => {
    setPinQuery(pin);
    const found = findPublicReportByPin(pin);
    setActiveReport(found);
    setSearchAttempted(true);
    setTrackingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* 1. Barra Superior de Acessibilidade Governamental (e-MAG / W3C) */}
      <GovtechAccessibilityBar />

      {/* 2. Menu de Navegação Funcional (Padrão GovTech / Portal Público) */}
      <header
        id="menu"
        className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md transition-colors"
      >
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center">
            <FarolProtegeLogo size="md" showSubtitle />
          </Link>

          {/* Links do Menu de Navegação Funcional */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Link
              to="/"
              className="rounded-lg px-3 py-1.5 text-foreground hover:bg-muted transition-colors"
            >
              Home
            </Link>
            <a
              href="#entenda"
              className="rounded-lg px-3 py-1.5 hover:text-foreground hover:bg-muted transition-colors"
            >
              {tx("Entenda o Conselho", "About Council", "Sobre el Consejo")}
            </a>
            <a
              href="#denuncia"
              className="rounded-lg px-3 py-1.5 hover:text-foreground hover:bg-muted transition-colors"
            >
              {tx("Denúncia", "Report", "Denuncia")}
            </a>
            <Link
              to="/shifts"
              className="rounded-lg px-3 py-1.5 hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <span>{tx("Plantões", "Shifts", "Guardias")}</span>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold">
                24h
              </Badge>
            </Link>
            <a
              href="#acompanhar"
              onClick={() => setTrackingModalOpen(true)}
              className="rounded-lg px-3 py-1.5 hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 text-sky-600 dark:text-sky-400 font-semibold"
            >
              <Search className="size-3.5" />
              <span>{tx("Acompanhar PIN", "Track PIN", "Seguir PIN")}</span>
            </a>
            <Link
              to="/reports"
              className="rounded-lg px-3 py-1.5 hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <span>{tx("Transparência", "Transparency", "Transparencia")}</span>
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                CMDCA
              </Badge>
            </Link>
          </nav>

          {/* Botão de Destaque na Navbar: Redireciona Obrigatoriamente para /login */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              className="h-10 px-4 text-xs sm:text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs gap-2"
            >
              <Link to="/login">
                <Lock className="size-3.5" />
                <span>{tx("Acessar o Painel", "Access Dashboard", "Acceder al Panel")}</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Padrão Defensoria Pública / Governo Digital) */}
      <section
        id="conteudo"
        className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/30 via-background to-background py-16 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-6">
            <ShieldCheck className="size-3.5" />
            <span>{tx("Portal Público GovTech · Garantia de Direitos e Proteção Integral", "Official GovTech Portal · Child Rights Protection", "Portal GovTech Oficial")}</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-slate-900 dark:text-slate-100">
            {L.hero} <span className="text-emerald-600 dark:text-emerald-400">{L.heroHi}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {L.sub}
          </p>

          {/* Botões de Chamada com Destino Correto */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {/* Botão Primário Verde Institucional */}
            <Button
              asChild
              size="lg"
              className="h-12 px-6 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <a href="#denuncia">
                <ShieldCheck className="size-5 mr-1" />
                <span>{L.cta}</span>
              </a>
            </Button>

            {/* Botão Azul Farol (#0284C7) para Busca / PIN */}
            <Button
              size="lg"
              variant="outline"
              onClick={() => setTrackingModalOpen(true)}
              className="h-12 px-6 text-base font-semibold border-sky-500/40 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40"
            >
              <Search className="size-5 mr-1 text-sky-600 dark:text-sky-400" />
              <span>{tx("Acompanhar com PIN", "Track with PIN", "Seguir con PIN")}</span>
            </Button>

            {/* Botão "Acessar o Painel" que redireciona OBRIGATORIAMENTE para /login */}
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-12 px-6 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-foreground"
            >
              <Link to="/login">
                <Lock className="size-4 mr-1 text-muted-foreground" />
                <span>{L.report}</span>
              </Link>
            </Button>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{L.note}</span>
          </p>
        </div>
      </section>

      {/* 4. Seção Reformulada: "Entenda o Conselho" com Cards Limpos e Badges Oficiais */}
      <section id="entenda" className="border-b border-border/60 bg-slate-50/50 dark:bg-slate-900/20 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="mb-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              {tx("Estatuto da Criança e do Adolescente", "Child and Adolescent Statute", "Estatuto de la Niñez")}
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
              {L.learnTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {L.learnSub}
            </p>
          </div>

          {/* Cards limpos em fundo claro, bordas suaves e badges de status oficial */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Card 1: Para que serve */}
            <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 text-white shadow-xs">
                  <BookOpen className="size-6" />
                </div>
                <Badge variant="secondary" className="text-[11px] font-semibold">
                  ECA Art. 131
                </Badge>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-slate-100">
                {L.learn[0]![0]}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {L.learn[0]![1]}
              </p>
            </Card>

            {/* Card 2: Quando acionar */}
            <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-600 text-white shadow-xs">
                  <PhoneCall className="size-6" />
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                  {tx("Quando Acionar", "When to Call", "Cuándo Acudir")}
                </Badge>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-slate-100">
                {L.learn[1]![0]}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {L.learn[1]![1]}
              </p>
            </Card>

            {/* Card 3: Como protege */}
            <Card className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-sky-500 text-white shadow-xs">
                  <HeartHandshake className="size-6" />
                </div>
                <Badge variant="secondary" className="text-[11px] font-semibold">
                  {tx("Medidas do Art. 101", "Protective Measures", "Medidas de Protección")}
                </Badge>
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-slate-100">
                {L.learn[2]![0]}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {L.learn[2]![1]}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Seção de Denúncia Anônima Cidadã */}
      <section
        id="denuncia"
        className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-4 py-20 md:grid-cols-2 md:items-center md:px-6"
      >
        <div>
          <Badge variant="outline" className="mb-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Lock className="size-3 mr-1" />
            {tx("Criptografia de Ponta a Ponta", "End-to-End Encryption", "Cifrado de Extremo a Extremo")}
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            {L.formTitle}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
            {L.formSub}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 px-3.5 py-2.5 text-sm font-semibold text-red-700 dark:text-red-400">
            <PhoneCall className="size-4 shrink-0" />
            <span>{L.emergency}</span>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-card p-5 shadow-xs">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider text-sky-600 dark:text-sky-400">
              <Search className="size-4" />
              {tx("Já possui um protocolo?", "Already have a protocol?", "¿Ya tienes un código?")}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              {tx(
                "Consulte o andamento da sua denúncia a qualquer momento utilizando o código PIN gerado pelo sistema.",
                "Track the status of your report at any time using your generated PIN code.",
                "Consulta el estado en cualquier momento usando tu código PIN."
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3.5 text-xs font-semibold border-sky-500/40 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 gap-1.5"
              onClick={() => setTrackingModalOpen(true)}
            >
              <Search className="size-3.5" />
              <span>{tx("Consultar Código PIN", "Query PIN Code", "Consultar Código PIN")}</span>
            </Button>
          </div>
        </div>

        <ReportForm onOpenTrackWithPin={openTrackWithSpecificPin} />
      </section>

      {/* 6. Seção Dedicada na Página: Consulta Pública de Denúncia por PIN (#acompanhar) */}
      <section id="acompanhar" className="border-t border-border/60 bg-sky-50/40 dark:bg-sky-950/10 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="text-center">
            <Badge variant="outline" className="mb-2 border-sky-500/40 bg-sky-100/60 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-semibold">
              <Search className="mr-1 size-3" />
              {tx("Consulta Pública e Sigilosa", "Public & Confidential Query", "Consulta Pública y Confidencial")}
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              {tx("Acompanhar Andamento da Denúncia por PIN", "Track Report Progress by PIN", "Seguir Estado de Denuncia por PIN")}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              {tx(
                "Digite o código PIN recebido para acompanhar o status e as etapas de atendimento do Conselho Tutelar sem violar o sigilo dos envolvidos.",
                "Enter your PIN code to track status and actions taken by the council while preserving privacy.",
                "Ingresa el código PIN para consultar el estado garantizando total sigilo."
              )}
            </p>
          </div>

          <Card className="mt-8 shadow-card border-sky-500/30 bg-card">
            <CardContent className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearchPin();
                }}
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sky-600 dark:text-sky-400" />
                  <Input
                    value={pinQuery}
                    onChange={(e) => setPinQuery(e.target.value)}
                    placeholder={tx("Digite o código PIN (ex: #PROT-8921)", "Enter PIN code (e.g. #PROT-8921)", "Código PIN (ej: #PROT-8921)")}
                    className="pl-9 font-mono tracking-wider h-11 border-sky-500/30 focus-visible:ring-sky-500"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 gap-2 font-semibold bg-sky-600 hover:bg-sky-700 text-white"
                >
                  <Search className="size-4" />
                  <span>{tx("Consultar Status", "Check Status", "Consultar")}</span>
                </Button>
              </form>

              {/* Botões rápidos com exemplos de teste */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{tx("Exemplos para teste:", "Demo samples:", "Ejemplos:")}</span>
                {["#PROT-8921", "#PROT-1042", "#PROT-3388"].map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => {
                      setPinQuery(ex);
                      handleSearchPin(ex);
                    }}
                    className="rounded-md border border-sky-500/30 bg-sky-50 dark:bg-sky-950/40 px-2 py-1 font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>

              {/* Resultado da Busca */}
              {searchAttempted && (
                <div className="mt-6 border-t pt-6">
                  {activeReport ? (
                    <PinTrackingView report={activeReport} onReset={() => setActiveReport(null)} />
                  ) : (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      <ShieldAlert className="mx-auto size-8 text-amber-500 mb-2" />
                      <p className="font-semibold text-foreground">
                        {tx("Protocolo não localizado", "Protocol not found", "Protocolo no encontrado")}
                      </p>
                      <p className="text-xs mt-1 max-w-md mx-auto">
                        {tx(
                          "Não encontramos registros com o código digitado. Verifique se o formato está correto (ex.: #PROT-8921) ou utilize os exemplos acima.",
                          "No records matched this code. Check the format or use the demo samples above.",
                          "No encontramos registros para este código."
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 7. Seção Reformulada: "Conheça os Conselheiros" com Cards Limpos e Status Oficial */}
      <section id="plantoes" className="border-t border-border/60 bg-muted/20 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <Badge variant="outline" className="mb-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <UserCheck className="size-3.5 mr-1" />
                {tx("Colegiado Oficial Eleito", "Elected Official Council", "Colegiado Oficial")}
              </Badge>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
                {L.teamTitle}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {L.teamSub}
              </p>
            </div>

            <Button asChild variant="outline" className="gap-2 font-semibold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
              <Link to="/shifts">
                <Calendar className="size-4" />
                <span>{tx("Ver Escala Semanal de Plantões", "View Weekly Shift Schedule", "Ver Turnos de Guardia")}</span>
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Card
                key={m.name}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-card overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={m.photo}
                      alt={m.name}
                      loading="lazy"
                      width={816}
                      height={816}
                      className="size-full object-cover transition-transform hover:scale-102"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="flex size-3 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-slate-900" title={m.status} />
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
                        {m.name}
                      </p>
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        {m.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {m.role}
                    </p>

                    <div className="mt-4 pt-3 border-t border-border/60">
                      <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{L.duty}: {L.days[i]}</span>
                      </p>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-semibold text-primary hover:bg-primary/10 gap-1 justify-center"
                  >
                    <Link to="/shifts">
                      <span>{tx("Consultar Escala", "View Shift", "Ver Guardia")}</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Rodapé Governamental com Legislação e Links Oficiais */}
      <footer className="border-t border-border/70 bg-card py-12 text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 pb-8 border-b border-border/60">
            <div>
              <FarolProtegeLogo size="md" showSubtitle />
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {tx(
                  "Plataforma GovTech de defesa dos direitos fundamentais de crianças e adolescentes. Desenvolvido para modernizar a atuação colegiada.",
                  "GovTech platform safeguarding the fundamental rights of children and teens.",
                  "Plataforma GovTech para la protección de la niñez y adolescencia."
                )}
              </p>
            </div>

            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-foreground mb-3">
                {tx("Navegação Cidadã", "Citizen Navigation", "Navegación")}
              </p>
              <ul className="space-y-2 text-xs">
                <li><a href="#conteudo" className="hover:text-foreground">Início</a></li>
                <li><a href="#entenda" className="hover:text-foreground">Entenda o Conselho</a></li>
                <li><a href="#denuncia" className="hover:text-foreground">Denúncia Anônima</a></li>
                <li><Link to="/shifts" className="hover:text-foreground">Escala de Plantões</Link></li>
                <li><Link to="/reports" className="hover:text-foreground">Transparência CMDCA</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-foreground mb-3">
                {tx("Legislação Aplicável", "Applicable Law", "Legislación")}
              </p>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="https://www.planalto.gov.br/ccivil_03/leis/l8069.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground inline-flex items-center gap-1"
                  >
                    ECA (Lei Federal nº 8.069/90) <ExternalLink className="size-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground inline-flex items-center gap-1"
                  >
                    LGPD (Lei nº 13.709/18) <ExternalLink className="size-3" />
                  </a>
                </li>
                <li>
                  <span className="text-muted-foreground">Regimento Interno Municipal</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-xs uppercase tracking-wider text-foreground mb-3">
                {tx("Canais de Emergência", "Emergency Channels", "Emergencias")}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Em situações de risco iminente, contate imediatamente as autoridades policiais ou o Disque 100.
              </p>
              <div className="mt-3 space-y-1 text-xs font-semibold text-foreground">
                <p>Disque 100 · Direitos Humanos</p>
                <p>190 · Polícia Militar</p>
                <p>193 · Corpo de Bombeiros</p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Farol Protege. {L.rights}</p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-primary hover:underline font-semibold">
                {tx("Acesso Restrito para Conselheiros", "Counselor Portal Access", "Acceso Restringido")}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal / Dialog de Acompanhamento (Disparado pelo Header ou Hero) */}
      <Dialog open={trackingModalOpen} onOpenChange={setTrackingModalOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Search className="size-5 text-sky-600 dark:text-sky-400" />
              <span>{tx("Acompanhar Denúncia por PIN", "Track Report by PIN", "Seguir Denuncia por PIN")}</span>
            </DialogTitle>
            <DialogDescription>
              {tx(
                "Consulte o andamento processual com garantia absoluta de anonimato e sigilo legal.",
                "Check procedure status with complete anonymity and legal confidentiality.",
                "Consulta el avance con garantía total de anonimato."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchPin();
              }}
              className="flex gap-2"
            >
              <Input
                value={pinQuery}
                onChange={(e) => setPinQuery(e.target.value)}
                placeholder={tx("ex: #PROT-8921", "e.g. #PROT-8921", "ej: #PROT-8921")}
                className="font-mono tracking-wider border-sky-500/30"
                autoFocus
              />
              <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white font-medium">
                {tx("Buscar", "Search", "Buscar")}
              </Button>
            </form>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span>{tx("Sugestões:", "Samples:", "Sugerencias:")}</span>
              {["#PROT-8921", "#PROT-1042", "#PROT-3388"].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setPinQuery(ex);
                    handleSearchPin(ex);
                  }}
                  className="rounded-md border border-sky-500/30 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>

            {searchAttempted && activeReport && (
              <div className="border-t pt-4">
                <PinTrackingView report={activeReport} />
              </div>
            )}

            {searchAttempted && !activeReport && (
              <div className="text-center py-6 border-t text-muted-foreground text-xs">
                <p className="font-semibold text-foreground">
                  {tx("Código não encontrado.", "Code not found.", "Código no encontrado.")}
                </p>
                <p className="mt-1">
                  {tx(
                    "Certifique-se de incluir os 4 dígitos do protocolo.",
                    "Make sure to include the 4-digit protocol number.",
                    "Asegúrese de incluir los 4 dígitos."
                  )}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
