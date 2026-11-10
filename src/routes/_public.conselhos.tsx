import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Building2,
  Copy,
  Crosshair,
  HeartHandshake,
  MapPin,
  Navigation,
  Phone,
  Scale,
  Search,
  School,
  Stethoscope,
} from "lucide-react";
import { PublicPageIntro } from "@/components/public-site-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTx } from "@/lib/i18n";
import { councilLocations } from "@/lib/council-locations";

const CitizenCouncilMap = lazy(() => import("@/components/citizen-council-map"));

const supportPoints = [
  {
    name: "CAPSi",
    icon: HeartHandshake,
    mapQuery: "CAPSi Cuiabá MT",
    description: [
      "Centro de Atenção Psicossocial Infantil. Apoio psicossocial em saúde mental para crianças e adolescentes.",
      "Child and Adolescent Psychosocial Care Center. Mental health support for children and adolescents.",
      "Centro de Atención Psicosocial Infantil. Apoyo en salud mental para niños y adolescentes.",
    ],
  },
  {
    name: "CER II / CER IV",
    icon: Stethoscope,
    mapQuery: "Centro Especializado em Reabilitação Cuiabá MT",
    description: [
      "Centros Especializados em Reabilitação. Consulte a unidade e as modalidades de reabilitação disponíveis.",
      "Specialized Rehabilitation Centers. Check the unit and available rehabilitation services.",
      "Centros Especializados en Rehabilitación. Consulte la unidad y los servicios disponibles.",
    ],
  },
  {
    name: "APAE Cuiabá",
    icon: Building2,
    mapQuery: "APAE Cuiabá MT",
    description: [
      "Associação de Pais e Amigos dos Excepcionais. Consulte diretamente os serviços e critérios de atendimento.",
      "Association of Parents and Friends of People with Disabilities. Check services and eligibility directly.",
      "Asociación de Padres y Amigos de Personas con Discapacidad. Consulte servicios y criterios directamente.",
    ],
  },
  {
    name: "Defensoria Pública — Defesa da Criança",
    icon: Scale,
    mapQuery: "Defensoria Pública Núcleo Defesa Criança Cuiabá MT",
    description: [
      "Orientação e defesa de direitos de crianças e adolescentes. Confirme o núcleo responsável e os canais oficiais.",
      "Legal guidance and rights protection for children and adolescents. Confirm the responsible office and official channels.",
      "Orientación y defensa de los derechos de niños y adolescentes. Confirme la unidad responsable y los canales oficiales.",
    ],
  },
] as const;

