import { createFileRoute } from "@tanstack/react-router";
import { CmsPageView } from "@/components/builder/CmsPageRoute";
import { cmsPageHead, loadCmsPage } from "@/components/builder/cmsPageRouteData";
import { toLocale } from "@/lib/seo";

export const Route = createFileRoute("/$locale/quote")({
  loader: ({ context, params }) =>
    loadCmsPage(context.queryClient, toLocale(params.locale), "quote", context.site.companyName),
  head: ({ params, loaderData }) => cmsPageHead(loaderData!, toLocale(params.locale), "/quote"),
  component: Page,
});

function Page() {
  const { page, solutionSummaries } = Route.useLoaderData();
  return <CmsPageView page={page} solutionSummaries={solutionSummaries} />;
}
