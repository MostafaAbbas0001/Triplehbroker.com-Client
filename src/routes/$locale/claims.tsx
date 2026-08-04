import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { pageHead, toLocale } from "@/lib/seo";
import { contentService } from "@/services/contentService";
import {
  ActionAnchor,
  Container,
  MediaStage,
  Section,
  SectionHeading,
} from "@/components/site/primitives";

export const Route = createFileRoute("/$locale/claims")({
  loader: async ({ context, params }) => ({
    claims: await contentService.getPage(context.queryClient, toLocale(params.locale), "claims"),
    company: context.site.companyName,
  }),
  head: ({ params, loaderData }) => {
    const d = loaderData!;
    const locale = toLocale(params.locale);
    return pageHead({
      locale,
      title: d.claims.title,
      description: d.claims.description,
      company: d.company,
      path: "/claims",
      image: d.claims.heroImageUrl,
      seo: d.claims,
    });
  },
  component: ClaimsPage,
});

function ClaimsPage() {
  const { contact } = useI18n();
  const { claims } = Route.useLoaderData();

  return (
    <>
      <MediaStage
        src={claims.heroImageUrl}
        alt={claims.imageAlt}
        height="tall"
        brandSideOverlay
        topOverlay
        align="center"
        priority
      >
        <Container className="w-full">
          <div className="max-w-2xl">
            <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-inverse-muted">
              {claims.eyebrow}
            </p>
            <h1 className="type-h1 mt-8 max-w-[16ch] text-inverse-foreground">{claims.heading}</h1>
            <p className="mt-8 max-w-xl text-[1.0625rem] leading-relaxed text-inverse-muted">
              {claims.lead}
            </p>
            <ActionAnchor href={claims.contactHref} variant="inverse" className="mt-11">
              {claims.contactLabel}
            </ActionAnchor>
          </div>
        </Container>
      </MediaStage>

      <Section bordered className="relative">
        <Container>
          <SectionHeading title={claims.stepsTitle} />
          <ol className="mt-16 grid gap-x-12 gap-y-14 md:grid-cols-2 lg:grid-cols-4">
            {claims.steps.map((step, index) => (
              <li key={step.title} className="border-t border-border pt-7">
                <span className="type-caption tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="type-h4 mt-6">{step.title}</h3>
                <p className="type-small mt-3">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section bordered className="relative">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <h2 className="type-h2">{claims.prepareTitle}</h2>
              <ul className="mt-10">
                {claims.prepare.map((entry) => (
                  <li key={entry} className="border-b border-border py-5 type-small">
                    {entry}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="type-h2">{claims.contactTitle}</h2>
              <p className="type-body mt-8">{claims.contactBody}</p>
              <div className="mt-10 space-y-4">
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="flex min-h-11 items-center gap-3 border-b border-border pb-5 text-foreground transition-colors hover:text-primary"
                >
                  <Phone
                    size={16}
                    strokeWidth={1.25}
                    className="text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span dir="ltr">{contact.phone}</span>
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex min-h-11 items-center gap-3 border-b border-border pb-5 text-foreground transition-colors hover:text-primary"
                >
                  <Mail
                    size={16}
                    strokeWidth={1.25}
                    className="text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span dir="ltr">{contact.email}</span>
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
