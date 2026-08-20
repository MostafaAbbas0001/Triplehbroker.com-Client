import { defineStructuredSection } from "./shared";
import { renderSolutionIntroduction } from "./solution-introduction.render";

export const solutionIntroductionSection = defineStructuredSection({
  render: renderSolutionIntroduction,
  kind: "solution-introduction",
  category: "Solutions",
  description: "Solution heading, lead, intended audience and quote action",
  content: {
    eyebrow: "Insurance solutions",
    heading: "Solution name",
    intro: "Explain this solution and why it matters.",
    audienceHeading: "Who it is for",
    audience: "Describe the people or businesses this solution is intended for.",
    buttonLabel: "Request a quote",
    buttonHref: "/quote",
  },
});
