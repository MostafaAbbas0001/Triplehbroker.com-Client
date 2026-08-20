import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
export function renderEditorialStory({ heading, intro, items }: SectionRenderProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
      <div>
        <h2 className="type-h2 max-w-[16ch]">{heading}</h2>
        {intro ? <p className="type-lead mt-5">{intro}</p> : null}
      </div>
      <div className="max-w-2xl space-y-6">
        {items.map((item, index) => (
          <p key={index} className="type-body">
            {stringValue(item["text"])}
          </p>
        ))}
      </div>
    </div>
  );
}
