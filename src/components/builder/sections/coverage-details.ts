import { defineStructuredSection } from "./shared";
import { renderCoverageDetails } from "./coverage-details.render";

export const coverageDetailsSection = defineStructuredSection({
  render: renderCoverageDetails,
  kind: "coverage-details",
  category: "Solutions",
  description: "Section heading, lead, coverage items and how-you-help content",
  content: {
    heading: "What it covers",
    intro: "Review the main areas of cover.",
    helpHeading: "How we help",
    help: "Explain how you advise and support the client.",
    items: [{ text: "Add the first covered item" }, { text: "Add another covered item" }],
  },
});
