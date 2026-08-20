import { createFileRoute } from "@tanstack/react-router";
import { CmsPageView } from "@/components/builder/CmsPageRoute";
import { cmsPageHead, loadCmsPage } from "@/components/builder/cmsPageRouteData";
import { toLocale } from "@/lib/seo";

export const Route = createFileRoute("/$locale/contact")({
  loader: ({ context, params }) =>
    loadCmsPage(context.queryClient, toLocale(params.locale), "contact", context.site.companyName),
  head: ({ params, loaderData }) => cmsPageHead(loaderData!, toLocale(params.locale), "/contact"),
  component: Page,
});

function Page() {
  const { page, solutionSummaries } = Route.useLoaderData();
  return <CmsPageView page={page} solutionSummaries={solutionSummaries} />;
}
