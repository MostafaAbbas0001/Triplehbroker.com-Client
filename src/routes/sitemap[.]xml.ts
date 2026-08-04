import { createFileRoute } from "@tanstack/react-router";
import { LOCALES, SOLUTION_SLUGS, type Locale } from "@/i18n/config";
import { pageService, type PageResponse } from "@/services/pageService";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const pages = await pageService.getAll(request.signal);
        const siteUrl = requiredSiteUrl();
        const urls = pages
          .filter((page) => page.seoData.robots.index)
          .map((page) => pageEntry(page, siteUrl));

        for (const locale of LOCALES) {
          const solutionsPage = pages.find((page) => page.slug === `${locale}/solutions`);
          if (!solutionsPage?.seoData.robots.index) continue;
          for (const slug of SOLUTION_SLUGS) {
            urls.push(solutionEntry(locale, slug, solutionsPage.updatedAt, siteUrl));
          }
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>`;

        return new Response(sitemap, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
          },
        });
      },
    },
  },
});

function requiredSiteUrl() {
  const configuredSiteUrl = import.meta.env["VITE_SITE_URL"];
  if (!configuredSiteUrl) throw new Error("VITE_SITE_URL is required.");
  return configuredSiteUrl.replace(/\/$/, "");
}

function pageEntry(page: PageResponse, siteUrl: string) {
  const path = `/${page.slug}`;
  const locale = page.slug.split("/")[0] as Locale;
  const localePath = page.slug.slice(locale.length);
  return urlEntry({
    location: sitemapLocation(page.seoData.canonicalUrl, path, siteUrl),
    lastModified: page.updatedAt,
    englishUrl: `${siteUrl}/en${localePath}`,
    arabicUrl: `${siteUrl}/ar${localePath}`,
  });
}

function solutionEntry(
  locale: Locale,
  slug: (typeof SOLUTION_SLUGS)[number],
  lastModified: string,
  siteUrl: string,
) {
  return urlEntry({
    location: `${siteUrl}/${locale}/solutions/${slug}`,
    lastModified,
    englishUrl: `${siteUrl}/en/solutions/${slug}`,
    arabicUrl: `${siteUrl}/ar/solutions/${slug}`,
  });
}

function sitemapLocation(canonicalUrl: string | null, fallbackPath: string, siteUrl: string) {
  if (!canonicalUrl) return `${siteUrl}${fallbackPath}`;
  const canonical = new URL(canonicalUrl, `${siteUrl}/`);
  return canonical.origin === new URL(siteUrl).origin
    ? canonical.toString()
    : `${siteUrl}${fallbackPath}`;
}

function urlEntry({
  location,
  lastModified,
  englishUrl,
  arabicUrl,
}: {
  location: string;
  lastModified: string;
  englishUrl: string;
  arabicUrl: string;
}) {
  return `  <url>
    <loc>${escapeXml(location)}</loc>
    <lastmod>${escapeXml(new Date(lastModified).toISOString())}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(englishUrl)}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${escapeXml(arabicUrl)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(englishUrl)}" />
  </url>`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
