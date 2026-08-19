import { useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { BuilderDocument, BuilderNode, JsonValue } from "@/services/builderService";
import {
  ActionAnchor,
  Container,
  MediaStage,
  SectionHeading,
} from "@/components/site/primitives";
import { cn } from "@/lib/utils";
import type { SolutionPageSummary } from "@/services/builderService";

const allowedStyleProperties = new Set([
  "display",
  "position",
  "flexDirection",
  "flexWrap",
  "justifyContent",
  "alignItems",
  "alignSelf",
  "gap",
  "rowGap",
  "columnGap",
  "gridTemplateColumns",
  "gridColumn",
  "width",
  "maxWidth",
  "minWidth",
  "height",
  "minHeight",
  "maxHeight",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "background",
  "backgroundColor",
  "color",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textTransform",
  "textDecoration",
  "border",
  "borderWidth",
  "borderStyle",
  "borderColor",
  "borderRadius",
  "boxShadow",
  "opacity",
  "overflow",
  "objectFit",
  "aspectRatio",
  "zIndex",
]);

type BuilderRenderContext = {
  solutionSummaries: SolutionPageSummary[];
};

export function BuilderPageRenderer({
  document,
  solutionSummaries = [],
}: {
  document: BuilderDocument;
  solutionSummaries?: SolutionPageSummary[];
}) {
  const visibleNodes = document.children.filter((node) => node.visible !== false);
  const context = { solutionSummaries };
  const renderedGroups = new Set<string>();
  return (
    <>
      <style>{responsiveRules(document)}</style>
      {visibleNodes.map((node) => {
        const group = stringValue(node.settings?.["layoutGroup"]);
        if (!group) return <RenderNode key={node.id} node={node} context={context} />;
        if (renderedGroups.has(group)) return null;
        renderedGroups.add(group);
        return (
          <SectionLayoutGroup
            key={`layout-${group}`}
            nodes={visibleNodes.filter(
              (candidate) => stringValue(candidate.settings?.["layoutGroup"]) === group,
            )}
            context={context}
          />
        );
      })}
    </>
  );
}

function SectionLayoutGroup({
  nodes,
  context,
}: {
  nodes: BuilderNode[];
  context: BuilderRenderContext;
}) {
  const columns = new Map<number, BuilderNode[]>();
  nodes.forEach((node) => {
    const column = Math.max(1, Math.min(4, numberValue(node.settings?.["layoutColumn"], 1)));
    columns.set(column, [...(columns.get(column) ?? []), node]);
  });
  const orderedColumns = [...columns].sort(([left], [right]) => left - right);
  const gridClass =
    orderedColumns.length >= 4
      ? "lg:grid-cols-4"
      : orderedColumns.length === 3
        ? "lg:grid-cols-3"
        : orderedColumns.length === 2
          ? "lg:grid-cols-2"
          : "lg:grid-cols-1";
  return (
    <section className="section-y border-t border-border first:border-t-0">
      <Container>
        <div className={cn("grid gap-14 lg:gap-18", gridClass)}>
          {orderedColumns.map(([column, columnNodes]) => (
            <div key={column} className="space-y-12">
              {columnNodes.map((node) => (
                <RenderNode key={node.id} node={node} context={context} embedded />
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function RenderNode({
  node,
  inMediaSection = false,
  context,
  embedded = false,
}: {
  node: BuilderNode;
  inMediaSection?: boolean;
  context: BuilderRenderContext;
  embedded?: boolean;
}) {
  if (node.visible === false) return null;
  const content = objectValue(node.content);
  const children = renderChildren(
    node,
    inMediaSection || (node.type === "section" && isMediaSection(node)),
    context,
    embedded,
  );
  const common = {
    "data-builder-id": safeId(node.id),
    style: embedded
      ? { ...baseStyle(node), paddingTop: 0, paddingBottom: 0 }
      : baseStyle(node),
  };

  switch (node.type) {
    case "section":
      if (isStructuredSection(node)) {
        if (embedded) {
          return (
            <div {...common} id={stringValue(node.settings?.["anchor"]) || undefined}>
              {renderStructuredSection(node, context)}
            </div>
          );
        }
        if (node.settings?.["sectionType"] === "hero-banner") {
          const desktopImage = stringValue(content["desktopImageUrl"] ?? content["heroImageUrl"]);
          const mobileImage = stringValue(content["mobileImageUrl"]) || desktopImage;
          const heroContent = (
            <Container className="w-full">
              {renderStructuredSection(node, context)}
            </Container>
          );
          if (desktopImage) {
            return (
              <section {...common} id={stringValue(node.settings?.["anchor"]) || undefined}>
                <MediaStage
                  src={desktopImage}
                  mobileSrc={mobileImage}
                  alt={stringValue(content["imageAlt"] ?? content["officeImageAlt"])}
                  height={node.styles?.["preset"] === "cinematic-full" ? "full" : "tall"}
                  brandSideOverlay
                  topOverlay
                  align="center"
                  priority
                >
                  {heroContent}
                </MediaStage>
              </section>
            );
          }
          return (
            <section
              {...common}
              id={stringValue(node.settings?.["anchor"]) || undefined}
              className="flex min-h-[70svh] items-center overflow-hidden bg-primary py-24"
            >
              {heroContent}
            </section>
          );
        }
        return (
          <section
            {...common}
            id={stringValue(node.settings?.["anchor"]) || undefined}
            className={cn(
              !hasSpacing(node) && "section-y",
              (node.settings?.["bordered"] === true ||
                node.styles?.["bordered"] === true ||
                node.settings?.["sectionType"] === "coverage-details" ||
                node.settings?.["sectionType"] === "related-links") &&
                "border-t border-border",
            )}
          >
            <Container>{renderStructuredSection(node, context)}</Container>
          </section>
        );
      }
      if (isMediaSection(node)) {
        // Older editor builds accidentally stored these values in `content`.
        // Keep rendering those documents while all new edits use `settings`.
        const desktopImage =
          stringValue(node.settings?.["desktopImageUrl"]) ||
          stringValue(content["desktopImageUrl"]) ||
          stringValue(node.settings?.["mobileImageUrl"]) ||
          stringValue(content["mobileImageUrl"]);
        const mobileImage =
          stringValue(node.settings?.["mobileImageUrl"]) ||
          stringValue(content["mobileImageUrl"]) ||
          desktopImage;
        const imageAlt =
          stringValue(node.settings?.["imageAlt"]) || stringValue(content["imageAlt"]);
        return (
          <section
            {...common}
            id={stringValue(node.settings?.["anchor"]) || undefined}
            className={cn("relative overflow-hidden", !hasSpacing(node) && "section-y")}
          >
            {desktopImage ? (
              <picture className="absolute inset-0 block size-full">
                <source media="(max-width: 640px)" srcSet={mobileImage} />
                <img src={desktopImage} alt={imageAlt} className="size-full object-cover" />
              </picture>
            ) : null}
            {desktopImage ? (
              <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,34,80,0.9),rgba(0,34,80,0.3))]" />
            ) : null}
            <div className="relative z-[1]" style={mediaTextStyle()}>
              {children}
            </div>
          </section>
        );
      }
      return (
        <section
          {...common}
          id={stringValue(node.settings?.["anchor"]) || undefined}
          className={cn(!hasSpacing(node) && "section-y")}
        >
          {children}
        </section>
      );
    case "container":
      return embedded ? <div>{children}</div> : <Container>{children}</Container>;
    case "grid":
    case "columns":
      return (
        <div {...common} className="grid">
          {children}
        </div>
      );
    case "stack":
      return (
        <div {...common} className="flex flex-col">
          {children}
        </div>
      );
    case "heading": {
      const level = numberValue(content["level"], 2);
      const Heading = `h${Math.min(6, Math.max(1, level))}` as ElementType;
      return <Heading {...common}>{stringValue(content["text"])}</Heading>;
    }
    case "text":
    case "paragraph":
    case "rich-text":
      return (
        <p {...common} className="type-body">
          {stringValue(content["text"] ?? node.content)}
        </p>
      );
    case "image": {
      const url = stringValue(content["url"]);
      if (!url) return null;
      return (
        <figure {...common}>
          <img
            src={url}
            alt={stringValue(content["alt"])}
            loading={content["priority"] === true ? "eager" : "lazy"}
            className="size-full object-cover"
          />
          {stringValue(content["caption"]) ? (
            <figcaption className="type-caption mt-3">{stringValue(content["caption"])}</figcaption>
          ) : null}
        </figure>
      );
    }
    case "button":
      return (
        <ActionAnchor
          {...common}
          href={stringValue(content["href"]) || "#"}
          variant={inMediaSection ? "inverse" : buttonVariant(content["variant"])}
          className={inMediaSection ? "me-4 mt-8 last:me-0" : undefined}
        >
          {stringValue(content["label"]) || "Button"}
        </ActionAnchor>
      );
    case "list": {
      const items = Array.isArray(content["items"]) ? content["items"] : [];
      return (
        <ul {...common} className="space-y-3">
          {items.map((item, index) => (
            <li key={index}>{stringValue(item)}</li>
          ))}
        </ul>
      );
    }
    case "divider":
      return <hr {...common} className="border-border" />;
    case "spacer":
      return <div {...common} aria-hidden="true" />;
    case "hero":
    case "insurance-services":
    case "why-triple-h":
    case "catalog":
    case "story":
    case "facts":
    case "commitments":
    case "process":
    case "prepare":
    case "claims-desk":
    case "question-groups":
    case "office":
    case "contact-methods":
    case "hours":
      return renderManagedLegacySection(node, context, common);
    default:
      return children ? <div {...common}>{children}</div> : null;
  }
}

const structuredSectionTypes = new Set([
  "hero-banner",
  "editorial-story",
  "callout",
  "faq-groups",
  "address-block",
  "statistics",
  "steps",
  "feature-list",
  "faq",
  "testimonials",
  "contact-details",
  "hours-location",
  "solutions-catalog",
  "solution-introduction",
  "coverage-details",
  "related-links",
  "automatic-solution-catalog",
  "solution-cards",
  "form",
  "multi-step-form",
]);

function isStructuredSection(node: BuilderNode) {
  return structuredSectionTypes.has(stringValue(node.settings?.["sectionType"]));
}

function renderStructuredSection(node: BuilderNode, context: BuilderRenderContext): ReactNode {
  const kind = stringValue(node.settings?.["sectionType"]);
  const content = objectValue(node.content);
  const items = objectArray(content["items"]);
  const heading = stringValue(content["heading"]);
  const intro = stringValue(content["intro"]);
  const headingBlock = (
    <div className="mb-10 max-w-3xl">
      {stringValue(content["eyebrow"]) ? <p className="type-label mb-5">{stringValue(content["eyebrow"])}</p> : null}
      {heading ? <h2 className="type-h2">{heading}</h2> : null}
      {intro ? <p className="type-body mt-5">{intro}</p> : null}
    </div>
  );

  if (kind === "hero-banner") {
    const buttons = objectArray(content["items"]);
    const heroHeading = stringValue(content["heading"]) || stringValue(content["title"]);
    const heroIntro = stringValue(content["intro"]) || stringValue(content["lead"]);
    return (
      <div className="max-w-3xl text-[color:var(--hero-heading)]">
        {stringValue(content["eyebrow"]) ? <p className="type-label text-inverse-muted">{stringValue(content["eyebrow"])}</p> : null}
        <h1 className="type-h1 mt-8 max-w-[18ch] text-inverse-foreground">{heroHeading}</h1>
        {heroIntro ? <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-inverse-muted">{heroIntro}</p> : null}
        {buttons.length ? <div className="mt-10 flex flex-wrap gap-4">{buttons.map((button, index) => <ActionAnchor key={index} href={stringValue(button["href"]) || "#"} variant={buttonVariant(button["variant"]) === "inverseOutline" ? "inverseOutline" : "inverse"}>{stringValue(button["label"])}</ActionAnchor>)}</div> : null}
      </div>
    );
  }
  if (kind === "editorial-story") {
    return (
      <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
        <div><h2 className="type-h2 max-w-[16ch]">{heading}</h2>{intro ? <p className="type-lead mt-5">{intro}</p> : null}</div>
        <div className="max-w-2xl space-y-6">{items.map((item, index) => <p key={index} className="type-body">{stringValue(item["text"])}</p>)}</div>
      </div>
    );
  }
  if (kind === "callout") {
    return (
      <div className="max-w-3xl">
        {headingBlock}
        {stringValue(content["buttonLabel"]) ? <ActionAnchor href={stringValue(content["buttonHref"]) || "#"}>{stringValue(content["buttonLabel"])}</ActionAnchor> : null}
      </div>
    );
  }
  if (kind === "faq-groups") {
    const groups = new Map<string, Array<Record<string, JsonValue>>>();
    items.forEach((item) => {
      const group = stringValue(item["group"]) || "Questions";
      groups.set(group, [...(groups.get(group) ?? []), item]);
    });
    return (
      <>
        {headingBlock}
        <div className="space-y-14">{[...groups].map(([group, questions]) => <div key={group} className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16"><h3 className="type-h3">{group}</h3><div className="border-t border-border">{questions.map((item, index) => <BuilderAccordionItem key={index} question={stringValue(item["question"])} answer={stringValue(item["answer"])} showArrow={content["showArrows"] !== false} smooth={content["smoothMotion"] !== false} />)}</div></div>)}</div>
      </>
    );
  }
  if (kind === "address-block") {
    const address = Array.isArray(content["address"])
      ? content["address"].map(stringValue)
      : stringValue(content["address"]).split("\n").filter(Boolean);
    const compact = stringValue(content["layout"]) === "compact";
    return <>{headingBlock}<div className={cn("flex items-start gap-3", compact && "type-small")}><ContactIcon name={stringValue(content["icon"]) || "map-pin"} className="mt-1 shrink-0 text-muted-foreground" /><address className="not-italic">{address.map((line, index) => <span key={index} className="block">{line}</span>)}</address></div>{stringValue(content["mapUrl"]) ? <ActionAnchor className="mt-7" href={stringValue(content["mapUrl"])}>{stringValue(content["mapLabel"]) || "View map"}</ActionAnchor> : null}</>;
  }

  if (kind === "statistics") {
    const savedLayout = stringValue(content["layout"]);
    const minimal =
      savedLayout === "minimal" ||
      (!savedLayout && node.styles?.["preset"] === "numbered-grid");
    return (
      <>
        {headingBlock}
        <div className={cn("grid sm:grid-cols-2 lg:grid-cols-4", minimal ? "gap-x-10 gap-y-8" : "gap-px border border-border bg-border")}>
          {items.map((item, index) => (
            <div key={index} className={minimal ? "border-t border-border pt-6" : "bg-background p-7"}>
              {minimal ? (
                <><p className="type-caption">{stringValue(item["label"])}</p><p className="type-small mt-4 text-foreground">{stringValue(item["value"])}</p></>
              ) : (
                <><p className="font-display text-4xl text-primary">{stringValue(item["value"])}</p><p className="type-small mt-3">{stringValue(item["label"])}</p></>
              )}
            </div>
          ))}
        </div>
      </>
    );
  }
  if (kind === "steps") {
    const split = stringValue(content["layout"]) === "split";
    const list = (
      <div className={cn("grid", split ? "gap-x-10 sm:grid-cols-2" : "gap-8 md:grid-cols-2 lg:grid-cols-4")}>
        {items.map((item, index) => (
          <article key={index} className="border-t border-border pt-6">
            {!split ? <span className="type-caption text-primary">{String(index + 1).padStart(2, "0")}</span> : null}
            <h3 className={cn("type-h3", !split && "mt-5")}>{stringValue(item["title"])}</h3>
            <p className="type-body mt-4">{stringValue(item["body"])}</p>
          </article>
        ))}
      </div>
    );
    return (
      <>
        {split ? <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">{headingBlock}{list}</div> : <>{headingBlock}{list}</>}
      </>
    );
  }
  if (kind === "feature-list") {
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
  if (kind === "faq") {
    return (
      <>
        {headingBlock}
        <div className="border-t border-border">
          {items.map((item, index) => (
            <BuilderAccordionItem
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
  if (kind === "testimonials") {
    return (
      <>
        {headingBlock}
        <div className="grid gap-6 lg:grid-cols-3">
          {items.map((item, index) => (
            <figure key={index} className="border border-border p-7">
              <blockquote className="type-body">“{stringValue(item["quote"])}”</blockquote>
              <figcaption className="mt-7">
                <strong className="block text-foreground">{stringValue(item["name"])}</strong>
                <span className="type-caption mt-1 block">{stringValue(item["role"])}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </>
    );
  }
  if (kind === "contact-details") {
    const rows = stringValue(content["layout"]) === "rows";
    return (
      <>
        {headingBlock}
        <div className={rows ? "border-t border-border" : "grid gap-px border border-border bg-border md:grid-cols-3"}>
          {items.map((item, index) => {
            const value = stringValue(item["value"]);
            const href = stringValue(item["href"]);
            return (
              <div key={index} className={rows ? "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 border-b border-border py-4" : "bg-background p-7"}>
                <p className={cn(rows ? "flex items-center gap-3 text-sm text-foreground" : "type-caption")}><ContactIcon name={stringValue(item["icon"])} className="shrink-0 text-muted-foreground" />{stringValue(item["label"])}</p>
                {href ? (
                  <a className={cn("block text-foreground hover:text-primary", !rows && "mt-3")} href={href}>
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
  if (kind === "hours-location") {
    const rows = stringValue(content["layout"]) === "rows";
    if (rows) {
      return <>{headingBlock}<div className="flex items-center gap-2"><ContactIcon name={stringValue(content["icon"]) || "clock"} className="text-muted-foreground" /><dl className="min-w-0 flex-1 border-t border-border">{items.map((item, index) => <div key={index} className="flex justify-between gap-6 border-b border-border py-4"><dt className="text-foreground">{stringValue(item["day"])}</dt><dd className="type-small text-end">{stringValue(item["time"])}</dd></div>)}</dl></div></>;
    }
    return (
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          {headingBlock}
          <p className="type-body whitespace-pre-line">{stringValue(content["address"])}</p>
          {stringValue(content["mapUrl"]) ? (
            <ActionAnchor
              className="mt-7"
              href={stringValue(content["mapUrl"])}
              variant="secondary"
            >
              {stringValue(content["mapLabel"]) || "View map"}
            </ActionAnchor>
          ) : null}
        </div>
        <dl className="border-t border-border">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between gap-6 border-b border-border py-4">
              <dt className="text-foreground">{stringValue(item["day"])}</dt>
              <dd className="text-body">{stringValue(item["time"])}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }
  if (kind === "solutions-catalog") {
    return (
      <>
        {headingBlock}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <article key={index} className="overflow-hidden border border-border bg-background">
              {stringValue(item["imageUrl"]) ? (
                <img
                  src={stringValue(item["imageUrl"])}
                  alt={stringValue(item["imageAlt"])}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : null}
              <div className="p-7">
                <h3 className="type-h3">{stringValue(item["title"])}</h3>
                <p className="type-body mt-4">{stringValue(item["summary"])}</p>
                {stringValue(item["href"]) ? (
                  <ActionAnchor className="mt-7" href={stringValue(item["href"])} variant="ghost">
                    {stringValue(item["linkLabel"]) || "Learn more"}
                  </ActionAnchor>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </>
    );
  }
  if (kind === "automatic-solution-catalog") {
    return renderSolutionList(content, context.solutionSummaries);
  }
  if (kind === "solution-cards") {
    return renderSolutionCards(content, context.solutionSummaries);
  }
  if (kind === "solution-introduction") {
    return (
      <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
        <div>
          {stringValue(content["eyebrow"]) ? (
            <p className="type-label">{stringValue(content["eyebrow"])}</p>
          ) : null}
          <h1 className="type-h1 mt-10">{stringValue(content["heading"])}</h1>
          <p className="type-lead mt-8 max-w-lg">{stringValue(content["intro"])}</p>
        </div>
        <div className="self-end">
          <div className="border-t border-border pt-7">
            <p className="type-label">{stringValue(content["audienceHeading"])}</p>
            <p className="type-body mt-4">{stringValue(content["audience"])}</p>
          </div>
          {stringValue(content["buttonLabel"]) ? (
            <ActionAnchor href={stringValue(content["buttonHref"]) || "#"} className="mt-10">
              {stringValue(content["buttonLabel"])}
            </ActionAnchor>
          ) : null}
        </div>
      </div>
    );
  }
  if (kind === "coverage-details") {
    return (
      <>
      {stringValue(content["intro"]) ? <p className="type-lead mb-12 max-w-3xl">{stringValue(content["intro"])}</p> : null}
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
  if (kind === "related-links") {
    return (
      <>
        <h2 className="type-h3">{stringValue(content["heading"])}</h2>
        {stringValue(content["intro"]) ? <p className="type-body mt-4 max-w-2xl">{stringValue(content["intro"])}</p> : null}
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
  if (kind === "form" || kind === "multi-step-form") {
    return (
      <BuilderForm
        content={content}
        multiStep={kind === "multi-step-form"}
        solutionSummaries={context.solutionSummaries}
      />
    );
  }
  return null;
}

function BuilderAccordionItem({
  question,
  answer,
  showArrow,
  smooth,
  large = false,
}: {
  question: string;
  answer: string;
  showArrow: boolean;
  smooth: boolean;
  large?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center justify-between gap-6 py-5 text-start text-foreground",
          large ? "font-display text-xl" : "type-h4",
        )}
      >
        <span>{question}</span>
        {showArrow ? (
          <ChevronDown
            size={18}
            className={cn(
              "shrink-0 transition-transform",
              smooth ? "duration-300" : "duration-0",
              open && "rotate-180",
            )}
          />
        ) : null}
      </button>
      <div
        className={cn(
          "grid",
          smooth ? "transition-[grid-template-rows,opacity] duration-300 ease-out" : "duration-0",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <p className={cn("type-body max-w-3xl pb-6", !large && "type-small")}>{answer}</p>
        </div>
      </div>
    </div>
  );
}

function renderManagedLegacySection(
  node: BuilderNode,
  context: BuilderRenderContext,
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
        <Container>{renderSolutionList(content, context.solutionSummaries)}</Container>
      </section>
    );
  }
  if (node.type === "insurance-services") {
    return (
      <section {...common} className={sectionClass}>
        <Container>{renderSolutionCards(content, context.solutionSummaries)}</Container>
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
    const paragraphs = Array.isArray(content["items"])
      ? content["items"].map(stringValue)
      : [];
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <h2 className="type-h2 max-w-[16ch]">{paragraphs[0]}</h2>
            <div className="max-w-2xl space-y-6">
              {paragraphs.slice(1).map((paragraph, index) => (
                <p key={index} className="type-body">{paragraph}</p>
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
          <SectionHeading title={stringValue(content["title"])} lead={stringValue(content["lead"])} />
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
          <SectionHeading title={stringValue(content["title"])} lead={stringValue(content["lead"])} />
          <ol className="mt-12 grid gap-x-12 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, index) => (
              <li key={index} className="border-t border-border pt-7">
                <span className="type-caption tabular-nums">{String(index + 1).padStart(2, "0")}</span>
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
          <SectionHeading title={stringValue(content["title"])} lead={stringValue(content["lead"])} />
          <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
            {entries.map((entry, index) => <li key={index} className="border-b border-border py-5 type-small">{entry}</li>)}
          </ul>
        </Container>
      </section>
    );
  }
  if (node.type === "claims-desk") {
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <SectionHeading title={stringValue(content["title"])} lead={stringValue(content["body"])} />
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
                <SectionHeading title={stringValue(group["title"])} lead={stringValue(group["lead"])} />
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
    const address = Array.isArray(content["address"])
      ? content["address"].map(stringValue)
      : [];
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <SectionHeading title={stringValue(content["title"])} lead={stringValue(content["lead"])} />
          <address className="type-body mt-8 not-italic">{address.map((line, index) => <span key={index} className="block">{line}</span>)}</address>
        </Container>
      </section>
    );
  }
  if (node.type === "contact-methods") {
    const methods = ["phone", "whatsapp", "email"].map((key) => ({
      label: stringValue(content[`${key}Label`]),
      value: stringValue(content[key]),
      href: key === "email" ? `mailto:${stringValue(content[key])}` : `tel:${stringValue(content[key]).replace(/\s/g, "")}`,
    }));
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <SectionHeading title={stringValue(content["title"])} lead={stringValue(content["lead"])} />
          <div className="mt-8 grid gap-px border border-border bg-border md:grid-cols-3">
            {methods.map((method) => <a key={method.label} href={method.href} className="bg-background p-7"><span className="type-caption block">{method.label}</span><span className="mt-3 block text-foreground" dir="ltr">{method.value}</span></a>)}
          </div>
        </Container>
      </section>
    );
  }
  if (node.type === "hours") {
    return (
      <section {...common} className={sectionClass}>
        <Container>
          <SectionHeading title={stringValue(content["title"])} lead={stringValue(content["lead"])} />
          <dl className="mt-8 border-t border-border">{items.map((item, index) => <div key={index} className="flex justify-between border-b border-border py-4"><dt>{stringValue(item["day"])}</dt><dd>{stringValue(item["time"])}</dd></div>)}</dl>
        </Container>
      </section>
    );
  }
  return null;
}

function renderSolutionList(
  content: Record<string, JsonValue>,
  summaries: SolutionPageSummary[],
): ReactNode {
  return (
    <>
      <SectionHeading
        eyebrow={stringValue(content["eyebrow"])}
        title={stringValue(content["heading"] ?? content["title"]) || "Insurance solutions"}
        lead={stringValue(content["intro"] ?? content["lead"])}
      />
      <ul className="mt-12">
        {[...summaries].sort((a, b) => a.position - b.position).map((item, index) => (
          <li key={item.id} className="border-t border-border last:border-b">
            <a href={`/${item.slug}`} className="group grid gap-5 py-8 sm:grid-cols-[4rem_0.9fr_1.1fr] sm:items-center md:gap-8">
              <span className="type-caption tabular-nums">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="type-h3 group-hover:text-primary">{item.title}</h3>
              <p className="type-small max-w-xl">{item.summary}</p>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

function renderSolutionCards(
  content: Record<string, JsonValue>,
  summaries: SolutionPageSummary[],
): ReactNode {
  const configured = objectArray(content["items"]);
  const summaryBySlug = new Map(
    summaries.map((summary) => [summary.slug.split("/").filter(Boolean).at(-1), summary]),
  );
  const cards = (configured.length
    ? configured
        .sort((a, b) => numberValue(a["position"], 999) - numberValue(b["position"], 999))
        .map((item) => ({ item, summary: summaryBySlug.get(stringValue(item["solutionSlug"])) }))
        .filter((entry) => entry.summary)
    : [...summaries]
        .sort((a, b) => a.position - b.position)
        .map((summary) => ({ item: {}, summary }))) as Array<{
    item: Record<string, JsonValue>;
    summary: SolutionPageSummary;
  }>;
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
            <a href={stringValue(item["href"]) || `/${summary.slug}`} className="group relative flex aspect-[4/5] size-full flex-col overflow-hidden bg-muted">
              <img src={stringValue(item["imageUrl"]) || summary.imageUrl || ""} alt={stringValue(item["imageAlt"])} loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              <div className="relative flex size-full flex-col justify-end p-8 sm:p-10">
                <span className="type-caption text-inverse-muted">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="type-h3 mt-4 text-inverse-foreground">{summary.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-inverse-muted">{summary.summary}</p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

function ContactIcon({ name, className }: { name: string; className?: string }) {
  const Icon = name === "message-circle"
    ? MessageCircle
    : name === "phone"
      ? Phone
      : name === "mail"
        ? Mail
        : name === "clock"
          ? Clock
          : name === "map-pin"
            ? MapPin
            : null;
  return Icon ? <Icon aria-hidden="true" className={cn("size-4", className)} /> : null;
}

function BuilderForm({
  content,
  multiStep,
  solutionSummaries,
}: {
  content: Record<string, JsonValue>;
  multiStep: boolean;
  solutionSummaries: SolutionPageSummary[];
}) {
  const fields = objectArray(content["items"]);
  const stepNames = [...new Set(fields.map((field) => stringValue(field["step"]) || "Details"))];
  const [step, setStep] = useState(0);
  const visibleFields = multiStep
    ? fields.filter((field) => (stringValue(field["step"]) || "Details") === stepNames[step])
    : fields;
  const underline = !multiStep && stringValue(content["appearance"]) === "underline";
  const columns = Math.max(1, Math.min(2, numberValue(content["columns"], 1)));
  const optionalLabel = stringValue(content["optionalLabel"]);
  const fieldClass = underline
    ? "min-h-12 border-0 border-b border-border bg-transparent px-0 outline-none focus:border-primary"
    : "min-h-12 border border-border bg-background px-3 outline-none focus:border-primary";
  return (
    <div className="w-full max-w-3xl">
      <h2 className="type-h2">{stringValue(content["heading"])}</h2>
      {stringValue(content["intro"]) ? (
        <p className={cn("type-body mt-5", underline && "border-s border-primary ps-4 text-sm")}>{stringValue(content["intro"])}</p>
      ) : null}
      {multiStep ? (
        <div className="mt-8 flex gap-2" aria-label="Form progress">
          {stepNames.map((name, index) => (
            <span
              key={name}
              className={cn("h-1 flex-1", index <= step ? "bg-primary" : "bg-muted")}
            />
          ))}
        </div>
      ) : null}
      <form
        className={cn("mt-8 grid gap-x-6 gap-y-7", columns === 2 && "sm:grid-cols-2")}
        action={`mailto:${stringValue(content["recipient"])}`}
        method="post"
        encType="text/plain"
      >
        {visibleFields.map((field, index) => {
          const type = stringValue(field["type"]) || "text";
          const name = stringValue(field["name"]) || `field-${index + 1}`;
          const label = stringValue(field["label"]);
          const configuredOptions = Array.isArray(field["options"])
            ? field["options"].map(stringValue)
            : stringValue(field["options"])
                .split(",")
                .map((option) => option.trim())
                .filter(Boolean);
          const options =
            stringValue(field["source"]) === "solution-pages"
              ? solutionSummaries.map((solution) => solution.title)
              : configuredOptions;
          if (type === "checkbox-group") {
            return (
              <fieldset key={`${name}-${index}`} className="col-span-full grid gap-3">
                <legend className="text-sm font-medium text-foreground">{label}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {options.map((option) => (
                    <label key={option} className="flex items-center gap-3 border border-border p-4 text-sm text-foreground">
                      <input type="checkbox" name={name} value={option} required={field["required"] === true} />
                      {option}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          }
          return (
            <label
              key={`${name}-${index}`}
              className={cn(
                "grid gap-2 text-sm font-medium text-foreground",
                (type === "textarea" || columns === 1) && "col-span-full",
              )}
            >
              <span className={underline ? "type-label" : undefined}>{label}</span>
              {type === "textarea" ? (
                <textarea
                  name={name}
                  required={field["required"] === true}
                  placeholder={stringValue(field["placeholder"])}
                  rows={5}
                  className={cn(fieldClass, underline ? "min-h-36 resize-y py-3" : "p-3")}
                />
              ) : type === "select" ? (
                <select
                  name={name}
                  required={field["required"] === true}
                  className={fieldClass}
                >
                  <option value="">—</option>
                  {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={type === "email" || type === "tel" ? type : "text"}
                  name={name}
                  required={field["required"] === true}
                  placeholder={stringValue(field["placeholder"])}
                  className={fieldClass}
                />
              )}
              {field["required"] !== true && optionalLabel ? (
                <span className="text-xs font-normal text-muted-foreground">{optionalLabel}</span>
              ) : null}
            </label>
          );
        })}
        {multiStep && step > 0 ? (
          <button
            type="button"
            onClick={() => setStep((value) => value - 1)}
            className="col-span-full justify-self-start text-primary"
          >
            Back
          </button>
        ) : null}
        {multiStep && step < stepNames.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((value) => value + 1)}
            className="col-span-full justify-self-start rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Next
          </button>
        ) : (
          <button
            type="submit"
            className="col-span-full justify-self-start rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            {stringValue(content["submitLabel"]) || "Send"}
          </button>
        )}
      </form>
    </div>
  );
}

function renderChildren(
  node: BuilderNode,
  inMediaSection: boolean,
  context: BuilderRenderContext,
  embedded = false,
): ReactNode {
  if (!node.children?.length) return null;
  return node.children
    .filter((child) => child.visible !== false)
    .map((child) => (
      <RenderNode
        key={child.id}
        node={child}
        inMediaSection={inMediaSection}
        context={context}
        embedded={embedded}
      />
    ));
}

function objectValue(value: JsonValue | undefined): Record<string, JsonValue> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function objectArray(value: JsonValue | undefined): Array<Record<string, JsonValue>> {
  return Array.isArray(value) ? value.map(objectValue) : [];
}

function stringValue(value: JsonValue | undefined): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function numberValue(value: JsonValue | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return fallback;
}

function buttonVariant(value: JsonValue | undefined) {
  return value === "secondary" ||
    value === "inverse" ||
    value === "inverseOutline" ||
    value === "ghost"
    ? value
    : "primary";
}

function safeId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function baseStyle(node: BuilderNode): CSSProperties {
  const desktop = node.styles?.["desktop"];
  const direct = Object.fromEntries(
    Object.entries(node.styles ?? {}).filter(
      ([key]) => !["desktop", "tablet", "mobile", "preset"].includes(key),
    ),
  );
  return sanitizeStyle({ ...direct, ...(isObject(desktop) ? desktop : {}) });
}

function sanitizeStyle(input: Record<string, JsonValue>): CSSProperties {
  const output: Record<string, string | number> = {};
  for (const [property, value] of Object.entries(input)) {
    if (!allowedStyleProperties.has(property)) continue;
    if (typeof value === "number" && Number.isFinite(value)) output[property] = value;
    if (
      typeof value === "string" &&
      value.length <= 300 &&
      !/[;{}<>]/.test(value) &&
      !/expression|javascript:/i.test(value)
    ) {
      output[property] = value;
    }
  }
  return output as CSSProperties;
}

function responsiveRules(document: BuilderDocument) {
  const rules: string[] = [];
  const walk = (node: BuilderNode) => {
    const selector = `[data-builder-id="${safeId(node.id)}"]`;
    const tablet = isObject(node.styles?.["tablet"]) ? cssDeclarations(node.styles!.tablet!) : "";
    const mobile = isObject(node.styles?.["mobile"]) ? cssDeclarations(node.styles!.mobile!) : "";
    if (tablet) rules.push(`@media(max-width:1024px){${selector}{${tablet}}}`);
    if (mobile) rules.push(`@media(max-width:640px){${selector}{${mobile}}}`);
    node.children?.forEach(walk);
  };
  document.children.forEach(walk);
  return rules.join("\n");
}

function cssDeclarations(style: Record<string, JsonValue>) {
  const sanitized = sanitizeStyle(style) as Record<string, string | number>;
  return Object.entries(sanitized)
    .map(
      ([property, value]) =>
        `${property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${value}`,
    )
    .join(";");
}

function isObject(value: unknown): value is Record<string, JsonValue> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasSpacing(node: BuilderNode) {
  const style = baseStyle(node) as Record<string, unknown>;
  return ["padding", "paddingTop", "paddingBottom"].some(
    (property) => style[property] !== undefined,
  );
}

function isMediaSection(node: BuilderNode) {
  const savedType = node.settings?.["sectionType"];
  if (savedType === "hero" || savedType === "call-to-action") return true;
  if (typeof savedType === "string" && savedType.length > 0) return false;

  // Documents created while sectionType was not preserved can still be
  // identified by the same structural rules used by the editor.
  const descendants = [node, ...(node.children ?? []).flatMap(builderDescendants)];
  const heading = descendants.find((child) => child.type === "heading");
  const headingContent = objectValue(heading?.content);
  return (
    headingContent["level"] === 1 ||
    node.styles?.["desktop"]?.["backgroundColor"] === "var(--inverse)"
  );
}

function builderDescendants(node: BuilderNode): BuilderNode[] {
  return [node, ...(node.children ?? []).flatMap(builderDescendants)];
}

function mediaTextStyle(): CSSProperties {
  return {
    color: "var(--hero-heading)",
    "--foreground": "var(--hero-heading)",
    "--body": "var(--hero-body)",
  } as CSSProperties;
}
