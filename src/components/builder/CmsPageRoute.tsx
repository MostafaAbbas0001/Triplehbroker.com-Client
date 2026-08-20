import { BuilderPageRenderer } from "@/components/builder/BuilderPageRenderer";
import type { CmsPageLoaderData } from "@/components/builder/cmsPageRouteData";

export function CmsPageView({
  page,
  solutionSummaries,
}: Pick<CmsPageLoaderData, "page" | "solutionSummaries">) {
  return <BuilderPageRenderer document={page.document} solutionSummaries={solutionSummaries} />;
}
