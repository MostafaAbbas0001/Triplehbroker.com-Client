import { baseContent, defineStructuredSection } from "./shared";
import { renderFeatureList } from "./feature-list.render";

export const featureListSection = defineStructuredSection({
  render: renderFeatureList,
  kind: "feature-list",
  category: "Collections",
  description: "Section heading, lead and a checklist of editable items",
  content: {
    ...baseContent,
    heading: "What to prepare",
    items: [{ text: "Add the first list item" }, { text: "Add another list item" }],
  },
});
