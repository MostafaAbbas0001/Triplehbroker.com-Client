import { defineStructuredSection } from "./shared";
import { renderAddressBlock } from "./address-block.render";

export const addressBlockSection = defineStructuredSection({
  render: renderAddressBlock,
  kind: "address-block",
  category: "Contact and forms",
  description: "Section heading, lead, postal address and optional map link",
  content: {
    eyebrow: "Our office",
    heading: "Our office",
    intro: "Visit or contact our office.",
    layout: "compact",
    icon: "map-pin",
    address: "Company name\nStreet and building\nCity, Country",
    mapLabel: "View map",
    mapUrl: "",
  },
});
