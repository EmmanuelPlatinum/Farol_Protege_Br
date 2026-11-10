import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languages, useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const selectedLanguage = languages.find((language) => language.code === lang);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="group gap-1.5 px-2"
          aria-label={`${t.language}: ${selectedLanguage?.label ?? "Português (Brasil)"}`}
          title={t.language}
        >
          <Languages
            aria-hidden="true"
            className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-12"
          />
          <span className="hidden text-xs font-semibold sm:inline">
            {selectedLanguage?.short ?? "PT"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t.language}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={lang}
          onValueChange={(value) => {
            const language = languages.find((item) => item.code === value);
            if (language) setLang(language.code);
          }}
        >
          {languages.map((language) => (
            <DropdownMenuRadioItem
              key={language.code}
              value={language.code}
              className="cursor-pointer transition-colors"
            >
              {language.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
