import { useCallback, useEffect, useState } from "react";
import { Radio, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-store";
import { useTx } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

type CloudIntake = {
  id: string;
  protocol: string;
  violation_type: string;
  approximate_area: string;
  support_need: string;
  description: string;
  status: string;
  created_at: string;
};

const statusNames: Record<string, string> = {
  received: "Recebida",
  screening: "Em triagem",
  visit_scheduled: "Visita agendada",
  visit_completed: "Visita realizada",
  referred_network: "Encaminhada à rede",
  referred_mp: "Encaminhada ao MP",
  protective_action: "Providência protetiva",
};

export function CloudIntakeQueue() {
  const tx = useTx();
  const { user, profile, demoMode } = useAuth();
  const [reports, setReports] = useState<CloudIntake[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const region = profile?.council_region;

  const loadReports = useCallback(async () => {
    if (!supabase || !user || !region || demoMode) return;
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from("public_reports")
      .select("id, protocol, violation_type, approximate_area, support_need, description, status, created_at")
      .eq("council_region", region)
      .order("created_at", { ascending: false });
    if (queryError) {
      setError(tx("Falha ao carregar fila regional. Verifique a migração RLS e o perfil aprovado.", "Could not load regional queue. Check the RLS migration and approved profile.", "No se pudo cargar la cola regional. Verifique RLS y el perfil aprobado."));
    } else {
      setReports((data ?? []) as CloudIntake[]);
    }
    setLoading(false);
  }, [demoMode, region, tx, user]);

  useEffect(() => {
    const client = supabase;
    if (!client || !user || !region || demoMode) return;
    void loadReports();
    const channel = client
      .channel(`regional-intake-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "public_reports",
          filter: `council_region=eq.${region}`,
        },
        () => void loadReports(),
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setError(tx("Canal em tempo real indisponível. Atualize manualmente a fila.", "Realtime channel unavailable. Refresh the queue manually.", "Canal en tiempo real no disponible. Actualice la cola manualmente."));
        }
      });
    return () => {
      void client.removeChannel(channel);
    };
  }, [demoMode, loadReports, region, tx, user]);

  const markForTriage = async (report: CloudIntake) => {
    if (!supabase || !user) return;
    const { error: updateError } = await supabase
      .from("public_reports")
      .update({
        status: "screening",
        triaged_at: new Date().toISOString(),
        triaged_by: user.id,
      })
      .eq("id", report.id)
      .eq("council_region", region);
    if (updateError) {
      toast.error(tx("Não foi possível registrar a triagem.", "Could not record triage.", "No se pudo registrar el triage."));
      return;
    }
    toast.success(tx("Denúncia encaminhada para triagem.", "Report moved to triage.", "Denuncia enviada a triage."));
    await loadReports();
  };

  if (demoMode || !user) return null;

  return (
    <Card className="mb-6 border-primary/25 shadow-card">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Radio aria-hidden="true" className="size-5 text-primary" />
              {tx("Fila regional de denúncias cidadãs", "Regional citizen-report queue", "Cola regional de denuncias ciudadanas")}
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
                {tx("Tempo real", "Realtime", "Tiempo real")}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {tx("Acesso restrito à regional verificada no seu perfil. Denúncias não são convertidas automaticamente em casos.", "Restricted to the region verified on your profile. Reports are not automatically converted into cases.", "Acceso restringido a la regional verificada en su perfil. Las denuncias no se convierten automáticamente en casos.")}
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadReports()} disabled={loading}>
            <RefreshCw aria-hidden="true" className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`} />
            {tx("Atualizar", "Refresh", "Actualizar")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {!error && reports.length === 0 && (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {loading ? tx("Carregando…", "Loading…", "Cargando…") : tx("Nenhuma denúncia nesta fila regional.", "No reports in this regional queue.", "No hay denuncias en esta cola regional.")}
          </p>
        )}
        {reports.map((report) => (
          <article key={report.id} className="rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{report.protocol} · {new Date(report.created_at).toLocaleString()}</p>
                <h3 className="mt-1 font-semibold">{report.violation_type}</h3>
                <p className="text-xs text-muted-foreground">{report.approximate_area || tx("Região não informada", "Region not provided", "Región no indicada")}</p>
              </div>
              <Badge variant="outline">{statusNames[report.status] ?? report.status}</Badge>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{report.description}</p>
            {report.support_need !== "unknown" && (
              <p className="mt-2 text-xs text-muted-foreground">
                {tx("Indicador de apoio informado:", "Support-needs indicator:", "Indicador de apoyo:")} {report.support_need}
              </p>
            )}
            {report.status === "received" && (
              <Button type="button" size="sm" className="mt-3" onClick={() => void markForTriage(report)}>
                {tx("Receber para triagem", "Accept for triage", "Recibir para triage")}
              </Button>
            )}
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
