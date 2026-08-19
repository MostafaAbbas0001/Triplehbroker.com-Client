import { apiClient } from "@/api/apiClient";
import type { Locale } from "@/i18n/config";
import type { SeoDataResponse } from "./pageService";
import { bearerHeaders } from "./authService";

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type BuilderNode = {
  id: string;
  type: string;
  position?: number;
  visible?: boolean;
  content?: JsonValue;
  settings?: Record<string, JsonValue>;
  styles?: Record<string, JsonValue> & {
    desktop?: Record<string, JsonValue>;
    tablet?: Record<string, JsonValue>;
    mobile?: Record<string, JsonValue>;
  };
  children?: BuilderNode[];
};

export type BuilderDocument = {
  schemaVersion: 1;
  type: "page";
  template: string;
  settings: { headerMode?: string; footerVisible?: boolean; [key: string]: JsonValue | undefined };
  children: BuilderNode[];
};

export type BuilderPageSummary = {
  id: string;
  pageGroupId: string | null;
  title: string;
  slug: string;
  locale: Locale;
  template: string;
  isHomepage: boolean;
  isSystemPage: boolean;
  updatedAt: string;
};

export type BuilderPage = BuilderPageSummary & {
  seoData: SeoDataResponse;
  document: BuilderDocument;
};

export type SolutionPageSummary = {
  id: string;
  title: string;
  slug: string;
  locale: Locale;
  summary: string;
  imageUrl: string | null;
  position: number;
};

export type CreateBuilderPage = {
  title: string;
  slug: string;
  locale: Locale;
  template: string;
  pageGroupId?: string | null;
  isHomepage?: boolean;
  seoData?: SeoDataResponse;
  document?: BuilderDocument;
};

export const builderQueryKeys = {
  all: ["builder"] as const,
  pages: () => [...builderQueryKeys.all, "pages"] as const,
  page: (id: string) => [...builderQueryKeys.pages(), id] as const,
  live: (locale: Locale, path: string) =>
    [...builderQueryKeys.pages(), "live", locale, path] as const,
  solutionSummaries: (locale: Locale) =>
    [...builderQueryKeys.pages(), "solution-summaries", locale] as const,
};

const withSignal = (signal?: AbortSignal): RequestInit => (signal ? { signal } : {});

export const builderService = {
  getPages: (token: string, signal?: AbortSignal) =>
    apiClient<BuilderPageSummary[]>("/api/builder/pages", {
      headers: bearerHeaders(token),
      ...withSignal(signal),
    }),
  getPage: (id: string, token: string, signal?: AbortSignal) =>
    apiClient<BuilderPage>(`/api/builder/pages/${id}`, {
      headers: bearerHeaders(token),
      ...withSignal(signal),
    }),
  getLive: (locale: Locale, path: string, signal?: AbortSignal) =>
    apiClient<BuilderPage>(
      `/api/builder/pages/public?locale=${encodeURIComponent(locale)}&path=${encodeURIComponent(path)}`,
      withSignal(signal),
    ),
  getSolutionSummaries: (locale: Locale, signal?: AbortSignal) =>
    apiClient<SolutionPageSummary[]>(
      `/api/builder/pages/public/solution-summaries?locale=${encodeURIComponent(locale)}`,
      withSignal(signal),
    ),
  create: (request: CreateBuilderPage, token: string) =>
    apiClient<BuilderPage>("/api/builder/pages", {
      method: "POST",
      headers: bearerHeaders(token),
      body: JSON.stringify(request),
    }),
  updateMetadata: (
    id: string,
    request: Partial<Pick<BuilderPage, "title" | "slug" | "template" | "isHomepage" | "seoData">>,
    token: string,
  ) =>
    apiClient<BuilderPage>(`/api/builder/pages/${id}`, {
      method: "PATCH",
      headers: bearerHeaders(token),
      body: JSON.stringify(request),
    }),
  saveDocument: (id: string, document: BuilderDocument, token: string) =>
    apiClient<BuilderPage>(`/api/builder/pages/${id}/document`, {
      method: "PUT",
      headers: bearerHeaders(token),
      body: JSON.stringify({ document }),
    }),
  delete: (id: string, token: string) =>
    apiClient<void>(`/api/builder/pages/${id}`, {
      method: "DELETE",
      headers: bearerHeaders(token),
    }),
};
