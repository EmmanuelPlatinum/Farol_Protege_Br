import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, Mic, MicOff, ShieldCheck, Smile, TriangleAlert } from "lucide-react";
import { PublicPageIntro } from "@/components/public-site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTx } from "@/lib/i18n";

export const Route = createFileRoute("/_public/citizen/kid-shield")({
  head: () => ({
    meta: [
      { title: "Espaço seguro para crianças — Farol Infantil" },
      { name: "description", content: "Orientações simples sobre proteção e como pedir ajuda." },
    ],
  }),
  component: KidShield,
});

const feelings = [
  {
    emoji: "😟",
    label: "Estou preocupado(a)",
    help: "Você merece ser ouvido. Conte para um adulto de confiança.",
  },
  {
    emoji: "😨",
    label: "Estou com medo",
    help: "Procure um lugar seguro e um adulto em quem confia. Não confronte quem está assustando você.",
  },
  {
    emoji: "💬",
    label: "Alguém me incomodou online",
    help: "Você não tem culpa. Não envie mais fotos nem encontre essa pessoa. Peça ajuda a um adulto de confiança.",
  },
  {
    emoji: "🤷",
    label: "Não sei o que fazer",
    help: "Tudo bem não saber. Você pode mostrar esta página para alguém que cuide de você.",
  },
] as const;

