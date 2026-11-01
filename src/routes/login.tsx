import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  LockKeyhole,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { LighthouseScene } from "@/components/lighthouse-scene";
import { FarolProtegeLogo } from "@/components/farol-logo";
import { useTx } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acesso Conselheiro — Farol Protege" },
      {
        name: "description",
        content: "Acesso demonstrativo ao Farol Protege para conselheiros tutelares.",
      },
      { property: "og:title", content: "Acesso Conselheiro — Farol Protege" },
      {
        property: "og:description",
        content: "Acesso dos conselheiros e demonstração do Farol Protege.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const tx = useTx();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"login" | "request">("login");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [visible, setVisible] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [requested, setRequested] = useState(false);

  // Additional fields for "Solicitar Acesso"
  const [fullName, setFullName] = useState("");
  const [councilRegion, setCouncilRegion] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("farol_login_identity");
      if (saved) {
        setIdentity(saved);
        setRemember(true);
      }
    } catch {
      /* optional preference */
    }
  }, []);

  const handleLoginSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (remember) {
        localStorage.setItem("farol_login_identity", identity);
      } else {
        localStorage.removeItem("farol_login_identity");
      }
    } catch {
      /* optional preference */
    }
    setPassword("");
    toast.info(
      tx(
        "Acesso demonstrativo — nenhuma credencial foi validada.",
        "Demo access — no credentials were verified.",
        "Acceso de demostración — no se verificaron credenciales."
      )
    );
    navigate({ to: "/dashboard" });
  };

  const handleRequestSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setRequested(true);
    toast.success(
      tx(
        "Solicitação simulada registrada com sucesso!",
        "Simulated access request recorded!",
        "¡Solicitud simulada registrada con éxito!"
      )
    );
  };

  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      {/* Visual Panel (Left) */}
      <section className="login-visual relative flex min-h-[380px] flex-col justify-between overflow-hidden lg:min-h-svh">
        <div className="relative z-10 flex items-center justify-between p-6 sm:p-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white backdrop-blur-md transition-colors hover:bg-black/60"
          >
            <FarolProtegeLogo size="sm" showSubtitle={false} inverted />
          </Link>
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-scene-label font-medium">GovTech Proteção 24h</span>
          </div>
        </div>

        {/* Lighthouse SVG Animation Scene */}
        <div className="absolute inset-0">
          <LighthouseScene />
        </div>

        {/* Gradient shadow for text readability */}
        <div className="relative z-10 mt-auto bg-gradient-to-t from-[oklch(0.18_0.035_250)] via-[oklch(0.18_0.035_250_/_80%)] to-transparent px-6 pb-8 pt-24 sm:px-10 lg:px-14 lg:pb-14">
          <Badge
            variant="outline"
            className="mb-3 border-scene-label/40 bg-black/20 text-[11px] font-semibold uppercase tracking-wider text-scene-label backdrop-blur-sm"
          >
            {tx("Proteção que orienta", "Protection that guides", "Protección que orienta")}
          </Badge>
          <h2 className="max-w-md text-2xl font-bold leading-snug tracking-tight text-scene-copy lg:text-3xl">
            {tx(
              "Farol Protege: Iluminando caminhos e protegendo a infância",
              "Farol Protege: Lighting paths and protecting childhood",
              "Farol Protege: Iluminando caminos y protegiendo la infancia"
            )}
          </h2>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-scene-copy/80">
            {tx(
              "Plataforma de gestão integrada para Conselhos Tutelares, unindo segurança de dados, vigilância proativa e sobreaviso.",
              "Integrated management platform for Child Protection Councils, uniting data security, proactive vigilance, and on-call duty.",
              "Plataforma de gestión integrada para Consejos Tutelares, uniendo seguridad de datos, vigilancia proactiva y guardias."
            )}
          </p>
        </div>
      </section>

      {/* GovTech Access Panel (Right) */}
      <section className="flex flex-col bg-background px-6 py-6 sm:px-12 lg:px-14">
        {/* Top bar with Branding, Language and Theme */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center">
            <FarolProtegeLogo size="md" showSubtitle />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-8">
          {/* GovTech Demonstration UI Label / Banner */}
          <div className="mb-6 rounded-lg border border-primary/25 bg-accent/60 p-3.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-foreground">
              <span className="flex items-center gap-1.5 text-primary">
                <ShieldAlert className="size-4" />
                {tx("Ambiente de Demonstração", "Demonstration Environment", "Entorno de Demostración")}
              </span>
              <Badge variant="outline" className="border-primary/40 text-[10px] uppercase font-bold text-primary">
                GovTech UI
              </Badge>
            </div>
            <p className="mt-1.5 leading-relaxed text-muted-foreground">
              {tx(
                "Interface demonstrativa sem validação de senhas. A autenticação real requer infraestrutura governamental em nuvem.",
                "Demonstration UI without password validation. Real auth requires government cloud infrastructure.",
                "Interfaz de demostración sin validación de contraseñas. La autenticación real requiere infraestructura en la nube."
              )}
            </p>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              {tx("Acesso Conselheiro", "Counselor Access", "Acceso del Consejero")}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              {tx("Bem-vindo ao Farol", "Welcome to Farol", "Bienvenido a Farol")}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {tx(
                "Cuidar da infância começa com você.",
                "Protecting childhood starts with you.",
                "Proteger la infancia comienza contigo."
              )}
            </p>
          </div>

          {/* Navigation Tabs: Entrar / Solicitar Acesso */}
          <Tabs
            value={tab}
            onValueChange={(val) => {
              setTab(val as "login" | "request");
              setRequested(false);
            }}
          >
            <TabsList className="mb-5 grid w-full grid-cols-2">
              <TabsTrigger value="login">{tx("Entrar", "Sign in", "Ingresar")}</TabsTrigger>
              <TabsTrigger value="request">
                {tx("Solicitar Acesso", "Request Access", "Solicitar Acceso")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Tab 1: Entrar */}
          {tab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="identity" className="text-sm font-medium">
                  {tx(
                    "Matrícula Funcional / E-mail",
                    "Employee ID / Email",
                    "Matrícula Funcional / Correo"
                  )}
                </Label>
                <Input
                  id="identity"
                  required
                  placeholder={tx("ex: 10482 ou conselheiro@municipio.gov.br", "ex: 10482 or counselor@city.gov.br", "ej: 10482 o consejero@municipio.gov.br")}
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  autoComplete="username"
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  {tx("Senha", "Password", "Contraseña")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    required
                    type={visible ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="h-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-0.5 size-9 text-muted-foreground hover:text-foreground"
                    onClick={() => setVisible(!visible)}
                    aria-label={
                      visible
                        ? tx("Ocultar senha", "Hide password", "Ocultar contraseña")
                        : tx("Mostrar senha", "Show password", "Mostrar contraseña")
                    }
                  >
                    {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(checked === true)}
                  />
                  <Label htmlFor="remember" className="cursor-pointer text-xs font-normal">
                    {tx("Lembrar-me", "Remember me", "Recordarme")}
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-primary"
                  onClick={() => setRecovery(true)}
                >
                  {tx("Esqueci minha senha", "Forgot password", "Olvidé mi contraseña")}
                </Button>
              </div>

              <Button type="submit" size="lg" className="h-11 w-full gap-2 font-medium">
                <span>{tx("Acessar Sistema", "Access System", "Acceder al Sistema")}</span>
                <ArrowRight className="size-4" />
              </Button>
            </form>
          )}

          {/* Tab 2: Solicitar Acesso */}
          {tab === "request" && (
            <div>
              {requested ? (
                <div
                  role="status"
                  className="rounded-lg border border-success/30 bg-success-soft/60 p-4 text-sm"
                >
                  <div className="flex items-center gap-2 font-semibold text-success">
                    <ShieldCheck className="size-5" />
                    <span>
                      {tx(
                        "Solicitação Simulada Registrada",
                        "Simulated Request Recorded",
                        "Solicitud Simulada Registrada"
                      )}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {tx(
                      "Seu pedido foi registrado localmente nesta interface de demonstração. Nenhum e-mail ou dado pessoal foi transmitido externamente.",
                      "Your request was logged locally in this demo UI. No emails or personal data were transmitted externally.",
                      "Su solicitud fue registrada localmente en esta interfaz de demostración. No se transmitieron correos ni datos personales externamente."
                    )}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => {
                        setRequested(false);
                        setTab("login");
                      }}
                    >
                      {tx("Voltar ao Login", "Back to Login", "Volver al Login")}
                    </Button>
                    <Button
                      size="sm"
                      asChild
                      className="w-full text-xs"
                    >
                      <Link to="/dashboard">
                        {tx("Ir ao Painel", "Go to Dashboard", "Ir al Panel")}
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="req-name" className="text-sm font-medium">
                      {tx("Nome Completo", "Full Name", "Nombre Completo")}
                    </Label>
                    <Input
                      id="req-name"
                      required
                      placeholder={tx("ex: Ana Costa", "ex: Ana Costa", "ej: Ana Costa")}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="req-identity" className="text-sm font-medium">
                      {tx(
                        "Matrícula Funcional / E-mail Institucional",
                        "Functional ID / Institutional Email",
                        "Matrícula Funcional / Correo Institucional"
                      )}
                    </Label>
                    <Input
                      id="req-identity"
                      required
                      type="text"
                      placeholder={tx("ex: conselheiro@municipio.gov.br", "ex: counselor@city.gov.br", "ej: consejero@municipio.gov.br")}
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="req-region" className="text-sm font-medium">
                      {tx(
                        "Conselho Tutelar / Município",
                        "Child Protection Council / Municipality",
                        "Consejo Tutelar / Municipio"
                      )}
                    </Label>
                    <Input
                      id="req-region"
                      required
                      placeholder={tx("ex: Conselho Tutelar Zona Sul - SP", "ex: South Zone Council - SP", "ej: Consejo Tutelar Zona Sur - SP")}
                      value={councilRegion}
                      onChange={(e) => setCouncilRegion(e.target.value)}
                      className="h-10"
                    />
                  </div>

                  <Button type="submit" size="lg" className="mt-2 h-11 w-full gap-2 font-medium">
                    <Send className="size-4" />
                    <span>{tx("Solicitar Acesso", "Request Access", "Solicitar Acceso")}</span>
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            <span>{tx("ou", "or", "o")}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Featured Button: Acessar Modo Demonstração (Sem Senha) */}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-auto min-h-12 w-full whitespace-normal border-primary/40 bg-accent py-3 text-accent-foreground shadow-sm transition-all hover:border-primary hover:bg-accent/80"
          >
            <Link to="/dashboard" className="flex items-center justify-center gap-2 text-center font-semibold">
              <Sparkles className="size-4 shrink-0 text-primary" />
              <span>
                {tx(
                  "Acessar Modo Demonstração (Sem Senha)",
                  "Access Demo Mode (No Password)",
                  "Acceder al Modo Demostración (Sin Contraseña)"
                )}
              </span>
            </Link>
          </Button>

          {/* Security / Privacy notice */}
          <p className="mt-4 flex items-start justify-center gap-1.5 text-center text-xs leading-relaxed text-muted-foreground">
            <LockKeyhole className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <span>
              {tx(
                "Ambiente de teste com dados fictícios. Não insira dados pessoais reais.",
                "Test environment with mock data. Do not enter real personal data.",
                "Entorno de prueba con datos ficticios. No ingrese datos personales reales."
              )}
            </span>
          </p>

          {/* Back to Home Link */}
          <Link
            to="/"
            className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>{tx("Voltar à Página Inicial", "Back to Home", "Volver al Inicio")}</span>
          </Link>
        </div>
      </section>

      {/* Forgot Password Dialog */}
      <Dialog open={recovery} onOpenChange={setRecovery}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <Info className="size-5 text-primary" />
            </div>
            <DialogTitle>
              {tx("Recuperação de Senha", "Password Recovery", "Recuperación de Contraseña")}
            </DialogTitle>
            <DialogDescription className="leading-relaxed">
              {tx(
                "Por ser uma demonstração pública GovTech sem validação de credenciais, o Farol Protege não armazena contas reais. Você pode explorar todas as funções instantaneamente pelo Modo Demonstração.",
                "As a public GovTech demo without credential validation, Farol Protege does not store real accounts. You can explore all features instantly via Demo Mode.",
                "Al ser una demostración pública GovTech sin validación de credenciales, Farol Protege no almacena cuentas reales. Puede explorar todas las funciones al instante a través del Modo Demostración."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setRecovery(false)}>
              {tx("Fechar", "Close", "Cerrar")}
            </Button>
            <Button asChild onClick={() => setRecovery(false)}>
              <Link to="/dashboard">
                {tx("Entrar no Modo Demonstração", "Enter Demo Mode", "Entrar en Modo Demostración")}
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
