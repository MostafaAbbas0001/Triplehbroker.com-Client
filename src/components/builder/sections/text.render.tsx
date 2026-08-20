import { cn } from "@/lib/utils";
import type { LegacySectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";
export function renderTextSection({
  node,
  children,
  common,
  hasSpacing,
}: LegacySectionRenderProps) {
  return (
    <section
      {...common}
      id={stringValue(node.settings?.["anchor"]) || undefined}
      className={cn(!hasSpacing && "section-y")}
    >
      {children}
    </section>
  );
}
