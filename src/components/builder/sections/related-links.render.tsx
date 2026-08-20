import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
export function renderRelatedLinks({ content, items }: SectionRenderProps) {
  return (
    <>
      <h2 className="type-h3">{stringValue(content["heading"])}</h2>
      {stringValue(content["intro"]) ? (
        <p className="type-body mt-4 max-w-2xl">{stringValue(content["intro"])}</p>
      ) : null}
      <ul className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item, index) => (
          <li key={index} className="border-t border-border">
            <a
              href={stringValue(item["href"]) || "#"}
              className="block py-6 text-[0.9375rem] text-foreground transition-colors duration-[var(--duration-base)] hover:text-primary"
            >
              {stringValue(item["label"])}
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
