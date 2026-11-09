import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Map, Menu, ShieldCheck } from "lucide-react";
import { GovtechAccessibilityBar } from "@/components/govtech-accessibility-bar";
import { FarolProtegeLogo } from "@/components/farol-logo";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/i18n";

const links = [
  { to: "/", label: "Início", en: "Home", es: "Inicio" },
  { to: "/about", label: "Sobre", en: "About", es: "Acerca de" },
  { to: "/report", label: "Denunciar", en: "Report", es: "Denunciar" },
  { to: "/conselhos", label: "Encontre seu Conselho", en: "Find your Council", es: "Encuentre su Consejo" },
  { to: "/tracking", label: "Acompanhar PIN", en: "Track PIN", es: "Consultar PIN" },
  { to: "/public-shifts", label: "Plantões", en: "Duty roster", es: "Guardias" },
  { to: "/transparency", label: "Transparência", en: "Transparency", es: "Transparencia" },
] as const;

export function PublicSiteHeader() {
  const tx = useTx();
  const path = useRouterState({ select: (state) => state.location.pathname });

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
            aria-label={tx(
              "Farol Protege — Início",
              "Farol Protege — Home",
              "Farol Protege — Inicio",
            )}
          >
            <FarolProtegeLogo size="sm" showSubtitle={false} />
          </Link>

          <nav
            aria-label={tx("Navegação pública", "Public navigation", "Navegación pública")}
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
                  {tx(item.label, item.en, item.es)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="h-9 px-2.5 text-xs sm:px-3 sm:text-sm">
              <Link
                to="/conselhos"
                aria-label={tx(
                  "Encontre seu Conselho Tutelar",
                  "Find your Guardianship Council",
                  "Encuentre su Consejo Tutelar",
                )}
              >
                <Map className="size-4 sm:mr-1.5" />
                <span className="hidden sm:inline">
                  {tx("Encontre seu Conselho", "Find your Council", "Encuentre su Consejo")}
                </span>
              </Link>
            </Button>
            <Button asChild className="h-9 px-3 text-xs sm:text-sm">
              <Link to="/login">
                <ShieldCheck className="mr-1.5 size-4" />
                {tx("Acesso do Conselho", "Council access", "Acceso al Consejo")}
              </Link>
            </Button>
            <details className="group relative xl:hidden">
              <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md border border-border text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                <Menu className="size-4" />
                <span className="sr-only">
                  {tx("Abrir navegação", "Open navigation", "Abrir navegación")}
                </span>
              </summary>
              <nav
                aria-label={tx("Navegação pública", "Public navigation", "Navegación pública")}
                className="absolute right-0 top-11 z-50 grid min-w-56 gap-1 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg"
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
                      onClick={(event) => {
                        const details = event.currentTarget.closest("details");
                        if (details) details.open = false;
                      }}
                    >
                      {item.to === "/conselhos" && <Map className="mr-1 inline size-4" />}
                      {tx(item.label, item.en, item.es)}
                    </Link>
                  );
                })}
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}

export function PublicSiteLayout() {
  const tx = useTx();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <PublicSiteHeader />
      <main id="conteudo" className="min-h-[65vh]">
        <Outlet />
      </main>
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6">
          <div>
            <p className="font-semibold text-foreground">Farol Protege</p>
            <p className="mt-1 text-xs">
              {tx(
                "Portal público demonstrativo de informação e proteção de direitos.",
                "Demonstration public portal for information and rights protection.",
                "Portal público demostrativo de información y protección de derechos.",
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
            <Link to="/about" className="hover:text-foreground">
              {tx("Sobre", "About", "Acerca de")}
            </Link>
            <Link to="/report" className="hover:text-foreground">
              {tx("Denunciar", "Report", "Denunciar")}
            </Link>
            <Link to="/conselhos" className="inline-flex items-center gap-1 hover:text-foreground">
              <Map className="size-3" />
              {tx("Encontre seu Conselho", "Find your Council", "Encuentre su Consejo")}
            </Link>
            <Link to="/tracking" className="hover:text-foreground">
              {tx("Acompanhar", "Track", "Consultar")}
            </Link>
            <Link to="/transparency" className="hover:text-foreground">
              {tx("Transparência", "Transparency", "Transparencia")}
            </Link>
            <Link to="/login" className="font-medium text-primary hover:underline">
              {tx("Acesso restrito", "Restricted access", "Acceso restringido")}
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
