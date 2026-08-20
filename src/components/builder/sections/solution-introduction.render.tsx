import { ActionAnchor } from "@/components/site/primitives";
import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
export function renderSolutionIntroduction({ content }: SectionRenderProps) {
  return (
    <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
      <div>
        {stringValue(content["eyebrow"]) ? (
          <p className="type-label">{stringValue(content["eyebrow"])}</p>
        ) : null}
        <h1 className="type-h1 mt-10">{stringValue(content["heading"])}</h1>
        <p className="type-lead mt-8 max-w-lg">{stringValue(content["intro"])}</p>
      </div>
      <div className="self-end">
        <div className="border-t border-border pt-7">
          <p className="type-label">{stringValue(content["audienceHeading"])}</p>
          <p className="type-body mt-4">{stringValue(content["audience"])}</p>
        </div>
        {stringValue(content["buttonLabel"]) ? (
          <ActionAnchor href={stringValue(content["buttonHref"]) || "#"} className="mt-10">
            {stringValue(content["buttonLabel"])}
          </ActionAnchor>
        ) : null}
      </div>
    </div>
  );
}
