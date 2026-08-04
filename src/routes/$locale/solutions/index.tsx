import { createFileRoute } from "@tanstack/react-router";
import { pageHead, toLocale } from "@/lib/seo";
import { Container, MediaStage, Section } from "@/components/site/primitives";
import { contentService } from "@/services/contentService";

export const Route = createFileRoute("/$locale/solutions/")({
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
    return pageHead({
      locale,
      title: d.solutions.title,
      description: d.solutions.description,
      company: d.company,
      path: "/solutions",
      image: d.solutions.heroImageUrl,
      seo: d.solutions,
    });
  },
  component: SolutionsPage,
});

function SolutionsPage() {
  const { solutions } = Route.useLoaderData();

  return (
    <>
      <MediaStage
        src={solutions.heroImageUrl}
        alt={solutions.imageAlt}
        height="tall"
        brandSideOverlay
        topOverlay
        align="center"
        priority
      >
        <Container className="w-full">
          <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-inverse-muted">
            {solutions.eyebrow}
          </p>
          <h1 className="type-h1 mt-8 max-w-[18ch] text-inverse-foreground">{solutions.heading}</h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-inverse-muted">
            {solutions.lead}
          </p>
        </Container>
      </MediaStage>

      <Section bordered className="relative">
        <Container>
          <ul>
            {solutions.order.map((slug, index) => {
              const item = solutions.items[slug];
              return (
                <li key={slug} className="border-t border-border last:border-b">
                  <a
                    href={item.href}
                    className="group grid gap-5 py-8 sm:grid-cols-[4rem_0.9fr_1.1fr] sm:items-center md:gap-8"
                  >
                    <span className="type-caption tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="type-h3 transition-colors duration-[var(--duration-base)] group-hover:text-primary">
                      {item.name}
                    </h2>
                    <p className="type-small max-w-xl">{item.summary}</p>
                  </a>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>
    </>
  );
}
