import { createHeading, createNode, createParagraph, defineLegacySection } from "./shared";
import { renderCallToActionSection } from "./call-to-action.render";

export const callToActionSection = defineLegacySection({
  renderLegacy: renderCallToActionSection,
  kind: "call-to-action",
  category: "Essentials",
  description: "Section heading, lead, responsive background and optional buttons",
  tone: "inverse",
  content: () => [
    createHeading("Ready to get started?"),
    createParagraph("Invite visitors to take the next step."),
    createNode("button", { label: "Contact us", href: "/contact", variant: "inverse" }),
  ],
});
