import type { BuilderNode, JsonValue } from "@/services/builderService";
import { createId } from "@/lib/utils";
import { addressBlockSection } from "./address-block";
import { automaticSolutionCatalogSection } from "./automatic-solution-catalog";
import { callToActionSection } from "./call-to-action";
import { calloutSection } from "./callout";
import { cardsSection } from "./cards";
import { contactDetailsSection } from "./contact-details";
import { coverageDetailsSection } from "./coverage-details";
import { editorialStorySection } from "./editorial-story";
import { faqGroupsSection } from "./faq-groups";
import { faqSection } from "./faq";
import { featureListSection } from "./feature-list";
import { formSection } from "./form";
import { heroBannerSection } from "./hero-banner";
import { heroSection } from "./hero";
import { hoursLocationSection } from "./hours-location";
import { imageTextSection } from "./image-text";
import { multiStepFormSection } from "./multi-step-form";
import { relatedLinksSection } from "./related-links";
import { solutionCardsSection } from "./solution-cards";
import { solutionIntroductionSection } from "./solution-introduction";
import { solutionsCatalogSection } from "./solutions-catalog";
import { statisticsSection } from "./statistics";
import { stepsSection } from "./steps";
import { testimonialsSection } from "./testimonials";
import { textSection } from "./text";
import type { BuilderSectionKind, SectionCategoryName, SectionModule } from "./types";

const sectionModules = [
  heroSection,
  heroBannerSection,
  textSection,
  imageTextSection,
  cardsSection,
  callToActionSection,
  editorialStorySection,
  calloutSection,
  faqGroupsSection,
  addressBlockSection,
  statisticsSection,
  stepsSection,
  featureListSection,
  faqSection,
  testimonialsSection,
  contactDetailsSection,
  hoursLocationSection,
  solutionsCatalogSection,
  automaticSolutionCatalogSection,
  solutionCardsSection,
  solutionIntroductionSection,
  coverageDetailsSection,
  relatedLinksSection,
  formSection,
  multiStepFormSection,
] satisfies SectionModule[];

export const sectionRegistry = Object.fromEntries(
  sectionModules.map((section) => [section.kind, section]),
) as Record<BuilderSectionKind, SectionModule>;

export const sectionHelp = Object.fromEntries(
  sectionModules.map((section) => [section.kind, section.description]),
) as Record<BuilderSectionKind, string>;

export type SectionCategory = { label: SectionCategoryName; kinds: BuilderSectionKind[] };

const categoryOrder: SectionCategoryName[] = [
  "Essentials",
  "Collections",
  "Solutions",
  "Engagement",
  "Contact and forms",
];

export const sectionCategories: SectionCategory[] = categoryOrder.map((label) => ({
  label,
  kinds: sectionModules
    .filter((section) => section.category === label)
    .map((section) => section.kind),
}));

export function createBuilderSection(kind: BuilderSectionKind): BuilderNode {
  return sectionRegistry[kind].create();
}

export function builderNodes(node: BuilderNode): BuilderNode[] {
  return [node, ...(node.children ?? []).flatMap(builderNodes)];
}

export function builderObject(value: JsonValue | undefined): Record<string, JsonValue> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function getSectionKind(section: BuilderNode): BuilderSectionKind {
  const saved = section.settings?.["sectionType"];
  if (typeof saved === "string" && saved in sectionRegistry) return saved as BuilderSectionKind;
  const nodes = builderNodes(section);
  if (nodes.some((node) => node.type === "image")) return "image-text";
  if (nodes.some((node) => node.type === "grid" && node.children?.some((x) => x.type === "stack")))
    return "cards";
  if (section.styles?.desktop?.["backgroundColor"] === "var(--inverse)") return "call-to-action";
  const heading = nodes.find((node) => node.type === "heading");
  return builderObject(heading?.content)["level"] === 1 ? "hero" : "text";
}

export function isHeroSection(section: BuilderNode | undefined) {
  if (!section || section.visible === false) return false;
  const kind = getSectionKind(section);
  return (
    section.type === "hero" ||
    (section.type === "section" && (kind === "hero" || kind === "hero-banner"))
  );
}

export function createBuilderCard(index: number): BuilderNode {
  return {
    id: createId(),
    type: "stack",
    visible: true,
    styles: { desktop: { padding: "28px", border: "1px solid var(--border)", gap: "12px" } },
    children: [
      {
        id: createId(),
        type: "heading",
        visible: true,
        content: { text: `Card ${index}`, level: 3 },
      },
      {
        id: createId(),
        type: "text",
        visible: true,
        content: { text: "Add supporting details here." },
      },
    ],
  };
}

export function createBuilderImage(): BuilderNode {
  return {
    id: createId(),
    type: "image",
    visible: true,
    content: { url: "", alt: "", caption: "" },
    styles: { desktop: { aspectRatio: "4 / 3" } },
  };
}
