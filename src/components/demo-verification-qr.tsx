import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function DemoVerificationQr({
  verificationKey,
  onReady,
}: {
  verificationKey: string;
  onReady?: () => void;
}) {
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setImage("");
    setError("");
    QRCode.toDataURL(`FAROL-PROTEGE-DEMO|${verificationKey}`, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 144,
    })
      .then((dataUrl) => {
        if (active) {
          setImage(dataUrl);
          onReady?.();
        }
      })
      .catch(() => {
        if (active) setError("Não foi possível gerar o QR demonstrativo.");
      });
    return () => {
      active = false;
    };
  }, [verificationKey, onReady]);

  if (error) return <p role="alert" className="text-xs text-destructive">{error}</p>;
  if (!image) return <div aria-label="Gerando QR demonstrativo" className="motion-safe:animate-pulse size-24 rounded bg-muted" />;
  return (
    <img
      src={image}
      alt={`QR demonstrativo para a chave ${verificationKey}; não autentica documento oficial`}
      className="size-24 rounded bg-white p-1"
    />
  );
}
