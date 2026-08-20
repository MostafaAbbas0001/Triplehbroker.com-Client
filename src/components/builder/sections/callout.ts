import { defineStructuredSection } from "./shared";
import { renderCallout } from "./callout.render";

export const calloutSection = defineStructuredSection({
  render: renderCallout,
  kind: "callout",
  category: "Essentials",
  description: "Section heading, lead and an optional action button",
  content: {
    heading: "Need help?",
    intro: "Explain the next step clearly.",
    buttonLabel: "Contact us",
    buttonHref: "/contact",
  },
});
