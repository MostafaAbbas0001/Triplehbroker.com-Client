import { ActionAnchor } from "@/components/site/primitives";
import { cn } from "@/lib/utils";
import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
import { ContactIcon } from "./rendering-widgets";

export function renderAddressBlock({ content, headingBlock }: SectionRenderProps) {
  const address = Array.isArray(content["address"])
    ? content["address"].map(stringValue)
    : stringValue(content["address"]).split("\n").filter(Boolean);
  const compact = stringValue(content["layout"]) === "compact";
  return (
    <>
      {headingBlock}
      <div className={cn("flex items-start gap-3", compact && "type-small")}>
        <ContactIcon
          name={stringValue(content["icon"]) || "map-pin"}
          className="mt-1 shrink-0 text-muted-foreground"
        />
        <address className="not-italic">
          {address.map((line, index) => (
            <span key={index} className="block">
              {line}
            </span>
          ))}
        </address>
      </div>
      {stringValue(content["mapUrl"]) ? (
        <ActionAnchor className="mt-7" href={stringValue(content["mapUrl"])}>
          {stringValue(content["mapLabel"]) || "View map"}
        </ActionAnchor>
      ) : null}
    </>
  );
}
