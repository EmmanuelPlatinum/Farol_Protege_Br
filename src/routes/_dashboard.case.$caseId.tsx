import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/risk-badge";
import { DocumentGenerator } from "@/components/document-generator";
import { useCases } from "@/lib/cases-store";
import { useI18n, useTx } from "@/lib/i18n";
import { usePrivacy } from "@/lib/privacy-store";

export const Route = createFileRoute("/_dashboard/case/$caseId")({
  head: ({ params }) => ({
    meta: [
      { title: `Caso #${params.caseId} — Farol Protege` },
      { name: "description", content: "Histórico completo e ofícios de um caso sigiloso." },
      { property: "og:title", content: `Caso #${params.caseId} — Farol Protege` },
      { property: "og:description", content: "Histórico completo e ofícios de um caso sigiloso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CaseDetails,
});

const variant = { open: "warning", urgent: "danger", closed: "success" } as const;

function CaseDetails() {
  const { caseId } = Route.useParams();
  const { t } = useI18n();
  const tx = useTx();
  const { maskFamily, maskName, lgpdMode } = usePrivacy();
  const c = useCases().find((x) => x.id === caseId);
  const back = <Button asChild variant="ghost" className="mb-4 -ml-3"><Link to="/cases"><ArrowLeft /> {tx("Voltar para casos", "Back to cases", "Volver a los casos")}</Link></Button>;
  if (!c) return <>{back}<p className="text-muted-foreground">{tx("Caso não encontrado.", "Case not found.", "Caso no encontrado.")}</p></>;

  return (
    <>
      {back}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="flex items-center gap-1 font-mono text-xs text-muted-foreground"><Lock className="size-3" /> {tx("Sigiloso", "Confidential", "Confidencial")} · #{c.id}</p>
            {lgpdMode && (
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                {tx("Sigilo LGPD Ativo", "LGPD Privacy Active", "Sigilo LGPD Activo")}
              </Badge>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{t.cases.family} {maskFamily(c.family)}</h1>
          <div className="mt-2 flex flex-wrap gap-2"><RiskBadge risk={c.risk} /><Badge variant={variant[c.status]}>{t.status[c.status]}</Badge><Badge variant="outline">{c.type}</Badge></div>
        </div>
        <DocumentGenerator c={c} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader><CardTitle>{tx("Dados do caso", "Case data", "Datos del caso")}</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <Info icon={User} label={tx("Criança / adolescente", "Child / teen", "Niño / adolescente")} value={`${maskName(c.child)} · ${c.age} ${tx("anos", "years", "años")}`} />
            <Info icon={MapPin} label={tx("Endereço", "Address", "Dirección")} value={c.address || "—"} />
            <Info icon={User} label={t.cases.counselor} value={c.counselor} />
            <div><p className="text-xs text-muted-foreground">{tx("Relato", "Description", "Relato")}</p><p className="mt-1">{c.description || "—"}</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-card lg:col-span-2">
          <CardHeader><CardTitle>{tx("Histórico do caso", "Case timeline", "Historial del caso")}</CardTitle></CardHeader>
          <CardContent>
            <ol className="relative space-y-6 border-l pl-6">
              {[...c.timeline].reverse().map((e, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[31px] top-1 size-3 rounded-full ring-4 ring-card ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                  <p className="text-xs text-muted-foreground">{e.date}</p>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-muted-foreground">{e.note}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex gap-3"><Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div></div>
  );
}
