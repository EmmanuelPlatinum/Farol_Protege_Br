import { useNavigate } from "@tanstack/react-router";
import { Bell, Search, ShieldCheck, Scale, Gavel } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useGovtechProfile } from "@/lib/govtech-profile";
import { signOut } from "@/lib/auth-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AppHeader() {
  const { t } = useI18n();
  const tx = useTx();
  const navigate = useNavigate();
  const { profile, setProfile } = useGovtechProfile();

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-4 shrink-0 text-emerald-500" aria-hidden="true" />
                <span className="hidden font-medium sm:inline">
                  {tx("Sigilo por padrão", "Privacy by default", "Privacidad predeterminada")}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs text-center text-xs">
              {tx(
                "Dados identificáveis de menores ficam protegidos por padrão. O acesso autorizado é auditado no servidor.",
                "Children's identifying data is protected by default. Authorized access is audited on the server.",
                "Los datos identificables de menores se protegen por defecto. El acceso autorizado se audita en el servidor."
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
