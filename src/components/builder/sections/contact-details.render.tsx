import { cn } from "@/lib/utils";
import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
import { ContactIcon } from "./rendering-widgets";

export function renderContactDetails({ content, headingBlock, items }: SectionRenderProps) {
  const rows = stringValue(content["layout"]) === "rows";
  return (
    <>
      {headingBlock}
      <div
        className={
          rows
            ? "border-t border-border"
            : "grid gap-px border border-border bg-border md:grid-cols-3"
        }
      >
        {items.map((item, index) => {
          const value = stringValue(item["value"]);
          const href = stringValue(item["href"]);
          return (
            <div
              key={index}
              className={
                rows
                  ? "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-b border-border py-4"
                  : "bg-background p-7"
              }
            >
              <p
                className={cn(
                  rows ? "flex items-center gap-3 text-sm text-foreground" : "type-caption",
                )}
              >
                <ContactIcon
                  name={stringValue(item["icon"])}
                  className="shrink-0 text-muted-foreground"
                />
                {stringValue(item["label"])}
              </p>
              {href ? (
                <a
                  className={cn("block text-foreground hover:text-primary", !rows && "mt-3")}
                  href={href}
                >
                  {value}
                </a>
              ) : (
                <p className={cn("text-foreground", !rows && "mt-3")}>{value}</p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
