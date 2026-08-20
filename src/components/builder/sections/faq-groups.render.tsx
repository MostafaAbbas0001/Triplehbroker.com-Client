import type { JsonValue } from "@/services/builderService";
import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
import { SectionAccordionItem } from "./rendering-widgets";
export function renderFaqGroups({ content, headingBlock, items }: SectionRenderProps) {
  const groups = new Map<string, Array<Record<string, JsonValue>>>();
  items.forEach((item) => {
    const group = stringValue(item["group"]) || "Questions";
    groups.set(group, [...(groups.get(group) ?? []), item]);
  });
  return (
    <>
      {headingBlock}
      <div className="space-y-14">
        {[...groups].map(([group, questions]) => (
          <div key={group} className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <h3 className="type-h3">{group}</h3>
            <div className="border-t border-border">
              {questions.map((item, index) => (
                <SectionAccordionItem
                  key={index}
                  question={stringValue(item["question"])}
                  answer={stringValue(item["answer"])}
                  showArrow={content["showArrows"] !== false}
                  smooth={content["smoothMotion"] !== false}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
