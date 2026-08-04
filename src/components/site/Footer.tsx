import { useI18n } from "@/i18n/context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Container } from "./primitives";
import { Wordmark } from "./Header";

function LegalDialog({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: readonly { title: string; body: string }[];
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="cursor-pointer border-b border-white/35 pb-1 text-start text-xs text-inverse-muted transition-colors hover:border-white hover:text-inverse-foreground"
        >
          {title}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85svh] max-w-2xl overflow-y-auto rounded-none border-border p-7 sm:p-10">
        <DialogHeader className="text-start">
          <DialogTitle className="type-h3 pe-8">{title}</DialogTitle>
          <DialogDescription className="pt-3 leading-relaxed">{intro}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-6">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-border pt-5">
              <h3 className="type-h4">{section.title}</h3>
              <p className="type-small mt-2">{section.body}</p>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Footer() {
  const { locale, site, contact } = useI18n();
  const year = new Date().getFullYear();
  const copy =
    locale === "ar"
      ? { contact: "التواصل", legal: "المعلومات القانونية" }
      : { contact: "Contact", legal: "Legal information" };
  const terms = site.legalDocuments.terms;
  const privacy = site.legalDocuments.privacy;

  return (
    <footer className="footer-brand-glass relative text-inverse-foreground">
      <Container>
        <div className="grid gap-10 py-12 md:grid-cols-[1fr_auto] md:items-start md:gap-20">
          <div className="max-w-sm">
            <Wordmark tone="inverse" />
            <p className="mt-5 text-sm leading-relaxed text-inverse-muted">
              {site.footerDescription}
            </p>
          </div>

          <div className="md:min-w-64">
            <p className="type-label text-inverse-muted">{copy.contact}</p>
            <address className="mt-4 space-y-2 text-sm not-italic text-inverse-muted">
              <span className="block">
                {contact.address[1]}, {contact.address[2]}
              </span>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="block transition-colors hover:text-inverse-foreground"
                dir="ltr"
              >
                {contact.phone}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="block transition-colors hover:text-inverse-foreground"
                dir="ltr"
              >
                {contact.email}
              </a>
            </address>
          </div>
        </div>

        <div className="grid gap-5 border-t border-inverse-border py-6 md:grid-cols-[1fr_auto] md:items-end">
          <div className="text-xs text-inverse-muted">
            <p>{site.licenceText}</p>
            <p className="mt-1">
              © {year} {site.companyName}. {site.copyrightText}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3" aria-label={copy.legal}>
            <LegalDialog title={terms.title} intro={terms.intro} sections={terms.sections} />
            <LegalDialog title={privacy.title} intro={privacy.intro} sections={privacy.sections} />
          </div>
        </div>
      </Container>
    </footer>
  );
}
