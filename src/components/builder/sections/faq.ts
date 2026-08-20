import { baseContent, defineStructuredSection } from "./shared";
import { renderFaq } from "./faq.render";

export const faqSection = defineStructuredSection({
  render: renderFaq,
  kind: "faq",
  category: "Engagement",
  description: "Section heading, lead and expandable questions with answers",
  content: {
    ...baseContent,
    heading: "Frequently asked questions",
    showArrows: true,
    smoothMotion: true,
    items: [
      { question: "Add your first question", answer: "Write a clear and helpful answer." },
      { question: "Add another question", answer: "Write a clear and helpful answer." },
    ],
  },
});
