import type { CSSProperties, ReactNode } from "react";
import type { BuilderNode, JsonValue } from "@/services/builderService";
import { ActionAnchor, Container, MediaStage, SectionHeading } from "@/components/site/primitives";
import { cn } from "@/lib/utils";
import { sectionRegistry } from "./registry";
import type { BuilderSectionKind } from "./types";
import type { SectionRenderContext } from "./rendering";
import { objectArray, objectValue, stringValue } from "./rendering";

export function renderManagedLegacySection(
  node: BuilderNode,
  context: SectionRenderContext,
  common: { "data-builder-id": string; style: CSSProperties },
): ReactNode {
  const content = objectValue(node.content);
  const bordered = objectValue(node.styles)["bordered"] === true;
  const sectionClass = cn("relative", bordered && "border-t border-border");

  if (node.type === "hero") {
    const heading = stringValue(content["heading"] ?? content["title"]);
    const desktopImage = stringValue(content["desktopImageUrl"] ?? content["heroImageUrl"]);
    const mobileImage = stringValue(content["mobileImageUrl"]) || desktopImage;
    const buttons = objectArray(content["buttons"]);
    const singleButton = objectValue(content["button"]);
    if (Object.keys(singleButton).length) buttons.push(singleButton);
    return (
      <MediaStage
        {...common}
        src={desktopImage}
        mobileSrc={mobileImage}
        alt={stringValue(content["imageAlt"] ?? content["officeImageAlt"])}
        height={node.styles?.["preset"] === "cinematic-full" ? "full" : "tall"}
        brandSideOverlay
        topOverlay
        align="center"
        priority
      >
        <Container className="w-full">
          <div className="max-w-3xl">
            {stringValue(content["eyebrow"]) ? (
              <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-inverse-muted">
                {stringValue(content["eyebrow"])}
              </p>
            ) : null}
            <h1 className="type-h1 mt-8 max-w-[18ch] text-inverse-foreground">{heading}</h1>
            {stringValue(content["lead"]) ? (
              <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-inverse-muted">
                {stringValue(content["lead"])}
              </p>
            ) : null}
            {buttons.length ? (
              <div className="mt-11 flex flex-wrap gap-4">
                {buttons.map((button, index) => (
                  <ActionAnchor
                    key={index}
                    href={stringValue(button["href"]) || "#"}
                    variant="inverse"
                  >
                    {stringValue(button["label"])}
                  </ActionAnchor>
                ))}
              </div>
            ) : null}
          </div>
        </Container>
      </MediaStage>
    );
  }

  if (node.type === "catalog") {
    return (
      <section {...common} className={sectionClass}>
        <Container>
          {renderRegisteredStructuredSection("automatic-solution-catalog", node, content, context)}
        </Container>
      </section>
    );
  }
  if (node.type === "insurance-services") {
    return (
      <section {...common} className={sectionClass}>
        <Container>
          {renderRegisteredStructuredSection("solution-cards", node, content, context)}
        </Container>
      </section>
    );
  }

  const items = objectArray(content["items"] ?? content["steps"]);
  if (node.type === "why-triple-h") {
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <SectionHeading
              eyebrow={stringValue(content["eyebrow"])}
              title={stringValue(content["title"])}
              lead={stringValue(content["lead"])}
            />
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {items.map((item, index) => (
                <li key={index} className="border-t border-border py-6">
                  <h3 className="type-h4">{stringValue(item["title"])}</h3>
                  <p className="type-small mt-3 max-w-md">{stringValue(item["body"])}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>
    );
  }
  if (node.type === "story") {
    const paragraphs = Array.isArray(content["items"]) ? content["items"].map(stringValue) : [];
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <h2 className="type-h2 max-w-[16ch]">{paragraphs[0]}</h2>
            <div className="max-w-2xl space-y-6">
              {paragraphs.slice(1).map((paragraph, index) => (
                <p key={index} className="type-body">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }
  if (node.type === "facts") {
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <SectionHeading
            title={stringValue(content["title"])}
            lead={stringValue(content["lead"])}
          />
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
              <div key={index} className="border-t border-border pt-6">
                <dt className="type-caption">{stringValue(item["label"])}</dt>
                <dd className="type-small mt-4 text-foreground">{stringValue(item["value"])}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
    );
  }
  if (node.type === "commitments" || node.type === "process") {
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <SectionHeading
            title={stringValue(content["title"])}
            lead={stringValue(content["lead"])}
          />
          <ol className="mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
              <li key={index} className="border-t border-border pt-7">
                <span className="type-caption tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="type-h4 mt-5">{stringValue(item["title"])}</h3>
                <p className="type-small mt-4">{stringValue(item["body"])}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    );
  }
  if (node.type === "prepare") {
    const entries = Array.isArray(content["items"]) ? content["items"].map(stringValue) : [];
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <SectionHeading
            title={stringValue(content["title"])}
            lead={stringValue(content["lead"])}
          />
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {entries.map((entry, index) => (
              <li key={index} className="border-b border-border py-5 type-small">
                {entry}
              </li>
            ))}
          </ul>
        </Container>
      </section>
    );
  }
  if (node.type === "claims-desk") {
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <SectionHeading
            title={stringValue(content["title"])}
            lead={stringValue(content["body"])}
          />
        </Container>
      </section>
    );
  }
  if (node.type === "question-groups") {
    return (
      <div {...common}>
        {items.map((group, groupIndex) => (
          <section key={groupIndex} className="section-y border-t border-border">
            <Container>
              <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
                <SectionHeading
                  title={stringValue(group["title"])}
                  lead={stringValue(group["lead"])}
                />
                <div className="border-t border-border">
                  {objectArray(group["items"]).map((item, index) => (
                    <details key={index} className="border-b border-border py-5">
                      <summary className="cursor-pointer list-none type-h4">
                        {stringValue(item["question"])}
                      </summary>
                      <p className="type-small max-w-2xl pt-5">{stringValue(item["answer"])}</p>
                    </details>
                  ))}
                </div>
              </div>
            </Container>
          </section>
        ))}
      </div>
    );
  }
  if (node.type === "office") {
    const address = Array.isArray(content["address"]) ? content["address"].map(stringValue) : [];
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <SectionHeading
            title={stringValue(content["title"])}
            lead={stringValue(content["lead"])}
          />
          <address className="type-body mt-8 not-italic">
            {address.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </address>
        </Container>
      </section>
    );
  }
  if (node.type === "contact-methods") {
    const methods = ["phone", "whatsapp", "email"].map((key) => ({
      label: stringValue(content[`${key}Label`]),
      value: stringValue(content[key]),
      href:
        key === "email"
          ? `mailto:${stringValue(content[key])}`
          : `tel:${stringValue(content[key]).replace(/\s/g, "")}`,
    }));
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <SectionHeading
            title={stringValue(content["title"])}
            lead={stringValue(content["lead"])}
          />
          <div className="mt-8 grid gap-px border border-border bg-border md:grid-cols-3">
            {methods.map((method) => (
              <a key={method.label} href={method.href} className="bg-background p-7">
                <span className="type-caption block">{method.label}</span>
                <span className="mt-3 block text-foreground" dir="ltr">
                  {method.value}
                </span>
              </a>
            ))}
          </div>
        </Container>
      </section>
    );
  }
  if (node.type === "hours") {
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <SectionHeading
            title={stringValue(content["title"])}
            lead={stringValue(content["lead"])}
          />
          <dl className="mt-8 border-t border-border">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between border-b border-border py-4">
                <dt>{stringValue(item["day"])}</dt>
                <dd>{stringValue(item["time"])}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
    );
  }
  return null;
}

function renderRegisteredStructuredSection(
  kind: BuilderSectionKind,
  node: BuilderNode,
  content: Record<string, JsonValue>,
  context: SectionRenderContext,
): ReactNode {
  const items = objectArray(content["items"]);
  const heading = stringValue(content["heading"]);
  const intro = stringValue(content["intro"]);
  const headingBlock = (
    <div className="mb-10 max-w-3xl">
      {stringValue(content["eyebrow"]) ? (
        <p className="type-label mb-5">{stringValue(content["eyebrow"])}</p>
      ) : null}
      {heading ? <h2 className="type-h2">{heading}</h2> : null}
      {intro ? <p className="type-body mt-5">{intro}</p> : null}
    </div>
  );
  const definition = sectionRegistry[kind];
  if (!definition.structured) throw new Error(`Section ${kind} is not structured`);
  return definition.render({ node, content, items, heading, intro, headingBlock, context });
}
