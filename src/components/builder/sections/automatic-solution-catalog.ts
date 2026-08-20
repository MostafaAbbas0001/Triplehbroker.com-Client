import { defineStructuredSection } from "./shared";
import { renderAutomaticSolutionCatalog } from "./automatic-solution-catalog.render";

export const automaticSolutionCatalogSection = defineStructuredSection({
  render: renderAutomaticSolutionCatalog,
  kind: "automatic-solution-catalog",
  category: "Solutions",
  description: "Section heading and lead above a list generated from solution pages",
  content: {
    heading: "Insurance solutions",
    intro: "Choose a solution to learn what it covers and who it is for.",
  },
});
