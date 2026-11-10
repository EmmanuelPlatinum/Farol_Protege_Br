import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Contrast, Ear } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTx } from "@/lib/i18n";

export function GovtechAccessibilityBar() {
  const tx = useTx();
  const [fontScale, setFontScale] = useState<0 | 1 | 2>(0);
  const [highContrast, setHighContrast] = useState(false);
  const [librasLoading, setLibrasLoading] = useState(false);

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

  const storePreference = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Could not save accessibility preference.", error);
    }
  };

  const increaseFont = () => {
    const next = (Math.min(fontScale + 1, 2) as 0 | 1 | 2);
    setFontScale(next);
    applyFontScale(next);
    storePreference("farol_font_scale", String(next));
    toast.info(
      tx(
        "Fonte aumentada",
        "Font size increased",
        "Fuente aumentada",
        "Taille du texte augmentée",
        "文字サイズを大きくしました",
        "字体已放大",
        "글자 크기를 키웠습니다",
      ),
    );
  };

  const decreaseFont = () => {
    const next = (Math.max(fontScale - 1, 0) as 0 | 1 | 2);
    setFontScale(next);
    applyFontScale(next);
    storePreference("farol_font_scale", String(next));
    toast.info(
      tx(
        "Fonte padrão restaurada",
        "Standard font size restored",
        "Fuente normal",
        "Taille de texte par défaut restaurée",
        "標準の文字サイズに戻しました",
        "已恢复默认字体大小",
        "기본 글자 크기로 복원했습니다",
      ),
    );
  };

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    document.documentElement.classList.toggle("high-contrast", next);
    storePreference("farol_contrast", String(next));
    toast.info(
      next
        ? tx(
            "Alto contraste ativado",
            "High contrast enabled",
            "Alto contraste activado",
            "Contraste élevé activé",
            "高コントラストを有効にしました",
            "已开启高对比度",
            "고대비를 켰습니다",
          )
        : tx(
            "Contraste padrão restaurado",
            "Standard contrast restored",
            "Contraste normal",
            "Contraste standard restauré",
            "標準のコントラストに戻しました",
            "已恢复标准对比度",
            "기본 대비로 복원했습니다",
          )
    );
  };

  const handleLibras = () => {
    if (document.querySelector('script[data-farol-vlibras="true"]')) {
      toast.info(
        tx(
          "O VLibras já foi carregado. Use o botão flutuante para iniciar a tradução.",
          "VLibras is already loaded. Use its floating button to start translation.",
          "VLibras ya está cargado. Use el botón flotante para iniciar la traducción.",
          "VLibras est déjà chargé. Utilisez le bouton flottant pour lancer la traduction.",
          "VLibras は読み込み済みです。画面のボタンから翻訳を開始してください。",
          "VLibras 已加载。请使用悬浮按钮开始翻译。",
          "VLibras가 이미 로드되었습니다. 떠 있는 버튼을 눌러 번역을 시작하세요.",
        ),
      );
      return;
    }

    const confirmed = window.confirm(
      tx(
        "O VLibras é carregado de um serviço externo. O conteúdo exibido pode ser processado pelo serviço para tradução. Continuar?",
        "VLibras is loaded from an external service. Displayed content may be processed by that service for translation. Continue?",
        "VLibras se carga desde un servicio externo. El contenido mostrado puede ser procesado por el servicio para traducirlo. ¿Continuar?",
        "VLibras est chargé depuis un service externe. Le contenu affiché peut être traité par ce service pour être traduit. Continuer ?",
        "VLibras は外部サービスから読み込まれます。表示内容が翻訳のために処理される場合があります。続行しますか？",
        "VLibras 由外部服务加载。该服务可能会处理页面内容以进行翻译。是否继续？",
        "VLibras는 외부 서비스에서 로드됩니다. 번역을 위해 표시된 콘텐츠가 처리될 수 있습니다. 계속하시겠습니까?",
      ),
    );
    if (!confirmed) return;

    setLibrasLoading(true);
    const script = document.createElement("script");
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;
    script.dataset["farolVlibras"] = "true";
    script.onload = () => {
      setLibrasLoading(false);
      toast.success(
        tx(
          "VLibras carregado. Use o botão flutuante para iniciar a tradução.",
          "VLibras loaded. Use its floating button to start translation.",
          "VLibras cargado. Use el botón flotante para iniciar la traducción.",
          "VLibras chargé. Utilisez le bouton flottant pour lancer la traduction.",
          "VLibras を読み込みました。画面のボタンから翻訳を開始してください。",
          "VLibras 已加载。请使用悬浮按钮开始翻译。",
          "VLibras가 로드되었습니다. 떠 있는 버튼을 눌러 번역을 시작하세요.",
        ),
      );
    };
    script.onerror = () => {
      script.remove();
      setLibrasLoading(false);
      toast.error(
        tx(
          "Não foi possível carregar o VLibras. Verifique sua conexão e tente novamente.",
          "Could not load VLibras. Check your connection and try again.",
          "No se pudo cargar VLibras. Verifique su conexión e inténtelo de nuevo.",
          "Impossible de charger VLibras. Vérifiez votre connexion et réessayez.",
          "VLibras を読み込めませんでした。接続を確認して再試行してください。",
          "无法加载 VLibras。请检查网络连接后重试。",
          "VLibras를 불러오지 못했습니다. 연결을 확인하고 다시 시도하세요.",
        ),
      );
    };
    document.body.appendChild(script);
  };

  return (
    <nav
      aria-label={tx(
        "Barra de Acessibilidade Governamental",
        "Government Accessibility Bar",
        "Barra de Accesibilidad",
        "Barre d’accessibilité gouvernementale",
        "政府アクセシビリティバー",
        "政府无障碍工具栏",
        "정부 접근성 도구 모음",
      )}
      className="border-b border-border/60 bg-muted/50 px-4 py-1 text-xs text-muted-foreground backdrop-blur-xs"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
        {/* Atalhos de Teclado e Navegação Rápida (e-MAG) */}
        <div className="flex items-center gap-3 text-[11px]">
          <span className="hidden font-bold uppercase tracking-wider text-primary sm:inline">
            {tx("Portal GovTech", "GovTech Portal", "Portal GovTech", "Portail GovTech", "GovTech ポータル", "GovTech 门户", "GovTech 포털")}
          </span>
          <span className="hidden text-border sm:inline">|</span>
          <a
            href="#conteudo"
            className="hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {tx("Ir para o Conteúdo [1]", "Go to Content [1]", "Ir al Contenido [1]", "Aller au contenu [1]", "本文へ移動 [1]", "跳转到正文 [1]", "본문으로 이동 [1]")}
          </a>
          <a
            href="#menu"
            className="hidden hover:text-foreground sm:inline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {tx("Menu [2]", "Menu [2]", "Menú [2]", "Menu [2]", "メニュー [2]", "菜单 [2]", "메뉴 [2]")}
          </a>
          <Link
            to="/tracking"
            className="hidden hover:text-foreground md:inline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {tx("Consulta PIN [3]", "PIN Query [3]", "Consulta PIN [3]", "Suivi du code [3]", "受付番号の確認 [3]", "查询编号 [3]", "접수 번호 조회 [3]")}
          </Link>
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
              title={tx("Diminuir tamanho do texto", "Decrease font size", "Disminuir texto", "Réduire la taille du texte", "文字を小さくする", "缩小字体", "글자 크기 줄이기")}
              aria-label={tx("Diminuir tamanho do texto", "Decrease font size", "Disminuir texto", "Réduire la taille du texte", "文字を小さくする", "缩小字体", "글자 크기 줄이기")}
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
              title={tx("Aumentar tamanho do texto", "Increase font size", "Aumentar texto", "Augmenter la taille du texte", "文字を大きくする", "放大字体", "글자 크기 키우기")}
              aria-label={tx("Aumentar tamanho do texto", "Increase font size", "Aumentar texto", "Augmenter la taille du texte", "文字を大きくする", "放大字体", "글자 크기 키우기")}
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
                    {tx("Alto Contraste", "Contrast", "Contraste", "Contraste élevé", "高コントラスト", "高对比度", "고대비")}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {tx("Alternar modo de alto contraste", "Toggle high contrast mode", "Alternar alto contraste", "Activer ou désactiver le contraste élevé", "高コントラストを切り替える", "切换高对比度模式", "고대비 모드 전환")}
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
                  disabled={librasLoading}
                  aria-label={tx("Carregar tradutor VLibras", "Load VLibras translator", "Cargar traductor VLibras", "Charger le traducteur VLibras", "VLibras 翻訳を読み込む", "加载 VLibras 翻译工具", "VLibras 번역기 불러오기")}
                  className="h-7 px-2 text-[11px] gap-1 text-primary hover:bg-primary/10"
                >
                  <Ear className="size-3.5" />
                  <span className="font-semibold">{librasLoading ? "…" : "LIBRAS"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {tx(
                  "Acessibilidade em Língua Brasileira de Sinais",
                  "Acessibilidade em Língua Brasileira de Sinais",
                  "Accesibilidad en Lengua de Señas",
                  "Accessibilité en langue des signes brésilienne",
                  "ブラジル手話によるアクセシビリティ",
                  "巴西手语无障碍功能",
                  "브라질 수화 접근성",
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-border">|</span>

          {/* Seletor de Idioma e Tema */}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
