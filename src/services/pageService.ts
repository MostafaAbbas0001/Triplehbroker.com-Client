import { apiClient } from "@/api/apiClient";
import { bearerHeaders } from "./authService";

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
  patch: (
    id: string,
    request: Partial<Pick<PageResponse, "title" | "slug" | "seoData">>,
    token: string,
  ) =>
    apiClient<PageResponse>(`/api/pages/${id}`, {
      method: "PATCH",
      headers: bearerHeaders(token),
      body: JSON.stringify(request),
    }),
};
