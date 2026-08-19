import { apiClient } from "@/api/apiClient";
import type { Locale } from "@/i18n/config";
import { bearerHeaders } from "./authService";
import type { JsonValue } from "./builderService";

export type NavigationItem = {
  id: string;
  label: string;
  linkType: string;
  pageId: string | null;
  url: string | null;
  href: string | null;
  anchor: string | null;
  sortOrder: number;
  openInNewTab: boolean;
  isVisible: boolean;
  style: Record<string, JsonValue>;
  children: NavigationItem[];
};

export type NavigationMenu = {
  id: string;
  name: string;
  key: string;
  locale: Locale;
  items: NavigationItem[];
  updatedAt: string;
};

export type SaveNavigationItem = {
  id?: string;
  label: string;
  linkType: string;
  pageId: string | null;
  url: string | null;
  anchor: string | null;
  openInNewTab: boolean;
  isVisible: boolean;
  style: Record<string, JsonValue>;
  children: SaveNavigationItem[];
};

export const navigationQueryKeys = {
  menu: (locale: Locale, key = "primary") => ["navigation", locale, key] as const,
};

const withSignal = (signal?: AbortSignal): RequestInit => (signal ? { signal } : {});

export const navigationService = {
  get: (locale: Locale, key = "primary", signal?: AbortSignal) =>
    apiClient<NavigationMenu>(`/api/navigation/${locale}/${key}`, withSignal(signal)),
  save: (
    locale: Locale,
    name: string,
    items: SaveNavigationItem[],
    token: string,
    key = "primary",
  ) =>
    apiClient<NavigationMenu>(`/api/navigation/${locale}/${key}`, {
      method: "PUT",
      headers: bearerHeaders(token),
      body: JSON.stringify({ name, items }),
    }),
};
