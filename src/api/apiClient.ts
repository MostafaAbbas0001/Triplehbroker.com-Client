import { ServerUnavailableError } from "@/lib/errors";

const configuredPublicApiBaseUrl = import.meta.env["VITE_API_BASE_URL"];

if (!configuredPublicApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL is required.");
}

function apiBaseUrl() {
  const runtimeProcess = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process;
  const internalApiBaseUrl = import.meta.env.SSR
    ? runtimeProcess?.env?.["API_INTERNAL_BASE_URL"]
    : undefined;

  return (internalApiBaseUrl || configuredPublicApiBaseUrl).replace(/\/$/, "");
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...init.headers,
      },
    });
  } catch (error) {
    throw new ServerUnavailableError(error);
  }

  if (!response.ok) {
    const contentType = response.headers.get("content-type") ?? "";
    const body = contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    const apiError = new ApiError(
      response.status,
      body,
      `API request failed with status ${response.status}.`,
    );
    if (response.status >= 500) throw new ServerUnavailableError(apiError);
    throw apiError;
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
