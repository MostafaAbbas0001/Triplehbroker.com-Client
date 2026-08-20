import { defineStructuredSection } from "./shared";
import { renderRelatedLinks } from "./related-links.render";

export const relatedLinksSection = defineStructuredSection({
  render: renderRelatedLinks,
  kind: "related-links",
  category: "Solutions",
  description: "Section heading and lead above automatic links to other solution pages",
  content: { heading: "Other solutions", intro: "Explore other available insurance solutions." },
});
