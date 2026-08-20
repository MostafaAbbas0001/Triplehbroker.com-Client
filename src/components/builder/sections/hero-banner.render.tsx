import { ActionAnchor } from "@/components/site/primitives";
import type { SectionRenderProps } from "./rendering";
import { buttonVariant, objectArray, stringValue } from "./rendering";

export function renderHeroBanner({ content }: SectionRenderProps) {
  const buttons = objectArray(content["items"]);
  const heading = stringValue(content["heading"]) || stringValue(content["title"]);
  const intro = stringValue(content["intro"]) || stringValue(content["lead"]);
  return (
    <div className="max-w-3xl text-[color:var(--hero-heading)]">
      {stringValue(content["eyebrow"]) ? (
        <p className="type-label text-inverse-muted">{stringValue(content["eyebrow"])}</p>
      ) : null}
      <h1 className="type-h1 mt-8 max-w-[18ch] text-inverse-foreground">{heading}</h1>
      {intro ? (
        <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-inverse-muted">
          {intro}
        </p>
      ) : null}
      {buttons.length ? (
        <div className="mt-10 flex flex-wrap gap-4">
          {buttons.map((button, index) => (
            <ActionAnchor
              key={index}
              href={stringValue(button["href"]) || "#"}
              variant={
                buttonVariant(button["variant"]) === "inverseOutline" ? "inverseOutline" : "inverse"
              }
            >
              {stringValue(button["label"])}
            </ActionAnchor>
          ))}
        </div>
      ) : null}
    </div>
  );
}
