import type { BuilderNode } from "@/services/builderService";
import type { ReactNode } from "react";
import type { LegacySectionRenderProps, SectionRenderProps } from "./rendering";

export type BuilderSectionKind =
  | "hero"
  | "hero-banner"
  | "text"
  | "image-text"
  | "cards"
  | "call-to-action"
  | "editorial-story"
  | "callout"
  | "faq-groups"
  | "address-block"
  | "statistics"
  | "steps"
  | "feature-list"
  | "faq"
  | "testimonials"
  | "contact-details"
  | "hours-location"
  | "solutions-catalog"
  | "automatic-solution-catalog"
  | "solution-cards"
  | "solution-introduction"
  | "coverage-details"
  | "related-links"
  | "form"
  | "multi-step-form";

export type SectionCategoryName =
  "Essentials" | "Collections" | "Solutions" | "Engagement" | "Contact and forms";

type SectionModuleBase = {
  kind: BuilderSectionKind;
  category: SectionCategoryName;
  description: string;
  create: () => BuilderNode;
};

export type SectionModule = SectionModuleBase &
  (
    | {
        structured: true;
        render: (props: SectionRenderProps) => ReactNode;
      }
    | {
        structured: false;
        renderLegacy: (props: LegacySectionRenderProps) => ReactNode;
      }
  );
