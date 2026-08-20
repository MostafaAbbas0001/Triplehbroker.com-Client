import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
import { SectionAccordionItem } from "./rendering-widgets";
export function renderFaq({ content, headingBlock, items }: SectionRenderProps) {
  return (
    <>
      {headingBlock}
      <div className="border-t border-border">
        {items.map((item, index) => (
          <SectionAccordionItem
            key={index}
            question={stringValue(item["question"])}
            answer={stringValue(item["answer"])}
            showArrow={content["showArrows"] !== false}
            smooth={content["smoothMotion"] !== false}
            large
          />
        ))}
      </div>
    </>
  );
}
