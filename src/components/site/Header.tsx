import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

const HEADER_COPY = {
  en: {
    tagline: "Independent insurance brokerage",
    menu: "Menu",
    close: "Close menu",
    links: [
      { href: "", to: "/$locale", label: "Home", exact: true },
      { href: "/about", to: "/$locale/about", label: "About", exact: false },
      { href: "/solutions", to: "/$locale/solutions", label: "Solutions", exact: false },
      { href: "/claims", to: "/$locale/claims", label: "Claims", exact: false },
      { href: "/faq", to: "/$locale/faq", label: "FAQ", exact: false },
      { href: "/contact", to: "/$locale/contact", label: "Contact", exact: false },
    ],
  },
  ar: {
    tagline: "وساطة تأمين مستقلة",
    menu: "القائمة",
    close: "إغلاق القائمة",
    links: [
      { href: "", to: "/$locale", label: "الرئيسية", exact: true },
      { href: "/about", to: "/$locale/about", label: "من نحن", exact: false },
      { href: "/solutions", to: "/$locale/solutions", label: "الحلول", exact: false },
      { href: "/claims", to: "/$locale/claims", label: "المطالبات", exact: false },
      { href: "/faq", to: "/$locale/faq", label: "الأسئلة الشائعة", exact: false },
      { href: "/contact", to: "/$locale/contact", label: "اتصل بنا", exact: false },
    ],
  },
} as const;

