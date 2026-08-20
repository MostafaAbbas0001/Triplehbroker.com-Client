import { baseContent, defineStructuredSection } from "./shared";
import { MultiStepFormSectionRenderer } from "./multi-step-form.render";

export const multiStepFormSection = defineStructuredSection({
  render: MultiStepFormSectionRenderer,
  kind: "multi-step-form",
  category: "Contact and forms",
  description: "Section heading, lead and configurable fields grouped into named steps",
  content: {
    ...baseContent,
    heading: "Request a quote",
    recipient: "",
    submitLabel: "Send",
    items: [
      {
        step: "Contact details",
        label: "Name",
        name: "name",
        type: "text",
        placeholder: "Your name",
        required: true,
      },
      {
        step: "Contact details",
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "you@example.com",
        required: true,
      },
      {
        step: "Request",
        label: "Message",
        name: "message",
        type: "textarea",
        placeholder: "How can we help?",
        required: true,
      },
    ],
  },
});
