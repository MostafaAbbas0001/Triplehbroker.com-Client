import { defineStructuredSection } from "./shared";
import { renderEditorialStory } from "./editorial-story.render";

export const editorialStorySection = defineStructuredSection({
  render: renderEditorialStory,
  kind: "editorial-story",
  category: "Essentials",
  description: "Section heading, lead and editable story paragraphs",
  content: {
    heading: "Our story",
    intro: "Introduce this story and explain why it matters.",
    items: [{ text: "Add the first story paragraph." }],
  },
});
