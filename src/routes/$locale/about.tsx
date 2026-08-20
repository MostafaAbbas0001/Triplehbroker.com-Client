import { createFileRoute } from "@tanstack/react-router";
import { CmsPageView } from "@/components/builder/CmsPageRoute";
import { cmsPageHead, loadCmsPage } from "@/components/builder/cmsPageRouteData";
import { toLocale } from "@/lib/seo";

export const Route = createFileRoute("/$locale/about")({
  loader: ({ context, params }) =>
    loadCmsPage(context.queryClient, toLocale(params.locale), "about", context.site.companyName),
  head: ({ params, loaderData }) => cmsPageHead(loaderData!, toLocale(params.locale), "/about"),
  component: Page,
});

function Page() {
  const { page, solutionSummaries } = Route.useLoaderData();
  return <CmsPageView page={page} solutionSummaries={solutionSummaries} />;
}
