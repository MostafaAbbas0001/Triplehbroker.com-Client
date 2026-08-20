import { queryOptions, type QueryClient } from "@tanstack/react-query";
import type { ContactContent, SiteContent } from "@/content/pages";
import type { Locale } from "@/i18n/config";
import { builderQueryKeys, builderService, type BuilderNode } from "./builderService";
import { siteSettingService } from "./siteSettingService";

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

const siteSettingQuery = (locale: Locale) =>
  queryOptions({
    queryKey: contentQueryKeys.siteSetting(locale),
    queryFn: ({ signal }) => siteSettingService.getByKey(`site-${locale}`, signal),
  });

function sectionContent(nodes: BuilderNode[], kind: string): Record<string, unknown> {
  const node = nodes.find(
    (candidate) =>
      candidate.visible !== false &&
      (candidate.settings?.["sectionType"] === kind || candidate.type === kind),
  );
  return node?.content && typeof node.content === "object" && !Array.isArray(node.content)
    ? (node.content as Record<string, unknown>)
    : {};
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function records(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      )
    : [];
}

async function getContact(queryClient: QueryClient, locale: Locale): Promise<ContactContent> {
  const page = await queryClient.ensureQueryData({
    queryKey: builderQueryKeys.live(locale, "contact"),
    queryFn: ({ signal }) => builderService.getLive(locale, "contact", signal),
  });
  const nodes = page.document.children;
  const hero = sectionContent(nodes, "hero-banner");
  const office = sectionContent(nodes, "address-block");
  const hours = sectionContent(nodes, "hours-location");
  const details = sectionContent(nodes, "contact-details");
  const form = sectionContent(nodes, "form");
  const methods = records(details["items"]);
  const byLabel = (part: string) =>
    methods.find((item) => text(item["label"]).toLowerCase().includes(part));
  const email =
    methods.find((item) => text(item["href"]).startsWith("mailto:")) ?? byLabel("email");
  const whatsapp = byLabel("whatsapp") ?? byLabel("واتساب");
  const phone =
    methods.find(
      (item) => item !== email && item !== whatsapp && text(item["href"]).startsWith("tel:"),
    ) ??
    byLabel("phone") ??
    byLabel("هاتف");
  const fields = records(form["items"]);
  const field = (name: string) => fields.find((item) => text(item["name"]) === name) ?? {};
  const address = Array.isArray(office["address"])
    ? office["address"].map(text)
    : text(office["address"]).split("\n").filter(Boolean);
  const subjectOptions = field("subject")["options"];

  return {
    title: page.seoData.title ?? page.title,
    description: page.seoData.description ?? "",
    canonicalUrl: page.seoData.canonicalUrl,
    robots: page.seoData.robots,
    openGraph: page.seoData.openGraph,
    heroImageUrl: text(hero["desktopImageUrl"] ?? hero["heroImageUrl"]),
    imageAlt: text(hero["imageAlt"] ?? hero["officeImageAlt"]),
    eyebrow: text(hero["eyebrow"]),
    heading: text(hero["heading"] ?? hero["title"]),
    lead: text(hero["intro"] ?? hero["lead"]),
    officeTitle: text(office["heading"]),
    address,
    hoursTitle: text(hours["heading"]),
    hours: records(hours["items"]).map((item) => ({
      day: text(item["day"]),
      time: text(item["time"]),
    })),
    whatsappLabel: text(whatsapp?.["label"]),
    whatsapp: text(whatsapp?.["value"]),
    phoneLabel: text(phone?.["label"]),
    phone: text(phone?.["value"]),
    emailLabel: text(email?.["label"]),
    email: text(email?.["value"]),
    privacyNotice: text(form["intro"]),
    formTitle: text(form["heading"]),
    form: {
      name: text(field("name")["label"]),
      email: text(field("email")["label"]),
      phone: text(field("phone")["label"]),
      subject: text(field("subject")["label"]),
      subjectOptions: Array.isArray(subjectOptions)
        ? subjectOptions.map(text)
        : text(subjectOptions)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
      message: text(field("message")["label"]),
      submit: text(form["submitLabel"]),
      success: text(form["successMessage"]),
      errors: { name: "", email: "", message: "" },
    },
  };
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
  getContact,
  getSite,
  invalidateAll: (queryClient: QueryClient) =>
    queryClient.invalidateQueries({ queryKey: contentQueryKeys.all }),
  invalidatePage: (queryClient: QueryClient, pageId: string) =>
    queryClient.invalidateQueries({ queryKey: contentQueryKeys.sections(pageId) }),
  invalidateSite: (queryClient: QueryClient, locale: Locale) =>
    queryClient.invalidateQueries({ queryKey: contentQueryKeys.siteSetting(locale) }),
};
