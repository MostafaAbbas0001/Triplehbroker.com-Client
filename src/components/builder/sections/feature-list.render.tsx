import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
export function renderFeatureList({ headingBlock, items }: SectionRenderProps) {
  return (
    <>
      {headingBlock}
      <ul className="grid gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <li key={index} className="border-b border-border py-4 text-foreground">
            {stringValue(item["text"])}
          </li>
        ))}
      </ul>
    </>
  );
}
