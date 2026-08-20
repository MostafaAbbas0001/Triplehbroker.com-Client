import { defineStructuredSection } from "./shared";
import { renderSolutionCards } from "./solution-cards.render";

export const solutionCardsSection = defineStructuredSection({
  render: renderSolutionCards,
  kind: "solution-cards",
  category: "Solutions",
  description: "Section heading, lead and ordered image cards linked to solution pages",
  content: {
    heading: "Insurance services",
    intro: "Choose a service to learn more.",
    items: [{ solutionSlug: "health", imageUrl: "", imageAlt: "", href: "", position: 1 }],
  },
});
