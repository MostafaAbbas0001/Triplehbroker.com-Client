import { ActionAnchor } from "@/components/site/primitives";
import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";

export function renderSolutionsCatalog({ headingBlock, items }: SectionRenderProps) {
  return (
    <>
      {headingBlock}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <article key={index} className="overflow-hidden border border-border bg-background">
            {stringValue(item["imageUrl"]) ? (
              <img
                src={stringValue(item["imageUrl"])}
                alt={stringValue(item["imageAlt"])}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : null}
            <div className="p-7">
              <h3 className="type-h3">{stringValue(item["title"])}</h3>
              <p className="type-body mt-4">{stringValue(item["summary"])}</p>
              {stringValue(item["href"]) ? (
                <ActionAnchor className="mt-7" href={stringValue(item["href"])} variant="ghost">
                  {stringValue(item["linkLabel"]) || "Learn more"}
                </ActionAnchor>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
