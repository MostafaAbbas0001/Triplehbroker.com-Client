import { baseContent, defineStructuredSection } from "./shared";
import { renderHoursLocation } from "./hours-location.render";

export const hoursLocationSection = defineStructuredSection({
  render: renderHoursLocation,
  kind: "hours-location",
  category: "Contact and forms",
  description: "Section heading, lead, address, map link and daily opening hours",
  content: {
    ...baseContent,
    eyebrow: "Opening hours",
    heading: "Visit our office",
    layout: "rows",
    icon: "clock",
    address: "Add your office address",
    mapLabel: "View on map",
    mapUrl: "",
    items: [{ day: "Monday – Friday", time: "Open 24 hours" }],
  },
});
