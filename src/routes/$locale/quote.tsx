import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { pageHead, toLocale } from "@/lib/seo";
import { type SolutionSlug } from "@/i18n/config";
import { ActionButton, Container, Eyebrow, Section } from "@/components/site/primitives";
import { ChoiceCard, Field } from "@/components/site/Field";
import { inputClass } from "@/components/site/form-control";
import { contentService } from "@/services/contentService";

export const Route = createFileRoute("/$locale/quote")({
  loader: async ({ context, params }) => {
    const locale = toLocale(params.locale);
    const [quote, solutions] = await Promise.all([
      contentService.getPage(context.queryClient, locale, "quote"),
      contentService.getPage(context.queryClient, locale, "solutions"),
    ]);
    return { quote, solutions, company: context.site.companyName };
  },
  head: ({ params, loaderData }) => {
    const d = loaderData!;
    const locale = toLocale(params.locale);
    return pageHead({
      locale,
      title: d.quote.title,
      description: d.quote.description,
      company: d.company,
      path: "/quote",
      seo: d.quote,
    });
  },
  component: QuotePage,
});

type FormState = {
  covers: SolutionSlug[];
  coverFor: string;
  existing: string;
  budget: string;
  notes: string;
  name: string;
  email: string;
  phone: string;
  preferred: string;
};

const EMPTY: FormState = {
  covers: [],
  coverFor: "",
  existing: "",
  budget: "",
  notes: "",
  name: "",
  email: "",
  phone: "",
  preferred: "",
};

