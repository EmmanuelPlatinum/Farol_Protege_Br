import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, HeartHandshake, MapPin, PhoneCall, ShieldCheck } from "lucide-react";
import { landing } from "@/lib/landing-i18n";
import { useI18n, useTx } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicPageIntro } from "@/components/public-site-layout";

export const Route = createFileRoute("/_public/about")({
  head: () => ({ meta: [{ title: "Sobre o Conselho Tutelar — Farol Infantil" }] }),
  component: About,
});

const icons = [BookOpen, PhoneCall, HeartHandshake];

function About() {
  const { lang } = useI18n();
  const tx = useTx();
  const content = landing[lang];

  return (
    <>
      <PublicPageIntro
        eyebrow={tx("INFORMAÇÃO CIDADÃ", "CITIZEN INFORMATION", "INFORMACIÓN CIUDADANA")}
        title={content.learnTitle}
        description={content.learnSub}
      />
      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-7 flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" />
          {tx(
            "Conheça as atribuições e quando procurar o serviço.",
            "Learn what the council does and when to contact it.",
            "Conozca sus funciones y cuándo contactar al servicio.",
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {content.learn.map(([title, description], index) => {
            const Icon = icons[index] ?? ShieldCheck;
            return (
              <Card key={title} className="shadow-card transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="mt-5 text-lg font-semibold">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/report">
              {tx("Fazer uma denúncia", "Make a report", "Hacer una denuncia")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/public-shifts">
              {tx("Consultar plantões", "View duty roster", "Consultar guardias")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/conselhos">
              <MapPin aria-hidden="true" className="mr-1.5 size-4" />
              {tx(
                "Encontrar meu Conselho",
                "Find my Council",
                "Encontrar mi Consejo",
              )}
            </Link>
          </Button>
        </div>
        <Badge variant="outline" className="mt-8">
          {tx(
            "Informação geral · procure os canais oficiais do seu município",
            "General information · contact your municipality's official channels",
            "Información general · consulte los canales oficiales de su municipio",
          )}
        </Badge>
      </section>
    </>
  );
}
