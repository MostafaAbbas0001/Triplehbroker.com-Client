import { createFileRoute } from "@tanstack/react-router";
import { pageHead, toLocale } from "@/lib/seo";
import { Container, MediaStage, Section, SectionHeading } from "@/components/site/primitives";
import { contentService } from "@/services/contentService";

export const Route = createFileRoute("/$locale/about")({
  loader: async ({ context, params }) => ({
    about: await contentService.getPage(context.queryClient, toLocale(params.locale), "about"),
    company: context.site.companyName,
  }),
  head: ({ params, loaderData }) => {
    const d = loaderData!;
    const locale = toLocale(params.locale);
    return pageHead({
      locale,
      title: d.about.title,
      description: d.about.description,
      company: d.company,
      path: "/about",
      image: d.about.heroImageUrl,
      seo: d.about,
    });
  },
  component: AboutPage,
});

function AboutPage() {
  const { about } = Route.useLoaderData();

  return (
    <>
      <MediaStage
        src={about.heroImageUrl}
        alt={about.officeImageAlt}
        height="tall"
        brandSideOverlay
        topOverlay
        align="center"
        priority
      >
        <Container className="w-full">
          <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-inverse-muted">
            {about.eyebrow}
          </p>
          <h1 className="type-h1 mt-8 max-w-[18ch] text-inverse-foreground">{about.heading}</h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-inverse-muted">
            {about.lead}
          </p>
        </Container>
      </MediaStage>

      <Section bordered className="relative">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <h2 className="type-h2 max-w-[16ch]">{about.story[0]}</h2>
            <div className="max-w-2xl space-y-6">
              {about.story.slice(1).map((paragraph) => (
                <p key={paragraph} className="type-body">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section bordered className="relative">
        <Container>
          <SectionHeading title={about.factsTitle} />
          <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {about.facts.map((fact) => (
              <div key={fact.label} className="border-t border-border pt-6">
                <dt className="type-caption">{fact.label}</dt>
                <dd className="type-small mt-4 text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section bordered className="relative">
        <Container>
          <SectionHeading title={about.commitmentsTitle} />
          <ul className="mt-10 grid gap-x-12 sm:grid-cols-2">
            {about.commitments.map((commitment, index) => (
              <li key={commitment.title} className="border-t border-border pt-7">
                <span className="type-caption tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="type-h4 mt-5">{commitment.title}</h3>
                <p className="type-small mt-4 max-w-md">{commitment.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
