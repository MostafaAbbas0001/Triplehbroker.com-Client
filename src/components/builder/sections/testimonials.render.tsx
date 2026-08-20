import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
export function renderTestimonials({ headingBlock, items }: SectionRenderProps) {
  return (
    <>
      {headingBlock}
      <div className="grid gap-6 lg:grid-cols-3">
        {items.map((item, index) => (
          <figure key={index} className="border border-border p-7">
            <blockquote className="type-body">“{stringValue(item["quote"])}”</blockquote>
            <figcaption className="mt-7">
              <strong className="block text-foreground">{stringValue(item["name"])}</strong>
              <span className="type-caption mt-1 block">{stringValue(item["role"])}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
