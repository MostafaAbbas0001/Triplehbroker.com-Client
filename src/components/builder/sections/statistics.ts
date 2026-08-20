import { baseContent, defineStructuredSection } from "./shared";
import { renderStatistics } from "./statistics.render";

export const statisticsSection = defineStructuredSection({
  render: renderStatistics,
  kind: "statistics",
  category: "Collections",
  description: "Section heading, lead and facts with a value and label",
  content: {
    ...baseContent,
    heading: "Key facts",
    layout: "boxed",
    items: [
      { value: "24/7", label: "Client support" },
      { value: "100%", label: "Independent advice" },
      { value: "15+", label: "Insurance solutions" },
    ],
  },
});
