import { Link } from "@tanstack/react-router";
import { Bell, Search, ShieldCheck, ShieldAlert, EyeOff } from "lucide-react";
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

export function AppHeader() {
  const { t } = useI18n();
  const tx = useTx();
  const { lgpdMode, setLgpdMode } = usePrivacy();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur md:px-6">
      <SidebarTrigger />

      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t.search} className="border-transparent bg-muted pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
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
                    setLgpdMode(checked);
                    if (checked) {
                      toast.success(
                        tx(
                          "Modo Sigilo LGPD/ECA ativado: Nomes de crianças e adolescentes anonimizados.",
                          "LGPD/ECA Privacy Mode activated: Minor names are now anonymized.",
                          "Modo Sigilo activado: Nombres de menores anonimizados."
                        )
                      );
                    } else {
                      toast.info(
                        tx(
                          "Modo Sigilo desativado: Nomes completos visíveis internamente.",
                          "Privacy Mode deactivated: Full names visible internally.",
                          "Modo Sigilo desactivado: Nombres completos visibles."
                        )
                      );
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
            <DropdownMenuItem asChild>
              <Link to="/login">{t.logout}</Link>
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
