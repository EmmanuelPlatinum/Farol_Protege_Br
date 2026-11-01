import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { LighthouseScene } from "@/components/lighthouse-scene";
import { useTx } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Acesso Conselheiro — Farol Protege" },
    { name: "description", content: "Acesso demonstrativo ao Farol Protege para conselheiros tutelares." },
    { property: "og:title", content: "Acesso Conselheiro — Farol Protege" },
    { property: "og:description", content: "Acesso dos conselheiros e demonstração do Farol Protege." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Login,
});

function Login() {
  const tx = useTx();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [visible, setVisible] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    try { const saved = localStorage.getItem("farol_login_identity"); if (saved) { setIdentity(saved); setRemember(true); } } catch { /* optional preference */ }
  }, []);
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (tab === "request") { setRequested(true); setPassword(""); return; }
    try { if (remember) localStorage.setItem("farol_login_identity", identity); else localStorage.removeItem("farol_login_identity"); } catch { /* optional preference */ }
    setPassword("");
    toast.info(tx("Acesso demonstrativo — nenhuma credencial foi validada.", "Demo access — no credentials were verified.", "Acceso de demostración — no se verificaron credenciales."));
    navigate({ to: "/dashboard" });
  };
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="login-visual relative flex min-h-[340px] flex-col overflow-hidden lg:min-h-svh">
        <div className="absolute left-8 top-8 z-10 flex items-center gap-2 text-sm font-semibold text-scene-copy"><ShieldCheck className="size-5" /> Farol Protege</div>
        <div className="absolute inset-0"><LighthouseScene /></div>
        <div className="relative z-10 mt-auto px-8 pb-8 pt-64 lg:px-14 lg:pb-14">
          <p className="mb-3 text-xs font-semibold uppercase text-scene-label">{tx("Proteção que orienta", "Protection that guides", "Protección que orienta")}</p>
          <h2 className="max-w-md text-2xl font-semibold leading-snug text-scene-copy lg:text-3xl">{tx("Farol Protege: Iluminando caminhos e protegendo a infância", "Farol Protege: Lighting paths and protecting childhood", "Farol Protege: Iluminando caminos y protegiendo la infancia")}</h2>
        </div>
      </section>
      <section className="flex flex-col bg-background px-6 py-6 sm:px-12 lg:px-14">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-semibold"><span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"><ShieldCheck className="size-5" /></span>Farol Protege</Link>
          <div className="flex items-center"><LanguageToggle /><ThemeToggle /></div>
        </header>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <div className="mb-6"><p className="mb-3 text-xs font-semibold uppercase text-primary">{tx("Acesso Conselheiro", "Counselor access", "Acceso del consejero")}</p><h1 className="text-3xl font-bold">{tx("Bem-vindo ao Farol", "Welcome to Farol", "Bienvenido a Farol")}</h1><p className="mt-3 text-sm text-muted-foreground">{tx("Cuidar da infância começa com você.", "Protecting childhood starts with you.", "Proteger la infancia comienza contigo.")}</p></div>
          <Tabs value={tab} onValueChange={(value) => { setTab(value); setRequested(false); }}><TabsList className="mb-6 grid w-full grid-cols-2"><TabsTrigger value="login">{tx("Entrar", "Sign in", "Ingresar")}</TabsTrigger><TabsTrigger value="request">{tx("Solicitar Acesso", "Request access", "Solicitar acceso")}</TabsTrigger></TabsList></Tabs>
          {requested ? <div role="status" className="mb-6 border-l-2 border-success py-3 pl-4 text-sm">{tx("Solicitação simulada registrada nesta tela. Nenhum pedido foi enviado ao conselho.", "Simulated request recorded on this screen. Nothing was sent to the council.", "Solicitud simulada registrada en esta pantalla. No se envió al consejo.")}<Button variant="link" className="mt-2 px-0" onClick={() => setRequested(false)}>{tx("Voltar", "Back", "Volver")}</Button></div> : <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2"><Label htmlFor="identity">{tx("Matrícula Funcional / E-mail", "Employee ID / Email", "Matrícula funcional / Correo")}</Label><Input id="identity" required value={identity} onChange={(e) => setIdentity(e.target.value)} autoComplete="username" className="h-11" /></div>
            {tab === "login" && <><div className="space-y-2"><Label htmlFor="password">{tx("Senha", "Password", "Contraseña")}</Label><div className="relative"><Input id="password" required type={visible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="h-11 pr-12" /><Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1" onClick={() => setVisible(!visible)} aria-label={visible ? tx("Ocultar senha", "Hide password", "Ocultar contraseña") : tx("Mostrar senha", "Show password", "Mostrar contraseña")}>{visible ? <EyeOff /> : <Eye />}</Button></div></div><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Checkbox id="remember" checked={remember} onCheckedChange={(checked) => setRemember(checked === true)} /><Label htmlFor="remember" className="text-xs">{tx("Lembrar-me", "Remember me", "Recordarme")}</Label></div><Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={() => setRecovery(true)}>{tx("Esqueci minha senha", "Forgot password", "Olvidé mi contraseña")}</Button></div></>}
            <Button type="submit" className="h-11 w-full">{tab === "login" ? tx("Acessar Sistema", "Access system", "Acceder al sistema") : tx("Solicitar Acesso", "Request access", "Solicitar acceso")}<ArrowRight /></Button>
          </form>}
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />{tx("ou", "or", "o")}<span className="h-px flex-1 bg-border" /></div>
          <Button asChild variant="outline" className="h-auto min-h-12 w-full whitespace-normal border-primary/40 bg-accent py-3 text-accent-foreground"><Link to="/dashboard"><ShieldCheck />{tx("Acessar Modo Demonstração (Sem Senha)", "Access Demo Mode (No Password)", "Acceder al modo demostración (Sin contraseña)")}</Link></Button>
          <p className="mt-4 flex items-start justify-center gap-2 text-xs leading-relaxed text-muted-foreground"><LockKeyhole className="mt-0.5 size-3 shrink-0" />{tx("Ambiente demonstrativo. Não use senhas ou dados pessoais reais.", "Demo environment. Do not use real passwords or personal data.", "Entorno de demostración. No uses contraseñas ni datos personales reales.")}</p>
          <Link to="/" className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />{tx("Voltar à Página Inicial", "Back to home", "Volver al inicio")}</Link>
        </div>
      </section>
      <Dialog open={recovery} onOpenChange={setRecovery}><DialogContent><DialogHeader><DialogTitle>{tx("Recuperação de senha", "Password recovery", "Recuperación de contraseña")}</DialogTitle><DialogDescription>{tx("Este acesso é demonstrativo e não possui contas ou recuperação de senha. Você pode entrar pelo Modo Demonstração sem senha.", "This demo has no accounts or password recovery. Use Demo Mode without a password.", "Esta demostración no tiene cuentas ni recuperación de contraseña. Usa el modo demostración sin contraseña.")}</DialogDescription></DialogHeader><Button asChild><Link to="/dashboard">{tx("Acessar demonstração", "Open demo", "Acceder a la demostración")}</Link></Button></DialogContent></Dialog>
    </main>
  );
}