export function Wordmark({ tone = "default" }: { tone?: "default" | "inverse" }) {
  const { locale, site } = useI18n();
  const copy = HEADER_COPY[locale];
  return (
    <Link
      to="/$locale"
      params={{ locale }}
      preload="intent"
      className="group flex items-center gap-3 leading-none"
      aria-label={site.companyName}
    >
      <img
        src={site.logoUrl}
        alt=""
        aria-hidden="true"
        className={cn(
          "h-16 w-auto shrink-0 object-contain transition-[filter] duration-[700ms] ease-[var(--ease-cinematic)]",
          tone === "default" && "brightness-0",
        )}
      />
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            "font-display text-xl tracking-[0.02em] transition-colors duration-[700ms] ease-[var(--ease-cinematic)]",
            tone === "inverse" ? "text-inverse-foreground" : "text-foreground",
          )}
        >
          {site.companyName}
        </span>
        <span
          className={cn(
            "mt-1.5 text-[0.625rem] uppercase tracking-[0.24em] transition-colors duration-[700ms] ease-[var(--ease-cinematic)]",
            tone === "inverse" ? "text-inverse-muted" : "text-muted-foreground",
          )}
        >
          {copy.tagline}
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const { locale } = useI18n();
  const copy = HEADER_COPY[locale];
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const isHome = normalizedPathname === `/${locale}`;
  const hasMediaHero =
    isHome ||
    normalizedPathname === `/${locale}/about` ||
    normalizedPathname === `/${locale}/claims` ||
    normalizedPathname === `/${locale}/solutions` ||
    normalizedPathname === `/${locale}/faq` ||
    normalizedPathname === `/${locale}/contact`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlay = hasMediaHero && !scrolled && !open;
  const inverseHeader = !open && (overlay || scrolled);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = copy.links;

  return (
    <header
      className={cn(
        "navbar-color-layer z-50 transition-[background-color,border-color,box-shadow] duration-[950ms] ease-[var(--ease-cinematic)]",
        hasMediaHero ? "fixed inset-x-0 top-0" : "sticky top-0",
        overlay || open || hasMediaHero
          ? "border-b border-transparent bg-transparent"
          : "navbar-glass border-b",
      )}
      data-scrolled={scrolled && !open}
    >
      <div
        className={cn(
          "container-page relative z-[60] flex items-center justify-between gap-8 transition-all duration-[var(--duration-base)]",
          overlay ? "py-7" : scrolled ? "py-3.5" : "py-5",
        )}
      >
        <div className={cn(scrolled && !open && "brand-reenter")}>
          <Wordmark tone={inverseHeader ? "inverse" : "default"} />
        </div>

        <nav className="hidden items-center gap-8 lg:flex" aria-label={copy.menu}>
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.to}
              params={{ locale }}
              preload="intent"
              aria-current={
                (
                  link.exact
                    ? normalizedPathname === `/${locale}`
                    : normalizedPathname.startsWith(`/${locale}${link.href}`)
                )
                  ? "page"
                  : undefined
              }
              data-status={
                (
                  link.exact
                    ? normalizedPathname === `/${locale}`
                    : normalizedPathname.startsWith(`/${locale}${link.href}`)
                )
                  ? "active"
                  : undefined
              }
              className={cn(
                "relative py-2 text-[0.75rem] uppercase tracking-[0.18em] transition-colors duration-[700ms] ease-[var(--ease-cinematic)]",
                inverseHeader
                  ? "text-inverse-muted hover:text-inverse-foreground data-[status=active]:text-inverse-foreground"
                  : "text-body hover:text-foreground data-[status=active]:text-foreground",
              )}
            >
              {link.label}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 -bottom-[1.35rem] h-px scale-x-0 transition-transform duration-[var(--duration-base)] ease-[var(--ease-standard)] data-[on=true]:scale-x-100",
                  inverseHeader ? "bg-inverse-foreground" : "bg-primary",
                )}
                data-on={
                  link.exact
                    ? normalizedPathname === `/${locale}`
                    : normalizedPathname.startsWith(`/${locale}${link.href}`)
                }
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <LanguageSwitcher tone={inverseHeader ? "inverse" : "default"} />
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? copy.close : copy.menu}
            className={cn(
              "glass-pressable relative z-[60] inline-flex size-11 items-center justify-center rounded-full lg:hidden",
              inverseHeader ? "text-inverse-foreground" : "text-foreground",
              inverseHeader && "glass-btn-dark",
            )}
          >
            <span aria-hidden="true" className="relative block h-4 w-6">
              <span
                className={cn(
                  "absolute inset-x-0 top-0 h-px bg-current transition-transform duration-[var(--duration-base)] ease-[var(--ease-cinematic)]",
                  open && "translate-y-[7px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-[7px] h-px bg-current transition-opacity duration-[var(--duration-fast)]",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "absolute inset-x-0 top-[14px] h-px bg-current transition-transform duration-[var(--duration-base)] ease-[var(--ease-cinematic)]",
                  open && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="overlay-panel glass-strong fixed inset-0 z-50 flex flex-col lg:hidden"
        >
          <div className="container-page flex flex-1 flex-col overflow-y-auto pb-10 pt-28">
            <nav className="flex flex-col" aria-label={copy.menu}>
              {links.map((link, i) => (
                <span
                  key={link.href}
                  className="menu-item-in border-b border-border"
                  style={{ ["--stagger" as string]: `${120 + i * 70}ms` }}
                >
                  <Link
                    to={link.to}
                    params={{ locale }}
                    preload="intent"
                    onClick={() => setOpen(false)}
                    aria-current={
                      (
                        link.exact
                          ? normalizedPathname === `/${locale}`
                          : normalizedPathname.startsWith(`/${locale}${link.href}`)
                      )
                        ? "page"
                        : undefined
                    }
                    data-status={
                      (
                        link.exact
                          ? normalizedPathname === `/${locale}`
                          : normalizedPathname.startsWith(`/${locale}${link.href}`)
                      )
                        ? "active"
                        : undefined
                    }
                    className="type-h2 flex min-h-14 items-center py-4 text-foreground/70 transition-colors duration-[var(--duration-base)] hover:text-foreground data-[status=active]:text-foreground"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </nav>

            <div
              className="menu-item-in mt-auto flex items-center gap-4 pt-12"
              style={{ ["--stagger" as string]: `${120 + links.length * 70}ms` }}
            >
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
