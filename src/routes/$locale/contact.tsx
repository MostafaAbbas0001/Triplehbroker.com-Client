import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { pageHead, toLocale } from "@/lib/seo";
import { ActionButton, Container, MediaStage, Section } from "@/components/site/primitives";
import { Field } from "@/components/site/Field";
import { inputClass } from "@/components/site/form-control";

export const Route = createFileRoute("/$locale/contact")({
  loader: ({ context }) => ({
    contact: context.contact,
    company: context.site.companyName,
  }),
  head: ({ params, loaderData }) => {
    const d = loaderData!;
    const locale = toLocale(params.locale);
    return pageHead({
      locale,
      title: d.contact.title,
      description: d.contact.description,
      company: d.company,
      path: "/contact",
      image: d.contact.heroImageUrl,
      seo: d.contact,
    });
  },
  component: ContactPage,
});

function ContactPage() {
  const { locale } = useI18n();
  const { contact } = Route.useLoaderData();
  const optional = locale === "ar" ? "اختياري" : "Optional";
  const validation = contact.form.errors;
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<"name" | "email" | "message", string>>>({});
  const [sent, setSent] = useState(false);

  function set(key: keyof typeof values, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Partial<Record<"name" | "email" | "message", string>> = {};
    if (!values.name.trim()) next.name = validation.name;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = validation.email;
    if (!values.message.trim()) next.message = validation.message;
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSent(true);
      setValues({ name: "", email: "", phone: "", subject: "", message: "" });
    }
  }

  return (
    <>
      <MediaStage
        src={contact.heroImageUrl}
        alt={contact.imageAlt}
        height="tall"
        brandSideOverlay
        topOverlay
        align="center"
        priority
      >
        <Container className="w-full">
          <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-inverse-muted">
            {contact.eyebrow}
          </p>
          <h1 className="type-h1 mt-8 max-w-[18ch] text-inverse-foreground">{contact.heading}</h1>
          <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-inverse-muted">
            {contact.lead}
          </p>
        </Container>
      </MediaStage>

      <Section bordered className="relative">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
            <div>
              <div>
                <h2 className="type-label">{contact.officeTitle}</h2>
                <address className="mt-5 flex gap-3 not-italic">
                  <MapPin
                    size={16}
                    strokeWidth={1.25}
                    className="mt-1 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="type-small">
                    {contact.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </address>
              </div>

              <div className="mt-10 space-y-4">
                <a
                  href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                  className="flex min-h-11 items-center gap-3 border-b border-border pb-5 text-foreground transition-colors hover:text-primary"
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle
                    size={16}
                    strokeWidth={1.25}
                    className="text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span>{contact.whatsappLabel}</span>
                  <span dir="ltr" className="ms-auto">
                    {contact.whatsapp}
                  </span>
                </a>
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
                  <span>{contact.phoneLabel}</span>
                  <span dir="ltr" className="ms-auto">
                    {contact.phone}
                  </span>
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
                  <span>{contact.emailLabel}</span>
                  <span dir="ltr" className="ms-auto">
                    {contact.email}
                  </span>
                </a>
              </div>

              <div className="mt-10">
                <h2 className="type-label flex items-center gap-2">
                  <Clock size={14} strokeWidth={1.25} aria-hidden="true" />
                  {contact.hoursTitle}
                </h2>
                <dl className="mt-5">
                  {contact.hours.map((entry) => (
                    <div
                      key={entry.day}
                      className="flex justify-between border-b border-border py-3 text-[0.9375rem]"
                    >
                      <dt className="text-body">{entry.day}</dt>
                      <dd className="text-foreground">{entry.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div>
              <h2 className="type-h2">{contact.formTitle}</h2>
              <p className="type-small mt-5 border-s-2 border-primary ps-4">
                {contact.privacyNotice}
              </p>
              {sent ? (
                <p
                  className="mt-6 border border-border bg-success-surface p-5 text-[0.9375rem] text-success"
                  role="status"
                >
                  {contact.form.success}
                </p>
              ) : null}
              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-7">
                <div className="grid gap-7 sm:grid-cols-2">
                  <Field label={contact.form.name} error={errors["name"]}>
                    {({ id, describedBy, invalid }) => (
                      <input
                        id={id}
                        type="text"
                        autoComplete="name"
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className={inputClass(invalid)}
                        value={values.name}
                        onChange={(e) => set("name", e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label={contact.form.email} error={errors["email"]}>
                    {({ id, describedBy, invalid }) => (
                      <input
                        id={id}
                        type="email"
                        autoComplete="email"
                        dir="ltr"
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className={inputClass(invalid)}
                        value={values.email}
                        onChange={(e) => set("email", e.target.value)}
                      />
                    )}
                  </Field>
                </div>
                <div className="grid gap-7 sm:grid-cols-2">
                  <Field label={contact.form.phone} hint={optional}>
                    {({ id }) => (
                      <input
                        id={id}
                        type="tel"
                        autoComplete="tel"
                        dir="ltr"
                        className={inputClass(false)}
                        value={values.phone}
                        onChange={(e) => set("phone", e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label={contact.form.subject} hint={optional}>
                    {({ id }) => (
                      <select
                        id={id}
                        className={inputClass(false)}
                        value={values.subject}
                        onChange={(e) => set("subject", e.target.value)}
                      >
                        <option value="">{contact.form.subjectOptions[0]}</option>
                        {contact.form.subjectOptions.slice(1).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                </div>
                <Field label={contact.form.message} error={errors["message"]}>
                  {({ id, describedBy, invalid }) => (
                    <textarea
                      id={id}
                      rows={6}
                      aria-invalid={invalid}
                      aria-describedby={describedBy}
                      className={inputClass(invalid)}
                      value={values.message}
                      onChange={(e) => set("message", e.target.value)}
                    />
                  )}
                </Field>
                <ActionButton type="submit">{contact.form.submit}</ActionButton>
              </form>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
