import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BedDouble, Building2, ClipboardList, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCases } from "@/lib/cases-store";
import { usePrivacy } from "@/lib/privacy-store";
import { useTx } from "@/lib/i18n";

export const Route = createFileRoute("/_dashboard/shelters")({
  head: () => ({
    meta: [{ title: "Vagas em Abrigos — Farol Protege" }, { name: "robots", content: "noindex" }],
  }),
  component: Shelters,
});

const institutions = [
  {
    name: "Casa-Lar Esperança",
    total: 12,
    occupied: 9,
    age: "0–12 anos",
    gender: "Todos",
    available: 3,
    distribution: "0–5 anos: 1 vaga · 6–12 anos: 2 vagas (todos os gêneros)",
  },
  {
    name: "Acolhimento Sementes",
    total: 10,
    occupied: 10,
    age: "6–17 anos",
    gender: "Todos",
    available: 0,
    distribution: "6–11 anos: sem vagas · 12–17 anos: sem vagas",
  },
  {
    name: "Residência Jovem",
    total: 8,
    occupied: 5,
    age: "12–17 anos",
    gender: "Todos",
    available: 3,
    distribution: "12–14 anos: 1 vaga · 15–17 anos: 2 vagas (todos os gêneros)",
  },
];

function Shelters() {
  const tx = useTx();
  const cases = useCases().filter((item) => item.status !== "closed");
  const { maskName } = usePrivacy();
  const [selectedCase, setSelectedCase] = useState(cases[0]?.id ?? "");
  const [generated, setGenerated] = useState(false);
  const currentCase = cases.find((item) => item.id === selectedCase);
  const totalCapacity = institutions.reduce((sum, item) => sum + item.total, 0);
  const occupied = institutions.reduce((sum, item) => sum + item.occupied, 0);

  return (
    <>
      <PageHeader
        title="Vagas em Abrigos"
        subtitle="Consulta demonstrativa de disponibilidade para acolhimento institucional."
        action={
          <Dialog
            onOpenChange={(open) => {
              if (!open) setGenerated(false);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <ClipboardList className="mr-2 size-4" />
                Solicitar Encaminhamento Emergencial
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Encaminhamento emergencial</DialogTitle>
                <DialogDescription>
                  Gere uma ficha demonstrativa pré-preenchida a partir de um caso ativo. A
                  disponibilidade deve ser confirmada diretamente com a instituição.
                </DialogDescription>
              </DialogHeader>
              {!generated ? (
                <div className="space-y-4">
                  <label className="text-sm font-medium" htmlFor="shelter-case">
                    Caso a encaminhar
                  </label>
                  <Select value={selectedCase} onValueChange={setSelectedCase}>
                    <SelectTrigger id="shelter-case">
                      <SelectValue placeholder="Selecione um caso" />
                    </SelectTrigger>
                    <SelectContent>
                      {cases.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          Caso #{item.id} · {maskName(item.child)} · {item.age} anos
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    className="w-full"
                    disabled={!currentCase}
                    onClick={() => setGenerated(true)}
                  >
                    Gerar ficha pré-preenchida
                  </Button>
                </div>
              ) : currentCase ? (
                <div className="space-y-3 rounded-lg border p-4 text-sm">
                  <p className="font-semibold">Ficha de encaminhamento · DEMONSTRAÇÃO</p>
                  <p>
                    <span className="text-muted-foreground">Caso:</span> #{currentCase.id}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Criança/adolescente:</span>{" "}
                    {maskName(currentCase.child)}, {currentCase.age} anos
                  </p>
                  <p>
                    <span className="text-muted-foreground">Responsável pelo caso:</span>{" "}
                    {currentCase.counselor}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Motivo:</span> {currentCase.type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Esta ficha não foi transmitida. Complete e valide as informações pelos canais
                    institucionais autorizados.
                  </p>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() =>
                      toast.success(
                        "Ficha demonstrativa gerada. Nenhum encaminhamento foi transmitido.",
                      )
                    }
                  >
                    Concluir ficha
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Não há casos ativos para pré-preencher uma ficha.
                </p>
              )}
            </DialogContent>
          </Dialog>
        }
      />
      <div
        role="note"
        className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-muted-foreground"
      >
        Dados ilustrativos, não conectados ao cadastro municipal. Confirme vaga, perfil, transporte
        e aceite da instituição antes de qualquer encaminhamento.
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Summary
          icon={Building2}
          label="Instituições cadastradas"
          value={String(institutions.length)}
        />
        <Summary icon={Users} label="Ocupação atual" value={`${occupied} / ${totalCapacity}`} />
        <Summary
          icon={BedDouble}
          label="Vagas indicativas"
          value={String(totalCapacity - occupied)}
        />
      </div>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Disponibilidade por instituição</CardTitle>
          <CardDescription>
            Vagas indicativas discriminadas por faixa etária e gênero atendido.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instituição</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Ocupação</TableHead>
                <TableHead>Faixa etária atendida</TableHead>
                <TableHead>Gênero atendido</TableHead>
                <TableHead>Vagas por idade / gênero</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {institutions.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.total}</TableCell>
                  <TableCell>{item.occupied}</TableCell>
                  <TableCell>{item.age}</TableCell>
                  <TableCell>{item.gender}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={item.available ? "success" : "outline"}>
                        {item.available ? `${item.available} vagas` : "Sem vagas"}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{item.distribution}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="flex items-center gap-3 p-5">
        <Icon className="size-5 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
