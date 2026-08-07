import { queryOptions, type QueryClient } from "@tanstack/react-query";
import type {
  AboutContent,
  ClaimsContent,
  ContactContent,
  FaqContent,
  HomeContent,
  QuoteContent,
  SiteContent,
  SolutionsContent,
} from "@/content/pages";
import type { Locale, SolutionSlug } from "@/i18n/config";
import { pageService, type PageResponse } from "./pageService";
import { sectionService, type SectionResponse } from "./sectionService";
import { siteSettingService } from "./siteSettingService";

type PageName = "home" | "about" | "solutions" | "claims" | "quote" | "contact" | "faq";
type PageContentByName = {
  home: HomeContent;
  about: AboutContent;
  solutions: SolutionsContent;
  claims: ClaimsContent;
  quote: QuoteContent;
  contact: ContactContent;
  faq: FaqContent;
};

type RawSiteContent = Omit<SiteContent, "legalDocuments"> & {
  documents: Array<{
    key: "terms" | "privacy";
    title: string;
    intro: string;
    sections: Array<{ title: string; body: string }>;
  }>;
};

export const contentQueryKeys = {
  all: ["content"] as const,
  pages: () => [...contentQueryKeys.all, "pages"] as const,
  sections: (pageId: string) => [...contentQueryKeys.pages(), pageId, "sections"] as const,
  siteSetting: (locale: Locale) =>
    [...contentQueryKeys.all, "site-settings", `site-${locale}`] as const,
};

const pagesQuery = queryOptions({
  queryKey: contentQueryKeys.pages(),
  queryFn: ({ signal }) => pageService.getAll(signal),
});

const sectionsQuery = (pageId: string) =>
  queryOptions({
    queryKey: contentQueryKeys.sections(pageId),
    queryFn: ({ signal }) => sectionService.getAllForPage(pageId, signal),
  });

const siteSettingQuery = (locale: Locale) =>
  queryOptions({
    queryKey: contentQueryKeys.siteSetting(locale),
    queryFn: ({ signal }) => siteSettingService.getByKey(`site-${locale}`, signal),
  });

function pageSlug(locale: Locale, pageName: PageName) {
  return pageName === "home" ? locale : `${locale}/${pageName}`;
}

function findPage(pages: PageResponse[], locale: Locale, pageName: PageName) {
  const slug = pageSlug(locale, pageName);
  const page = pages.find((candidate) => candidate.slug === slug);
  if (!page)
    throw new Error(`Backend content page '${slug}' was not found. Run the database seed.`);
  return page;
}

function content<T>(sections: SectionResponse[], key: string): T {
  const section = sections.find((candidate) => candidate.key === key);
  if (!section) throw new Error(`Backend content section '${key}' was not found.`);
  return section.content as T;
}

function seo(page: PageResponse) {
  return {
    title: page.seoData.title ?? page.title,
    description: page.seoData.description ?? "",
    canonicalUrl: page.seoData.canonicalUrl,
    robots: page.seoData.robots,
    openGraph: page.seoData.openGraph,
  };
}

