import type { ReactNode } from "react";
import { dirOf, type Locale } from "./config";
import type { ContactContent, SiteContent } from "@/content/pages";
import { I18nContext, type I18nValue } from "./context";

export function I18nProvider({
  locale,
  site,
  contact,
  children,
}: {
  locale: Locale;
  site: SiteContent;
  contact: ContactContent;
  children: ReactNode;
}) {
  const value: I18nValue = {
    locale,
    dir: dirOf(locale),
    site,
    contact,
  };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
