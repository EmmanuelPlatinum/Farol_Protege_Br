import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Map, Menu, ShieldCheck, X } from "lucide-react";
import { GovtechAccessibilityBar } from "@/components/govtech-accessibility-bar";
import { FarolInfantilLogo } from "@/components/farol-infantil-logo";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { useI18n, useTx } from "@/lib/i18n";

const links = [
  { to: "/", label: "Início", en: "Home", es: "Inicio", fr: "Accueil", ja: "ホーム", zh: "首页", ko: "홈" },
  { to: "/about", label: "Sobre", en: "About", es: "Acerca de", fr: "À propos", ja: "概要", zh: "关于", ko: "소개" },
  { to: "/report", label: "Denunciar", en: "Report", es: "Denunciar", fr: "Signaler", ja: "通報する", zh: "举报", ko: "신고하기" },
  { to: "/citizen/kid-shield", label: "Espaço seguro", en: "Safe space", es: "Espacio seguro", fr: "Espace sûr", ja: "安心できる場所", zh: "安全空间", ko: "안전한 공간" },
  { to: "/educa", label: "Farol Saberes", en: "Farol Learning Hub", es: "Farol Saberes", fr: "Farol Savoirs", ja: "ファロル学習", zh: "Farol 学习中心", ko: "파롤 학습관" },
  {
    to: "/conselhos",
    label: "Encontre seu Conselho",
    en: "Find your Council",
    es: "Encuentre su Consejo",
    fr: "Trouver votre conseil",
    ja: "相談窓口を探す",
    zh: "查找儿童保护委员会",
    ko: "아동보호위원회 찾기",
  },
  { to: "/tracking", label: "Acompanhar PIN", en: "Track PIN", es: "Consultar PIN", fr: "Suivre le code", ja: "受付番号を確認", zh: "查询编号", ko: "접수 번호 조회" },
  { to: "/public-shifts", label: "Plantões", en: "Duty roster", es: "Guardias", fr: "Permanences", ja: "当番表", zh: "值班安排", ko: "당직 일정" },
  { to: "/transparency", label: "Transparência", en: "Transparency", es: "Transparencia", fr: "Transparence", ja: "透明性", zh: "透明度", ko: "투명성" },
] as const;

