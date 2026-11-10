import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/i18n";

export function ThemeToggle() {
  const tx = useTx();
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={
        dark
          ? tx(
              "Ativar tema claro",
              "Switch to light theme",
              "Activar tema claro",
              "Activer le thème clair",
              "ライトテーマに切り替え",
              "切换到浅色主题",
              "라이트 테마로 전환",
            )
          : tx(
              "Ativar tema escuro",
              "Switch to dark theme",
              "Activar tema oscuro",
              "Activer le thème sombre",
              "ダークテーマに切り替え",
              "切换到深色主题",
              "다크 테마로 전환",
            )
      }
      title={
        dark
          ? tx(
              "Ativar tema claro",
              "Switch to light theme",
              "Activar tema claro",
              "Activer le thème clair",
              "ライトテーマに切り替え",
              "切换到浅色主题",
              "라이트 테마로 전환",
            )
          : tx(
              "Ativar tema escuro",
              "Switch to dark theme",
              "Activar tema oscuro",
              "Activer le thème sombre",
              "ダークテーマに切り替え",
              "切换到深色主题",
              "다크 테마로 전환",
            )
      }
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </Button>
  );
}
