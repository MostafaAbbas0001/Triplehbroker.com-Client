import {
  createFileRoute,
  notFound,
  Outlet,
  useMatches,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type CSSProperties } from "react";
import { I18nProvider } from "@/i18n";
import { dirOf, isLocale, LOCALE_STORAGE_KEY } from "@/i18n/config";
import { toLocale } from "@/lib/seo";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { contentService } from "@/services/contentService";
import { navigationQueryKeys, navigationService } from "@/services/navigationService";
import { themeQueryKey, themeService, type ThemeResponse } from "@/services/themeService";
import type { BuilderPage } from "@/services/builderService";

export const Route = createFileRoute("/$locale")({
  beforeLoad: async ({ context, params }) => {
    if (!isLocale(params.locale)) throw notFound();
    const locale = params.locale;
    const [site, contact, navigation, theme] = await Promise.all([
      contentService.getSite(context.queryClient, locale),
      contentService.getContact(context.queryClient, locale),
      context.queryClient.ensureQueryData({
        queryKey: navigationQueryKeys.menu(locale),
        queryFn: ({ signal }) => navigationService.get(locale, "primary", signal),
      }),
      context.queryClient.ensureQueryData({
        queryKey: themeQueryKey,
        queryFn: ({ signal }) => themeService.getActive(signal),
      }),
    ]);
    return { site, contact, navigation, theme };
  },
  component: LocaleLayout,
});

function LocaleLayout() {
  const { locale: raw } = Route.useParams();
  const { site, contact, navigation, theme } = Route.useRouteContext();
  const locale = toLocale(raw);
  const structuredData = createStructuredData({ locale, site, contact });

  useEffect(() => {
    const dir = dirOf(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  return (
    <I18nProvider locale={locale} site={site} contact={contact} navigation={navigation}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <div
        dir={dirOf(locale)}
        lang={locale}
        className="flex min-h-dvh flex-col"
        style={themeVariables(theme, locale)}
      >
        <Header />
        <main className="flex-1">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <ManagedFooter />
      </div>
    </I18nProvider>
  );
}

function ManagedFooter() {
  const matches = useMatches();
  const page = matches
    .map(
      (match) => match.loaderData as { page?: BuilderPage; builderPage?: BuilderPage } | undefined,
    )
    .map((data) => data?.page ?? data?.builderPage)
    .find(Boolean);
  return page?.document.settings.footerVisible === false ? null : <Footer />;
}

function themeVariables(theme: ThemeResponse, locale: "en" | "ar"): CSSProperties {
  const colors = theme.tokens["colors"] as Record<string, unknown> | undefined;
  const layout = theme.tokens["layout"] as Record<string, unknown> | undefined;
  const typography = theme.tokens["typography"] as Record<string, unknown> | undefined;
  const radius = theme.tokens["radius"] as Record<string, unknown> | undefined;
  const variables: Record<string, string> = {};
  const set = (name: string, value: unknown) => {
    if (typeof value === "string" && value.length <= 200 && !/[;{}]/.test(value)) {
      variables[name] = value;
    }
  };
  set("--brand-900", colors?.["brand900"]);
  set("--brand-700", colors?.["brand700"]);
  set("--brand-500", colors?.["brand500"]);
  set("--brand-050", colors?.["brand050"]);
  set("--gold-500", colors?.["accent"]);
  set("--background", colors?.["background"]);
  set("--foreground", colors?.["foreground"]);
  set("--body", colors?.["body"]);
  set("--muted", colors?.["muted"]);
  set("--border", colors?.["border"]);
  set("--hero-heading", colors?.["heroHeading"]);
  set("--hero-body", colors?.["heroBody"]);
  set("--inverse-foreground", colors?.["heroHeading"]);
  set("--inverse-muted", colors?.["heroBody"]);
  set("--button-primary", colors?.["buttonPrimary"]);
  set("--button-primary-text", colors?.["buttonPrimaryText"]);
  set("--button-inverse", colors?.["buttonInverse"]);
  set("--button-inverse-text", colors?.["buttonInverseText"]);
  set("--container-max", layout?.["containerMax"]);
  set("--gutter", layout?.["gutter"]);
  set("--section-y", layout?.["sectionY"]);
  set("--section-y-lg", layout?.["sectionYLarge"]);
  set("--font-display", locale === "ar" ? typography?.["arabic"] : typography?.["display"]);
  set("--font-body", locale === "ar" ? typography?.["arabic"] : typography?.["body"]);
  set("--radius-sm", radius?.["small"]);
  set("--radius-md", radius?.["medium"]);
  set("--radius-lg", radius?.["large"]);
  return variables as CSSProperties;
}

function createStructuredData({
  locale,
  site,
  contact,
}: {
  locale: "en" | "ar";
  site: { companyName: string; logoUrl: string };
  contact: { phone: string; email: string; address: string[] };
}) {
  const configuredSiteUrl = import.meta.env["VITE_SITE_URL"];
  if (!configuredSiteUrl) throw new Error("VITE_SITE_URL is required.");
  const siteUrl = configuredSiteUrl.replace(/\/$/, "");
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "InsuranceAgency",
        "@id": `${siteUrl}/#organization`,
        name: site.companyName,
        url: `${siteUrl}/${locale}`,
        logo: new URL(site.logoUrl, `${siteUrl}/`).toString(),
        telephone: contact.phone,
        email: contact.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: contact.address.join(", "),
          addressCountry: "LB",
        },
        areaServed: { "@type": "Country", name: "Lebanon" },
        availableLanguage: ["English", "Arabic"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: site.companyName,
        inLanguage: locale,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return JSON.stringify(graph).replace(/</g, "\\u003c");
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div key={pathname} className="page-transition flex flex-col">
      <span aria-hidden="true" className="page-veil" />
      {children}
    </div>
  );
}
