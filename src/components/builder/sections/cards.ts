import { createHeading, createNode, createParagraph, defineLegacySection } from "./shared";
import { renderCardsSection } from "./cards.render";

export const cardsSection = defineLegacySection({
  renderLegacy: renderCardsSection,
  kind: "cards",
  category: "Collections",
  description: "Section heading, lead and editable cards with optional media and links",
  content: () => [
    createHeading("Featured information"),
    createParagraph("Add a clear lead for this collection."),
    createNode(
      "grid",
      undefined,
      {
        desktop: { gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" },
        mobile: { gridTemplateColumns: "1fr" },
      },
      [1, 2, 3].map((index) =>
        createNode(
          "stack",
          undefined,
          { desktop: { padding: "28px", border: "1px solid var(--border)", gap: "12px" } },
          [createHeading(`Card ${index}`, 3), createParagraph("Add supporting details here.")],
        ),
      ),
    ),
  ],
});
