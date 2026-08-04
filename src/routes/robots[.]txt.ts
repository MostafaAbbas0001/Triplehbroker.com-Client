import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const configuredSiteUrl = import.meta.env["VITE_SITE_URL"];
        if (!configuredSiteUrl) throw new Error("VITE_SITE_URL is required.");
        const siteUrl = configuredSiteUrl.replace(/\/$/, "");
        const robots = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "",
          `Sitemap: ${siteUrl}/sitemap.xml`,
          "",
        ].join("\n");

        return new Response(robots, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
          },
        });
      },
    },
  },
});
