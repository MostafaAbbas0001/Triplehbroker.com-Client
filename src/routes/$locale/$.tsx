import { createFileRoute, notFound } from "@tanstack/react-router";
import { ApiError } from "@/api/apiClient";
import { CmsPageView, cmsPageHead, loadCmsPage } from "@/components/builder/CmsPageRoute";
import { toLocale } from "@/lib/seo";

export const Route = createFileRoute("/$locale/$")({
  loader: async ({ context, params }) => {
    const locale = toLocale(params.locale);
    try {
      return await loadCmsPage(
        context.queryClient,
        locale,
        params._splat ?? "",
        context.site.companyName,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) throw notFound();
      throw error;
    }
  },
  head: ({ params, loaderData }) =>
    cmsPageHead(loaderData!, toLocale(params.locale), `/${params._splat ?? ""}`),
  component: DynamicBuilderPage,
});

function DynamicBuilderPage() {
  const data = Route.useLoaderData();
  return <CmsPageView page={data.page} solutionSummaries={data.solutionSummaries} />;
}
