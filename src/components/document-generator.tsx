import { useState } from "react";
import { toast } from "sonner";
import {
  FileSignature,
  Gavel,
  Mail,
  Printer,
  School,
  Scale,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { addTimeline, type Case } from "@/lib/cases-store";
import { useTx } from "@/lib/i18n";
import { usePrivacy } from "@/lib/privacy-store";

function CoatOfArms() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="mx-auto size-14 drop-shadow-xs"
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <polygon
        points="50,14 61,38 86,38 66,54 74,78 50,62 26,78 34,54 14,38 39,38"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="50" cy="48" r="14" fill="var(--background, #fff)" stroke="currentColor" strokeWidth="2" />
      <path
        d="M38 52 Q50 40 62 52"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="50" cy="46" r="2.5" fill="currentColor" />
    </svg>
  );
}

const templates = [
  {
    key: "mp",
    name: "Ministério Público",
    icon: Scale,
    titleVocativo: "Excelentíssimo(a) Senhor(a) Promotor(a) de Justiça",
    organ: "Promotoria de Justiça da Infância e da Juventude",
    ask: "a adoção das medidas judiciais cabíveis, nos termos do art. 136, inciso IV, da Lei Federal nº 8.069/1990 (ECA)",
  },
  {
    key: "school",
    name: "Unidade Escolar",
    icon: School,
    titleVocativo: "Ilustríssimo(a) Senhor(a) Diretor(a)",
    organ: "Direção da Unidade Escolar Integrada",
    ask: "informações detalhadas sobre frequência escolar, rendimento pedagógico e suporte multidisciplinar do(a) educando(a), com fulcro no art. 136, inciso III, alínea 'b', do ECA",
  },
  {
    key: "court",
    name: "Vara da Infância",
    icon: Gavel,
    titleVocativo: "Excelentíssimo(a) Senhor(a) Doutor(a) Juiz(a) de Direito",
    organ: "Vara da Infância e da Juventude da Comarca",
    ask: "a criteriosa apreciação judicial e a aplicação das medidas de proteção integral cabíveis, com fundamento nos arts. 98 e 101 do ECA",
  },
] as const;

