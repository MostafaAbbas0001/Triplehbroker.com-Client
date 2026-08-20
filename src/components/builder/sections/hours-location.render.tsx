import { ActionAnchor } from "@/components/site/primitives";
import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
import { ContactIcon } from "./rendering-widgets";

export function renderHoursLocation({ content, headingBlock, items }: SectionRenderProps) {
  const rows = stringValue(content["layout"]) === "rows";
  const hours = (
    <dl className="min-w-0 flex-1 border-t border-border">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between gap-6 border-b border-border py-4">
          <dt className="text-foreground">{stringValue(item["day"])}</dt>
          <dd className="type-small text-end">{stringValue(item["time"])}</dd>
        </div>
      ))}
    </dl>
  );
  if (rows)
    return (
      <>
        {headingBlock}
        <div className="flex items-center gap-2">
          <ContactIcon
            name={stringValue(content["icon"]) || "clock"}
            className="text-muted-foreground"
          />
          {hours}
        </div>
      </>
    );
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div>
        {headingBlock}
        <p className="type-body whitespace-pre-line">{stringValue(content["address"])}</p>
        {stringValue(content["mapUrl"]) ? (
          <ActionAnchor className="mt-7" href={stringValue(content["mapUrl"])} variant="secondary">
            {stringValue(content["mapLabel"]) || "View map"}
          </ActionAnchor>
        ) : null}
      </div>
      {hours}
    </div>
  );
}
