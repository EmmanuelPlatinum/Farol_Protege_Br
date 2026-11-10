import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Fingerprint, RefreshCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCases } from "@/lib/cases-store";
import { useTx } from "@/lib/i18n";

export const Route = createFileRoute("/_dashboard/case/$caseId/blockchain-timeline")({
  head: ({ params }) => ({
    meta: [
      { title: `Trilha de integridade · Caso #${params.caseId} — Farol Infantil` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: IntegrityTimeline,
});

type HashedEvent = {
  date: string;
  title: string;
  previousHash: string;
  hash: string;
};

const GENESIS = "FAROL-DEMO-CHAIN-V1";

async function buildHashChain(events: { date: string; title: string }[]): Promise<HashedEvent[]> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Este navegador não oferece Web Crypto nesta conexão.");
  }
  const chain: HashedEvent[] = [];
  let previousHash = GENESIS;
  for (const event of events) {
    const payload = JSON.stringify({ date: event.date, title: event.title, previousHash });
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
    const hash = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    chain.push({ ...event, previousHash, hash });
    previousHash = hash;
  }
  return chain;
}

function IntegrityTimeline() {
  const { caseId } = Route.useParams();
  const tx = useTx();
  const record = useCases().find((item) => item.id === caseId);
  const safeEvents = useMemo(
    () => (record?.timeline ?? []).map(({ date, title }) => ({ date, title })),
    [record?.timeline],
  );
  const [chain, setChain] = useState<HashedEvent[]>([]);
  const [verification, setVerification] = useState<"idle" | "valid" | "mismatch">("idle");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    void buildHashChain(safeEvents)
      .then((result) => {
        if (active) setChain(result);
      })
      .catch((error: unknown) => {
        if (active) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível gerar a trilha demonstrativa.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [safeEvents]);

  const verifyCurrent = async () => {
    setBusy(true);
    try {
      const current = await buildHashChain(safeEvents);
      const matches =
        current.length === chain.length &&
        current.every(
          (event, index) =>
            event.hash === chain[index]?.hash && event.previousHash === chain[index]?.previousHash,
        );
      setVerification(matches ? "valid" : "mismatch");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível verificar a trilha.");
    } finally {
      setBusy(false);
    }
  };

  const rebuild = async () => {
    setBusy(true);
    try {
      setChain(await buildHashChain(safeEvents));
      setVerification("valid");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível gerar a trilha.");
    } finally {
      setBusy(false);
    }
  };

  if (!record) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>{tx("Caso não encontrado.", "Case not found.", "Caso no encontrado.")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" className="-ml-3">
        <Link to="/case/$caseId" params={{ caseId }}>
          <ArrowLeft className="mr-2 size-4" />
          {tx("Voltar ao caso", "Back to case", "Volver al caso")}
        </Link>
      </Button>
      <div>
        <p className="text-sm text-muted-foreground">
          {tx(
            "Trilha local de integridade · demonstração",
            "Local integrity trail · demo",
            "Cadena local de integridad · demostración",
          )}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">
          {tx("Eventos do caso", "Case events", "Eventos del caso")} #{caseId}
        </h1>
      </div>
      <div
        role="note"
        className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-muted-foreground"
      >
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
        <p>
          {tx(
            "Hashes SHA-256 ilustrativos, calculados neste navegador e somente nesta sessão. Isto não é blockchain, assinatura digital, registro imutável nem prova de autenticidade. Eventos reais precisam de trilha append-only e armazenamento independente no servidor; os detalhes do relato foram omitidos desta tela.",
            "Illustrative SHA-256 hashes, computed in this browser and session only. This is not a blockchain, digital signature, immutable record, or proof of authenticity. Real events require server-side append-only logging and independent storage; report details are omitted here.",
            "Hashes SHA-256 ilustrativos, calculados en este navegador y solo en esta sesión. Esto no es una blockchain, firma digital, registro inmutable ni prueba de autenticidad. Los eventos reales requieren registro append-only en servidor y almacenamiento independiente; aquí se omiten los detalles del relato.",
          )}
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="size-5 text-primary" />
            {tx(
              "Encadeamento demonstrativo de hashes",
              "Demonstration hash chain",
              "Encadenamiento demostrativo de hashes",
            )}
          </CardTitle>
          <CardDescription>
            {tx(
              "Cada impressão inclui a data, o título do evento e o hash anterior.",
              "Each fingerprint includes the event date, title, and previous hash.",
              "Cada huella incluye fecha, título del evento y hash anterior.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => void verifyCurrent()}
              disabled={busy || chain.length === 0}
            >
              <CheckCircle2 className="mr-2 size-4" />
              {tx(
                "Comparar com a trilha desta sessão",
                "Compare with this session's chain",
                "Comparar con la cadena de esta sesión",
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => void rebuild()} disabled={busy}>
              <RefreshCw className="mr-2 size-4" />
              {tx(
                "Recriar hashes demonstrativos",
                "Rebuild demo hashes",
                "Recrear hashes demostrativos",
              )}
            </Button>
            {verification === "valid" && (
              <Badge variant="success">
                {tx(
                  "Conteúdo consistente nesta sessão",
                  "Content matches this session",
                  "Contenido coincide en esta sesión",
                )}
              </Badge>
            )}
            {verification === "mismatch" && (
              <Badge variant="danger">
                {tx("Divergência detectada", "Mismatch detected", "Diferencia detectada")}
              </Badge>
            )}
          </div>
          <ol className="space-y-4">
            {chain.map((event, index) => (
              <li key={`${event.date}-${index}`} className="relative rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                    <h2 className="mt-1 font-medium">{event.title}</h2>
                  </div>
                  <Badge variant="outline">#{index + 1}</Badge>
                </div>
                <dl className="mt-3 space-y-2 font-mono text-[11px]">
                  <div>
                    <dt className="text-muted-foreground">
                      {tx("Hash anterior", "Previous hash", "Hash anterior")}
                    </dt>
                    <dd className="break-all">{event.previousHash}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">SHA-256</dt>
                    <dd className="break-all">{event.hash}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
          {chain.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {tx(
                "Nenhum evento disponível.",
                "No events available.",
                "No hay eventos disponibles.",
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
