import { baseContent, defineStructuredSection } from "./shared";
import { renderSteps } from "./steps.render";

export const stepsSection = defineStructuredSection({
  render: renderSteps,
  kind: "steps",
  category: "Collections",
  description: "Section heading, lead and numbered steps with titles and descriptions",
  content: {
    ...baseContent,
    heading: "How it works",
    layout: "grid",
    items: [
      { title: "Tell us what you need", body: "Share your situation and priorities." },
      { title: "Compare your options", body: "We review suitable coverage from the market." },
      { title: "Stay protected", body: "We remain available when you need support." },
    ],
  },
});