export const Route = createFileRoute("/_public/conselhos")({
  head: () => ({
    meta: [
      { title: "Encontre seu Conselho Tutelar em Cuiabá — Farol Infantil" },
      {
        name: "description",
        content: "Consulte os endereços informados para os Conselhos Tutelares de Cuiabá.",
      },
      { property: "og:title", content: "Encontre seu Conselho Tutelar em Cuiabá — Farol Infantil" },
      {
        property: "og:description",
        content: "Consulte os endereços informados para os Conselhos Tutelares de Cuiabá.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConselhosPage,
});

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

type LocalizedCouncilLabel = readonly [string, string, string, string, string, string, string];

const regionalCouncilLabels: LocalizedCouncilLabel[] = [
  ["2º Conselho Tutelar — Pedra 90", "2nd Child Protection Council — Pedra 90", "2.º Consejo Tutelar — Pedra 90", "2e Conseil de protection — Pedra 90", "第2児童保護相談窓口 — Pedra 90", "第2儿童保护委员会 — Pedra 90", "제2 아동보호위원회 — Pedra 90"],
  ["3º Conselho Tutelar — CPA", "3rd Child Protection Council — CPA", "3.º Consejo Tutelar — CPA", "3e Conseil de protection — CPA", "第3児童保護相談窓口 — CPA", "第3儿童保护委员会 — CPA", "제3 아동보호위원회 — CPA"],
  ["4º Conselho Tutelar — Cidade Alta", "4th Child Protection Council — Cidade Alta", "4.º Consejo Tutelar — Cidade Alta", "4e Conseil de protection — Cidade Alta", "第4児童保護相談窓口 — Cidade Alta", "第4儿童保护委员会 — Cidade Alta", "제4 아동보호위원회 — Cidade Alta"],
  ["5º Conselho Tutelar — Coxipó", "5th Child Protection Council — Coxipó", "5.º Consejo Tutelar — Coxipó", "5e Conseil de protection — Coxipó", "第5児童保護相談窓口 — Coxipó", "第5儿童保护委员会 — Coxipó", "제5 아동보호위원회 — Coxipó"],
  ["6º Conselho Tutelar — Planalto", "6th Child Protection Council — Planalto", "6.º Consejo Tutelar — Planalto", "6e Conseil de protection — Planalto", "第6児童保護相談窓口 — Planalto", "第6儿童保护委员会 — Planalto", "제6 아동보호위원회 — Planalto"],
];

function getPhoneHref(phone?: string) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  if (digits.length === 10 || digits.length === 11) return `tel:${digits}`;
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) {
    return `tel:+${digits}`;
  }
  return undefined;
}

function ConselhosPage() {
  const tx = useTx();
  const [selected, setSelected] = useState(councilLocations[0]!.id);
  const [query, setQuery] = useState("");
  const council = councilLocations.find((item) => item.id === selected) ?? councilLocations[0]!;
  const normalizedQuery = normalize(query);

  const matches = useMemo(() => {
    if (!normalizedQuery) return councilLocations;
    return councilLocations.filter((item) => {
      const terms = [item.name, item.region, ...item.searchTerms];
      return terms.some((term) => normalize(term).includes(normalizedQuery));
    });
  }, [normalizedQuery]);

  const onSearch = (value: string) => {
    setQuery(value);
    const search = normalize(value);
    if (search.length < 2) return;

    const found = councilLocations.find((item) =>
      [item.name, item.region, ...item.searchTerms].some((term) =>
        normalize(term).startsWith(search),
      ),
    );
    if (found) setSelected(found.id);
  };

  const copy = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error(tx("Não foi possível copiar.", "Could not copy.", "No se pudo copiar."));
    }
  };

  const address = council.address;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const googleSearchItems: { labels: LocalizedCouncilLabel; href: string }[] = [
    {
      labels: [
        "Conselho Tutelar Plantão",
        "Child Protection Council — On Call",
        "Consejo Tutelar de guardia",
        "Conseil de protection — permanence",
        "児童保護相談窓口（当番）",
        "儿童保护委员会（值班）",
        "아동보호위원회 당직",
      ],
      href: "https://www.google.com/search?kgmid=%2Fg%2F11g739mpl_",
    },
    {
      labels: [
        "1º Conselho Tutelar — Centro",
        "1st Child Protection Council — Centro",
        "1.º Consejo Tutelar — Centro",
        "1er Conseil de protection — Centro",
        "第1児童保護相談窓口 — Centro",
        "第1儿童保护委员会 — Centro",
        "제1 아동보호위원회 — Centro",
      ],
      href: "https://www.google.com/search?kgmid=%2Fg%2F11c467tfxm",
    },
    ...regionalCouncilLabels.map((labels) => ({
      labels,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${labels[0]} Cuiabá MT`)}`,
    })),
  ];
  const fallback = (
    <div className="h-full min-h-72 w-full animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
  );

  return (
    <>
      <PublicPageIntro
        eyebrow={tx(
          "Atendimento ao cidadão",
          "Citizen services",
          "Atención al ciudadano",
          "Services aux citoyens",
          "市民向けサービス",
          "市民服务",
          "시민 서비스",
        )}
        title={tx(
          "Encontre seu Conselho Tutelar",
          "Find your Guardianship Council",
          "Encuentre su Consejo Tutelar",
          "Trouver votre conseil de protection de l’enfance",
          "児童保護相談窓口を探す",
          "查找儿童保护委员会",
          "아동보호위원회 찾기",
        )}
        description={tx(
          "Consulte qual região de referência pode atender seu bairro em Cuiabá.",
          "Check which reference region may serve your neighborhood in Cuiabá.",
          "Consulte qué región de referencia puede atender su barrio en Cuiabá.",
          "Consultez le secteur de référence susceptible de desservir votre quartier à Cuiabá.",
          "クイアバでお住まいの地域を担当する相談窓口をご確認ください。",
          "查询库亚巴可能负责您所在街区的服务区域。",
          "쿠이아바에서 거주 지역을 담당할 수 있는 상담 기관을 확인하세요.",
        )}
      />

      <section
        className="mx-auto max-w-7xl space-y-6 px-4 py-8 md:px-6"
        aria-label={tx(
          "Localizador dos Conselhos Tutelares",
          "Guardianship Council locator",
          "Localizador de los Consejos Tutelares",
          "Localisateur des conseils de protection",
          "児童保護相談窓口の検索",
          "儿童保护委员会定位器",
          "아동보호위원회 찾기",
        )}
      >
        <Tabs defaultValue="councils" className="space-y-6">
          <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="councils">
              {tx(
                "Conselhos Tutelares",
                "Guardianship Councils",
                "Consejos Tutelares",
                "Conseils de protection",
                "児童保護相談窓口",
                "儿童保护委员会",
                "아동보호위원회",
              )}
            </TabsTrigger>
            <TabsTrigger value="inclusion">
              {tx(
                "Rede TEA & Inclusão PCD",
                "Autism & Disability Support Network",
                "Red de apoyo para autismo y discapacidad",
                "Réseau autisme et inclusion des personnes handicapées",
                "自閉症・障害者支援ネットワーク",
                "自闭症与残障支持网络",
                "자폐·장애인 지원 네트워크",
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="councils" className="space-y-6">
            <div
              role="note"
              className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
            >
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400" />
              <p className="text-muted-foreground">
                {tx(
                  "Endereços e contatos cadastrados conforme as informações recebidas. Os pinos são referências aproximadas, não necessariamente a entrada exata; confirme os dados com a unidade antes de se deslocar. A busca territorial por GPS segue indisponível sem os limites oficiais.",
                  "Addresses and contacts are listed as provided. Pins are approximate references, not necessarily the exact entrance; confirm details with the office before traveling. GPS territory lookup remains unavailable without official boundaries.",
                  "Direcciones y contactos incluidos según la información recibida. Los marcadores son referencias aproximadas, no necesariamente la entrada exacta; confirme los datos con la unidad antes de desplazarse. La búsqueda territorial por GPS no está disponible sin límites oficiales.",
                  "Adresses et coordonnées indiquées selon les informations reçues. Les repères sont approximatifs et ne désignent pas nécessairement l’entrée exacte ; vérifiez auprès du service avant de vous déplacer. La recherche GPS territoriale reste indisponible sans limites officielles.",
                  "住所と連絡先は提供された情報に基づいています。地図の印はおおよその位置で、入口とは限りません。訪問前に窓口へ確認してください。公式な区域境界がないため、GPSによる地域判定は利用できません。",
                  "地址和联系方式根据已提供的信息列出。地图标记为大致位置，不一定是准确入口；出行前请向单位确认。由于缺少官方区域边界，暂不能使用 GPS 区域查询。",
                  "주소와 연락처는 제공된 정보를 기준으로 표시됩니다. 지도 표시는 대략적인 위치이며 정확한 출입구가 아닐 수 있으니 방문 전에 기관에 확인하세요. 공식 구역 경계가 없어 GPS 관할 검색은 사용할 수 없습니다.",
                )}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={query}
                  onChange={(event) => onSearch(event.target.value)}
                  className="h-11 pl-9"
                  aria-label={tx(
                    "Buscar bairro em Cuiabá",
                    "Search neighborhood in Cuiabá",
                    "Buscar barrio en Cuiabá",
                    "Rechercher un quartier à Cuiabá",
                    "クイアバの地域を検索",
                    "搜索库亚巴街区",
                    "쿠이아바 지역 검색",
                  )}
                  placeholder={tx(
                    "Digite seu bairro em Cuiabá (ex: CPA, Pedra 90, Tijucal, Dom Aquino...)",
                    "Type your neighborhood in Cuiabá (e.g. CPA, Pedra 90, Tijucal, Dom Aquino...)",
                    "Escriba su barrio en Cuiabá (ej.: CPA, Pedra 90, Tijucal, Dom Aquino...)",
                    "Saisissez votre quartier à Cuiabá (ex. : CPA, Pedra 90, Tijucal, Dom Aquino...)",
                    "クイアバの地域名を入力（例：CPA、Pedra 90、Tijucal、Dom Aquino）",
                    "输入库亚巴街区名称（例如：CPA、Pedra 90、Tijucal、Dom Aquino）",
                    "쿠이아바 지역명을 입력하세요(예: CPA, Pedra 90, Tijucal, Dom Aquino)",
                  )}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 shrink-0"
                disabled
                title={tx(
                  "A busca territorial por GPS aguarda a publicação dos polígonos oficiais.",
                  "Territorial GPS lookup is waiting for official boundary polygons.",
                  "La búsqueda territorial por GPS espera los polígonos oficiales.",
                  "La recherche territoriale GPS attend la publication des limites officielles.",
                  "GPSによる地域検索は、公式な区域境界の公開を待っています。",
                  "GPS 区域查询尚待官方边界数据发布。",
                  "GPS 관할 검색은 공식 구역 경계 공개를 기다리고 있습니다.",
                )}
              >
                <Crosshair aria-hidden="true" className="mr-2 size-4" />
                {tx(
                  "Localização territorial indisponível",
                  "Territorial lookup unavailable",
                  "Ubicación territorial no disponible",
                  "Recherche territoriale indisponible",
                  "地域検索は利用できません",
                  "区域定位暂不可用",
                  "관할 위치 검색을 사용할 수 없습니다",
                )}
              </Button>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)_minmax(300px,360px)]">
              <div>
                <h2 className="mb-3 text-sm font-semibold">
                  {tx(
                    "Regiões de referência",
                    "Reference regions",
                    "Regiones de referencia",
                    "Secteurs de référence",
                    "担当区域",
                    "参考区域",
                    "담당 지역",
                  )}
                </h2>
                <ul
                  className="space-y-2"
                  aria-label={tx(
                    "Conselhos Tutelares de Cuiabá",
                    "Cuiabá Guardianship Councils",
                    "Consejos Tutelares de Cuiabá",
                    "Conseils de protection de Cuiabá",
                    "クイアバ児童保護相談窓口",
                    "库亚巴儿童保护委员会",
                    "쿠이아바 아동보호위원회",
                  )}
                >
                  {matches.length === 0 && (
                    <li className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                      {tx(
                        "Nenhuma região de referência encontrada para essa busca.",
                        "No reference region found for this search.",
                        "No se encontró una región de referencia para esta búsqueda.",
                      )}
                    </li>
                  )}
                  {matches.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(item.id)}
                        aria-pressed={selected === item.id}
                        className={`w-full rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          selected === item.id ? "border-primary bg-primary/10" : "hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-start gap-2">
                          <MapPin
                            aria-hidden="true"
                            className={`mt-0.5 size-4 shrink-0 ${
                              selected === item.id ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                          <span>
                            <span className="block text-sm font-semibold">{item.name}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {item.region}
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="mb-3 text-sm font-semibold">
                  {tx(
                    "Mapa dos endereços informados",
                    "Map of supplied addresses",
                    "Mapa de las direcciones informadas",
                    "Carte des adresses indiquées",
                    "提供された住所の地図",
                    "已提供地址地图",
                    "제공된 주소 지도",
                  )}
                </h2>
                <Card className="h-[360px] p-2 sm:h-[440px] lg:h-[520px]">
                  <ClientOnly fallback={fallback}>
                    <Suspense fallback={fallback}>
                      <CitizenCouncilMap selected={selected} onSelect={setSelected} />
                    </Suspense>
                  </ClientOnly>
                </Card>
              </div>

              <Card aria-live="polite">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin aria-hidden="true" className="size-5 shrink-0 text-primary" />
                    {council.name}
                  </CardTitle>
                  <CardDescription>{council.region}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <section aria-labelledby="council-address">
                    <h3 id="council-address" className="text-sm font-semibold">
                      {tx(
                        "Endereço da unidade",
                        "Unit address",
                        "Dirección de la unidad",
                        "Adresse du service",
                        "窓口の住所",
                        "单位地址",
                        "기관 주소",
                      )}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{address}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{council.locationNote}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          address &&
                          copy(
                            address,
                            tx(
                              "Endereço copiado!",
                              "Address copied!",
                              "¡Dirección copiada!",
                              "Adresse copiée !",
                              "住所をコピーしました",
                              "地址已复制！",
                              "주소를 복사했습니다!",
                            ),
                          )
                        }
                      >
                        <Copy aria-hidden="true" className="mr-1.5 size-4" />
                        {tx(
                          "Copiar Endereço",
                          "Copy Address",
                          "Copiar Dirección",
                          "Copier l’adresse",
                          "住所をコピー",
                          "复制地址",
                          "주소 복사",
                        )}
                      </Button>
                      <Button size="sm" asChild>
                        <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                          <Navigation aria-hidden="true" className="mr-1.5 size-4" />
                          {tx(
                            "Como Chegar",
                            "Directions",
                            "Cómo llegar",
                            "Itinéraire",
                            "道順",
                            "路线",
                            "길찾기",
                          )}
                        </a>
                      </Button>
                    </div>
                  </section>

                  <section aria-labelledby="council-contact" className="rounded-xl border p-3">
                    <h3
                      id="council-contact"
                      className="flex items-center gap-2 text-sm font-semibold"
                    >
                      <Phone aria-hidden="true" className="size-4" />
                      {tx(
                        "Telefone / contato",
                        "Phone / contact",
                        "Teléfono / contacto",
                        "Téléphone / contact",
                        "電話・連絡先",
                        "电话 / 联系方式",
                        "전화 / 연락처",
                      )}
                    </h3>
                    <div className="mt-2 space-y-3">
                      {council.contacts.map((contact) => {
                        const phoneHref = getPhoneHref(contact.phone);
                        return (
                          <div
                            key={`${contact.label}-${contact.phone}`}
                            className="rounded-lg bg-muted/50 p-2"
                          >
                            <p className="text-sm font-medium">{contact.label}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{contact.phone}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  copy(
                                    contact.phone,
                                    tx(
                                      "Número copiado!",
                                      "Number copied!",
                                      "¡Número copiado!",
                                      "Numéro copié !",
                                      "番号をコピーしました",
                                      "号码已复制！",
                                      "번호를 복사했습니다!",
                                    ),
                                  )
                                }
                              >
                                <Copy aria-hidden="true" className="mr-1.5 size-4" />
                                {tx(
                                  "Copiar Número",
                                  "Copy Number",
                                  "Copiar número",
                                  "Copier le numéro",
                                  "番号をコピー",
                                  "复制号码",
                                  "번호 복사",
                                )}
                              </Button>
                              {phoneHref && (
                                <Button size="sm" variant="outline" asChild>
                                  <a href={phoneHref}>
                                    <Phone aria-hidden="true" className="mr-1.5 size-4" />
                                    {tx("Ligar", "Call", "Llamar", "Appeler", "電話する", "拨打电话", "전화")}
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-primary/10 p-3">
                      <p className="min-w-0 flex-1 text-xs leading-relaxed">
                        <strong className="block">
                          {tx("Disque 100", "Dial 100", "Disque 100")}
                        </strong>
                        {tx(
                          "Direitos Humanos · gratuito · 24 horas",
                          "Human Rights · free · 24 hours",
                          "Derechos Humanos · gratuito · 24 horas",
                        )}
                      </p>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            copy("100", tx("Número copiado!", "Number copied!", "¡Número copiado!"))
                          }
                          aria-label={tx(
                            "Copiar número 100",
                            "Copy number 100",
                            "Copiar número 100",
                          )}
                        >
                          <Copy aria-hidden="true" className="size-4" />
                        </Button>
                        <Button size="sm" asChild>
                          <a href="tel:100">100</a>
                        </Button>
                      </div>
                    </div>
                  </section>
                </CardContent>
              </Card>
              <Card className="mt-6 w-full min-w-0 @container">
                <CardHeader>
                  <CardTitle>
                    {tx(
                      "Pesquisar Conselhos Tutelares de Cuiabá",
                      "Search Cuiabá Guardianship Councils",
                      "Buscar Consejos Tutelares de Cuiabá",
                      "Rechercher les conseils de protection de Cuiabá",
                      "クイアバの児童保護相談窓口を検索",
                      "搜索库亚巴儿童保护委员会",
                      "쿠이아바 아동보호위원회 검색",
                    )}
                  </CardTitle>
                  <CardDescription>
                    {tx(
                      "Consulte o endereço, copie os dados ou abra a unidade no Google Maps. As localizações são referências aproximadas; confirme antes de se deslocar.",
                      "View an address, copy contact details, or open a location in Google Maps. Locations are approximate; confirm before traveling.",
                      "Consulte una dirección, copie los datos o abra la unidad en Google Maps. Las ubicaciones son aproximadas; confirme antes de desplazarse.",
                      "Consultez une adresse, copiez les coordonnées ou ouvrez le lieu dans Google Maps. Les emplacements sont approximatifs ; vérifiez avant de vous déplacer.",
                      "住所の確認、連絡先のコピー、Google マップでの表示ができます。位置は概略です。訪問前にご確認ください。",
                      "查看地址、复制联系方式，或在 Google 地图中打开位置。地点为大致位置，出行前请确认。",
                      "주소를 확인하고 연락처를 복사하거나 Google 지도에서 위치를 열 수 있습니다. 위치는 대략적이므로 방문 전에 확인하세요.",
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid min-w-0 grid-cols-1 gap-3 @md:grid-cols-2 @xl:grid-cols-3">
                  {googleSearchItems.map((item) => (
                    <Button
                      key={item.labels[0]}
                      asChild
                      variant="outline"
                      className="h-auto min-h-14 w-full min-w-0 justify-start whitespace-normal break-words px-3 py-3 text-left leading-snug"
                    >
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        <MapPin aria-hidden="true" className="mr-2 size-4 shrink-0" />
                        {tx(...item.labels)}
                      </a>
                    </Button>
                  ))}
                  <Button
                    asChild
                    className="h-auto min-h-14 w-full min-w-0 justify-start whitespace-normal break-words px-3 py-3 text-left leading-snug @md:col-span-2 @xl:col-span-3"
                  >
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Conselho+Tutelar+Cuiab%C3%A1+MT"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation aria-hidden="true" className="mr-2 size-4 shrink-0" />
                      {tx(
                        "Pesquisar conselhos no Google Maps",
                        "Search councils on Google Maps",
                        "Buscar consejos en Google Maps",
                        "Rechercher les conseils sur Google Maps",
                        "Google マップで相談窓口を検索",
                        "在 Google 地图中搜索儿童保护委员会",
                        "Google 지도에서 아동보호위원회 검색",
                      )}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inclusion" className="space-y-6">
            <div className="max-w-3xl">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {tx(
                  "Serviços de referência para crianças e adolescentes com TEA e deficiência em Cuiabá. Confirme endereço, disponibilidade, critérios de acesso e horários diretamente nos canais oficiais antes de se deslocar.",
                  "Reference services for children and adolescents with autism and disabilities in Cuiabá. Confirm address, availability, eligibility, and hours through official channels before visiting.",
                  "Servicios de referencia para niños y adolescentes con autismo y discapacidad en Cuiabá. Confirme dirección, disponibilidad, requisitos y horarios en los canales oficiales antes de acudir.",
                )}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {supportPoints.map((point) => {
                const Icon = point.icon;
                const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.mapQuery)}`;
                return (
                  <Card key={point.name} className="flex flex-col shadow-card">
                    <CardHeader>
                      <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon aria-hidden="true" className="size-5" />
                      </div>
                      <CardTitle className="pt-2 text-base">{point.name}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {tx(point.description[0], point.description[1], point.description[2])}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <Button asChild size="sm" variant="outline">
                        <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                          <MapPin aria-hidden="true" className="mr-1.5 size-4" />
                          {tx("Buscar no mapa", "Search on map", "Buscar en el mapa")}
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School aria-hidden="true" className="size-5 text-primary" />
                  {tx(
                    "Direito à educação inclusiva e ao apoio escolar",
                    "Right to inclusive education and school support",
                    "Derecho a la educación inclusiva y al apoyo escolar",
                  )}
                </CardTitle>
                <CardDescription>
                  {tx(
                    "Lei Berenice Piana (Lei 12.764/2012), Lei Brasileira de Inclusão (Lei 13.146/2015), Constituição Federal e ECA.",
                    "Berenice Piana Act (12.764/2012), Brazilian Inclusion Act (13.146/2015), Federal Constitution, and ECA.",
                    "Ley Berenice Piana (12.764/2012), Ley Brasileña de Inclusión (13.146/2015), Constitución Federal y ECA.",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed">
                <p>
                  {tx(
                    "A Constituição Federal (art. 208, III) e o ECA (art. 54, III) asseguram atendimento educacional especializado, preferencialmente na rede regular de ensino.",
                    "The Federal Constitution (Art. 208, III) and ECA (Art. 54, III) guarantee specialized educational support, preferably in regular schools.",
                    "La Constitución Federal (art. 208, III) y el ECA (art. 54, III) garantizan atención educativa especializada, preferentemente en la red regular.",
                  )}
                </p>
                <p>
                  {tx(
                    "A Lei 12.764/2012 prevê multa de 3 a 20 salários-mínimos ao gestor escolar ou autoridade competente que recusar matrícula de estudante com TEA ou qualquer outro tipo de deficiência; em caso de reincidência, pode haver perda do cargo. A Lei 13.146/2015 (LBI, art. 98, que alterou o art. 8º da Lei 7.853/1989) tipifica como crime recusar matrícula ou cobrar valor adicional em razão da deficiência, com pena de reclusão de 2 a 5 anos e multa; se a vítima for menor de 18 anos, a pena é aumentada em 1/3.",
                    "Act 12.764/2012 provides for a fine of 3 to 20 minimum wages for a school manager or authority who refuses enrollment of a student with autism or another disability; repeat offenses may result in loss of position. Act 13.146/2015 (Brazilian Inclusion Act, Art. 98, amending Art. 8 of Act 7.853/1989) makes refusing enrollment or charging extra because of disability a crime punishable by 2 to 5 years' imprisonment and a fine; if the victim is under 18, the sentence increases by one third.",
                    "La Ley 12.764/2012 prevé una multa de 3 a 20 salarios mínimos para el gestor escolar o autoridad que rechace la matrícula de un estudiante con autismo u otra discapacidad; la reincidencia puede ocasionar la pérdida del cargo. La Ley 13.146/2015 (LBI, art. 98, que modificó el art. 8 de la Ley 7.853/1989) tipifica como delito rechazar la matrícula o cobrar un importe adicional por razón de discapacidad, con pena de prisión de 2 a 5 años y multa; si la víctima es menor de 18 años, la pena aumenta en un tercio.",
                  )}
                </p>
                <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-muted-foreground">
                  {tx(
                    "A legislação citada não classifica esse crime como inafiançável. Cada situação depende de apuração e análise jurídica; procure a Defensoria Pública para orientação.",
                    "The cited law does not classify this crime as non-bailable. Each situation requires investigation and legal assessment; contact the Public Defender's Office for guidance.",
                    "La legislación citada no clasifica este delito como no excarcelable. Cada caso requiere investigación y análisis jurídico; consulte a la Defensoría Pública.",
                  )}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  <a
                    className="text-primary underline-offset-4 hover:underline"
                    href="https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12764.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx("Lei 12.764/2012", "Act 12.764/2012", "Ley 12.764/2012")}
                  </a>
                  <a
                    className="text-primary underline-offset-4 hover:underline"
                    href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx(
                      "Lei 13.146/2015 (LBI)",
                      "Act 13.146/2015 (Brazilian Inclusion Act)",
                      "Ley 13.146/2015 (LBI)",
                    )}
                  </a>
                  <a
                    className="text-primary underline-offset-4 hover:underline"
                    href="https://www.planalto.gov.br/ccivil_03/leis/l8069.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx(
                      "Estatuto da Criança e do Adolescente",
                      "Child and Adolescent Statute",
                      "Estatuto de la Niñez y Adolescencia",
                    )}
                  </a>
                </div>
                <Button asChild variant="outline">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Defensoria+P%C3%BAblica+Cuiab%C3%A1+MT"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Scale aria-hidden="true" className="mr-1.5 size-4" />
                    {tx(
                      "Localizar a Defensoria Pública",
                      "Find the Public Defender",
                      "Buscar la Defensoría Pública",
                    )}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </>
  );
}
