import { baseContent, defineStructuredSection } from "./shared";
import { renderSolutionsCatalog } from "./solutions-catalog.render";

export const solutionsCatalogSection = defineStructuredSection({
  render: renderSolutionsCatalog,
  kind: "solutions-catalog",
  category: "Solutions",
  description: "Section heading, lead and manually managed linked solution cards",
  content: {
    ...baseContent,
    heading: "Our solutions",
    items: [
      {
        title: "New solution",
        summary: "Describe this solution.",
        imageUrl: "",
        imageAlt: "",
        linkLabel: "Learn more",
        href: "",
      },
    ],
  },
});
