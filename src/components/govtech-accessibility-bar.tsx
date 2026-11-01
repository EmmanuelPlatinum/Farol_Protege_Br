import { useEffect, useState } from "react";
import { Contrast, Ear, Languages, Moon, Sun, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTx } from "@/lib/i18n";

export function GovtechAccessibilityBar() {
  const tx = useTx();
  const [fontScale, setFontScale] = useState<0 | 1 | 2>(0);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    try {
      const savedContrast = localStorage.getItem("farol_contrast") === "true";
      if (savedContrast) {
        setHighContrast(true);
        document.documentElement.classList.add("high-contrast");
      }
      const savedScale = Number(localStorage.getItem("farol_font_scale") || 0) as 0 | 1 | 2;
      if (savedScale > 0) {
        setFontScale(savedScale);
        applyFontScale(savedScale);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const applyFontScale = (scale: 0 | 1 | 2) => {
    document.documentElement.classList.remove("font-lg", "font-xl");
    if (scale === 1) document.documentElement.classList.add("font-lg");
    if (scale === 2) document.documentElement.classList.add("font-xl");
  };

  const increaseFont = () => {
    const next = (Math.min(fontScale + 1, 2) as 0 | 1 | 2);
    setFontScale(next);
    applyFontScale(next);
    try {
      localStorage.setItem("farol_font_scale", String(next));
    } catch {}
    toast.info(tx("Fonte aumentada", "Font size increased", "Fuente aumentada"));
  };

  const decreaseFont = () => {
    const next = (Math.max(fontScale - 1, 0) as 0 | 1 | 2);
    setFontScale(next);
    applyFontScale(next);
    try {
      localStorage.setItem("farol_font_scale", String(next));
    } catch {}
    toast.info(tx("Fonte padrão restaurada", "Standard font size restored", "Fuente normal"));
  };

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    document.documentElement.classList.toggle("high-contrast", next);
    try {
      localStorage.setItem("farol_contrast", String(next));
    } catch {}
    toast.info(
      next
        ? tx("Alto contraste ativado", "High contrast enabled", "Alto contraste activado")
        : tx("Contraste padrão restaurado", "Standard contrast restored", "Contraste normal")
    );
  };

  const handleLibras = () => {
    toast.info(
      tx(
        "Acessibilidade em LIBRAS: Suporte ao VLibras ativo para tradução automática em Língua Brasileira de Sinais.",
        "LIBRAS Accessibility: Brazilian Sign Language compatibility enabled.",
        "Accesibilidad en Lengua de Señas habilitada."
      )
    );
  };

  return (
    <nav
      aria-label={tx("Barra de Acessibilidade Governamental", "Government Accessibility Bar", "Barra de Accesibilidad")}
      className="border-b border-border/60 bg-muted/50 px-4 py-1 text-xs text-muted-foreground backdrop-blur-xs"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        {/* Atalhos de Teclado e Navegação Rápida (e-MAG) */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="hidden font-bold uppercase tracking-wider text-primary sm:inline">
            Portal GovTech
          </span>
          <span className="hidden text-border sm:inline">|</span>
          <a
            href="#conteudo"
            className="hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {tx("Ir para o Conteúdo [1]", "Go to Content [1]", "Ir al Contenido [1]")}
          </a>
          <a
            href="#menu"
            className="hidden hover:text-foreground sm:inline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {tx("Menu [2]", "Menu [2]", "Menú [2]")}
          </a>
          <a
            href="#acompanhar"
            className="hidden hover:text-foreground md:inline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {tx("Consulta PIN [3]", "PIN Query [3]", "Consulta PIN [3]")}
          </a>
        </div>

        {/* Ferramentas de Acessibilidade */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Controle de Tamanho da Fonte */}
          <div className="flex items-center gap-0.5 rounded-md border border-border/80 bg-background/80 px-1 py-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-xs font-bold"
              onClick={decreaseFont}
              title={tx("Diminuir tamanho do texto", "Decrease font size", "Disminuir texto")}
              aria-label={tx("Diminuir tamanho do texto", "Decrease font size", "Disminuir texto")}
            >
              A-
            </Button>
            <span className="text-[10px] text-muted-foreground font-mono">
              {fontScale === 0 ? "100%" : fontScale === 1 ? "112%" : "125%"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-xs font-bold text-primary"
              onClick={increaseFont}
              title={tx("Aumentar tamanho do texto", "Increase font size", "Aumentar texto")}
              aria-label={tx("Aumentar tamanho do texto", "Increase font size", "Aumentar texto")}
            >
              A+
            </Button>
          </div>

          {/* Alto Contraste */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleContrast}
                  className={`h-7 px-2 text-[11px] gap-1 ${
                    highContrast ? "bg-accent text-accent-foreground font-bold" : ""
                  }`}
                  aria-pressed={highContrast}
                >
                  <Contrast className="size-3.5" />
                  <span className="hidden sm:inline">
                    {tx("Alto Contraste", "Contrast", "Contraste")}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {tx("Alternar modo de alto contraste", "Toggle high contrast mode", "Alternar alto contraste")}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Atalho VLibras / Tradutor de Sinais */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLibras}
                  className="h-7 px-2 text-[11px] gap-1 text-primary hover:bg-primary/10"
                >
                  <Ear className="size-3.5" />
                  <span className="font-semibold">LIBRAS</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {tx(
                  "Acessibilidade em Língua Brasileira de Sinais",
                  "Sign Language Accessibility",
                  "Accesibilidad en Lengua de Señas"
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-border">|</span>

          {/* Seletor de Idioma e Tema */}
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

