import { createFileRoute, notFound } from "@tanstack/react-router";
import { ApiError } from "@/api/apiClient";
import { BuilderPageRenderer } from "@/components/builder/BuilderPageRenderer";
import { pageHead, toLocale } from "@/lib/seo";
import {
  builderQueryKeys,
  builderService,
  type BuilderDocument,
  type BuilderPage,
  type SolutionPageSummary,
} from "@/services/builderService";

export const Route = createFileRoute("/$locale/solutions/$slug")({
  loader: async ({ context, params }) => {
    const locale = toLocale(params.locale);
    const path = `solutions/${params.slug}`;
    try {
      const [page, solutionPages] = await Promise.all([
        context.queryClient.ensureQueryData({
          queryKey: builderQueryKeys.live(locale, path),
          queryFn: ({ signal }) => builderService.getLive(locale, path, signal),
        }),
        context.queryClient.ensureQueryData({
          queryKey: builderQueryKeys.solutionSummaries(locale),
          queryFn: ({ signal }) => builderService.getSolutionSummaries(locale, signal),
        }),
      ]);
      return { page, solutionPages, company: context.site.companyName };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) throw notFound();
      throw error;
    }
  },
  head: ({ params, loaderData }) => {
    const data = loaderData!;
    const locale = toLocale(params.locale);
    return pageHead({
      locale,
      title: data.page.seoData.title ?? data.page.title,
      description: data.page.seoData.description ?? "",
      company: data.company,
      path: `/solutions/${params.slug}`,
      type: "article",
      ...(data.page.seoData.openGraph.imageUrl
        ? { image: data.page.seoData.openGraph.imageUrl }
        : {}),
      seo: {
        ...data.page.seoData,
        title: data.page.seoData.title ?? data.page.title,
        description: data.page.seoData.description ?? "",
      },
    });
  },
  component: SolutionDetail,
});

function SolutionDetail() {
  const { page, solutionPages } = Route.useLoaderData();
  return (
    <BuilderPageRenderer
      document={withRelatedSolutionLinks(page, solutionPages)}
      solutionSummaries={solutionPages}
    />
  );
}

function withRelatedSolutionLinks(
  page: BuilderPage,
  solutionPages: SolutionPageSummary[],
): BuilderDocument {
  const items = solutionPages
    .filter((candidate) => candidate.id !== page.id)
    .sort((left, right) => left.position - right.position)
    .map((candidate) => ({ label: candidate.title, href: `/${candidate.slug}` }));
  return {
    ...page.document,
    children: page.document.children.map((node) =>
      node.settings?.["sectionType"] === "related-links"
        ? {
            ...node,
            content: {
              ...(node.content && typeof node.content === "object" && !Array.isArray(node.content)
                ? node.content
                : {}),
              items,
            },
          }
        : node,
    ),
  };
}
