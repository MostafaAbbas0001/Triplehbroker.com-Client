import { apiClient } from "@/api/apiClient";

export type LoginResponse = { accessToken: string; expiresAtUtc: string };

const TOKEN_KEY = "triple-h-admin-session";

export const authService = {
  login: (email: string, password: string) =>
    apiClient<LoginResponse>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  readSession: () => {
    if (typeof window === "undefined") return null;
    const raw = window.sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as LoginResponse;
      if (new Date(session.expiresAtUtc).getTime() <= Date.now()) {
        window.sessionStorage.removeItem(TOKEN_KEY);
        return null;
      }
      return session;
    } catch {
      window.sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }
  },
  saveSession: (session: LoginResponse) =>
    window.sessionStorage.setItem(TOKEN_KEY, JSON.stringify(session)),
  clearSession: () => window.sessionStorage.removeItem(TOKEN_KEY),
};

export function bearerHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}
