import { useCallback, useState } from "react";
import {
  FileSignature,
  Gavel,
  Mail,
  Printer,
  School,
  Scale,
  ArrowLeft,
  ShieldCheck,
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
import {
  addOfficialCommunication,
  createOfficialCommunicationDraft,
  type Case,
  type OfficialCommunicationDraft,
} from "@/lib/cases-store";
import { useTx } from "@/lib/i18n";
import { usePrivacy } from "@/lib/privacy-store";
import { DemoVerificationQr } from "@/components/demo-verification-qr";
import { toast } from "sonner";
import { appendAuditEvents } from "@/lib/audit-store";

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
  {
    key: "inclusive-education",
    name: "Notificação Recomendatória à Secretaria Municipal de Educação / Escola Privada - Designação Imediata de Profissional de Apoio Escolar (AEE)",
    icon: School,
    titleVocativo: "Senhor(a) Secretário(a) Municipal de Educação / Senhor(a) Diretor(a)",
    organ: "Secretaria Municipal de Educação ou direção da unidade escolar privada",
    ask: "que sejam adotadas, com urgência, as providências para assegurar a matrícula e a permanência do(a) estudante, a oferta do Atendimento Educacional Especializado (AEE) e, quando comprovada a necessidade, a disponibilização de profissional de apoio escolar, sem cobrança adicional à família",
  },
] as const;

