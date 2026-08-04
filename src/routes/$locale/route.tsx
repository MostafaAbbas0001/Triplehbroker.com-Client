import { createFileRoute, notFound, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { I18nProvider } from "@/i18n";
import { dirOf, isLocale, LOCALE_STORAGE_KEY } from "@/i18n/config";
import { toLocale } from "@/lib/seo";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { contentService } from "@/services/contentService";

export const Route = createFileRoute("/$locale")({
  beforeLoad: async ({ context, params }) => {
    if (!isLocale(params.locale)) throw notFound();
    const [site, contact] = await Promise.all([
      contentService.getSite(context.queryClient, params.locale),
      contentService.getPage(context.queryClient, params.locale, "contact"),
    ]);
    return { site, contact };
  },
  component: LocaleLayout,
});

function LocaleLayout() {
  const { locale: raw } = Route.useParams();
  const { site, contact } = Route.useRouteContext();
  const locale = toLocale(raw);
  const structuredData = createStructuredData({ locale, site, contact });

  useEffect(() => {
    const dir = dirOf(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  return (
    <I18nProvider locale={locale} site={site} contact={contact}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <div dir={dirOf(locale)} lang={locale} className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <Footer />
      </div>
    </I18nProvider>
  );
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
    <div key={pathname} className="page-transition">
      <span aria-hidden="true" className="page-veil" />
      {children}
    </div>
  );
}
