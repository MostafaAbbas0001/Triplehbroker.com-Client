import { useMemo, type ReactNode } from "react";
import { dirOf, type Locale } from "./config";
import type { ContactContent, SiteContent } from "@/content/pages";
import { I18nContext, type I18nValue } from "./context";
import type { NavigationMenu } from "@/services/navigationService";

export function I18nProvider({
  locale,
  site,
  contact,
  navigation,
  children,
}: {
  locale: Locale;
  site: SiteContent;
  contact: ContactContent;
  navigation: NavigationMenu;
  children: ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dir: dirOf(locale),
      site,
      contact,
      navigation,
    }),
    [contact, locale, navigation, site],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
