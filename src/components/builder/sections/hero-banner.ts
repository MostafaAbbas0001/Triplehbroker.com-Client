import { defineStructuredSection } from "./shared";
import { renderHeroBanner } from "./hero-banner.render";

export const heroBannerSection = defineStructuredSection({
  kind: "hero-banner",
  category: "Essentials",
  description: "Page hero with heading, lead, responsive images and optional buttons",
  hero: true,
  render: renderHeroBanner,
  content: {
    eyebrow: "Section label",
    heading: "New page heading",
    intro: "Add a clear introduction for this page.",
    desktopImageUrl: "",
    mobileImageUrl: "",
    imageAlt: "",
    items: [{ label: "Learn more", href: "/contact", variant: "inverse" }],
  },
});
