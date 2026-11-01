import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Clock, Copy, HeartHandshake, Lock, PhoneCall, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/lib/i18n";
import { landing } from "@/lib/landing-i18n";
import c1 from "@/assets/c1.jpg";
import c2 from "@/assets/c2.jpg";
import c3 from "@/assets/c3.jpg";
import c4 from "@/assets/c4.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Farol — Proteção à infância e Conselho Tutelar" },
      { name: "description", content: "Denúncia anônima, informações sobre o Conselho Tutelar e conselheiros de plantão." },
      { property: "og:title", content: "Farol — Proteção à infância e Conselho Tutelar" },
      { property: "og:description", content: "Denúncia anônima, informações sobre o Conselho Tutelar e conselheiros de plantão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Landing,
});

const learnIcons = [BookOpen, PhoneCall, HeartHandshake];
const team = [
  { name: "Ana Costa", photo: c1 },
  { name: "Marcos Lima", photo: c2 },
  { name: "Júlia Rocha", photo: c3 },
  { name: "Paulo Mendes", photo: c4 },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ShieldCheck className="size-4" /></span>
      Farol
    </Link>
  );
}

function ReportForm() {
  const { lang } = useI18n();
  const L = landing[lang];
  const [type, setType] = useState("0");
  const [place, setPlace] = useState("");
  const [desc, setDesc] = useState("");
  const [pin, setPin] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (desc.trim().length < 5) { toast.error(L.required); return; }
    setPin(`#PROT-${Math.floor(1000 + Math.random() * 9000)}`);
    setPlace(""); setDesc(""); setType("0");
  };

  return (
    <Card className="shadow-glow">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label>{L.fType}</Label>
            <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{L.types.map((t, i) => <SelectItem key={i} value={String(i)}>{t}</SelectItem>)}</SelectContent></Select>
          </div>
          <div className="space-y-1.5"><Label>{L.fPlace}</Label><Input value={place} onChange={(e) => setPlace(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>{L.fDesc}</Label><Textarea rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={L.fDescPh} /></div>
          <Button type="submit" size="lg" className="w-full">{L.send}</Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3 text-success" /> {L.anon}</p>
        </form>
      </CardContent>
      <Dialog open={!!pin} onOpenChange={(o) => !o && setPin(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success-soft text-success"><ShieldCheck className="size-6" /></div>
            <DialogTitle className="text-center">{L.pinTitle}</DialogTitle>
            <DialogDescription className="text-center">{L.pinSub}</DialogDescription>
          </DialogHeader>
          <p className="rounded-xl border-2 border-dashed border-primary/40 bg-accent py-5 text-center font-mono text-3xl font-bold tracking-widest text-accent-foreground">{pin}</p>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => { navigator.clipboard?.writeText(pin ?? ""); toast.success(L.copied); }}><Copy /> {L.pinCopy}</Button>
            <Button onClick={() => setPin(null)}>{L.close}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Landing() {
  const { lang } = useI18n();
  const L = landing[lang];
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Logo />
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Button asChild variant="ghost"><Link to="/login">{L.login}</Link></Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center md:px-6 md:pt-28">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"><span className="size-1.5 rounded-full bg-primary" /> {L.badge}</span>
        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">{L.hero} <span className="text-primary">{L.heroHi}</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{L.sub}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-12 px-6 text-base"><a href="#denuncia">{L.cta} <ArrowRight /></a></Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base"><Link to="/dashboard">{L.report}</Link></Button>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground"><Lock className="size-4 text-success" /> {L.note}</p>
      </section>

      <section className="border-y bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">{L.learnTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{L.learnSub}</p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {L.learn.map(([title, text], i) => {
              const Icon = learnIcons[i]!;
              return (
                <Card key={i} className="shadow-card"><CardContent className="p-6">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground"><Icon className="size-5" /></div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                </CardContent></Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="denuncia" className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-4 py-20 md:grid-cols-2 md:items-center md:px-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{L.formTitle}</h2>
          <p className="mt-3 text-muted-foreground">{L.formSub}</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-lg bg-danger-soft px-3 py-2 text-sm font-medium text-destructive"><PhoneCall className="size-4" /> {L.emergency}</p>
        </div>
        <ReportForm />
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">{L.teamTitle}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{L.teamSub}</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m, i) => (
              <Card key={m.name} className="overflow-hidden shadow-card">
                <img src={m.photo} alt={m.name} loading="lazy" width={816} height={816} className="aspect-square w-full object-cover" />
                <CardContent className="p-5">
                  <p className="font-semibold">{m.name}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="size-4 text-primary" /> {L.duty}: {L.days[i]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row md:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} Farol. {L.rights}</p>
        </div>
      </footer>
    </div>
  );
}
