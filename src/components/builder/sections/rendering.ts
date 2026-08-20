import type { CSSProperties, ReactNode } from "react";
import type { BuilderNode, JsonValue, SolutionPageSummary } from "@/services/builderService";

export type SectionRenderContext = { solutionSummaries: SolutionPageSummary[] };

export type SectionRenderProps = {
  node: BuilderNode;
  content: Record<string, JsonValue>;
  items: Array<Record<string, JsonValue>>;
  heading: string;
  intro: string;
  headingBlock: ReactNode;
  context: SectionRenderContext;
};

export type LegacySectionRenderProps = {
  node: BuilderNode;
  content: Record<string, JsonValue>;
  children: ReactNode;
  common: { "data-builder-id": string; "data-builder-type": string; style: CSSProperties };
  hasSpacing: boolean;
};

export function objectValue(value: JsonValue | undefined): Record<string, JsonValue> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function objectArray(value: JsonValue | undefined): Array<Record<string, JsonValue>> {
  return Array.isArray(value) ? value.map(objectValue) : [];
}

export function stringValue(value: JsonValue | undefined): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

export function numberValue(value: JsonValue | undefined, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function buttonVariant(value: JsonValue | undefined) {
  return value === "secondary" ||
    value === "inverse" ||
    value === "inverseOutline" ||
    value === "ghost"
    ? value
    : "primary";
}
