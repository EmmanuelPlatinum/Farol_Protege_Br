import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, HeartHandshake, ShieldCheck, UsersRound } from "lucide-react";
import { PublicPageIntro } from "@/components/public-site-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTx } from "@/lib/i18n";

export const Route = createFileRoute("/_public/educa")({
  head: () => ({
    meta: [
      { title: "Farol Saberes — educação e direitos | Farol Infantil" },
      {
        name: "description",
        content: "Recursos educativos oficiais para crianças, adolescentes, famílias e educadores.",
      },
    ],
  }),
  component: EducaPage,
});

const childResources = [
  {
    name: "Plenarinho — Câmara dos Deputados",
    description:
      "Jogos, histórias e conteúdos para aprender sobre cidadania, leis e direitos de um jeito acessível.",
    url: "https://plenarinho.leg.br/",
    action: "Quero jogar e aprender",
  },
  {
    name: "Turma do Solzinho — DPU",
    description:
      "Materiais da Defensoria Pública da União sobre direitos humanos, educação, saúde e moradia.",
    url: "https://www.dpu.def.br/",
    action: "Conhecer os materiais",
  },
  {
    name: "Canal Futura / Fundação Roberto Marinho",
    description:
      "Vídeos, séries, podcasts e conteúdos educativos para aprender e conversar sobre diferentes temas.",
    url: "https://futura.frm.org.br/",
    action: "Ver vídeos e conteúdos",
  },
] as const;

const adultResources = [
  {
    name: "Pediatria para Famílias — SBP",
    question: "Filho passa muito tempo no celular?",
    description:
      "Orientações da Sociedade Brasileira de Pediatria sobre saúde, desenvolvimento e bem-estar de crianças e adolescentes.",
    url: "https://www.sbp.com.br/pediatria-para-familias/",
    action: "Acessar orientações da SBP",
  },
  {
    name: "Internet Segura — NIC.br",
    question: "Quer conversar sobre riscos e segurança digital?",
    description:
      "Guias para famílias e educadores sobre privacidade, supervisão parental, cyberbullying e uso responsável da internet.",
    url: "https://internetsegura.br/",
    action: "Acessar guias de segurança",
  },
  {
    name: "Disque 100 — MDHC",
    question: "Precisa de orientação sobre como denunciar?",
    description:
      "Canal oficial do Ministério dos Direitos Humanos e da Cidadania para informações e denúncias de violações de direitos humanos.",
    url: "https://www.gov.br/mdh",
    action: "Acessar o portal do MDHC",
  },
] as const;

const internationalResources = [
  {
    name: "Thinkuknow / CEOP — Reino Unido",
    url: "https://www.thinkuknow.co.uk/",
  },
  {
    name: "CEOP Education — Reino Unido",
    url: "https://www.ceopeducation.co.uk/",
  },
  {
    name: "NCMEC — Estados Unidos",
    url: "https://www.missingkids.org/",
  },
  {
    name: "Global Missing Kids — Brasil",
    url: "https://br.globalmissingkids.org/",
  },
] as const;

function ResourceCard({
  name,
  description,
  url,
  action,
  question,
}: {
  name: string;
  description: string;
  url: string;
  action: string;
  question?: string;
}) {
  const tx = useTx();

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        {question && <p className="text-sm font-semibold text-primary">{question}</p>}
        <CardTitle className="text-lg">{name}</CardTitle>
        <CardDescription className="leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto space-y-3">
        <Button asChild className="w-full whitespace-normal">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {action}
          </a>
        </Button>
        <p className="break-all text-xs text-muted-foreground">
          <span className="sr-only">{tx("Link: ", "Link: ", "Enlace: ")}</span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            {url}
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

function EducaPage() {
  const tx = useTx();

  return (
    <>
      <PublicPageIntro
        eyebrow={tx(
          "Informação e cidadania",
          "Information and citizenship",
          "Información y ciudadanía",
        )}
        title={tx("Farol Saberes", "Farol Learning Hub", "Farol Saberes")}
        description={tx(
          "Materiais para aprender sobre direitos, proteção e segurança. Escolha os conteúdos para crianças e adolescentes ou para adultos e educadores.",
          "Resources about rights, protection, and safety. Choose materials for children and teens or for adults and educators.",
          "Materiales sobre derechos, protección y seguridad. Elija contenidos para niños y adolescentes o para adultos y educadores.",
        )}
      />

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:px-6">
        <Tabs defaultValue="children" className="space-y-6">
          <TabsList className="grid h-auto w-full grid-cols-2">
            <TabsTrigger value="children" className="min-h-12 gap-2 whitespace-normal">
              <HeartHandshake aria-hidden="true" className="size-4 shrink-0" />
              {tx("Sou criança ou adolescente", "I'm a child or teen", "Soy niño/a o adolescente")}
            </TabsTrigger>
            <TabsTrigger value="adults" className="min-h-12 gap-2 whitespace-normal">
              <UsersRound aria-hidden="true" className="size-4 shrink-0" />
              {tx("Sou adulto ou educador", "I'm an adult or educator", "Soy adulto o educador")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="children" className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <BookOpen aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed">
                {tx(
                  "Aprenda no seu ritmo. Se algo deixar você preocupado(a), converse com um adulto de confiança. Estes links abrem sites externos.",
                  "Learn at your own pace. If something worries you, talk to a trusted adult. These links open external websites.",
                  "Aprende a tu ritmo. Si algo te preocupa, habla con un adulto de confianza. Estos enlaces abren sitios externos.",
                )}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {childResources.map((resource) => (
                <ResourceCard key={resource.name} {...resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="adults" className="space-y-5">
            <div className="flex items-start gap-3 rounded-xl border border-secondary/30 bg-secondary/10 p-4">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed">
                {tx(
                  "Use materiais de fontes institucionais e confirme orientações e canais diretamente nos sites oficiais.",
                  "Use resources from institutional sources and verify guidance and contact channels on official websites.",
                  "Utilice materiales de fuentes institucionales y confirme orientaciones y canales directamente en los sitios oficiales.",
                )}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {adultResources.map((resource) => (
                <ResourceCard key={resource.name} {...resource} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <section aria-labelledby="international-resources">
          <div className="mb-4">
            <h2 id="international-resources" className="text-xl font-semibold">
              {tx(
                "Referências internacionais",
                "International references",
                "Referencias internacionales",
              )}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tx(
                "Materiais de referência internacional; não substituem os serviços de proteção brasileiros.",
                "International reference materials; they do not replace Brazilian protection services.",
                "Materiales internacionales de referencia; no sustituyen los servicios brasileños de protección.",
              )}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {internationalResources.map((resource) => (
              <Card key={resource.url}>
                <CardContent className="flex h-full flex-col gap-3 p-4">
                  <h3 className="font-semibold">{resource.name}</h3>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto break-all text-sm text-primary underline underline-offset-2"
                  >
                    {resource.url}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}
