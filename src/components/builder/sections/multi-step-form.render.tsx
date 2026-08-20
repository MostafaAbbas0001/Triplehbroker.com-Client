import type { SectionRenderProps } from "./rendering";
import { FormRendererBase } from "./form.render";

export function MultiStepFormSectionRenderer(props: SectionRenderProps) {
  return <FormRendererBase {...props} multiStep />;
}
