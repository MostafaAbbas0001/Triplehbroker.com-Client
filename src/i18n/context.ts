import { createContext, useContext } from "react";
import type { ContactContent, SiteContent } from "@/content/pages";
import type { Locale } from "./config";

export type I18nValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  site: SiteContent;
  contact: ContactContent;
};

export const I18nContext = createContext<I18nValue | null>(null);

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within I18nProvider");
  return value;
}
