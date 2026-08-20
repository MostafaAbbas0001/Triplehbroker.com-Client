import { createHeading, createParagraph, defineLegacySection } from "./shared";
import { renderTextSection } from "./text.render";

export const textSection = defineLegacySection({
  renderLegacy: renderTextSection,
  kind: "text",
  category: "Essentials",
  description: "Section heading and lead",
  content: () => [
    createHeading("Section heading"),
    createParagraph("Add your section content here."),
  ],
});
