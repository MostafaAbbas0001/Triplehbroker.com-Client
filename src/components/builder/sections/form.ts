import { baseContent, defineStructuredSection } from "./shared";
import { FormSectionRenderer } from "./form.render";

export const formSection = defineStructuredSection({
  render: FormSectionRenderer,
  kind: "form",
  category: "Contact and forms",
  description: "Section heading, lead, recipient, submit label and configurable fields",
  content: {
    ...baseContent,
    heading: "Send us a message",
    appearance: "boxed",
    columns: 1,
    optionalLabel: "Optional",
    recipient: "",
    submitLabel: "Send",
    items: [
      { label: "Name", name: "name", type: "text", placeholder: "Your name", required: true },
      {
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "you@example.com",
        required: true,
      },
      {
        label: "Message",
        name: "message",
        type: "textarea",
        placeholder: "How can we help?",
        required: true,
      },
    ],
  },
});
