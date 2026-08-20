import { cn } from "@/lib/utils";
import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";

export function renderSteps({ content, headingBlock, items }: SectionRenderProps) {
  const split = stringValue(content["layout"]) === "split";
  const list = (
    <div
      className={cn(
        "grid",
        split ? "gap-x-10 sm:grid-cols-2" : "gap-8 md:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {items.map((item, index) => (
        <article key={index} className="border-t border-border pt-6">
          {!split ? (
            <span className="type-caption text-primary">{String(index + 1).padStart(2, "0")}</span>
          ) : null}
          <h3 className={cn("type-h3", !split && "mt-5")}>{stringValue(item["title"])}</h3>
          <p className="type-body mt-4">{stringValue(item["body"])}</p>
        </article>
      ))}
    </div>
  );
  return split ? (
    <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
      {headingBlock}
      {list}
    </div>
  ) : (
    <>
      {headingBlock}
      {list}
    </>
  );
}