export function DocumentGenerator({ c }: { c: Case }) {
  const tx = useTx();
  const { maskName, maskFamily, lgpdMode } = usePrivacy();
  const [open, setOpen] = useState(false);
  const [tpl, setTpl] = useState<(typeof templates)[number] | null>(null);

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const num = `${String(Number(c.id) % 1000).padStart(3, "0")}/2026`;

  const childDisplay = maskName(c.child);
  const familyDisplay = maskFamily(c.family);

  const finish = (how: "print" | "email") => {
    addTimeline(
      c.id,
      `Ofício Nº ${num} gerado`,
      `Destinatário: ${tpl!.name} (${how === "print" ? "impresso para protocolo oficial" : "encaminhado digitalmente por e-mail"}).`
    );

    if (how === "print") {
      window.print();
      toast.success(
        tx(
          "Ofício timbrado enviado para impressão / PDF",
          "Official letter sent to printer / PDF export",
          "Oficio enviado para impresión / exportación PDF"
        )
      );
    } else {
      toast.success(
        tx(
          "Ofício protocolado e enviado por e-mail institucional",
          "Official letter dispatched via institutional email",
          "Oficio despachado por correo electrónico institucional"
        )
      );
    }
    setOpen(false);
    setTpl(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTpl(null);
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 font-medium">
          <FileSignature className="size-4" />
          <span>{tx("Gerar Ofício Timbrado", "Generate Official Letter", "Generar Oficio")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-4xl p-4 sm:p-6">
        <DialogHeader className="no-print">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>
              {tpl
                ? tx("Pré-visualização do Ofício Timbrado A4", "Official Letter A4 Preview", "Vista Previa del Oficio A4")
                : tx("Escolha o Modelo do Ofício", "Choose Document Template", "Elige el Modelo del Oficio")}
            </DialogTitle>
            {lgpdMode && (
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]">
                <ShieldCheck className="mr-1 size-3" />
                {tx("Sigilo LGPD Ativo no Documento", "LGPD Privacy Active", "Sigilo LGPD Activo")}
              </Badge>
            )}
          </div>
          <DialogDescription>
            {tx(
              `Caso Sigiloso #${c.id} — Família ${familyDisplay}`,
              `Confidential Case #${c.id} — ${familyDisplay} Family`,
              `Caso Confidencial #${c.id} — Familia ${familyDisplay}`
            )}
          </DialogDescription>
        </DialogHeader>

        {!tpl ? (
          <div className="grid gap-3.5 py-4 sm:grid-cols-3">
            {templates.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTpl(t)}
                className="flex flex-col justify-between rounded-xl border bg-card p-5 text-left transition hover:border-primary hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div>
                  <div className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <t.icon className="size-5 text-primary" />
                  </div>
                  <p className="mt-4 font-semibold text-base">{t.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {t.organ}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t text-[11px] font-medium text-primary flex items-center gap-1">
                  <span>{tx("Selecionar modelo oficial", "Select official template", "Seleccionar modelo")}</span>
                  <span>→</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Folha A4 Timbrada Oficial (Visível em tela e impressa perfeitamente em A4) */}
            <div className="my-2 rounded-lg border bg-muted/40 p-2 sm:p-6 overflow-x-auto">
              <article
                id="printable-oficio"
                className="printable-document-area mx-auto max-w-[720px] rounded-sm bg-white p-8 sm:p-14 font-serif text-[13px] leading-relaxed text-black shadow-card border border-neutral-200"
              >
                {/* Cabeçalho Timbrado Oficial com Brasão */}
                <header className="border-b-2 border-black pb-5 text-center">
                  <div className="text-black mb-2">
                    <CoatOfArms />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                    República Federativa do Brasil
                  </p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-700">
                    Estado de São Paulo · Município Sede
                  </p>
                  <h2 className="mt-1 text-base font-bold uppercase tracking-wide text-neutral-950">
                    Conselho Tutelar de Defesa dos Direitos da Criança e do Adolescente
                  </h2>
                  <p className="text-[11px] text-neutral-600">
                    Órgão Permanente, Autônomo e Não-Jurisdicional · Lei Federal nº 8.069/1990 (ECA)
                  </p>
                </header>

                {/* Numeração Sequencial e Data Oficial */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-300 pb-3 text-xs">
                  <span className="font-bold tracking-wide">
                    OFÍCIO Nº {num} - CT/FAROL
                  </span>
                  <span className="text-neutral-700">
                    São Paulo/SP, {today}
                  </span>
                </div>

                {/* Destinatário */}
                <div className="mt-6 text-neutral-900">
                  <p className="font-semibold">{tpl.titleVocativo},</p>
                  <p className="text-xs text-neutral-700">{tpl.organ}</p>
                </div>

                {/* Assunto */}
                <div className="mt-4 font-semibold text-xs border-l-2 border-black pl-3 py-1 bg-neutral-50 text-neutral-900">
                  Assunto: Comunicação de Violação de Direitos e Requisição de Providências (Procedimento nº {c.id})
                </div>

                {/* Corpo do Ofício */}
                <div className="mt-6 space-y-3.5 text-justify leading-relaxed text-neutral-900">
                  <p className="indent-8">
                    O <strong>CONSELHO TUTELAR MUNICIPAL</strong>, no uso das atribuições institucionais que lhe são conferidas pelos artigos 131 e 136 da Lei Federal nº 8.069, de 13 de julho de 1990 (Estatuto da Criança e do Adolescente), vem respeitosamente perante Vossa Senhoria/Excelência comunicar a situação acompanhada no <strong>Procedimento Administrativo Sigiloso nº {c.id}</strong>.
                  </p>

                  <p className="indent-8">
                    Trata-se de acolhimento de denúncia e acompanhamento protetivo referente à criança/adolescente <strong>{childDisplay}</strong>, com {c.age} anos de idade, pertencente à <strong>Família {familyDisplay}</strong>, residente em {c.address || "endereço em apuração sigilosa"}, em razão da constatação de <strong>{c.type.toLowerCase()}</strong>.
                  </p>

                  <p className="indent-8 text-neutral-800 italic bg-neutral-50 p-3 rounded border border-neutral-200">
                    &ldquo;{c.description}&rdquo;
                  </p>

                  <p className="indent-8">
                    Diante da gravidade da situação fática exposta e com o objetivo inegociável de fazer cessar a violação de direitos, garantindo a proteção integral prevista no art. 227 da Constituição Federal e art. 1º do ECA, <strong>SOLICITAMOS</strong> {tpl.ask}, devendo a manifestação formal ser encaminhada a este Colegiado no prazo de até <strong>10 (dez) dias úteis</strong>.
                  </p>

                  <p className="indent-8">
                    Certos de contar com a costumeira atenção e presteza na defesa incondicional dos direitos de nossas crianças e adolescentes, renovamos nossos protestos de elevada estima e consideração.
                  </p>
                </div>

                {/* Campo Final Reservado para Assinaturas dos Conselheiros */}
                <div className="print-avoid-break mt-12 pt-4 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="mx-auto w-48 border-t border-black pt-1.5 font-bold text-neutral-950">
                      {c.counselor}
                    </div>
                    <p className="text-[11px] text-neutral-700">Conselheiro(a) Tutelar Relator(a)</p>
                    <p className="text-[10px] text-neutral-500">Matrícula Funcional nº 10482/CT</p>
                  </div>

                  <div>
                    <div className="mx-auto w-48 border-t border-black pt-1.5 font-bold text-neutral-950">
                      Coordenação Colegiada
                    </div>
                    <p className="text-[11px] text-neutral-700">Conselho Tutelar Municipal</p>
                    <p className="text-[10px] text-neutral-500">Portaria de Nomeação CMDCA 2026</p>
                  </div>
                </div>

                {/* Rodapé Oficial com Carimbo Legal */}
                <footer className="mt-10 border-t border-neutral-300 pt-3 text-center text-[10px] text-neutral-600 space-y-1">
                  <p className="uppercase tracking-wider font-semibold text-neutral-800">
                    Documento Oficial Sigiloso · Artigos 17 e 143 do ECA (Lei 8.069/1990) e LGPD (Lei 13.709/2018)
                  </p>
                  <p>
                    Sede Oficial do Conselho Tutelar · Rua da Cidadania, 100 — Centro · Atendimento: (11) 3000-0000 · Plantão 24h: 190
                  </p>
                </footer>
              </article>
            </div>

            {/* Ações Inferiores (Ocultadas na impressão) */}
            <div className="no-print mt-4 flex flex-col-reverse justify-between gap-2.5 sm:flex-row">
              <Button variant="ghost" onClick={() => setTpl(null)} className="gap-2">
                <ArrowLeft className="size-4" />
                <span>{tx("Trocar Modelo", "Change Template", "Cambiar Modelo")}</span>
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={() => finish("email")} className="gap-2">
                  <Mail className="size-4" />
                  <span>{tx("Enviar por E-mail", "Send by Email", "Enviar por Correo")}</span>
                </Button>

                <Button onClick={() => finish("print")} className="gap-2 bg-primary font-medium">
                  <Printer className="size-4" />
                  <span>{tx("Imprimir / Exportar PDF", "Print / Export PDF", "Imprimir / Exportar PDF")}</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
