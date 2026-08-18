import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/i18n/context";
import { toLocale, pageHead } from "@/lib/seo";
import { contentService } from "@/services/contentService";
import {
  ActionAnchor,
  Container,
  MediaStage,
  Reveal,
  Section,
  SectionHeading,
} from "@/components/site/primitives";

export const Route = createFileRoute("/$locale/")({
  loader: async ({ context, params }) => {
    const locale = toLocale(params.locale);
    const [home, solutions] = await Promise.all([
      contentService.getPage(context.queryClient, locale, "home"),
      contentService.getPage(context.queryClient, locale, "solutions"),
    ]);
    return { home, solutions, company: context.site.companyName };
  },
  head: ({ params, loaderData }) => {
    const d = loaderData!;
    const locale = toLocale(params.locale);
    return pageHead({
      locale,
      title: d.home.title,
      description: d.home.description,
      company: d.company,
      path: "",
      image: d.home.hero.desktopImageUrl,
      seo: d.home,
    });
  },
  component: HomePage,
});

function HomePage() {
  const { locale } = useI18n();
  const { home, solutions } = Route.useLoaderData();
  const readMore = locale === "ar" ? "عرض تفاصيل التغطية" : "View cover details";

  return (
    <>
      {/* Cinematic hero */}
      <MediaStage
        src={home.hero.desktopImageUrl}
        mobileSrc={home.hero.mobileImageUrl}
        alt={home.hero.imageAlt}
        height="full"
        brandSideOverlay
        topOverlay
        align="center"
        priority
      >
        <Container className="w-full pb-32 lg:pb-0">
          <div className="fade-up max-w-3xl">
            <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-inverse-muted">
              {home.hero.eyebrow}
            </p>
            <h1 className="type-display mt-8 max-w-[16ch] text-inverse-foreground">
              {home.hero.title}
            </h1>
            <p className="mt-8 max-w-xl text-[1.0625rem] leading-relaxed text-inverse-muted">
              {home.hero.lead}
            </p>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <ActionAnchor href={home.hero.primaryHref} variant="inverse">
                {home.hero.primary}
              </ActionAnchor>
              <ActionAnchor href={home.hero.secondaryHref} variant="inverseOutline">
                {home.hero.secondary}
              </ActionAnchor>
            </div>
          </div>
        </Container>
      </MediaStage>

      {/* Lines of cover */}
      <Section bordered className="relative">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={home.lines.eyebrow}
              title={home.lines.title}
              lead={home.lines.lead}
            />
          </Reveal>
          <ul className="mt-16 grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {solutions.order.map((slug, index) => {
              const item = solutions.items[slug];
              return (
                <li key={slug}>
                  <Reveal delay={index * 120} className="size-full">
                    <a
                      href={item.href}
                      className="group relative flex aspect-[4/5] size-full flex-col overflow-hidden bg-muted"
                    >
                      <img
                        src={item.imageUrl}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="relative flex size-full flex-col justify-end p-8 sm:p-10">
                        <span className="type-caption tabular-nums text-inverse-muted">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="type-h3 mt-4 text-inverse-foreground">{item.name}</h3>
                        <p className="mt-3 max-w-[34ch] text-[0.9375rem] leading-relaxed text-inverse-muted">
                          {item.summary}
                        </p>
                        <span className="hairline-link mt-7 self-start text-[0.75rem] uppercase tracking-[0.18em] text-inverse-foreground">
                          {readMore}
                        </span>
                      </div>
                    </a>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* What we do */}
      <Section bordered className="relative">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <SectionHeading
              eyebrow={home.why.eyebrow}
              title={home.why.title}
              lead={home.why.lead}
            />
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {home.why.items.map((item) => (
                <li key={item.title} className="border-t border-border py-6">
                  <h3 className="type-h4">{item.title}</h3>
                  <p className="type-small mt-3 max-w-md">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>
    </>
  );
}
