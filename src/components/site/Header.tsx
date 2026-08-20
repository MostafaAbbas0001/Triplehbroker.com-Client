import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Link, useMatches, useRouterState } from "@tanstack/react-router";
import type { BuilderPage } from "@/services/builderService";
import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";

const HEADER_COPY = {
  en: {
    menu: "Menu",
    close: "Close menu",
    more: "More",
  },
  ar: {
    menu: "القائمة",
    close: "إغلاق القائمة",
    more: "المزيد",
  },
} as const;

function NavigationLink({
  href,
  openInNewTab = false,
  className,
  current,
  onClick,
  children,
}: {
  href: string;
  openInNewTab?: boolean;
  className: string;
  current?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  const isInternal = href.startsWith("/") && !openInNewTab;
  if (isInternal) {
    return (
      <Link
        to={href as never}
        preload="intent"
        aria-current={current ? "page" : undefined}
        data-status={current ? "active" : undefined}
        onClick={onClick}
        className={className}
      >
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noreferrer" : undefined}
      aria-current={current ? "page" : undefined}
      data-status={current ? "active" : undefined}
      onClick={onClick}
      className={className}
    >
      {children}
    </a>
  );
}

export function Wordmark({ tone = "default" }: { tone?: "default" | "inverse" }) {
  const { locale, site } = useI18n();
  return (
    <Link
      to="/$locale"
      params={{ locale }}
      preload="intent"
      className="group flex min-w-0 items-center gap-2 leading-none sm:gap-3"
      aria-label={site.companyName}
    >
      <img
        src={site.logoUrl}
        alt=""
        aria-hidden="true"
        className={cn(
          "h-12 w-auto shrink-0 object-contain transition-[filter] duration-[700ms] ease-[var(--ease-cinematic)] sm:h-16",
          tone === "default" && "brightness-0",
        )}
      />
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            "font-display text-base leading-tight tracking-[0.01em] transition-colors duration-[700ms] ease-[var(--ease-cinematic)] sm:text-xl sm:tracking-[0.02em]",
            tone === "inverse" ? "text-inverse-foreground" : "text-foreground",
          )}
        >
          {site.companyName}
        </span>
        <span
          className={cn(
            "mt-1 block text-[0.5rem] leading-tight uppercase tracking-[0.12em] transition-colors duration-[700ms] ease-[var(--ease-cinematic)] sm:mt-1.5 sm:text-[0.625rem] sm:tracking-[0.24em]",
            tone === "inverse" ? "text-inverse-muted" : "text-muted-foreground",
          )}
        >
          {site.tagline}
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const { locale, navigation } = useI18n();
  const copy = HEADER_COPY[locale];
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visibleLinkCount, setVisibleLinkCount] = useState(Number.MAX_SAFE_INTEGER);
  const headerRowRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const linkMeasureRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLSpanElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const matches = useMatches();

  const normalizedPathname = pathname.replace(/\/+$/, "") || "/";
  const builderPage = matches
    .map(
      (match) => match.loaderData as { page?: BuilderPage; builderPage?: BuilderPage } | undefined,
    )
    .map((data) => data?.page ?? data?.builderPage)
    .find(Boolean);
  const hasMediaHero =
    builderPage?.document.children.some(
      (node) =>
        node.visible !== false &&
        (node.type === "hero" ||
          (node.type === "section" &&
            (node.settings?.["sectionType"] === "hero" ||
              node.settings?.["sectionType"] === "hero-banner"))),
    ) ?? false;

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
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!moreMenuRef.current?.contains(event.target as Node)) setMoreOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [moreOpen]);

  const links = useMemo(
    () => navigation.items.filter((item) => item.isVisible && item.href),
    [navigation.items],
  );
  const primaryLinks = links.slice(0, visibleLinkCount);
  const overflowLinks = links.slice(visibleLinkCount);

  useEffect(() => {
    const row = headerRowRef.current;
    const brand = brandRef.current;
    const controls = controlsRef.current;
    const measure = linkMeasureRef.current;
    if (!row || !brand || !controls || !measure) return;

    const update = () => {
      const widths = Array.from(measure.children).map(
        (item) => (item as HTMLElement).getBoundingClientRect().width,
      );
      const available = Math.max(
        0,
        row.clientWidth -
          brand.getBoundingClientRect().width -
          controls.getBoundingClientRect().width -
          128,
      );
      const gap = 32;
      const moreWidth = 88;
      const allWidth =
        widths.reduce((total, width) => total + width, 0) + gap * Math.max(0, widths.length - 1);
      if (allWidth <= available) {
        setVisibleLinkCount(widths.length);
        return;
      }

      let used = moreWidth;
      let count = 0;
      for (const width of widths) {
        const next = used + (count ? gap : 0) + width;
        if (next > available) break;
        used = next;
        count += 1;
      }
      setVisibleLinkCount(Math.max(1, Math.min(count, Math.max(1, widths.length - 1))));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(row);
    observer.observe(brand);
    observer.observe(controls);
    observer.observe(measure);
    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) update();
    });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [links, locale]);

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
        ref={headerRowRef}
        className={cn(
          "container-page relative z-[60] flex items-center justify-between gap-3 transition-all duration-[var(--duration-base)] lg:gap-8",
          overlay ? "py-7" : scrolled ? "py-3.5" : "py-5",
        )}
      >
        <div
          ref={brandRef}
          className={cn("min-w-0 shrink-0", scrolled && !open && "brand-reenter")}
        >
          <Wordmark tone={inverseHeader ? "inverse" : "default"} />
        </div>

        <nav
          className="hidden shrink-0 items-center gap-8 whitespace-nowrap lg:flex"
          aria-label={copy.menu}
        >
          {primaryLinks.map((link) => {
            const exact = link.href === `/${locale}`;
            const active = exact
              ? normalizedPathname === `/${locale}`
              : normalizedPathname.startsWith(link.href!);
            return (
              <span key={link.id} className="group/nav relative shrink-0">
                <NavigationLink
                  href={link.href!}
                  openInNewTab={link.openInNewTab}
                  current={active}
                  className={cn(
                    "relative whitespace-nowrap py-2 text-[0.75rem] uppercase tracking-[0.18em] transition-colors duration-[700ms] ease-[var(--ease-cinematic)]",
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
                    data-on={active}
                  />
                </NavigationLink>
                {link.children.some((child) => child.isVisible && child.href) ? (
                  <div className="invisible absolute start-1/2 top-full min-w-56 -translate-x-1/2 pt-5 opacity-0 transition group-focus-within/nav:visible group-focus-within/nav:opacity-100 group-hover/nav:visible group-hover/nav:opacity-100">
                    <div className="border border-border bg-background p-2 shadow-lg">
                      {link.children
                        .filter((child) => child.isVisible && child.href)
                        .map((child) => (
                          <NavigationLink
                            key={child.id}
                            href={child.href!}
                            openInNewTab={child.openInNewTab}
                            className="block px-4 py-3 text-xs uppercase tracking-[0.12em] text-body hover:bg-muted hover:text-foreground"
                          >
                            {child.label}
                          </NavigationLink>
                        ))}
                    </div>
                  </div>
                ) : null}
              </span>
            );
          })}
          {overflowLinks.length ? (
            <span ref={moreMenuRef} className="relative shrink-0">
              <button
                type="button"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                onClick={() => setMoreOpen((value) => !value)}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap py-2 text-[0.75rem] uppercase tracking-[0.18em] transition-colors duration-[700ms] ease-[var(--ease-cinematic)]",
                  inverseHeader
                    ? "text-inverse-muted hover:text-inverse-foreground"
                    : "text-body hover:text-foreground",
                )}
              >
                {copy.more}{" "}
                <ChevronDown
                  size={13}
                  strokeWidth={1.5}
                  className={cn("transition-transform", moreOpen && "rotate-180")}
                />
              </button>
              <div
                role="menu"
                className={cn(
                  "absolute end-0 top-full min-w-64 pt-5 transition",
                  moreOpen
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-1 opacity-0",
                )}
              >
                <div className="border border-border bg-background p-2 shadow-xl">
                  {overflowLinks.map((link) => (
                    <div key={link.id} className="border-b border-border last:border-b-0">
                      <NavigationLink
                        href={link.href!}
                        openInNewTab={link.openInNewTab}
                        onClick={() => setMoreOpen(false)}
                        className="block px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-foreground hover:bg-muted"
                      >
                        {link.label}
                      </NavigationLink>
                      {link.children
                        .filter((child) => child.isVisible && child.href)
                        .map((child) => (
                          <NavigationLink
                            key={child.id}
                            href={child.href!}
                            openInNewTab={child.openInNewTab}
                            onClick={() => setMoreOpen(false)}
                            className="block px-6 py-2.5 text-xs text-body hover:bg-muted hover:text-foreground"
                          >
                            {child.label}
                          </NavigationLink>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            </span>
          ) : null}
        </nav>

        <div ref={controlsRef} className="flex shrink-0 items-center gap-3">
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
        <div
          ref={linkMeasureRef}
          aria-hidden="true"
          className="pointer-events-none absolute start-0 top-0 flex size-0 items-center gap-8 overflow-hidden whitespace-nowrap opacity-0"
        >
          {links.map((link) => (
            <span
              key={link.id}
              className="shrink-0 py-2 text-[0.75rem] uppercase tracking-[0.18em]"
            >
              {link.label}
            </span>
          ))}
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
                  key={link.id}
                  className="menu-item-in border-b border-border"
                  style={{ ["--stagger" as string]: `${120 + i * 70}ms` }}
                >
                  <NavigationLink
                    href={link.href!}
                    openInNewTab={link.openInNewTab}
                    onClick={() => setOpen(false)}
                    current={
                      normalizedPathname === link.href ||
                      normalizedPathname.startsWith(`${link.href}/`)
                    }
                    className="type-h2 flex min-h-14 items-center py-4 text-foreground/70 transition-colors duration-[var(--duration-base)] hover:text-foreground data-[status=active]:text-foreground"
                  >
                    {link.label}
                  </NavigationLink>
                  {link.children
                    .filter((child) => child.isVisible && child.href)
                    .map((child) => (
                      <NavigationLink
                        key={child.id}
                        href={child.href!}
                        openInNewTab={child.openInNewTab}
                        onClick={() => setOpen(false)}
                        className="block py-2 ps-6 text-sm text-body hover:text-foreground"
                      >
                        {child.label}
                      </NavigationLink>
                    ))}
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
