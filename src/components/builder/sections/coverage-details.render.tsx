import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
export function renderCoverageDetails({ content, items }: SectionRenderProps) {
  return (
    <>
      {stringValue(content["intro"]) ? (
        <p className="type-lead mb-12 max-w-3xl">{stringValue(content["intro"])}</p>
      ) : null}
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div>
          <h2 className="type-h2">{stringValue(content["heading"])}</h2>
          <ul className="mt-10">
            {items.map((item, index) => (
              <li key={index} className="border-b border-border py-5 type-small">
                {stringValue(item["text"])}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="type-h2">{stringValue(content["helpHeading"])}</h2>
          <p className="type-body mt-10 max-w-xl">{stringValue(content["help"])}</p>
        </div>
      </div>
    </>
  );
}