function QuotePage() {
  const { locale } = useI18n();
  const { quote, solutions } = Route.useLoaderData();
  const optional = locale === "ar" ? "اختياري" : "Optional";
  const validation = quote.errors;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<
    Partial<Record<"covers" | "name" | "email" | "phone", string>>
  >({});
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCover(slug: SolutionSlug) {
    setForm((prev) => ({
      ...prev,
      covers: prev.covers.includes(slug)
        ? prev.covers.filter((c) => c !== slug)
        : [...prev.covers, slug],
    }));
  }

  function validate(current: number) {
    const next: Partial<Record<"covers" | "name" | "email" | "phone", string>> = {};
    if (current === 0 && form.covers.length === 0) next.covers = validation.cover;
    if (current === 2) {
      if (!form.name.trim()) next.name = validation.name;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = validation.email;
      if (!form.phone.trim()) next.phone = validation.phone;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (step < 2) {
      if (validate(step)) setStep(step + 1);
      return;
    }
    if (validate(2)) setSubmitted(true);
  }

  if (submitted) {
    return (
      <Section>
        <Container>
          <div className="mx-auto max-w-xl border-t border-border pt-10">
            <span className="inline-flex items-center gap-2 text-success">
              <Check size={18} strokeWidth={1.25} aria-hidden="true" />
            </span>
            <h1 className="type-h2 mt-6">{quote.successTitle}</h1>
            <p className="type-body mt-4">{quote.successBody}</p>
            <dl className="mt-8 border-t border-border pt-6 text-sm">
              <dt className="type-label">{quote.summaryTitle}</dt>
              <dd className="type-small mt-3">
                {form.covers.map((slug) => solutions.items[slug].name).join(" · ")}
              </dd>
            </dl>
            <ActionButton
              variant="secondary"
              className="mt-8"
              onClick={() => {
                setForm(EMPTY);
                setStep(0);
                setSubmitted(false);
              }}
            >
              {quote.successReset}
            </ActionButton>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <>
      <Section as="div" className="relative">
        <Container>
          <Eyebrow>{quote.eyebrow}</Eyebrow>
          <h1 className="type-h1 mt-10 max-w-[18ch]">{quote.heading}</h1>
          <p className="type-lead mt-8 max-w-xl">{quote.lead}</p>
        </Container>
      </Section>

      <Section bordered className="relative">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-24">
            <ol className="flex gap-6 lg:flex-col lg:gap-0">
              {quote.steps.map((label, index) => {
                const active = index === step;
                const done = index < step;
                return (
                  <li
                    key={label}
                    className="flex items-center gap-3 border-t pt-4 lg:border-t-0 lg:border-s lg:pb-6 lg:pt-0 lg:ps-5"
                    style={{ borderColor: active || done ? "var(--primary)" : "var(--border)" }}
                    aria-current={active ? "step" : undefined}
                  >
                    <span className="type-caption tabular-nums">{index + 1}</span>
                    <span
                      className={
                        active
                          ? "text-[0.9375rem] font-medium text-foreground"
                          : "text-[0.9375rem] text-muted-foreground"
                      }
                    >
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>

            <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
              <p className="type-label">
                {quote.stepLabel} {step + 1} {quote.of} {quote.steps.length}
              </p>

              {step === 0 ? (
                <fieldset className="mt-6">
                  <legend className="type-h3">{quote.coverQuestion}</legend>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {solutions.order.map((slug) => (
                      <ChoiceCard
                        key={slug}
                        type="checkbox"
                        name="covers"
                        value={slug}
                        checked={form.covers.includes(slug)}
                        onChange={() => toggleCover(slug)}
                      >
                        {solutions.items[slug].name}
                      </ChoiceCard>
                    ))}
                  </div>
                  {errors["covers"] ? (
                    <p className="mt-3 text-[0.8125rem] text-error" role="alert">
                      {errors["covers"]}
                    </p>
                  ) : null}
                </fieldset>
              ) : null}

              {step === 1 ? (
                <div className="mt-6 space-y-8">
                  <h2 className="type-h3">{quote.detailsTitle}</h2>
                  <Field label={quote.fields.coverFor}>
                    {({ id }) => (
                      <select
                        id={id}
                        className={inputClass(false)}
                        value={form.coverFor}
                        onChange={(e) => set("coverFor", e.target.value)}
                      >
                        <option value="">—</option>
                        {quote.fields.coverForOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <Field label={quote.fields.existing}>
                    {({ id }) => (
                      <select
                        id={id}
                        className={inputClass(false)}
                        value={form.existing}
                        onChange={(e) => set("existing", e.target.value)}
                      >
                        <option value="">—</option>
                        {quote.fields.existingOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <Field label={quote.fields.budget} hint={optional}>
                    {({ id }) => (
                      <input
                        id={id}
                        type="text"
                        inputMode="numeric"
                        className={inputClass(false)}
                        value={form.budget}
                        onChange={(e) => set("budget", e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label={quote.fields.notes} hint={optional}>
                    {({ id }) => (
                      <textarea
                        id={id}
                        rows={5}
                        placeholder={quote.fields.notesPlaceholder}
                        className={inputClass(false)}
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value)}
                      />
                    )}
                  </Field>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="mt-6 space-y-8">
                  <h2 className="type-h3">{quote.contactTitle}</h2>
                  <Field label={quote.fields.name} error={errors["name"]}>
                    {({ id, describedBy, invalid }) => (
                      <input
                        id={id}
                        type="text"
                        autoComplete="name"
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className={inputClass(invalid)}
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label={quote.fields.email} error={errors["email"]}>
                    {({ id, describedBy, invalid }) => (
                      <input
                        id={id}
                        type="email"
                        autoComplete="email"
                        dir="ltr"
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className={inputClass(invalid)}
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label={quote.fields.phone} error={errors["phone"]}>
                    {({ id, describedBy, invalid }) => (
                      <input
                        id={id}
                        type="tel"
                        autoComplete="tel"
                        dir="ltr"
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        className={inputClass(invalid)}
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                      />
                    )}
                  </Field>
                  <Field label={quote.fields.preferred}>
                    {({ id }) => (
                      <select
                        id={id}
                        className={inputClass(false)}
                        value={form.preferred}
                        onChange={(e) => set("preferred", e.target.value)}
                      >
                        <option value="">—</option>
                        {quote.fields.preferredOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                </div>
              ) : null}

              <div className="mt-10 flex flex-wrap gap-4 border-t border-border pt-8">
                {step > 0 ? (
                  <ActionButton type="button" variant="secondary" onClick={() => setStep(step - 1)}>
                    {quote.back}
                  </ActionButton>
                ) : null}
                <ActionButton type="submit">{step === 2 ? quote.submit : quote.next}</ActionButton>
              </div>
            </form>
          </div>
        </Container>
      </Section>
    </>
  );
}
