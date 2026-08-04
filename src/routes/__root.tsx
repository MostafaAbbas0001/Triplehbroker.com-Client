import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { isServerUnavailableError } from "../lib/errors";
import { dirOf, isLocale } from "@/i18n/config";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const locale = pathname.split("/")[1] === "ar" ? "ar" : "en";
  const serverUnavailable = isServerUnavailableError(error);
  const copy =
    locale === "ar"
      ? serverUnavailable
        ? {
            eyebrow: "تريبل إتش إنشورنس بروكر",
            title: "تعذّر الاتصال بالخادم",
            body: "محتوى الموقع غير متاح مؤقتاً. يرجى إعادة المحاولة بعد قليل.",
            retry: "إعادة المحاولة",
            home: "العودة إلى الرئيسية",
          }
        : {
            eyebrow: "تريبل إتش إنشورنس بروكر",
            title: "تعذّر تحميل الصفحة",
            body: "حدث خطأ غير متوقع. يمكنك إعادة المحاولة أو العودة إلى الصفحة الرئيسية.",
            retry: "إعادة المحاولة",
            home: "العودة إلى الرئيسية",
          }
      : serverUnavailable
        ? {
            eyebrow: "Triple H Insurance Broker",
            title: "We can’t reach our server",
            body: "Our website content is temporarily unavailable. Please try again in a moment.",
            retry: "Try again",
            home: "Go home",
          }
        : {
            eyebrow: "Triple H Insurance Broker",
            title: "This page didn’t load",
            body: "Something unexpected happened. You can try again or return to the home page.",
            retry: "Try again",
            home: "Go home",
          };
  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-6 text-inverse-foreground">
      <div className="w-full max-w-xl border-y border-inverse-border py-14 text-center">
        <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-inverse-muted">
          {copy.eyebrow}
        </p>
        <h1 className="type-h2 mt-6 text-inverse-foreground">{copy.title}</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-inverse-muted">
          {copy.body}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center border border-white bg-white px-5 py-2 text-sm font-medium text-primary transition-colors hover:bg-white/90"
          >
            {copy.retry}
          </button>
          {!serverUnavailable ? (
            <a
              href={`/${locale}`}
              className="inline-flex min-h-11 items-center justify-center border border-inverse-border px-5 py-2 text-sm font-medium text-inverse-foreground transition-colors hover:border-white"
            >
              {copy.home}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export type RouterContext = { queryClient: QueryClient };

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      {
        rel: "shortcut icon",
        type: "image/x-icon",
        href: "/favicon.ico?v=20260804",
      },
      { rel: "icon", type: "image/jpeg", href: "/logo.jpeg?v=20260804" },
      { rel: "apple-touch-icon", href: "/logo.jpeg?v=20260804" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Inter+Tight:wght@300;400;500;600&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const routeLocale = pathname.split("/")[1];
  const locale = isLocale(routeLocale) ? routeLocale : "en";

  return (
    <html lang={locale} dir={dirOf(locale)}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
