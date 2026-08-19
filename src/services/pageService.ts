import { apiClient } from "@/api/apiClient";

export type SeoDataResponse = {
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  robots: { index: boolean; follow: boolean };
  openGraph: { title: string | null; description: string | null; imageUrl: string | null };
};

export type PageResponse = {
  id: string;
  title: string;
  slug: string;
  seoData: SeoDataResponse;
  updatedAt: string;
};

export const pageService = {
  getAll: (signal: AbortSignal) => apiClient<PageResponse[]>("/api/pages", { signal }),
};
