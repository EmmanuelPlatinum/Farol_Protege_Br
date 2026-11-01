import { createFileRoute } from "@tanstack/react-router";
import { FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app-header";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/_dashboard/reports")({
  head: () => ({
    meta: [
      { title: "Relatórios ECA — Farol Protege" },
      { name: "description", content: "Relatórios e ofícios gerados conforme o ECA." },
      { property: "og:title", content: "Relatórios ECA — Farol Protege" },
      { property: "og:description", content: "Relatórios e ofícios gerados conforme o ECA." },
    ],
  }),
  component: Reports,
});

const items = [
  { due: "28/10", s: "onTime" }, { due: "27/10", s: "late" }, { due: "25/10", s: "sent" }, { due: "30/10", s: "onTime" },
] as const;
const variant = { onTime: "warning", late: "danger", sent: "success" } as const;

function Reports() {
  const { t } = useI18n();
  return (
    <>
      <PageHeader title={t.reports.title} subtitle={t.reports.sub}
        action={<Button size="lg" onClick={() => toast.success(t.reports.generated)}><Sparkles /> {t.reports.generate}</Button>} />
      <div className="space-y-3">
        {items.map((it, i) => (
          <Card key={i} className="shadow-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><FileText className="size-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{t.reportNames[i]}</p>
                <p className="text-xs text-muted-foreground">{t.reports.due}: {it.due}</p>
              </div>
              <Badge variant={variant[it.s]}>{t.reports[it.s]}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
