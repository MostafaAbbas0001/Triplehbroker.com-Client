import type { SolutionSlug } from "@/i18n/config";

export type PageSeo = {
  title: string;
  description: string;
  canonicalUrl: string | null;
  robots: { index: boolean; follow: boolean };
  openGraph: {
    title: string | null;
    description: string | null;
    imageUrl: string | null;
  };
};

export type SiteContent = {
  companyName: string;
  logoUrl: string;
  footerDescription: string;
  licenceText: string;
  copyrightText: string;
  legalDocuments: Record<
    "terms" | "privacy",
    { title: string; intro: string; sections: Array<{ key: string; title: string; body: string }> }
  >;
};

export type SolutionCopy = {
  name: string;
  imageUrl: string;
  summary: string;
  intro: string;
  covers: string[];
  audience: string;
  help: string;
  href: string;
};

export type SolutionsContent = PageSeo & {
  imageAlt: string;
  heroImageUrl: string;
  order: readonly SolutionSlug[];
  indexHref: string;
  quoteHref: string;
  eyebrow: string;
  heading: string;
  lead: string;
  navigation: { breadcrumb: string; back: string; quote: string };
  detail: { whatItCovers: string; whoItIsFor: string; howWeHelp: string; otherSolutions: string };
  items: Record<SolutionSlug, SolutionCopy>;
};

export type HomeContent = PageSeo & {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    primary: string;
    secondary: string;
    imageAlt: string;
    desktopImageUrl: string;
    mobileImageUrl: string;
    primaryHref: string;
    secondaryHref: string;
  };
  lines: { eyebrow: string; title: string; lead: string };
  why: {
    eyebrow: string;
    title: string;
    lead: string;
    items: Array<{ title: string; body: string }>;
  };
};

export type AboutContent = PageSeo & {
  heroImageUrl: string;
  officeImageAlt: string;
  eyebrow: string;
  heading: string;
  lead: string;
  story: string[];
  factsTitle: string;
  facts: Array<{ label: string; value: string }>;
  commitmentsTitle: string;
  commitments: Array<{ title: string; body: string }>;
};

export type ClaimsContent = PageSeo & {
  heroImageUrl: string;
  imageAlt: string;
  eyebrow: string;
  heading: string;
  lead: string;
  contactHref: string;
  contactLabel: string;
  stepsTitle: string;
  steps: Array<{ title: string; body: string }>;
  prepareTitle: string;
  prepare: string[];
  contactTitle: string;
  contactBody: string;
};

export type QuoteContent = PageSeo & {
  eyebrow: string;
  heading: string;
  lead: string;
  steps: string[];
  stepLabel: string;
  of: string;
  coverQuestion: string;
  detailsTitle: string;
  contactTitle: string;
  fields: {
    coverFor: string;
    coverForOptions: string[];
    budget: string;
    existing: string;
    existingOptions: string[];
    notes: string;
    notesPlaceholder: string;
    name: string;
    email: string;
    phone: string;
    preferred: string;
    preferredOptions: string[];
  };
  back: string;
  next: string;
  submit: string;
  successTitle: string;
  successBody: string;
  successReset: string;
  summaryTitle: string;
  errors: { cover: string; name: string; email: string; phone: string };
};

export type ContactContent = PageSeo & {
  heroImageUrl: string;
  imageAlt: string;
  eyebrow: string;
  heading: string;
  lead: string;
  officeTitle: string;
  address: string[];
  hoursTitle: string;
  hours: Array<{ day: string; time: string }>;
  whatsappLabel: string;
  whatsapp: string;
  phoneLabel: string;
  phone: string;
  emailLabel: string;
  email: string;
  privacyNotice: string;
  formTitle: string;
  form: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    subjectOptions: string[];
    message: string;
    submit: string;
    success: string;
    errors: { name: string; email: string; message: string };
  };
};

export type FaqContent = PageSeo & {
  heroImageUrl: string;
  imageAlt: string;
  eyebrow: string;
  heading: string;
  lead: string;
  groups: Array<{ title: string; items: Array<{ question: string; answer: string }> }>;
};
