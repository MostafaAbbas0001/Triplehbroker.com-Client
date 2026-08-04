import { createFileRoute, redirect } from "@tanstack/react-router";
import { DEFAULT_LOCALE } from "@/i18n/config";

/** `/` resolves to the visitor's stored or preferred locale. */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/$locale", params: { locale: DEFAULT_LOCALE }, replace: true });
  },
});
