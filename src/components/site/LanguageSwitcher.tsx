import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LOCALES, LOCALE_STORAGE_KEY, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ tone = "default" }: { tone?: "default" | "inverse" }) {
  const { locale } = useI18n();
  const label = locale === "ar" ? "اللغة" : "Language";
  const languageNames = { en: "English", ar: "العربية" } as const;
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function switchTo(next: Locale) {
    if (next === locale) return;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    }
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = next;
    void navigate({ to: `/${segments.join("/")}`, replace: false });
  }

  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-full",
        tone === "inverse" ? "glass-btn-dark" : "glass-pressable",
      )}
      role="group"
      aria-label={label}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            dir={code === "ar" ? "rtl" : "ltr"}
            onClick={() => switchTo(code)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "min-h-9 cursor-pointer rounded-full px-4 text-xs font-semibold tracking-wide transition-[background-color,color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-standard)]",
              active
                ? tone === "inverse"
                  ? "bg-white/90 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                  : "bg-primary/90 text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.32)]"
                : tone === "inverse"
                  ? "text-inverse-muted hover:text-inverse-foreground"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            {languageNames[code]}
          </button>
        );
      })}
    </div>
  );
}
