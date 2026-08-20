import { createHeading, createNode, createParagraph, defineLegacySection } from "./shared";
import { renderHeroSection } from "./hero.render";

export const heroSection = defineLegacySection({
  renderLegacy: renderHeroSection,
  kind: "hero",
  category: "Essentials",
  description: "Hero title, lead, responsive background images and optional buttons",
  tone: "primary",
  content: () => [
    {
      ...createParagraph("Section label"),
      settings: { role: "eyebrow" },
      styles: {
        desktop: {
          fontSize: "11px",
          fontWeight: "600",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
        },
      },
    },
    createHeading("New page heading", 1),
    createParagraph("Add a clear introduction for this page."),
    createNode("button", { label: "Learn more", href: "/contact", variant: "inverse" }),
  ],
});
