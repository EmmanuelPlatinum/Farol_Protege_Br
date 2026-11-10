import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/app-header";
import { useI18n, useTx } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { resetDemoData } from "@/lib/cases-store";

export const Route = createFileRoute("/_dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Configurações — Farol Infantil" },
      { name: "description", content: "Configure automações e notificações do conselho." },
      { property: "og:title", content: "Configurações — Farol Infantil" },
      { property: "og:description", content: "Configure automações e notificações do conselho." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useI18n();
  const tx = useTx();
  return (
    <>
      <PageHeader title={t.settings.title} subtitle={t.settings.sub} />
      <Card className="shadow-card">
        <CardHeader><CardTitle>{t.settings.card}</CardTitle><CardDescription>{t.settings.cardSub}</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          {t.settings.opts.map(([title, d], i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <div><p className="font-medium">{title}</p><p className="text-sm text-muted-foreground">{d}</p></div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => {
          if (!confirm(tx("Restaurar dados de exemplo? Casos criados serão apagados.", "Restore sample data? Created cases will be deleted.", "¿Restaurar datos de ejemplo? Los casos creados se eliminarán."))) return;
          resetDemoData(); toast.success(tx("Dados de exemplo restaurados", "Sample data restored", "Datos de ejemplo restaurados"));
        }}>{tx("Restaurar dados de exemplo", "Restore sample data", "Restaurar datos de ejemplo")}</Button>
      </div>
    </>
  );
}
