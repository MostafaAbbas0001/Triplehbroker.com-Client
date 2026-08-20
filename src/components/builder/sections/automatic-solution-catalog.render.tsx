import { SectionHeading } from "@/components/site/primitives";
import type { SectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";

export function renderAutomaticSolutionCatalog({ content, context }: SectionRenderProps) {
  return (
    <>
      <SectionHeading
        eyebrow={stringValue(content["eyebrow"])}
        title={stringValue(content["heading"] ?? content["title"]) || "Insurance solutions"}
        lead={stringValue(content["intro"] ?? content["lead"])}
      />
      <ul className="mt-12">
        {[...context.solutionSummaries]
          .sort((a, b) => a.position - b.position)
          .map((item, index) => (
            <li key={item.id} className="border-t border-border last:border-b">
              <a
                href={`/${item.slug}`}
                className="group grid gap-5 py-8 sm:grid-cols-[4rem_0.9fr_1.1fr] sm:items-center md:gap-8"
              >
                <span className="type-caption tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="type-h3 group-hover:text-primary">{item.title}</h3>
                <p className="type-small max-w-xl">{item.summary}</p>
              </a>
            </li>
          ))}
      </ul>
    </>
  );
}
