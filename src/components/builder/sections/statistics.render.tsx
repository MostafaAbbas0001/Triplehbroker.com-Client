import { cn } from "@/lib/utils";
import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";

export function renderStatistics({ node, content, headingBlock, items }: SectionRenderProps) {
  const savedLayout = stringValue(content["layout"]);
  const minimal =
    savedLayout === "minimal" || (!savedLayout && node.styles?.["preset"] === "numbered-grid");
  return (
    <>
      {headingBlock}
      <div
        className={cn(
          "grid sm:grid-cols-2 lg:grid-cols-4",
          minimal ? "gap-x-10 gap-y-8" : "gap-px border border-border bg-border",
        )}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={minimal ? "border-t border-border pt-6" : "bg-background p-7"}
          >
            {minimal ? (
              <>
                <p className="type-caption">{stringValue(item["label"])}</p>
                <p className="type-small mt-4 text-foreground">{stringValue(item["value"])}</p>
              </>
            ) : (
              <>
                <p className="font-display text-4xl text-primary">{stringValue(item["value"])}</p>
                <p className="type-small mt-3">{stringValue(item["label"])}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
