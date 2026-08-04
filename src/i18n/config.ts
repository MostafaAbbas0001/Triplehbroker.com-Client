export const LOCALES = ["en", "ar"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "thb-locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function dirOf(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Solution slugs are shared across locales so URLs stay stable. */
export const SOLUTION_SLUGS = [
  "health",
  "life",
  "motor",
  "property",
  "business",
  "travel",
] as const;

export type SolutionSlug = (typeof SOLUTION_SLUGS)[number];
