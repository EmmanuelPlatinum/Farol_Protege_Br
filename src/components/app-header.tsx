import { useNavigate } from "@tanstack/react-router";
import { Bell, Search, ShieldCheck, ShieldAlert, Scale, Gavel } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n, useTx } from "@/lib/i18n";
import { usePrivacy } from "@/lib/privacy-store";
import { useGovtechProfile } from "@/lib/govtech-profile";
import { appendAuditEvents, getActiveAuditCase } from "@/lib/audit-store";
import { signOut } from "@/lib/auth-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AppHeader() {
  const { t } = useI18n();
  const tx = useTx();
  const navigate = useNavigate();
  const { lgpdMode, setLgpdMode } = usePrivacy();
  const { profile, setProfile } = useGovtechProfile();
  const [confirmPrivacyOff, setConfirmPrivacyOff] = useState(false);

  const confirmUnmaskedAccess = async () => {
    try {
      await appendAuditEvents([
        {
          caseId: getActiveAuditCase(),
          action: "privacy_mode_disabled",
          summary: "Confirmação de acesso a dados sensíveis; visualização sem máscara autorizada pelo usuário.",
          actorProfile: profile,
        },
      ]);
      setLgpdMode(false);
      setConfirmPrivacyOff(false);
      toast.info(
        tx(
          "Acesso sem máscara confirmado e registrado no histórico de auditoria.",
          "Unmasked access confirmed and recorded in the audit history.",
          "Acceso sin máscara confirmado y registrado en el historial de auditoría.",
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível registrar; o Modo Sigilo permanece ativo.");
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur md:px-6">
      <SidebarTrigger />

      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t.search} className="border-transparent bg-muted pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5">
          <span className="hidden text-[10px] font-medium uppercase tracking-wide text-amber-700 xl:inline dark:text-amber-400">
            {tx("Simulado", "Simulated", "Simulado")}
          </span>
          {profile === "prosecutor" ? (
            <Scale className="hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
          ) : profile === "juvenile_court" ? (
            <Gavel className="hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
          ) : null}
          <Select
            value={profile}
            onValueChange={(value) => {
              if (value === "counselor" || value === "prosecutor" || value === "juvenile_court") {
                setProfile(value);
              }
            }}
          >
            <SelectTrigger
              className="h-9 w-[142px] border-dashed text-xs sm:w-[190px]"
              aria-label={tx("Perfil simulado", "Simulated profile", "Perfil simulado")}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="counselor">
                {tx("Conselheiro Tutelar", "Child Protection Counselor", "Consejero Tutelar")}
              </SelectItem>
              <SelectItem value="prosecutor">
                {tx("Promotoria da Infância (MP)", "Children's Prosecutor (MP)", "Fiscalía de Infancia (MP)")}
              </SelectItem>
              <SelectItem value="juvenile_court">
                {tx("Juizado da Infância", "Juvenile Court", "Juzgado de Infancia")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Botão de Alternância / Toggle: Modo Sigilo LGPD / ECA */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  lgpdMode
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {lgpdMode ? (
                  <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
                ) : (
                  <ShieldAlert className="size-4 shrink-0 text-muted-foreground" />
                )}
                <span className="hidden font-medium sm:inline">
                  {tx("Sigilo LGPD", "LGPD Privacy", "Sigilo LGPD")}
                </span>
                <Switch
                  checked={lgpdMode}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setLgpdMode(true);
                      toast.success(
                        tx(
                          "Modo Sigilo LGPD/ECA ativado: Nomes de crianças e adolescentes anonimizados.",
                          "LGPD/ECA Privacy Mode activated: Minor names are now anonymized.",
                          "Modo Sigilo activado: Nombres de menores anonimizados."
                        )
                      );
                    } else {
                      setConfirmPrivacyOff(true);
                    }
                  }}
                  aria-label={tx("Alternar Modo Sigilo LGPD", "Toggle LGPD Privacy Mode", "Alternar Modo Sigilo")}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-center text-xs">
              {tx(
                "Conformidade Art. 17 do ECA e LGPD: Mascara nomes de menores em iniciais para preservar o sigilo das famílias.",
                "ECA Art. 17 & LGPD Compliance: Masks minor names into initials to protect identity.",
                "Conformidad Art. 17 del ECA y LGPD: Oculta nombres de menores en iniciales."
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <AlertDialog open={confirmPrivacyOff} onOpenChange={setConfirmPrivacyOff}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {tx("Confirmação de acesso a dados sensíveis", "Sensitive data access confirmation", "Confirmación de acceso a datos sensibles")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {tx(
                  "Você está acessando dados sensíveis de menores protegidos pelo ECA. Esta ação será registrada no histórico de auditoria do Conselho.",
                  "You are accessing sensitive data of minors protected by the ECA. This action will be recorded in the Council's audit history.",
                  "Está accediendo a datos sensibles de menores protegidos por el ECA. Esta acción se registrará en el historial de auditoría del Consejo.",
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tx("Cancelar", "Cancel", "Cancelar")}</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    void confirmUnmaskedAccess();
                  }}
                >
                  {tx("Confirmar Visualização Justificada", "Confirm Justified Access", "Confirmar Visualización Justificada")}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <LanguageToggle />
        <ThemeToggle />

        <Button variant="ghost" size="icon" className="relative" aria-label={t.notifications}>
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t.profile}
            >
              <Avatar className="size-9">
                <AvatarFallback className="bg-accent font-semibold text-accent-foreground">
                  AC
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">Ana Costa</p>
              <p className="text-xs font-normal text-muted-foreground">ana@farolprotege.gov.br</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t.profile}</DropdownMenuItem>
            <DropdownMenuItem>{t.nav.settings}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void signOut()
                  .then(() => navigate({ to: "/login", replace: true }))
                  .catch((error: unknown) =>
                    toast.error(error instanceof Error ? error.message : tx("Não foi possível encerrar a sessão.", "Could not sign out.", "No se pudo cerrar sesión.")),
                  );
              }}
            >
              {t.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
