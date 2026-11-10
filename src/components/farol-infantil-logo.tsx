import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface FarolInfantilLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  inverted?: boolean;
}

export function FarolInfantilLogo({
  size = "md",
  showText = true,
  showSubtitle = false,
  className,
  inverted = false,
}: FarolInfantilLogoProps) {
  const { t } = useI18n();

  const iconSizes = {
    sm: "size-7",
    md: "size-9",
    lg: "size-11",
    xl: "size-14",
  };

  const textSizes = {
    sm: "text-base font-bold",
    md: "text-lg font-bold",
    lg: "text-2xl font-bold",
    xl: "text-3xl font-extrabold",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 tracking-tight", className)}>
      {/* Ícone estilizado: Escudo de Proteção Cidadã + Farol Emitindo Feixe de Luz */}
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-sm transition-transform hover:scale-105",
          iconSizes[size],
        )}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-full drop-shadow-xs"
          aria-hidden="true"
        >
          <defs>
            {/* Degradê GovTech: Verde Institucional (#059669 / #10B981) para Azul Farol (#0284C7) */}
            <linearGradient id="farol-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            {/* Feixe de Luz Dourado/Branco Radiante */}
            <linearGradient id="beam-glow" x1="0%" y1="50%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="lighthouse-tower" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F8FAFC" />
              <stop offset="50%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>

            <filter id="shield-subtle-glow">
              <feDropShadow
                dx="0"
                dy="1"
                stdDeviation="1.5"
                floodColor="#0284C7"
                floodOpacity="0.3"
              />
            </filter>
          </defs>

          {/* 1. Silhueta do Escudo de Proteção */}
          <path
            d="M24 4L7 11V22C7 32.5 14.3 42.2 24 44.5C33.7 42.2 41 32.5 41 22V11L24 4Z"
            fill="url(#farol-shield-grad)"
            filter="url(#shield-subtle-glow)"
          />

          {/* Borda interna refinada do escudo */}
          <path
            d="M24 6.5L9.5 12.5V22C9.5 31 15.7 39.5 24 41.5C32.3 39.5 38.5 31 38.5 22V12.5L24 6.5Z"
            stroke="#FFFFFF"
            strokeOpacity="0.25"
            strokeWidth="1.2"
            fill="none"
          />

          {/* 2. Feixe de Luz Expansivo do Farol (Vetor Angular) */}
          <path d="M24 19L41 12V28L24 21Z" fill="url(#beam-glow)" opacity="0.85" />
          <path d="M24 19L7 12V28L24 21Z" fill="url(#beam-glow)" opacity="0.5" />

          {/* 3. Estrutura do Farol */}
          {/* Base rochosa / pedestal */}
          <ellipse cx="24" cy="36" rx="9" ry="2.5" fill="#047857" opacity="0.8" />

          {/* Torre cônica do Farol */}
          <polygon points="21,35 27,35 26,21 22,21" fill="url(#lighthouse-tower)" />
          {/* Faixa vermelha institucional na torre */}
          <polygon points="21.6,29 26.4,29 26.1,26 21.9,26" fill="#EF4444" />

          {/* Cúpula / Lanterna do Farol */}
          <rect x="21" y="19" width="6" height="2.5" rx="0.5" fill="#0F172A" />
          <circle cx="24" cy="18.5" r="2.5" fill="#FDE047" />
          <polygon points="21,18 24,14 27,18" fill="#0F172A" />
          <circle cx="24" cy="14" r="1" fill="#FEF08A" />

          {/* Ponto de Brilho Central da Lâmpada */}
          <circle cx="24" cy="18.5" r="1.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Tipografia da Marca */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className={cn(textSizes[size], "flex items-center gap-1.5 whitespace-nowrap")}>
            <span className={cn(inverted ? "text-white" : "text-foreground")}>
              {t.brandPrefix}
            </span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
              {t.brandSuffix}
            </span>
          </div>
          {showSubtitle && (
            <span
              className={cn(
                "mt-0.5 text-[10px] font-medium tracking-normal",
                inverted ? "text-slate-300" : "text-muted-foreground",
              )}
            >
              {t.brandSubtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
