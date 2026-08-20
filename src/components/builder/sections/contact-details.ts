import { baseContent, defineStructuredSection } from "./shared";
import { renderContactDetails } from "./contact-details.render";

export const contactDetailsSection = defineStructuredSection({
  render: renderContactDetails,
  kind: "contact-details",
  category: "Contact and forms",
  description: "Section heading, lead and linked phone, email or other contact methods",
  content: {
    ...baseContent,
    heading: "Contact us",
    layout: "rows",
    items: [
      { label: "Phone", value: "+961", href: "tel:+961", icon: "phone" },
      { label: "Email", value: "info@example.com", href: "mailto:info@example.com", icon: "mail" },
      { label: "Address", value: "Add your office address", href: "", icon: "map-pin" },
    ],
  },
});
