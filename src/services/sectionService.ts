import { apiClient } from "@/api/apiClient";
import { bearerHeaders } from "./authService";

export type SectionResponse = {
  id: string;
  pageId: string;
  key: string;
  content: unknown;
  updatedAt: string;
};

export const sectionService = {
  getAllForPage: (pageId: string, signal: AbortSignal) =>
    apiClient<SectionResponse[]>(`/api/pages/${pageId}/sections`, { signal }),
  patch: (pageId: string, sectionId: string, content: unknown, token: string) =>
    apiClient<SectionResponse>(`/api/pages/${pageId}/sections/${sectionId}`, {
      method: "PATCH",
      headers: bearerHeaders(token),
      body: JSON.stringify({ content }),
    }),
};
