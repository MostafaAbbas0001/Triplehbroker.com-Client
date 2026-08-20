import { defineStructuredSection } from "./shared";
import { renderFaqGroups } from "./faq-groups.render";

export const faqGroupsSection = defineStructuredSection({
  render: renderFaqGroups,
  kind: "faq-groups",
  category: "Engagement",
  description: "Grouped questions and answers with a section heading and lead",
  content: {
    heading: "Frequently asked questions",
    intro: "Find clear answers to common questions.",
    showArrows: true,
    smoothMotion: true,
    items: [{ group: "General", question: "New question", answer: "Write the answer here." }],
  },
});
