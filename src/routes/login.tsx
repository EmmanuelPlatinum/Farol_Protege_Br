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
import {
  registerAccount,
  requestPasswordReset,
  signInWithPassword,
  startDemoSession,
  useAuth,
} from "@/lib/auth-store";
import { councilRegions, isLovableCloudConfigured } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const auth = useAuth();

  const [tab, setTab] = useState<"login" | "request">("login");
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [registerPassword, setRegisterPassword] = useState("");
  const [employeeRegistration, setEmployeeRegistration] = useState("");
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [requested, setRequested] = useState(false);

  // Additional fields for "Solicitar Acesso"
  const [fullName, setFullName] = useState("");
  const [councilRegion, setCouncilRegion] = useState("");

  useEffect(() => {
    if (!auth.loading && auth.user && auth.profile?.approved_at) {
      void navigate({ to: "/dashboard", replace: true });
    }
  }, [auth.loading, auth.profile?.approved_at, auth.user, navigate]);

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await signInWithPassword(identity.trim(), password);
      setPassword("");
      toast.success(tx("Autenticação realizada. Verificando perfil e permissões…", "Signed in. Checking profile and permissions…", "Autenticación realizada. Verificando perfil y permisos…"));
      await navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tx("Não foi possível autenticar.", "Sign-in failed.", "No se pudo autenticar."));
    } finally {
      setBusy(false);
    }
  };

  const handleRequestSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!councilRegion) {
      toast.error(tx("Selecione a regional de Cuiabá.", "Select a Cuiabá council region.", "Seleccione la regional de Cuiabá."));
      return;
    }
    setBusy(true);
    try {
      const { session } = await registerAccount({
        email: identity.trim(),
        password: registerPassword,
        fullName,
        employeeRegistration,
        councilRegion: councilRegion as (typeof councilRegions)[number]["id"],
      });
      setRequested(true);
      toast.success(
        session
          ? tx("Cadastro enviado; o perfil aguarda aprovação administrativa.", "Registration submitted; profile awaits administrative approval.", "Registro enviado; el perfil espera aprobación administrativa.")
          : tx("Conta criada. Verifique o e-mail e aguarde a aprovação do Conselho.", "Account created. Verify your email and await Council approval.", "Cuenta creada. Verifique el correo y espere aprobación del Consejo."),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tx("Não foi possível solicitar acesso.", "Could not request access.", "No se pudo solicitar acceso."));
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordRecovery = async () => {
    try {
      await requestPasswordReset(identity.trim());
      toast.success(tx("Se a conta existir, o link de redefinição será enviado ao e-mail.", "If the account exists, a reset link will be sent by email.", "Si la cuenta existe, se enviará un enlace de restablecimiento."));
      setRecovery(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tx("Não foi possível solicitar a redefinição.", "Could not request a password reset.", "No se pudo solicitar el restablecimiento."));
    }
  };

  const enterDemo = async () => {
    try {
      await startDemoSession();
      await navigate({ to: "/dashboard" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tx("Não foi possível iniciar a demonstração.", "Could not start demo.", "No se pudo iniciar la demostración."));
    }
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
                "A autenticação institucional usa Lovable Cloud. O Modo Demonstração é separado e utiliza dados fictícios.",
                "Institutional sign-in uses Lovable Cloud. Demo Mode is separate and uses fictional data.",
                "El acceso institucional usa Lovable Cloud. El Modo Demostración es independiente y utiliza datos ficticios."
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
                    "E-mail institucional",
                    "Institutional email",
                    "Correo institucional"
                  )}
                </Label>
                <Input
                  id="identity"
                  required
                  type="email"
                  placeholder={tx("conselheiro@municipio.gov.br", "counselor@city.gov", "consejero@municipio.gov")}
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  autoComplete="email"
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

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-primary"
                  onClick={() => setRecovery(true)}
                >
                  {tx("Esqueci minha senha", "Forgot password", "Olvidé mi contraseña")}
                </Button>
              </div>

              <Button type="submit" disabled={busy || !isLovableCloudConfigured} size="lg" className="h-11 w-full gap-2 font-medium">
                <span>{tx("Acessar Sistema", "Access System", "Acceder al Sistema")}</span>
                <ArrowRight className="size-4" />
              </Button>
              {!isLovableCloudConfigured && (
                <p className="text-xs text-muted-foreground">
                  {tx("Autenticação em nuvem não configurada neste ambiente. Use o modo demonstração.", "Cloud authentication is not configured in this environment. Use demo mode.", "La autenticación en la nube no está configurada. Use el modo de demostración.")}
                </p>
              )}
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
                        "Solicitação enviada · aprovação pendente",
                        "Request submitted · approval pending",
                        "Solicitud enviada · aprobación pendiente"
                      )}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {tx(
                      "A conta foi criada no Lovable Cloud. Verifique o e-mail, se solicitado, e aguarde a conferência da matrícula e regional por um administrador autorizado.",
                      "The account was created in Lovable Cloud. Verify your email if requested, then wait for an authorized administrator to verify your employee registration and region.",
                      "La cuenta se creó en Lovable Cloud. Verifique el correo si se solicita y espere la validación de matrícula y regional por un administrador autorizado."
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
                        "E-mail institucional",
                        "Institutional email",
                        "Correo institucional"
                      )}
                    </Label>
                    <Input
                      id="req-identity"
                      required
                      type="email"
                      placeholder={tx("conselheiro@municipio.gov.br", "counselor@city.gov", "consejero@municipio.gov")}
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      autoComplete="email"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="req-registration" className="text-sm font-medium">
                      {tx("Matrícula funcional", "Employee registration", "Matrícula funcional")}
                    </Label>
                    <Input
                      id="req-registration"
                      required
                      maxLength={60}
                      value={employeeRegistration}
                      onChange={(e) => setEmployeeRegistration(e.target.value)}
                      autoComplete="off"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="req-region" className="text-sm font-medium">
                      {tx("Regional do Conselho Tutelar de Cuiabá", "Cuiabá Child Protection Council region", "Regional del Consejo Tutelar de Cuiabá")}
                    </Label>
                    <Select value={councilRegion} onValueChange={setCouncilRegion}>
                      <SelectTrigger id="req-region">
                        <SelectValue placeholder={tx("Selecione a regional", "Select region", "Seleccione regional")} />
                      </SelectTrigger>
                      <SelectContent>
                        {councilRegions.map((region) => (
                          <SelectItem key={region.id} value={region.id}>{region.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="req-password">{tx("Criar senha", "Create password", "Crear contraseña")}</Label>
                    <Input
                      id="req-password"
                      required
                      type="password"
                      minLength={10}
                      autoComplete="new-password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {tx("Mínimo de 10 caracteres. O acesso aos casos permanece bloqueado até aprovação.", "At least 10 characters. Case access remains blocked until approval.", "Mínimo 10 caracteres. El acceso a casos permanece bloqueado hasta la aprobación.")}
                    </p>
                  </div>

                  <Button type="submit" disabled={busy || !isLovableCloudConfigured} size="lg" className="mt-2 h-11 w-full gap-2 font-medium">
                    <Send className="size-4" />
                    <span>{tx("Criar conta e solicitar acesso", "Create account and request access", "Crear cuenta y solicitar acceso")}</span>
                  </Button>
                  {!isLovableCloudConfigured && (
                    <p className="text-xs text-muted-foreground">
                      {tx("Cadastro em nuvem indisponível neste ambiente.", "Cloud registration is unavailable in this environment.", "El registro en la nube no está disponible en este entorno.")}
                    </p>
                  )}
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
            type="button"
            variant="outline"
            size="lg"
            className="h-auto min-h-12 w-full whitespace-normal border-primary/40 bg-accent py-3 text-accent-foreground shadow-sm transition-all hover:border-primary hover:bg-accent/80"
            onClick={enterDemo}
          >
            <span className="flex items-center justify-center gap-2 text-center font-semibold">
              <Sparkles className="size-4 shrink-0 text-primary" />
              <span>
                {tx(
                  "Acessar Modo Demonstração (Sem Senha)",
                  "Access Demo Mode (No Password)",
                  "Acceder al Modo Demostración (Sin Contraseña)"
                )}
              </span>
            </span>
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
                "Use o e-mail institucional associado à conta para receber um link seguro de redefinição.",
                "Use the institutional email associated with the account to receive a secure reset link.",
                "Use el correo institucional asociado a la cuenta para recibir un enlace seguro de restablecimiento."
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setRecovery(false)}>
              {tx("Fechar", "Close", "Cerrar")}
            </Button>
            <Button onClick={handlePasswordRecovery} disabled={!isLovableCloudConfigured || !identity.trim()}>
              {tx("Enviar link de redefinição", "Send reset link", "Enviar enlace")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
