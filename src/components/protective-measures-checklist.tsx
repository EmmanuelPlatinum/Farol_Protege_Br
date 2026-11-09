import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CalendarClock, Plus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  addProtectiveMeasure,
  updateProtectiveMeasure,
  type Case,
} from "@/lib/cases-store";
import {
  formatDateKey,
  getDateKey,
  getDaysUntilDeadline,
  getMeasureDeadline,
  isActiveMeasureStatus,
  protectiveMeasureTemplates,
  type ProtectiveMeasure,
  type ProtectiveMeasureStatus,
} from "@/lib/protective-measures";
import { useTx } from "@/lib/i18n";

const statusLabels: Record<ProtectiveMeasureStatus, [string, string, string]> = {
  pending: ["Pendente", "Pending", "Pendiente"],
  in_progress: ["Em cumprimento", "In progress", "En cumplimiento"],
  completed: ["Cumprida", "Completed", "Cumplida"],
  breached: ["Descumprida", "Not complied", "Incumplida"],
};

function MeasureItem({
  caseId,
  measure,
  readOnly,
}: {
  caseId: string;
  measure: ProtectiveMeasure;
  readOnly: boolean;
}) {
  const tx = useTx();
  const [days, setDays] = useState(String(measure.deadlineDays));
  const remaining = getDaysUntilDeadline(measure);
  const overdue = remaining < 0 && isActiveMeasureStatus(measure.status);
  const deadlineBadge = overdue
    ? "border-destructive/30 bg-destructive/10 text-destructive motion-safe:animate-pulse"
    : remaining <= 3
      ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      : "border-success/30 bg-success-soft text-success";

  const saveDeadline = () => {
    const parsedDays = Number(days);
    if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 3650) {
      setDays(String(measure.deadlineDays));
      return;
    }
    if (parsedDays !== measure.deadlineDays) {
      void updateProtectiveMeasure(caseId, measure.id, { deadlineDays: parsedDays }).catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : tx("Não foi possível salvar o prazo.", "Could not save the deadline.", "No se pudo guardar el plazo.")),
      );
    }
  };

  const changeStatus = (value: string) => {
    if (
      value === "pending" ||
      value === "in_progress" ||
      value === "completed" ||
      value === "breached"
    ) {
      void updateProtectiveMeasure(caseId, measure.id, { status: value }).catch((error: unknown) =>
        toast.error(error instanceof Error ? error.message : tx("Não foi possível salvar o status.", "Could not save the status.", "No se pudo guardar el estado.")),
      );
    }
  };

  return (
    <li className="rounded-xl border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="font-medium">{measure.title}</h4>
          <p className="mt-1 text-xs text-muted-foreground">{measure.legalBasis}</p>
        </div>
        <Badge
          variant="outline"
          className={
            measure.status === "breached"
              ? "border-destructive/30 bg-destructive/10 text-destructive"
              : measure.status === "completed"
                ? "border-success/30 bg-success-soft text-success"
                : "border-border"
          }
        >
          {tx(...statusLabels[measure.status])}
        </Badge>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Label htmlFor={`measure-status-${measure.id}`} className="text-xs">
            {tx("Status da medida", "Measure status", "Estado de la medida")}
          </Label>
          <Select value={measure.status} onValueChange={changeStatus} disabled={readOnly}>
            <SelectTrigger id={`measure-status-${measure.id}`} className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(statusLabels) as ProtectiveMeasureStatus[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {tx(...statusLabels[status])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-32">
          <Label htmlFor={`measure-days-${measure.id}`} className="text-xs">
            {tx("Prazo (dias)", "Deadline (days)", "Plazo (días)")}
          </Label>
          <Input
            id={`measure-days-${measure.id}`}
            type="number"
            min={1}
            max={3650}
            step={1}
            value={days}
            disabled={readOnly}
            onChange={(event) => setDays(event.target.value)}
            onBlur={saveDeadline}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                saveDeadline();
                event.currentTarget.blur();
              }
            }}
            className="mt-1"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <CalendarClock aria-hidden="true" className="size-3.5" />
          {tx("Prazo final:", "Due date:", "Fecha límite:")}{" "}
          {formatDateKey(getMeasureDeadline(measure))}
        </span>
        {overdue ? (
          <Badge variant="outline" className={deadlineBadge}>
            <AlertTriangle aria-hidden="true" className="mr-1 size-3" />
            {tx("Vencida / Prazo esgotado", "Overdue / Deadline passed", "Vencida / Plazo agotado")}
          </Badge>
        ) : measure.status === "completed" ? (
          <Badge variant="outline" className="border-success/30 bg-success-soft text-success">
            {tx("Cumprida", "Completed", "Cumplida")}
          </Badge>
        ) : measure.status === "breached" ? (
          <Badge variant="danger">{tx("Descumprida", "Not complied", "Incumplida")}</Badge>
        ) : remaining <= 3 ? (
          <Badge variant="outline" className={deadlineBadge}>
            {remaining === 0
              ? tx("Vence hoje", "Due today", "Vence hoy")
              : tx(`Vence em ${remaining} dias`, `Due in ${remaining} days`, `Vence en ${remaining} días`)}
          </Badge>
        ) : (
          <Badge variant="outline" className={deadlineBadge}>
            {tx(`Restam ${remaining} dias`, `${remaining} days remaining`, `Quedan ${remaining} días`)}
          </Badge>
        )}
      </div>
    </li>
  );
}

