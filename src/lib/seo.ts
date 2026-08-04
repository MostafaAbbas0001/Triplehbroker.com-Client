import type { PageSeo } from "@/content/pages";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/config";

export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function pageHead({
  locale,
  title,
  description,
  company,
  path,
  type = "website",
  image,
  seo,
}: {
  locale: Locale;
  title: string;
  description: string;
  company: string;
  path: string;
  type?: string;
  image?: string;
  seo?: PageSeo;
}) {
  const configuredSiteUrl = import.meta.env["VITE_SITE_URL"];
  if (!configuredSiteUrl) throw new Error("VITE_SITE_URL is required.");
  const siteUrl = configuredSiteUrl.replace(/\/$/, "");
  const resolvedTitle = seo?.title || title;
  const resolvedDescription = seo?.description || description;
  const fullTitle = seo
    ? resolvedTitle
    : resolvedTitle.includes(company)
      ? resolvedTitle
      : `${resolvedTitle} — ${company}`;
  const localizedPath = `/${locale}${path}`;
  const routeUrl = `${siteUrl}${localizedPath}`;
  const canonicalUrl = seo?.canonicalUrl
    ? new URL(seo.canonicalUrl, `${siteUrl}/`).toString()
    : routeUrl;
  const imageSource = seo?.openGraph.imageUrl || image;
  const imageUrl = imageSource ? new URL(imageSource, `${siteUrl}/`).toString() : undefined;
  const openGraphTitle = seo?.openGraph.title || fullTitle;
  const openGraphDescription = seo?.openGraph.description || resolvedDescription;
  const robots = seo?.robots ?? { index: true, follow: true };

  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: resolvedDescription },
      {
        name: "robots",
        content: `${robots.index ? "index" : "noindex"},${robots.follow ? "follow" : "nofollow"}`,
      },
      { property: "og:title", content: openGraphTitle },
      { property: "og:description", content: openGraphDescription },
      { property: "og:type", content: type },
      { property: "og:url", content: canonicalUrl },
      { property: "og:locale", content: locale === "ar" ? "ar_LB" : "en_US" },
      { property: "og:locale:alternate", content: locale === "ar" ? "en_US" : "ar_LB" },
      ...(imageUrl ? [{ property: "og:image", content: imageUrl }] : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: openGraphTitle },
      { name: "twitter:description", content: openGraphDescription },
      ...(imageUrl ? [{ name: "twitter:image", content: imageUrl }] : []),
    ],
    links: [
      { rel: "canonical", href: canonicalUrl },
      { rel: "alternate", hrefLang: "en", href: `${siteUrl}/en${path}` },
      { rel: "alternate", hrefLang: "ar", href: `${siteUrl}/ar${path}` },
      { rel: "alternate", hrefLang: "x-default", href: `${siteUrl}/en${path}` },
    ],
  };
}