export function DocumentGenerator({ c }: { c: Case }) {
  const tx = useTx();
  const { maskName, maskFamily, maskAddress, lgpdMode } = usePrivacy();
  const [open, setOpen] = useState(false);
  const [tpl, setTpl] = useState<(typeof templates)[number] | null>(null);
  const [verificationDraft, setVerificationDraft] = useState<OfficialCommunicationDraft | null>(null);
  const [qrReady, setQrReady] = useState(false);
  const onQrReady = useCallback(() => setQrReady(true), []);

  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const num = `${String(Number(c.id) % 1000).padStart(3, "0")}/2026`;

  const childDisplay = maskName(c.child);
  const familyDisplay = maskFamily(c.family);

  const finish = async () => {
    if (!verificationDraft) {
      toast.error(tx("Não foi possível registrar o documento demonstrativo.", "Could not register the demo document.", "No se pudo registrar el documento demostrativo."));
      return;
    }
    try {
      await appendAuditEvents([
        {
          caseId: c.id,
          action: "letter_generated",
          summary: `Minuta de ofício para ${tpl!.name} gerada para revisão e impressão.`,
          actorProfile: "counselor",
        },
      ]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível registrar a geração da minuta.");
      return;
    }
    if (!await addOfficialCommunication(c.id, verificationDraft)) {
      toast.error(tx("Caso não encontrado; minuta não gerada.", "Case not found; draft not generated.", "Caso no encontrado; borrador no generado."));
      return;
    }

    window.print();
    toast.success(
      tx(
        "Minuta impressa para revisão. Não foi enviada nem protocolada oficialmente.",
        "Draft printed for review. It was not sent or officially filed.",
        "Borrador impreso para revisión. No se envió ni se registró oficialmente.",
      ),
    );
    setOpen(false);
    setTpl(null);
    setVerificationDraft(null);
    setQrReady(false);
  };

  const selectTemplate = (selected: (typeof templates)[number]) => {
    try {
      setVerificationDraft(
        createOfficialCommunicationDraft("Ofício gerado para revisão", "counselor"),
      );
      setQrReady(false);
      setTpl(selected);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tx("Falha ao gerar chave demonstrativa.", "Could not create demo key.", "No se pudo crear la clave de demostración."));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setTpl(null);
          setVerificationDraft(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 font-medium">
          <FileSignature className="size-4" />
          <span>{tx("Gerar minuta de ofício", "Generate letter draft", "Generar borrador de oficio")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[94vh] overflow-y-auto sm:max-w-4xl p-4 sm:p-6">
        <DialogHeader className="no-print">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>
              {tpl
                ? tx("Pré-visualização da minuta · sem validade oficial", "Draft preview · not an official document", "Vista previa del borrador · sin validez oficial")
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
          <div className="grid gap-3.5 py-4 sm:grid-cols-2 xl:grid-cols-4">
            {templates.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => selectTemplate(t)}
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-800">
                    MODELO DEMONSTRATIVO · SEM VALIDADE OFICIAL
                  </p>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-neutral-700">
                    Estado de Mato Grosso · Município de Cuiabá
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
                    MINUTA Nº {verificationDraft?.protocol ?? num}
                  </span>
                  <span className="text-neutral-700">
                    Cuiabá/MT, {today}
                  </span>
                </div>

                {/* Destinatário */}
                <div className="mt-6 text-neutral-900">
                  <p className="font-semibold">{tpl.titleVocativo},</p>
                  <p className="text-xs text-neutral-700">{tpl.organ}</p>
                </div>

                {/* Assunto */}
                <div className="mt-4 font-semibold text-xs border-l-2 border-black pl-3 py-1 bg-neutral-50 text-neutral-900">
                  Assunto: {tpl.key === "inclusive-education"
                    ? "Notificação recomendatória para garantia de educação inclusiva e apoio escolar"
                    : `Comunicação de Violação de Direitos e Requisição de Providências (Procedimento nº ${c.id})`}
                </div>

                {/* Corpo do Ofício */}
                <div className="mt-6 space-y-3.5 text-justify leading-relaxed text-neutral-900">
                  <p className="indent-8">
                    O <strong>CONSELHO TUTELAR MUNICIPAL</strong>, no uso das atribuições institucionais que lhe são conferidas pelos artigos 131 e 136 da Lei Federal nº 8.069, de 13 de julho de 1990 (Estatuto da Criança e do Adolescente), vem respeitosamente perante Vossa Senhoria/Excelência comunicar a situação acompanhada no <strong>Procedimento Administrativo Sigiloso nº {c.id}</strong>.
                  </p>

                  <p className="indent-8">
                    Trata-se de acolhimento de denúncia e acompanhamento protetivo referente à criança/adolescente <strong>{childDisplay}</strong>, com {c.age} anos de idade, pertencente à <strong>Família {familyDisplay}</strong>, residente em {c.address ? maskAddress(c.address) : "endereço em apuração sigilosa"}, em razão da constatação de <strong>{c.type.toLowerCase()}</strong>.
                  </p>

                  <p className="indent-8 text-neutral-800 italic bg-neutral-50 p-3 rounded border border-neutral-200">
                    &ldquo;{c.description}&rdquo;
                  </p>

                  {tpl.key === "inclusive-education" && (
                    <>
                      <p className="indent-8">
                        Para fins de triagem, consta a informação de que a criança/adolescente possui{" "}
                        <strong>
                          {c.supportNeed === "confirmed"
                            ? "laudo informado"
                            : c.supportNeed === "suspected"
                              ? "suspeita informada, sem laudo"
                              : c.supportNeed === "none"
                                ? "ausência de laudo ou suspeita informada"
                                : "condição não informada"}
                        </strong>
                        . A informação deve ser considerada com respeito à dignidade, à privacidade e às necessidades individuais do(a) estudante.
                      </p>

                      <p className="indent-8">
                        A recomendação fundamenta-se no art. 208, inciso III, da Constituição Federal; no art. 54, inciso III, do Estatuto da Criança e do Adolescente; no art. 28, incisos III e XVII e § 1º, da Lei nº 13.146/2015; e, quando aplicável à pessoa com TEA, no art. 3º, parágrafo único, da Lei nº 12.764/2012. A oferta de AEE e de profissional de apoio deve observar as necessidades educacionais específicas e a avaliação pertinente, sem substituir a atuação dos demais profissionais da educação.
                      </p>

                      <p className="indent-8">
                        Registra-se que o art. 8º, inciso I, da Lei nº 7.853/1989, com redação dada pelo art. 98 da Lei nº 13.146/2015, tipifica como crime recusar, cobrar valores adicionais, suspender, procrastinar, cancelar ou fazer cessar inscrição em estabelecimento de ensino em razão da deficiência, com pena de reclusão de 2 a 5 anos e multa; se a vítima for menor de 18 anos, a pena é aumentada em um terço.
                      </p>
                    </>
                  )}

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
                    <p className="text-[10px] text-neutral-500">Matrícula funcional: preencher</p>
                  </div>

                  <div>
                    <div className="mx-auto w-48 border-t border-black pt-1.5 font-bold text-neutral-950">
                      Coordenação Colegiada
                    </div>
                    <p className="text-[11px] text-neutral-700">Conselho Tutelar Municipal</p>
                    <p className="text-[10px] text-neutral-500">Ato de designação: preencher</p>
                  </div>
                </div>

                {verificationDraft && (
                  <div className="mt-8 flex items-center gap-4 border-t border-neutral-300 pt-4 text-[10px]">
                    <DemoVerificationQr verificationKey={verificationDraft.verificationKey} onReady={onQrReady} />
                    <div className="space-y-1">
                      <p className="font-bold">CHAVE DE DEMONSTRAÇÃO: {verificationDraft.verificationKey}</p>
                      <p>QR contém apenas identificador demonstrativo, sem dados do caso.</p>
                      <p>Não valida autenticidade, assinatura, envio ou protocolo oficial.</p>
                    </div>
                  </div>
                )}

                {/* Rodapé da minuta */}
                <footer className="mt-10 border-t border-neutral-300 pt-3 text-center text-[10px] text-neutral-600 space-y-1">
                  <p className="uppercase tracking-wider font-semibold text-neutral-800">
                    RASCUNHO PARA REVISÃO · SEM VALIDADE OFICIAL
                  </p>
                  <p>
                    Endereço e contatos institucionais devem ser conferidos antes da expedição.
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
                <Button variant="outline" disabled className="gap-2">
                  <Mail className="size-4" />
                  <span>
                    {tx(
                      "Envio por e-mail não configurado",
                      "Email delivery is not configured",
                      "Envío por correo no configurado",
                    )}
                  </span>
                </Button>

                <Button onClick={() => void finish()} disabled={!qrReady} className="gap-2 bg-primary font-medium">
                  <Printer className="size-4" />
                  <span>{qrReady
                    ? tx("Imprimir minuta / Exportar PDF", "Print draft / Export PDF", "Imprimir borrador / Exportar PDF")
                    : tx("Preparando QR demonstrativo…", "Preparing demo QR…", "Preparando QR de demostración…")}</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