const mappers: {
  [Key in PageName]: (page: PageResponse, sections: SectionResponse[]) => PageContentByName[Key];
} = {
  home: (page, sections) => ({
    ...seo(page),
    hero: content<HomeContent["hero"]>(sections, "hero"),
    lines: content<HomeContent["lines"]>(sections, "insurance-services"),
    why: content<HomeContent["why"]>(sections, "why-triple-h"),
  }),
  about: (page, sections) => {
    const hero = content<
      Pick<AboutContent, "heroImageUrl" | "officeImageAlt" | "eyebrow" | "heading" | "lead">
    >(sections, "hero");
    const story = content<{ items: AboutContent["story"] }>(sections, "story");
    const facts = content<{ title: string; items: AboutContent["facts"] }>(sections, "facts");
    const commitments = content<{ title: string; items: AboutContent["commitments"] }>(
      sections,
      "commitments",
    );
    return {
      ...seo(page),
      ...hero,
      story: story.items,
      factsTitle: facts.title,
      facts: facts.items,
      commitmentsTitle: commitments.title,
      commitments: commitments.items,
    };
  },
  solutions: (page, sections) => {
    const hero = content<
      Pick<SolutionsContent, "heroImageUrl" | "imageAlt" | "eyebrow" | "heading" | "lead">
    >(sections, "hero");
    const detail = content<
      SolutionsContent["detail"] & {
        order: SolutionSlug[];
        indexHref: string;
        quoteHref: string;
        breadcrumb: string;
        back: string;
        quote: string;
      }
    >(sections, "detail");
    const catalog = content<{ items: SolutionsContent["items"] }>(sections, "catalog");
    return {
      ...seo(page),
      ...hero,
      order: detail.order,
      indexHref: detail.indexHref,
      quoteHref: detail.quoteHref,
      navigation: { breadcrumb: detail.breadcrumb, back: detail.back, quote: detail.quote },
      detail: {
        whatItCovers: detail.whatItCovers,
        whoItIsFor: detail.whoItIsFor,
        howWeHelp: detail.howWeHelp,
        otherSolutions: detail.otherSolutions,
      },
      items: catalog.items,
    };
  },
  claims: (page, sections) => {
    const hero = content<
      Pick<ClaimsContent, "heroImageUrl" | "imageAlt" | "eyebrow" | "heading" | "lead"> & {
        button: { label: string; href: string };
      }
    >(sections, "hero");
    const process = content<{ title: string; steps: ClaimsContent["steps"] }>(sections, "process");
    const prepare = content<{ title: string; items: ClaimsContent["prepare"] }>(
      sections,
      "prepare",
    );
    const claimsDesk = content<{ title: string; body: string }>(sections, "claims-desk");
    return {
      ...seo(page),
      heroImageUrl: hero.heroImageUrl,
      imageAlt: hero.imageAlt,
      eyebrow: hero.eyebrow,
      heading: hero.heading,
      lead: hero.lead,
      contactHref: hero.button.href,
      contactLabel: hero.button.label,
      stepsTitle: process.title,
      steps: process.steps,
      prepareTitle: prepare.title,
      prepare: prepare.items,
      contactTitle: claimsDesk.title,
      contactBody: claimsDesk.body,
    };
  },
  quote: (page, sections) => {
    const hero = content<Pick<QuoteContent, "eyebrow" | "heading" | "lead">>(sections, "hero");
    const progress = content<Pick<QuoteContent, "steps" | "stepLabel" | "of">>(
      sections,
      "progress",
    );
    const cover = content<{ question: string }>(sections, "cover-step");
    const details = content<{
      title: string;
      fields: Pick<
        QuoteContent["fields"],
        | "coverFor"
        | "coverForOptions"
        | "budget"
        | "existing"
        | "existingOptions"
        | "notes"
        | "notesPlaceholder"
      >;
    }>(sections, "details-step");
    const contact = content<{
      title: string;
      fields: Pick<
        QuoteContent["fields"],
        "name" | "email" | "phone" | "preferred" | "preferredOptions"
      >;
    }>(sections, "contact-step");
    const actions = content<Pick<QuoteContent, "back" | "next" | "submit">>(sections, "actions");
    const success = content<
      Pick<QuoteContent, "successTitle" | "successBody" | "successReset" | "summaryTitle">
    >(sections, "success");
    const errors = content<QuoteContent["errors"]>(sections, "errors");
    return {
      ...seo(page),
      ...hero,
      ...progress,
      coverQuestion: cover.question,
      detailsTitle: details.title,
      contactTitle: contact.title,
      fields: { ...details.fields, ...contact.fields },
      ...actions,
      ...success,
      errors,
    };
  },
  contact: (page, sections) => {
    const hero = content<
      Pick<ContactContent, "heroImageUrl" | "imageAlt" | "eyebrow" | "heading" | "lead">
    >(sections, "hero");
    const office = content<{ title: string; address: string[] }>(sections, "office");
    const hours = content<{ title: string; items: ContactContent["hours"] }>(sections, "hours");
    const methods = content<
      Pick<
        ContactContent,
        "whatsappLabel" | "whatsapp" | "phoneLabel" | "phone" | "emailLabel" | "email"
      >
    >(sections, "contact-methods");
    const form = content<{ title: string; privacyNotice: string } & ContactContent["form"]>(
      sections,
      "form",
    );
    const { title: formTitle, privacyNotice, ...formFields } = form;
    return {
      ...seo(page),
      ...hero,
      officeTitle: office.title,
      address: office.address,
      hoursTitle: hours.title,
      hours: hours.items,
      ...methods,
      privacyNotice,
      formTitle,
      form: formFields,
    };
  },
  faq: (page, sections) => {
    const hero = content<
      Pick<FaqContent, "heroImageUrl" | "imageAlt" | "eyebrow" | "heading" | "lead">
    >(sections, "hero");
    const groups = content<{ items: FaqContent["groups"] }>(sections, "question-groups");
    return { ...seo(page), ...hero, groups: groups.items };
  },
};

async function getPage<Key extends PageName>(
  queryClient: QueryClient,
  locale: Locale,
  pageName: Key,
): Promise<PageContentByName[Key]> {
  const pages = await queryClient.ensureQueryData(pagesQuery);
  const page = findPage(pages, locale, pageName);
  const sections = await queryClient.ensureQueryData(sectionsQuery(page.id));
  return mappers[pageName](page, sections);
}

async function getSite(queryClient: QueryClient, locale: Locale): Promise<SiteContent> {
  const setting = await queryClient.ensureQueryData(siteSettingQuery(locale));
  const raw = setting.value as RawSiteContent;
  const legalDocuments = Object.fromEntries(
    raw.documents.map((document) => [
      document.key,
      {
        title: document.title,
        intro: document.intro,
        sections: document.sections.map((section, index) => ({
          key: `section-${index + 1}`,
          ...section,
        })),
      },
    ]),
  ) as SiteContent["legalDocuments"];
  return {
    companyName: raw.companyName,
    tagline: raw.tagline,
    logoUrl: raw.logoUrl,
    footerDescription: raw.footerDescription,
    licenceText: raw.licenceText,
    copyrightText: raw.copyrightText,
    legalDocuments,
  };
}

export const contentService = {
  getPage,
  getSite,
  invalidateAll: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: contentQueryKeys.all }),
  invalidatePage: (queryClient: QueryClient, pageId: string) =>
    queryClient.invalidateQueries({ queryKey: contentQueryKeys.sections(pageId) }),
  invalidateSite: (queryClient: QueryClient, locale: Locale) =>
    queryClient.invalidateQueries({ queryKey: contentQueryKeys.siteSetting(locale) }),
};
