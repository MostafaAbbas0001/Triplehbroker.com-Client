export class ServerUnavailableError extends Error {
  readonly code = "SERVER_UNAVAILABLE";

  constructor(cause?: unknown) {
    super("Cannot reach server.", { cause });
    this.name = "ServerUnavailableError";
  }
}

export function isServerUnavailableError(error: unknown): boolean {
  if (error instanceof ServerUnavailableError) return true;
  if (!error || typeof error !== "object") return false;

  const candidate = error as { name?: unknown; code?: unknown; message?: unknown };
  return (
    candidate.name === "ServerUnavailableError" ||
    candidate.code === "SERVER_UNAVAILABLE" ||
    candidate.message === "Cannot reach server."
  );
}
