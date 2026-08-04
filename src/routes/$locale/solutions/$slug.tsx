import { createFileRoute, notFound } from "@tanstack/react-router";
import { SOLUTION_SLUGS, type SolutionSlug } from "@/i18n/config";
import { pageHead, toLocale } from "@/lib/seo";
import { ActionAnchor, Container, Eyebrow, Section } from "@/components/site/primitives";
import { contentService } from "@/services/contentService";

function isSolutionSlug(value: string): value is SolutionSlug {
  return (SOLUTION_SLUGS as readonly string[]).includes(value);
}

export const Route = createFileRoute("/$locale/solutions/$slug")({
  beforeLoad: ({ params }) => {
    if (!isSolutionSlug(params.slug)) throw notFound();
  },
  loader: async ({ context, params }) => ({
    solutions: await contentService.getPage(
      context.queryClient,
      toLocale(params.locale),
      "solutions",
    ),
    company: context.site.companyName,
  }),
  head: ({ params, loaderData }) => {
    const d = loaderData!;
    const locale = toLocale(params.locale);
    const slug = params.slug as SolutionSlug;
    const item = d.solutions.items[slug];
    return pageHead({
      locale,
      title: item.name,
      description: item.summary,
      company: d.company,
      path: `/solutions/${slug}`,
      type: "article",
      image: d.solutions.heroImageUrl,
    });
  },
  component: SolutionDetail,
});

function SolutionDetail() {
  const { solutions } = Route.useLoaderData();
  const copy = solutions.navigation;
  const { slug: rawSlug } = Route.useParams();
  const slug = rawSlug as SolutionSlug;
  const item = solutions.items[slug];
  const others = solutions.order.filter((s) => s !== slug);

  return (
    <>
      <Section as="div" size="lg">
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24">
            <div>
              <Eyebrow>{solutions.eyebrow}</Eyebrow>
              <h1 className="type-h1 mt-10">{item.name}</h1>
              <p className="type-lead mt-8 max-w-lg">{item.intro}</p>
            </div>
            <div className="self-end">
              <div className="border-t border-border pt-7">
                <p className="type-label">{solutions.detail.whoItIsFor}</p>
                <p className="type-body mt-4">{item.audience}</p>
              </div>
              <ActionAnchor href={solutions.quoteHref} className="mt-10">
                {copy.quote}
              </ActionAnchor>
            </div>
          </div>
        </Container>
      </Section>

      <Section bordered>
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <h2 className="type-h2">{solutions.detail.whatItCovers}</h2>
              <ul className="mt-10">
                {item.covers.map((cover) => (
                  <li key={cover} className="border-b border-border py-5 type-small">
                    {cover}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="type-h2">{solutions.detail.howWeHelp}</h2>
              <p className="type-body mt-10 max-w-xl">{item.help}</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section bordered>
        <Container>
          <h2 className="type-h3">{solutions.detail.otherSolutions}</h2>
          <ul className="mt-10 grid gap-x-12 sm:grid-cols-2 lg:grid-cols-5">
            {others.map((other) => (
              <li key={other} className="border-t border-border">
                <a
                  href={solutions.items[other].href}
                  className="block py-6 text-[0.9375rem] text-foreground transition-colors duration-[var(--duration-base)] hover:text-primary"
                >
                  {solutions.items[other].name}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
