import { apiClient } from "@/api/apiClient";
import { bearerHeaders } from "./authService";
import type { JsonValue } from "./builderService";

export type ThemeResponse = {
  id: string;
  name: string;
  isActive: boolean;
  tokens: Record<string, JsonValue>;
  updatedAt: string;
};

export const themeQueryKey = ["theme", "active"] as const;

const withSignal = (signal?: AbortSignal): RequestInit => (signal ? { signal } : {});

export const themeService = {
  getActive: (signal?: AbortSignal) =>
    apiClient<ThemeResponse>("/api/themes/active", withSignal(signal)),
  update: (id: string, name: string, tokens: Record<string, JsonValue>, token: string) =>
    apiClient<ThemeResponse>(`/api/themes/${id}`, {
      method: "PUT",
      headers: bearerHeaders(token),
      body: JSON.stringify({ name, tokens }),
    }),
};
