import { createFileRoute } from "@tanstack/react-router";
import { pageHead, toLocale } from "@/lib/seo";
import { Container, MediaStage, Section, SectionHeading } from "@/components/site/primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { contentService } from "@/services/contentService";

export const Route = createFileRoute("/$locale/faq")({
  loader: async ({ context, params }) => ({
    faq: await contentService.getPage(context.queryClient, toLocale(params.locale), "faq"),
    company: context.site.companyName,
  }),
  head: ({ params, loaderData }) => {
    const d = loaderData!;
    const locale = toLocale(params.locale);
    return pageHead({
      locale,
      title: d.faq.title,
      description: d.faq.description,
      company: d.company,
      path: "/faq",
      image: d.faq.heroImageUrl,
      seo: d.faq,
    });
  },
  component: FaqPage,
});

function FaqPage() {
  const { faq } = Route.useLoaderData();

  return (
    <>
      <MediaStage
        src={faq.heroImageUrl}
        alt={faq.imageAlt}
        height="tall"
        brandSideOverlay
        topOverlay
        align="center"
        priority
      >
        <Container className="w-full">
          <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-inverse-muted">
            {faq.eyebrow}
          </p>
          <h1 className="type-h1 mt-8 max-w-[18ch] text-inverse-foreground">{faq.heading}</h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-inverse-muted">
            {faq.lead}
          </p>
        </Container>
      </MediaStage>

      <div className="relative">
        {faq.groups.map((group) => (
          <Section key={group.title} bordered>
            <Container>
              <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
                <SectionHeading title={group.title} />
                <Accordion type="single" collapsible>
                  {group.items.map((item, index) => (
                    <AccordionItem
                      key={item.question}
                      value={item.question}
                      className="border-border first:border-t"
                    >
                      <AccordionTrigger className="gap-6 py-6 no-underline hover:no-underline">
                        <span className="flex items-baseline gap-5">
                          <span className="type-caption tabular-nums">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="type-h4">{item.question}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="type-small max-w-2xl pb-7 ps-12">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </Container>
          </Section>
        ))}
      </div>
    </>
  );
}
