import { SectionHeading } from "@/components/site/primitives";
import type { JsonValue, SolutionPageSummary } from "@/services/builderService";
import type { SectionRenderProps } from "./rendering";
import { numberValue, objectArray, stringValue } from "./rendering";

export function renderSolutionCards({ content, context }: SectionRenderProps) {
  const configured = objectArray(content["items"]);
  const summaryBySlug = new Map(
    context.solutionSummaries.map((summary) => [
      summary.slug.split("/").filter(Boolean).at(-1),
      summary,
    ]),
  );
  const cards = (
    configured.length
      ? configured
          .sort((a, b) => numberValue(a["position"], 999) - numberValue(b["position"], 999))
          .map((item) => ({ item, summary: summaryBySlug.get(stringValue(item["solutionSlug"])) }))
          .filter((entry) => entry.summary)
      : [...context.solutionSummaries]
          .sort((a, b) => a.position - b.position)
          .map((summary) => ({ item: {}, summary }))
  ) as Array<{ item: Record<string, JsonValue>; summary: SolutionPageSummary }>;
  return (
    <>
      <SectionHeading
        eyebrow={stringValue(content["eyebrow"])}
        title={stringValue(content["heading"] ?? content["title"])}
        lead={stringValue(content["intro"] ?? content["lead"])}
      />
      <ul className="mt-16 grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ item, summary }, index) => (
          <li key={`${summary.id}-${index}`}>
            <a
              href={stringValue(item["href"]) || `/${summary.slug}`}
              className="group relative flex aspect-[4/5] size-full flex-col overflow-hidden bg-muted"
            >
              <img
                src={stringValue(item["imageUrl"]) || summary.imageUrl || ""}
                alt={stringValue(item["imageAlt"])}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="relative flex size-full flex-col justify-end p-8 sm:p-10">
                <span className="type-caption text-inverse-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="type-h3 mt-4 text-inverse-foreground">{summary.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-inverse-muted">
                  {summary.summary}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
