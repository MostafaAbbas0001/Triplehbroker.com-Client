import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { BuilderPageRenderer } from "@/components/builder/BuilderPageRenderer";
import type { Locale } from "@/i18n/config";
import { pageHead } from "@/lib/seo";
import {
  builderQueryKeys,
  builderService,
  type BuilderPage,
  type SolutionPageSummary,
} from "@/services/builderService";

export type CmsPageLoaderData = {
  page: BuilderPage;
  solutionSummaries: SolutionPageSummary[];
  company: string;
};

export async function loadCmsPage(
  queryClient: QueryClient,
  locale: Locale,
  path: string,
  company: string,
): Promise<CmsPageLoaderData> {
  const [page, solutionSummaries] = await Promise.all([
    queryClient.ensureQueryData({
      queryKey: builderQueryKeys.live(locale, path),
      queryFn: ({ signal }) => builderService.getLive(locale, path, signal),
    }),
    queryClient.ensureQueryData(
      queryOptions({
        queryKey: builderQueryKeys.solutionSummaries(locale),
        queryFn: ({ signal }) => builderService.getSolutionSummaries(locale, signal),
      }),
    ),
  ]);
  return { page, solutionSummaries, company };
}

export function CmsPageView({
  page,
  solutionSummaries,
}: Pick<CmsPageLoaderData, "page" | "solutionSummaries">) {
  return <BuilderPageRenderer document={page.document} solutionSummaries={solutionSummaries} />;
}

export function cmsPageHead(data: CmsPageLoaderData, locale: Locale, path: string) {
  return pageHead({
    locale,
    title: data.page.seoData.title ?? data.page.title,
    description: data.page.seoData.description ?? "",
    company: data.company,
    path,
    ...(data.page.seoData.openGraph.imageUrl
      ? { image: data.page.seoData.openGraph.imageUrl }
      : {}),
    seo: {
      ...data.page.seoData,
      title: data.page.seoData.title ?? data.page.title,
      description: data.page.seoData.description ?? "",
    },
  });
}
