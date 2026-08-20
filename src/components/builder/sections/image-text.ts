import { createHeading, createNode, createParagraph, defineLegacySection } from "./shared";
import { renderImageTextSection } from "./image-text.render";

export const imageTextSection = defineLegacySection({
  renderLegacy: renderImageTextSection,
  kind: "image-text",
  category: "Essentials",
  description: "Section heading, lead, image, description, caption and optional buttons",
  content: () => [
    createNode(
      "grid",
      undefined,
      {
        desktop: { gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" },
        mobile: { gridTemplateColumns: "1fr", gap: "24px" },
      },
      [
        createNode("stack", undefined, { desktop: { gap: "24px" } }, [
          createHeading("Section heading"),
          createParagraph("Explain this section and why it matters to the reader."),
        ]),
        createNode(
          "image",
          { url: "/site-assets/global/logo.png", alt: "", caption: "" },
          { desktop: { aspectRatio: "4 / 3" } },
        ),
      ],
    ),
  ],
});