export function ProtectiveMeasuresChecklist({
  caseRecord,
  readOnly = false,
}: {
  caseRecord: Case;
  readOnly?: boolean;
}) {
  const tx = useTx();
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [adding, setAdding] = useState(false);
  const measures = caseRecord.protectiveMeasures ?? [];
  const childMeasures = measures.filter((measure) => measure.category === "child");
  const caregiverMeasures = measures.filter((measure) => measure.category === "caregiver");

  const addSelectedMeasure = async () => {
    const template = protectiveMeasureTemplates.find((item) => item.id === selectedTemplate);
    if (!template) return;
    setAdding(true);
    try {
      await addProtectiveMeasure(caseRecord.id, {
        templateId: template.id,
        title: template.title,
        category: template.category,
        legalBasis: template.legalBasis,
        status: "pending",
        createdAt: getDateKey(new Date()),
        deadlineDays: template.defaultDeadlineDays,
      });
      setSelectedTemplate("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tx("Não foi possível incluir a medida.", "Could not add the measure.", "No se pudo añadir la medida."));
    } finally {
      setAdding(false);
    }
  };

  const renderMeasures = (items: ProtectiveMeasure[]) =>
    items.length ? (
      <ul className="space-y-3">
        {items.map((measure) => (
          <MeasureItem key={measure.id} caseId={caseRecord.id} measure={measure} readOnly={readOnly} />
        ))}
      </ul>
    ) : (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        {tx("Nenhuma medida adicionada.", "No measures added.", "No se han añadido medidas.")}
      </p>
    );

  return (
    <Card className="mt-6 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
          {tx("Medidas protetivas e gestão de prazos", "Protective measures and deadlines", "Medidas de protección y plazos")}
        </CardTitle>
        <CardDescription>
          {tx(
            "Checklist baseado nos arts. 101 e 129 do ECA. Os prazos são referências operacionais e devem ser definidos conforme o caso.",
            "Checklist based on ECA Articles 101 and 129. Deadlines are operational references and should be set for each case.",
            "Lista basada en los arts. 101 y 129 del ECA. Los plazos son referencias operativas y deben definirse según el caso.",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!readOnly && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
            <SelectTrigger aria-label={tx("Selecionar medida protetiva", "Select protective measure", "Seleccionar medida de protección")} className="min-w-0 flex-1">
              <SelectValue
                placeholder={tx("Adicionar medida protetiva...", "Add a protective measure...", "Añadir medida de protección...")}
              />
            </SelectTrigger>
            <SelectContent>
              {protectiveMeasureTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {tx(
                    template.title,
                    template.id === "school-enrollment"
                      ? "School enrollment and attendance"
                      : template.id === "health-treatment"
                        ? "Medical or psychological treatment"
                        : template.id === "shelter"
                          ? "Institutional or family care"
                          : template.id === "family-support"
                            ? "Referral to family support program"
                            : template.id === "substance-treatment"
                              ? "Substance-use treatment"
                              : "Parenting guidance program",
                    template.id === "school-enrollment"
                      ? "Matrícula y asistencia escolar"
                      : template.id === "health-treatment"
                        ? "Tratamiento médico o psicológico"
                        : template.id === "shelter"
                          ? "Acogimiento institucional o familiar"
                          : template.id === "family-support"
                            ? "Derivación a programa de apoyo familiar"
                            : template.id === "substance-treatment"
                              ? "Tratamiento por dependencia de sustancias"
                              : "Programa de orientación familiar",
                  )}
                  {" · "}
                  {template.defaultDeadlineDays} {tx("dias", "days", "días")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" onClick={() => void addSelectedMeasure()} disabled={!selectedTemplate || adding}>
            <Plus aria-hidden="true" className="mr-1.5 size-4" />
            {tx("Adicionar medida", "Add measure", "Añadir medida")}
          </Button>
        </div>
        )}

        <section aria-labelledby={`child-measures-${caseRecord.id}`} className="space-y-3">
          <div>
            <h3 id={`child-measures-${caseRecord.id}`} className="font-semibold">
              {tx("Medidas à criança/adolescente · Art. 101", "Measures for child/adolescent · Art. 101", "Medidas para niño/adolescente · Art. 101")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tx("Matrícula, tratamento e acolhimento, conforme avaliação do caso.", "Enrollment, treatment, and care, according to case assessment.", "Matrícula, tratamiento y acogimiento, según la evaluación del caso.")}
            </p>
          </div>
          {renderMeasures(childMeasures)}
        </section>

        <section aria-labelledby={`caregiver-measures-${caseRecord.id}`} className="space-y-3">
          <div>
            <h3 id={`caregiver-measures-${caseRecord.id}`} className="font-semibold">
              {tx("Medidas aos pais/responsáveis · Art. 129", "Measures for parents/guardians · Art. 129", "Medidas para padres/responsables · Art. 129")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tx("Apoio familiar, tratamento e orientação, conforme deliberação do Conselho.", "Family support, treatment, and guidance, as determined by the Council.", "Apoyo familiar, tratamiento y orientación, según lo determine el Consejo.")}
            </p>
          </div>
          {renderMeasures(caregiverMeasures)}
        </section>
      </CardContent>
    </Card>
  );
}
