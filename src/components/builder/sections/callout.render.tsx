import { ActionAnchor } from "@/components/site/primitives";
import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
export function renderCallout({ content, headingBlock }: SectionRenderProps) {
  return (
    <div className="max-w-3xl">
      {headingBlock}
      {stringValue(content["buttonLabel"]) ? (
        <ActionAnchor href={stringValue(content["buttonHref"]) || "#"}>
          {stringValue(content["buttonLabel"])}
        </ActionAnchor>
      ) : null}
    </div>
  );
}
