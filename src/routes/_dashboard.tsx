import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { useAuth, signOut } from "@/lib/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const auth = useAuth();
  const navigate = useNavigate();
  const tx = useTx();
  const approved = auth.demoMode || Boolean(auth.user && auth.profile?.approved_at);

  useEffect(() => {
    if (!auth.loading && !auth.user && !auth.demoMode) {
      void navigate({ to: "/login", replace: true });
    }
  }, [auth.demoMode, auth.loading, auth.user, navigate]);

  const leaveDemo = async () => {
    try {
      await signOut();
      await navigate({ to: "/login", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível encerrar a sessão.");
    }
  };

  if (auth.loading || (!auth.user && !auth.demoMode)) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <p role="status" className="text-sm text-muted-foreground">
          {tx("Verificando autenticação…", "Checking authentication…", "Verificando autenticación…")}
        </p>
      </main>
    );
  }

  if (auth.user && !approved) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <Card className="w-full max-w-lg">
          <CardContent className="space-y-4 p-6">
            <h1 className="text-xl font-semibold">{tx("Acesso aguardando aprovação", "Access pending approval", "Acceso pendiente de aprobación")}</h1>
            <p className="text-sm text-muted-foreground">
              {tx(
                "A conta foi autenticada, mas o perfil funcional e a regional ainda precisam ser verificados por um administrador autorizado. Nenhum dado de caso foi liberado.",
                "The account is authenticated, but its employee profile and council region must be verified by an authorized administrator. No case data has been released.",
                "La cuenta está autenticada, pero un administrador autorizado debe verificar el perfil y la regional. No se han habilitado datos de casos.",
              )}
            </p>
            <Button type="button" variant="outline" onClick={leaveDemo}>
              {tx("Sair", "Sign out", "Cerrar sesión")}
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
