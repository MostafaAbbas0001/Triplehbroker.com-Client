import type { CSSProperties, ElementType, ReactNode } from "react";
import type { BuilderDocument, BuilderNode, JsonValue } from "@/services/builderService";
import { ActionAnchor, Container, MediaStage } from "@/components/site/primitives";
import { cn } from "@/lib/utils";
import type { SolutionPageSummary } from "@/services/builderService";
import { sectionRegistry, type BuilderSectionKind } from "@/components/builder/sections";
import { renderManagedLegacySection } from "@/components/builder/sections/legacy-managed.render";

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
    <div className="builder-page w-full min-w-0 max-w-full overflow-x-clip">
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
    </div>
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
    inMediaSection || (node.type === "section" && isRegisteredMediaSection(node)),
    context,
    embedded,
  );
  const common = {
    "data-builder-id": safeId(node.id),
    "data-builder-type": node.type,
    style: embedded ? { ...baseStyle(node), paddingTop: 0, paddingBottom: 0 } : baseStyle(node),
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
            <Container className="w-full">{renderStructuredSection(node, context)}</Container>
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
      {
        const kind = stringValue(node.settings?.["sectionType"]) as BuilderSectionKind;
        const definition = sectionRegistry[kind];
        if (definition && !definition.structured) {
          return definition.renderLegacy({
            node,
            content,
            children,
            common,
            hasSpacing: hasSpacing(node),
          });
        }
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

function isStructuredSection(node: BuilderNode) {
  const kind = stringValue(node.settings?.["sectionType"]) as BuilderSectionKind;
  return sectionRegistry[kind]?.structured === true;
}

function renderStructuredSection(node: BuilderNode, context: BuilderRenderContext): ReactNode {
  const kind = stringValue(node.settings?.["sectionType"]) as BuilderSectionKind;
  return renderRegisteredStructuredSection(kind, node, objectValue(node.content), context);
}

function renderRegisteredStructuredSection(
  kind: BuilderSectionKind,
  node: BuilderNode,
  content: Record<string, JsonValue>,
  context: BuilderRenderContext,
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
  const style = sanitizeStyle({ ...direct, ...(isObject(desktop) ? desktop : {}) });
  return isHeroNode(node) ? withoutOuterSpacing(style) : style;
}

function isHeroNode(node: BuilderNode) {
  return (
    node.type === "hero" ||
    (node.type === "section" &&
      (node.settings?.["sectionType"] === "hero" ||
        node.settings?.["sectionType"] === "hero-banner"))
  );
}

function withoutOuterSpacing(style: CSSProperties) {
  const {
    padding: _padding,
    paddingTop: _paddingTop,
    paddingRight: _paddingRight,
    paddingBottom: _paddingBottom,
    paddingLeft: _paddingLeft,
    ...rest
  } = style;
  return rest;
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
    const savedTabletStyle = isObject(node.styles?.["tablet"]) ? node.styles!.tablet! : {};
    const savedMobileStyle = isObject(node.styles?.["mobile"]) ? node.styles!.mobile! : {};
    const tabletStyle = isHeroNode(node)
      ? withoutOuterSpacing(sanitizeStyle(savedTabletStyle))
      : savedTabletStyle;
    const normalizedMobileStyle = isHeroNode(node)
      ? withoutOuterSpacing(sanitizeStyle(savedMobileStyle))
      : savedMobileStyle;
    const desktopStyle = baseStyle(node) as Record<string, string | number>;
    const mobileStyle: Record<string, JsonValue> = {
      ...(normalizedMobileStyle as Record<string, JsonValue>),
    };

    // Fixed desktop dimensions must not enlarge a phone viewport when the
    // editor has no explicit mobile value for them.
    if (desktopStyle["width"] !== undefined && mobileStyle["width"] === undefined) {
      mobileStyle["width"] = "100%";
    }
    if (desktopStyle["minWidth"] !== undefined && mobileStyle["minWidth"] === undefined) {
      mobileStyle["minWidth"] = 0;
    }
    if (
      (node.type === "grid" || node.type === "columns") &&
      mobileStyle["gridTemplateColumns"] === undefined
    ) {
      mobileStyle["gridTemplateColumns"] = "minmax(0, 1fr)";
    }

    const tablet = cssDeclarations(tabletStyle as Record<string, JsonValue>);
    const mobile = cssDeclarations(mobileStyle);
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
        `${property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}:${value}!important`,
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

function isRegisteredMediaSection(node: BuilderNode) {
  const kind = node.settings?.["sectionType"];
  return kind === "hero" || kind === "call-to-action";
}
