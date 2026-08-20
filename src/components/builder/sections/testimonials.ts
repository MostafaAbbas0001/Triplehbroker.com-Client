import { baseContent, defineStructuredSection } from "./shared";
import { renderTestimonials } from "./testimonials.render";

export const testimonialsSection = defineStructuredSection({
  render: renderTestimonials,
  kind: "testimonials",
  category: "Engagement",
  description: "Section heading, lead and quotes with customer names and roles",
  content: {
    ...baseContent,
    heading: "What our clients say",
    items: [{ quote: "Add a customer testimonial.", name: "Customer name", role: "Customer" }],
  },
});