export function PublicSiteHeader() {
  const tx = useTx();
  const { t } = useI18n();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <>
      <GovtechAccessibilityBar />
      <header
        id="menu"
        className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-md"
      >
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
          <Link
            to="/"
            className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${t.brand} — ${tx("Início", "Home", "Inicio", "Accueil", "ホーム", "首页", "홈")}`}
          >
            <FarolInfantilLogo size="sm" showSubtitle={false} />
          </Link>

          <nav
            aria-label={tx(
              "Navegação pública",
              "Public navigation",
              "Navegación pública",
              "Navigation publique",
              "公開ナビゲーション",
              "公共导航",
              "공개 탐색",
            )}
            className="hidden items-center gap-1 xl:flex"
          >
            {links.map((item) => {
              const active = path === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.to === "/conselhos" && <Map className="mr-1 inline size-4" />}
                  {tx(item.label, item.en, item.es, item.fr, item.ja, item.zh, item.ko)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Button asChild variant="outline" className="h-9 px-2.5 text-xs sm:px-3 sm:text-sm">
              <Link
                to="/conselhos"
                aria-label={tx(
                  "Encontre seu Conselho Tutelar",
                  "Find your Guardianship Council",
                  "Encuentre su Consejo Tutelar",
                  "Trouver votre conseil de protection de l’enfance",
                  "児童保護相談窓口を探す",
                  "查找儿童保护委员会",
                  "아동보호위원회 찾기",
                )}
              >
                <Map className="size-4 sm:mr-1.5" />
                <span className="hidden sm:inline">
                  {tx(
                    "Encontre seu Conselho",
                    "Find your Council",
                    "Encuentre su Consejo",
                    "Trouver votre conseil",
                    "相談窓口を探す",
                    "查找儿童保护委员会",
                    "아동보호위원회 찾기",
                  )}
                </span>
              </Link>
            </Button>
            <Button asChild className="h-9 px-2.5 text-xs sm:px-3 sm:text-sm">
              <Link to="/login">
                <ShieldCheck className="size-4 sm:mr-1.5" />
                <span className="hidden sm:inline">
                  {tx(
                    "Acesso do Conselho",
                    "Council access",
                    "Acceso al Consejo",
                    "Accès du conseil",
                    "相談員ログイン",
                    "委员会工作人员登录",
                    "위원회 담당자 로그인",
                  )}
                </span>
              </Link>
            </Button>
            <div className="relative xl:hidden" ref={menuRef}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-expanded={menuOpen}
                aria-controls="public-mobile-navigation"
                aria-label={
                  menuOpen
                    ? tx(
                        "Fechar navegação",
                        "Close navigation",
                        "Cerrar navegación",
                        "Fermer la navigation",
                        "メニューを閉じる",
                        "关闭导航",
                        "메뉴 닫기",
                      )
                    : tx(
                        "Abrir navegação",
                        "Open navigation",
                        "Abrir navegación",
                        "Ouvrir la navigation",
                        "メニューを開く",
                        "打开导航",
                        "메뉴 열기",
                      )
                }
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span aria-hidden="true" className="relative flex size-4 items-center justify-center">
                  <Menu
                    className={`absolute size-4 transition-transform duration-200 motion-reduce:transition-none ${
                      menuOpen ? "rotate-90 scale-0" : "rotate-0 scale-100"
                    }`}
                  />
                  <X
                    className={`absolute size-4 transition-transform duration-200 motion-reduce:transition-none ${
                      menuOpen ? "rotate-0 scale-100" : "-rotate-90 scale-0"
                    }`}
                  />
                </span>
              </Button>
              <nav
                id="public-mobile-navigation"
                inert={!menuOpen}
                aria-hidden={!menuOpen}
                aria-label={tx(
                  "Navegação pública",
                  "Public navigation",
                  "Navegación pública",
                  "Navigation publique",
                  "公開ナビゲーション",
                  "公共导航",
                  "공개 탐색",
                )}
                className={`absolute right-0 top-11 z-50 grid w-[min(18rem,calc(100vw-2rem))] origin-top-right gap-1 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
                  menuOpen
                    ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                    : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                }`}
              >
                {links.map((item) => {
                  const active = path === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      aria-current={active ? "page" : undefined}
                      className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.to === "/conselhos" && <Map className="mr-1 inline size-4" />}
                      {tx(item.label, item.en, item.es, item.fr, item.ja, item.zh, item.ko)}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export function PublicSiteLayout() {
  const tx = useTx();
  const { t } = useI18n();
  const path = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <PublicSiteHeader />
      <main id="conteudo" className="min-h-[65vh]">
        <div key={path} className="route-enter">
          <Outlet />
        </div>
      </main>
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            <p className="font-semibold text-foreground">{t.brand}</p>
            <p className="mt-1 text-xs">
              {tx(
                "Portal público demonstrativo de informação e proteção de direitos.",
                "Demonstration public portal for information and rights protection.",
                "Portal público demostrativo de información y protección de derechos.",
                "Portail public de démonstration pour l’information et la protection des droits.",
                "権利に関する情報と保護を提供する公開デモポータルです。",
                "提供权利信息与保护服务的公共演示门户。",
                "권리 정보와 보호를 위한 공개 데모 포털입니다.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <Link to="/about" className="hover:text-foreground">
              {tx("Sobre", "About", "Acerca de", "À propos", "概要", "关于", "소개")}
            </Link>
            <Link to="/report" className="hover:text-foreground">
              {tx("Denunciar", "Report", "Denunciar", "Signaler", "通報する", "举报", "신고하기")}
            </Link>
            <Link to="/citizen/kid-shield" className="hover:text-foreground">
              {tx(
                "Espaço seguro para crianças",
                "Safe space for children",
                "Espacio seguro para niños",
                "Espace sûr pour les enfants",
                "子どもの安心スペース",
                "儿童安全空间",
                "아동 안전 공간",
              )}
            </Link>
            <Link to="/educa" className="hover:text-foreground">
              {tx(
                "Farol Saberes",
                "Farol Learning Hub",
                "Farol Saberes",
                "Farol Savoirs",
                "ファロル学習",
                "Farol 学习中心",
                "파롤 학습관",
              )}
            </Link>
            <Link to="/conselhos" className="inline-flex items-center gap-1 hover:text-foreground">
              <Map className="size-3" />
              {tx(
                "Encontre seu Conselho",
                "Find your Council",
                "Encuentre su Consejo",
                "Trouver votre conseil",
                "相談窓口を探す",
                "查找儿童保护委员会",
                "아동보호위원회 찾기",
              )}
            </Link>
            <Link to="/tracking" className="hover:text-foreground">
              {tx("Acompanhar", "Track", "Consultar", "Suivre", "確認する", "查询", "조회")}
            </Link>
            <Link to="/transparency" className="hover:text-foreground">
              {tx("Transparência", "Transparency", "Transparencia", "Transparence", "透明性", "透明度", "투명성")}
            </Link>
            <Link to="/login" className="font-medium text-primary hover:underline">
              {tx("Acesso restrito", "Restricted access", "Acceso restringido", "Accès réservé", "関係者専用", "限制访问", "관계자 전용")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PublicPageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b bg-gradient-to-b from-primary/5 to-background">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-sm font-semibold text-primary">{eyebrow}</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}
