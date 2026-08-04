import { apiClient } from "@/api/apiClient";
import { bearerHeaders } from "./authService";

export type SiteSettingResponse = {
  id: string;
  key: string;
  value: unknown;
  updatedAt: string;
};

export const siteSettingService = {
  getByKey: (key: string, signal: AbortSignal) =>
    apiClient<SiteSettingResponse>(`/api/site-settings/${encodeURIComponent(key)}`, { signal }),
  patch: (key: string, value: unknown, token: string) =>
    apiClient<SiteSettingResponse>(`/api/site-settings/${encodeURIComponent(key)}`, {
      method: "PATCH",
      headers: bearerHeaders(token),
      body: JSON.stringify({ value }),
    }),
};