function KidShield() {
  const tx = useTx();
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [selectedFeeling, setSelectedFeeling] = useState<number | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioType, setAudioType] = useState("audio/webm");
  const [audioError, setAudioError] = useState("");

  useEffect(
    () => () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    },
    [audioUrl],
  );

  const startRecording = async () => {
    setAudioError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setAudioError(
        tx(
          "Este navegador não permite gravar áudio.",
          "This browser cannot record audio.",
          "Este navegador no permite grabar audio.",
        ),
      );
      return;
    }
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = currentStream;
      chunks.current = [];
      const mediaRecorder = new MediaRecorder(currentStream);
      recorder.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: mediaRecorder.mimeType || "audio/webm" });
        const nextUrl = URL.createObjectURL(blob);
        setAudioType(blob.type || "audio/webm");
        setAudioUrl(nextUrl);
        currentStream.getTracks().forEach((track) => track.stop());
        stream.current = null;
        setRecording(false);
      };
      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      setAudioError(
        error instanceof Error
          ? tx(
              `Não foi possível iniciar o áudio: ${error.message}`,
              `Could not start audio: ${error.message}`,
              `No se pudo iniciar el audio: ${error.message}`,
            )
          : tx(
              "Não foi possível iniciar o áudio.",
              "Could not start audio.",
              "No se pudo iniciar el audio.",
            ),
      );
    }
  };

  const stopRecording = () => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  };

  return (
    <>
      <PublicPageIntro
        eyebrow={tx("UM ESPAÇO PARA VOCÊ", "A SPACE FOR YOU", "UN ESPACIO PARA TI")}
        title={tx(
          "Você merece estar seguro(a)",
          "You deserve to feel safe",
          "Mereces sentirte seguro(a)",
        )}
        description={tx(
          "Se alguma coisa preocupa você, peça ajuda. Você não está sozinho(a), e a culpa nunca é sua.",
          "If something worries you, ask for help. You are not alone, and it is never your fault.",
          "Si algo te preocupa, pide ayuda. No estás solo(a), y nunca es tu culpa.",
        )}
      />
      <section className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6">
        <div
          role="note"
          className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm"
        >
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <p>
            {tx(
              "Este site é uma demonstração e não é monitorado em tempo real. Ele não envia sua localização, gravação ou mensagem. Se alguém puder ver seu dispositivo, use, se possível, o telefone de um adulto seguro. Esta página não apaga o histórico do navegador.",
              "This is a demo site and is not monitored in real time. It does not send your location, recording, or message. If someone may see your device, use a trusted adult's phone if you can. This page does not erase browser history.",
              "Este sitio es una demostración y no se supervisa en tiempo real. No envía tu ubicación, grabación ni mensaje. Si alguien puede ver tu dispositivo, usa si puedes el teléfono de un adulto de confianza. Esta página no borra el historial del navegador.",
            )}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Smile className="size-6 text-primary" />
              {tx("Como você está se sentindo?", "How are you feeling?", "¿Cómo te sientes?")}
            </CardTitle>
            <CardDescription>
              {tx(
                "Escolha um botão. Você não precisa escrever seu nome.",
                "Escolha um botão. Você não precisa escrever seu nome.",
                "Elige un botón. No tienes que escribir tu nombre.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {feelings.map((feeling, index) => (
                <Button
                  key={feeling.label}
                  type="button"
                  variant={selectedFeeling === index ? "default" : "outline"}
                  className="h-auto min-h-20 justify-start gap-3 whitespace-normal p-4 text-left text-base"
                  aria-pressed={selectedFeeling === index}
                  onClick={() => setSelectedFeeling(index)}
                >
                  <span aria-hidden="true" className="text-3xl">
                    {feeling.emoji}
                  </span>
                  {feeling.label}
                </Button>
              ))}
            </div>
            {selectedFeeling !== null && (
              <p
                role="status"
                aria-live="polite"
                className="rounded-lg bg-primary/10 p-4 text-lg leading-relaxed"
              >
                {feelings[selectedFeeling]!.help}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <HeartHandshake className="size-6 text-primary" />
              {tx("Quem pode ajudar?", "Who can help?", "¿Quién puede ayudar?")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-base leading-relaxed">
            <ul className="list-inside list-disc space-y-2">
              <li>
                {tx(
                  "Um adulto em quem você confia: alguém da família, professor(a) ou outra pessoa segura.",
                  "A trusted adult: someone in your family, a teacher, or another safe person.",
                  "Un adulto de confianza: alguien de tu familia, un(a) profesor(a) u otra persona segura.",
                )}
              </li>
              <li>
                {tx(
                  "Se alguém pediu segredo sobre algo que machuca ou assusta, você pode contar mesmo assim.",
                  "If someone asked you to keep a secret about something hurtful or scary, you can still tell.",
                  "Si alguien te pidió guardar un secreto sobre algo que te hace daño o miedo, puedes contarlo.",
                )}
              </li>
              <li>
                {tx(
                  "Se houver perigo agora, afaste-se para um local seguro e peça ajuda a um adulto próximo.",
                  "If there is danger right now, move to a safe place and ask a nearby adult for help.",
                  "Si hay peligro ahora, ve a un lugar seguro y pide ayuda a un adulto cercano.",
                )}
              </li>
            </ul>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/conselhos">
                  {tx(
                    "Encontrar um serviço de proteção",
                    "Find a protection service",
                    "Encontrar un servicio de protección",
                  )}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/report">
                  {tx(
                    "Abrir formulário demonstrativo",
                    "Open demo form",
                    "Abrir formulario de demostración",
                  )}
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {tx(
                "O formulário não é um canal oficial e não tem atendimento imediato. Peça a um adulto de confiança para confirmar os canais locais.",
                "The form is not an official channel and is not monitored immediately. Ask a trusted adult to confirm local contact options.",
                "El formulario no es un canal oficial ni ofrece atención inmediata. Pide a un adulto de confianza que confirme los canales locales.",
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              {recording ? (
                <Mic className="size-6 text-destructive" />
              ) : (
                <MicOff className="size-6 text-primary" />
              )}
              {tx(
                "Gravar uma mensagem neste aparelho",
                "Record a message on this device",
                "Grabar un mensaje en este dispositivo",
              )}
              <Badge variant="outline">{tx("Só local", "Local only", "Solo local")}</Badge>
            </CardTitle>
            <CardDescription>
              {tx(
                "A gravação não é enviada. Você pode ouvir ou baixar para mostrar a um adulto seguro. Evite dizer seu endereço, escola ou nome completo.",
                "The recording is not sent. You can listen or download it to show a trusted adult. Avoid saying your address, school, or full name.",
                "La grabación no se envía. Puedes escucharla o descargarla para mostrarla a un adulto de confianza. Evita decir tu dirección, escuela o nombre completo.",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {!recording ? (
                <Button type="button" size="lg" onClick={() => void startRecording()}>
                  <Mic className="mr-2 size-5" />
                  {tx("Começar a gravar", "Start recording", "Empezar a grabar")}
                </Button>
              ) : (
                <Button type="button" size="lg" variant="destructive" onClick={stopRecording}>
                  <MicOff className="mr-2 size-5" />
                  {tx("Parar gravação", "Stop recording", "Detener grabación")}
                </Button>
              )}
              {audioUrl && (
                <>
                  <audio
                    controls
                    src={audioUrl}
                    aria-label={tx(
                      "Ouvir gravação local",
                      "Listen to local recording",
                      "Escuchar grabación local",
                    )}
                  />
                  <a
                    className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium underline"
                    href={audioUrl}
                    download={`mensagem-farol.${audioType.includes("ogg") ? "ogg" : "webm"}`}
                  >
                    {tx("Baixar mensagem", "Download message", "Descargar mensaje")}
                  </a>
                </>
              )}
            </div>
            {audioError && (
              <p role="alert" className="text-sm text-destructive">
                {audioError}
              </p>
            )}
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              <p>
                {tx(
                  "O navegador pedirá permissão para usar o microfone. Fechar esta página apaga o acesso à gravação temporária; o botão não envia nenhum arquivo.",
                  "Your browser will ask permission to use the microphone. Closing this page clears access to the temporary recording; this button does not upload anything.",
                  "El navegador pedirá permiso para usar el micrófono. Al cerrar la página se pierde el acceso a la grabación temporal; el botón no envía archivos.",
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
