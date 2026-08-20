import { createId } from "@/lib/utils";
import type { ReactNode } from "react";
import type { BuilderNode, JsonValue } from "@/services/builderService";
import type { BuilderSectionKind, SectionCategoryName, SectionModule } from "./types";
import type { LegacySectionRenderProps, SectionRenderProps } from "./rendering";

export function createNode(
  type: string,
  content?: JsonValue,
  styles?: BuilderNode["styles"],
  children?: BuilderNode[],
): BuilderNode {
  return {
    id: createId(),
    type,
    visible: true,
    ...(content === undefined ? {} : { content }),
    ...(styles === undefined ? {} : { styles }),
    ...(children === undefined ? {} : { children }),
  };
}

export function createHeading(text: string, level = 2) {
  return createNode(
    "heading",
    { text, level },
    {
      desktop: { fontSize: level === 1 ? "64px" : "44px" },
      mobile: { fontSize: level === 1 ? "38px" : "32px" },
    },
  );
}

export function createParagraph(text: string) {
  return createNode(
    "text",
    { text },
    {
      desktop: { maxWidth: "62ch", fontSize: "17px", lineHeight: "1.7" },
    },
  );
}

export function defineStructuredSection({
  kind,
  category,
  description,
  content,
  hero = false,
  render,
}: {
  kind: BuilderSectionKind;
  category: SectionCategoryName;
  description: string;
  content: Record<string, JsonValue>;
  hero?: boolean;
  render: (props: SectionRenderProps) => ReactNode;
}): SectionModule {
  return {
    kind,
    category,
    description,
    structured: true,
    render,
    create: () => ({
      ...createNode(
        "section",
        structuredClone(content),
        hero
          ? { preset: "cinematic-tall" }
          : {
              desktop: { paddingTop: "80px", paddingBottom: "80px" },
              mobile: { paddingTop: "48px", paddingBottom: "48px" },
            },
        [],
      ),
      settings: { sectionType: kind },
    }),
  };
}

export function defineLegacySection({
  kind,
  category,
  description,
  content,
  tone,
  renderLegacy,
}: {
  kind: BuilderSectionKind;
  category: SectionCategoryName;
  description: string;
  content: () => BuilderNode[];
  tone?: "primary" | "inverse";
  renderLegacy: (props: LegacySectionRenderProps) => ReactNode;
}): SectionModule {
  return {
    kind,
    category,
    description,
    structured: false,
    renderLegacy,
    create: () => ({
      ...createNode(
        "section",
        undefined,
        {
          desktop: {
            paddingTop: kind === "hero" ? "120px" : "80px",
            paddingBottom: kind === "hero" ? "120px" : "80px",
            ...(tone ? { backgroundColor: `var(--${tone})` } : {}),
          },
          mobile: { paddingTop: "48px", paddingBottom: "48px" },
        },
        [createNode("container", undefined, undefined, content())],
      ),
      settings: {
        sectionType: kind,
        ...(kind === "hero" || kind === "call-to-action"
          ? { desktopImageUrl: "", mobileImageUrl: "", imageAlt: "" }
          : {}),
      },
    }),
  };
}

export const baseContent = {
  heading: "New section",
  intro: "Add a short introduction for this section.",
} satisfies Record<string, JsonValue>;
