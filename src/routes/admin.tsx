import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ExternalLink,
  Globe2,
  Image as ImageIcon,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  Monitor,
  PanelLeft,
  PanelRight,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Tablet,
  Trash2,
  Upload,
} from "lucide-react";
import { ApiError } from "@/api/apiClient";
import { contentQueryKeys } from "@/services/contentService";
import { authService, type LoginResponse } from "@/services/authService";
import { siteSettingService, type SiteSettingResponse } from "@/services/siteSettingService";
import { uploadQueryKey, uploadService, type UploadResponse } from "@/services/uploadService";
import {
  navigationQueryKeys,
  navigationService,
  type NavigationMenu,
  type SaveNavigationItem,
} from "@/services/navigationService";
import { themeQueryKey, themeService, type ThemeResponse } from "@/services/themeService";
import {
  builderQueryKeys,
  builderService,
  type BuilderDocument,
  type BuilderNode,
  type BuilderPage,
  type BuilderPageSummary,
} from "@/services/builderService";
import type { Locale } from "@/i18n/config";
import { cn, createId } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  builderNodes,
  builderObject,
  createBuilderCard as createRegisteredCard,
  createBuilderImage as createRegisteredImage,
  createBuilderSection as createRegisteredSection,
  getSectionKind,
  isHeroSection,
  sectionCategories,
  sectionHelp,
  type BuilderSectionKind,
} from "@/components/builder/sections";

export const Route = createFileRoute("/admin")({
  headers: () => ({
    "X-Robots-Tag": "noindex, nofollow, noarchive",
  }),
  head: () => ({
    meta: [
      { title: "Content Studio | Triple H Insurance Broker" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
      { name: "googlebot", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: AdminRoute,
});

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type EditorTarget = "builder" | "site" | "navigation" | "theme" | "media";
type PreviewSize = "desktop" | "tablet" | "mobile";

const controlClass =
  "w-full border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary";

function AdminRoute() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<LoginResponse | null>(null);
  const siteSettingQuery = useQuery({
    queryKey: contentQueryKeys.siteSetting("en"),
    queryFn: ({ signal }) => siteSettingService.getByKey("site-en", signal),
  });

  useEffect(() => {
    setSession(authService.readSession());
    setReady(true);
  }, []);

  if (siteSettingQuery.error) throw siteSettingQuery.error;

  if (!ready || siteSettingQuery.isLoading) {
    return <AdminLoading />;
  }

  const logoUrl = getSiteLogoUrl(siteSettingQuery.data);

  if (!session) {
    return (
      <AdminLogin
        logoUrl={logoUrl}
        onLogin={(nextSession) => {
          authService.saveSession(nextSession);
          setSession(nextSession);
        }}
      />
    );
  }

  return (
    <ContentStudio
      session={session}
      logoUrl={logoUrl}
      onLogout={() => {
        authService.clearSession();
        setSession(null);
      }}
    />
  );
}

function getSiteLogoUrl(setting: SiteSettingResponse | undefined) {
  const value = setting?.value as { logoUrl?: unknown } | undefined;
  if (typeof value?.logoUrl !== "string" || value.logoUrl.trim() === "") {
    throw new Error("The site-en setting must contain a logoUrl.");
  }
  return value.logoUrl;
}

function AdminLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-primary text-inverse-foreground">
      <Loader2 className="animate-spin" size={24} aria-label="Loading admin studio" />
    </div>
  );
}

function AdminLogin({
  logoUrl,
  onLogin,
}: {
  logoUrl: string;
  onLogin: (session: LoginResponse) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useMutation({
    mutationFn: () => authService.login(email, password),
    onSuccess: onLogin,
  });
  const message =
    login.error instanceof ApiError && login.error.status === 401
      ? "The email or password is incorrect."
      : login.error
        ? "The admin service is unavailable. Please try again."
        : null;

  return (
    <main className="page-transition grid min-h-screen place-items-center bg-primary px-6 py-16 text-inverse-foreground">
      <form
        className="w-full max-w-md"
        onSubmit={(event) => {
          event.preventDefault();
          login.mutate();
        }}
      >
        <div className="text-center">
          <img src={logoUrl} alt="Triple H Broker" className="mx-auto h-36 w-auto object-contain" />
          <h1 className="mt-7 font-display text-xl tracking-[0.02em] text-inverse-foreground">
            Triple H Broker Administration
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-inverse-muted">
            Secure access
          </p>
        </div>

        <div className="mt-10 space-y-5">
          <label className="block">
            <span className="text-xs font-medium text-inverse-muted">Email address</span>
            <span className="relative mt-2 block">
              <Mail
                size={17}
                strokeWidth={1.5}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-inverse-muted"
              />
              <input
                className="min-h-12 w-full rounded-full border border-white/25 bg-white/10 px-5 ps-12 text-sm text-inverse-foreground outline-none transition-colors placeholder:text-inverse-muted/70 focus:border-white/70 focus:bg-white/15"
                type="email"
                autoComplete="username"
                placeholder="admin@example.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </span>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-inverse-muted">Password</span>
            <span className="relative mt-2 block">
              <LockKeyhole
                size={17}
                strokeWidth={1.5}
                className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-inverse-muted"
              />
              <input
                className="min-h-12 w-full rounded-full border border-white/25 bg-white/10 px-5 ps-12 text-sm text-inverse-foreground outline-none transition-colors placeholder:text-inverse-muted/70 focus:border-white/70 focus:bg-white/15"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </span>
          </label>
        </div>

        {message ? (
          <p
            className="mt-5 rounded-lg border border-white/25 bg-white/10 px-4 py-3 text-sm text-inverse-foreground"
            role="alert"
          >
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={login.isPending}
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white bg-white px-6 text-sm font-semibold uppercase tracking-[0.08em] text-primary transition-colors hover:bg-white/90 disabled:opacity-60"
        >
          {login.isPending ? <Loader2 className="animate-spin" size={17} /> : null}
          Sign in
        </button>
      </form>
    </main>
  );
}

function ContentStudio({
  session,
  logoUrl,
  onLogout,
}: {
  session: LoginResponse;
  logoUrl: string;
  onLogout: () => void;
}) {
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Locale>("en");
  const [target, setTarget] = useState<EditorTarget>("builder");
  const [builderSelectedId, setBuilderSelectedId] = useState<string | null>(null);
  const [creatingPage, setCreatingPage] = useState(false);
  const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop");
  const [previewVersion, setPreviewVersion] = useState(0);
  const builderPagesQuery = useQuery({
    queryKey: builderQueryKeys.pages(),
    queryFn: ({ signal }) => builderService.getPages(session.accessToken, signal),
  });
  const sidebarPages = useMemo(
    () => builderPagesQuery.data?.filter((page) => page.locale === locale) ?? [],
    [builderPagesQuery.data, locale],
  );
  const settingQuery = useQuery({
    queryKey: contentQueryKeys.siteSetting(locale),
    queryFn: ({ signal }) => siteSettingService.getByKey(`site-${locale}`, signal),
    enabled: target === "site",
  });
  const navigationQuery = useQuery({
    queryKey: navigationQueryKeys.menu(locale),
    queryFn: ({ signal }) => navigationService.get(locale, "primary", signal),
    enabled: target === "navigation",
  });
  const themeQuery = useQuery({
    queryKey: themeQueryKey,
    queryFn: ({ signal }) => themeService.getActive(signal),
    enabled: target === "theme",
  });
  const previewPath = `/${locale}`;
  const previewWidth = { desktop: "100%", tablet: "820px", mobile: "390px" }[previewSize];
  const refreshPreview = () => setPreviewVersion((version) => version + 1);

  return (
    <div className="page-transition flex h-screen min-w-[74rem] flex-col overflow-hidden bg-muted">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-inverse-border bg-primary px-5">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Triple H Broker" className="h-12 w-auto object-contain" />
          <div>
            <p className="font-display text-xl tracking-[0.02em] text-inverse-foreground">
              Triple H Broker Administration
            </p>
            <p className="mt-1 text-[0.625rem] uppercase tracking-[0.24em] text-inverse-muted">
              Live website editor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={previewPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-inverse-border px-4 text-xs font-semibold uppercase tracking-[0.08em] text-inverse-foreground transition-colors hover:border-inverse-foreground"
          >
            <ExternalLink size={14} /> Open website
          </a>
          <button
            onClick={onLogout}
            className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.08em] text-inverse-muted transition-colors hover:text-inverse-foreground"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <div
        className={cn(
          "grid min-h-0 flex-1",
          target === "media" || target === "builder"
            ? "grid-cols-[15rem_minmax(34rem,1fr)]"
            : "grid-cols-[15rem_minmax(34rem,1fr)_27rem]",
        )}
      >
        <aside className="overflow-y-auto border-e border-border bg-background p-4">
          <p className="px-3 pt-2 type-caption">Language</p>
          <div className="mt-3 grid grid-cols-2 rounded-full bg-muted p-1">
            {(["en", "ar"] as const).map((code) => (
              <button
                key={code}
                onClick={() => setLocale(code)}
                className={cn(
                  "rounded-full px-3 py-2 text-xs font-semibold uppercase",
                  locale === code ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                {code}
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between px-3">
            <p className="type-caption">Pages</p>
            <span className="text-[0.625rem] text-muted-foreground">{sidebarPages.length}</span>
          </div>
          <button
            type="button"
            onClick={() => setCreatingPage(true)}
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-semibold uppercase tracking-[0.08em] text-primary-foreground"
          >
            <Plus size={14} /> New page
          </button>
          <nav className="mt-3 space-y-1">
            {builderPagesQuery.isLoading ? (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                <Loader2 size={13} className="animate-spin" /> Loading pages…
              </div>
            ) : null}
            {sidebarPages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  setBuilderSelectedId(page.id);
                  setTarget("builder");
                }}
                className={cn(
                  "w-full rounded-lg px-3 py-3 text-start text-sm font-medium transition-colors",
                  builderSelectedId === page.id && target === "builder"
                    ? "bg-primary text-primary-foreground"
                    : "text-body hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="block truncate">{page.title}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 border-t border-border pt-6">
            <button
              onClick={() => setTarget("site")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-start text-sm transition-colors",
                target === "site"
                  ? "bg-primary text-primary-foreground"
                  : "text-body hover:bg-muted hover:text-foreground",
              )}
            >
              <Globe2 size={15} strokeWidth={1.5} /> Global content
            </button>
            <button
              onClick={() => setTarget("media")}
              className={cn(
                "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-start text-sm transition-colors",
                target === "media"
                  ? "bg-primary text-primary-foreground"
                  : "text-body hover:bg-muted hover:text-foreground",
              )}
            >
              <ImageIcon size={15} strokeWidth={1.5} /> Media library
            </button>
            <button
              onClick={() => setTarget("navigation")}
              className={cn(
                "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-start text-sm transition-colors",
                target === "navigation"
                  ? "bg-primary text-primary-foreground"
                  : "text-body hover:bg-muted hover:text-foreground",
              )}
            >
              <Menu size={15} strokeWidth={1.5} /> Navigation
            </button>
            <button
              onClick={() => setTarget("theme")}
              className={cn(
                "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-start text-sm transition-colors",
                target === "theme"
                  ? "bg-primary text-primary-foreground"
                  : "text-body hover:bg-muted hover:text-foreground",
              )}
            >
              <Palette size={15} strokeWidth={1.5} /> Design
            </button>
          </div>
        </aside>

        <main className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
          {target === "media" ? (
            <MediaLibrary token={session.accessToken} />
          ) : target === "builder" ? (
            <BuilderPageManager
              token={session.accessToken}
              locale={locale}
              selectedPageId={builderSelectedId}
              onSelectedPageChange={setBuilderSelectedId}
            />
          ) : (
            <>
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {target === "site" ? "Global content" : humanize(target)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    /{locale}
                    {target === "site" ? "" : `/${target}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex rounded-full border border-border bg-muted p-1">
                    {(
                      [
                        ["desktop", Monitor],
                        ["tablet", Tablet],
                        ["mobile", Smartphone],
                      ] as const
                    ).map(([size, Icon]) => (
                      <button
                        key={size}
                        title={`${size} preview`}
                        onClick={() => setPreviewSize(size)}
                        className={cn(
                          "grid size-8 place-items-center rounded-full",
                          previewSize === size
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground",
                        )}
                      >
                        <Icon size={14} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-background p-6">
                <div
                  className="h-full min-h-[42rem] overflow-hidden rounded-xl border border-black/10 bg-white shadow-2xl transition-[width] duration-300"
                  style={{ width: previewWidth, maxWidth: "100%" }}
                >
                  <iframe
                    key={`${previewPath}-${previewVersion}`}
                    src={previewPath}
                    title={`Live preview of ${target}`}
                    className="size-full border-0"
                  />
                </div>
              </div>
            </>
          )}
        </main>

        {target !== "media" && target !== "builder" ? (
          <aside className="overflow-y-auto border-s border-border bg-background">
            <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
              <p className="text-sm font-semibold text-foreground">Edit content</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Changes appear in the preview after saving.
              </p>
            </div>

            <div className="p-4">
              {settingQuery.isLoading || navigationQuery.isLoading || themeQuery.isLoading ? (
                <PanelLoading />
              ) : settingQuery.error || navigationQuery.error || themeQuery.error ? (
                <PanelError />
              ) : target === "navigation" && navigationQuery.data ? (
                <NavigationEditor
                  menu={navigationQuery.data}
                  token={session.accessToken}
                  locale={locale}
                  onSaved={refreshPreview}
                />
              ) : target === "theme" && themeQuery.data ? (
                <ThemeEditor
                  theme={themeQuery.data}
                  token={session.accessToken}
                  onSaved={refreshPreview}
                />
              ) : target === "site" && settingQuery.data ? (
                <SiteSettingEditor
                  setting={settingQuery.data}
                  token={session.accessToken}
                  locale={locale}
                  onSaved={refreshPreview}
                />
              ) : (
                <PanelError />
              )}
            </div>
          </aside>
        ) : null}
      </div>
      <Dialog open={creatingPage} onOpenChange={setCreatingPage}>
        <DialogContent className="max-w-xl p-0">
          <DialogHeader className="border-b border-border px-6 py-5 pe-12">
            <DialogTitle>Create a new page</DialogTitle>
            <DialogDescription>
              Add its name and URL. You can build the page content immediately afterward.
            </DialogDescription>
          </DialogHeader>
          <CreatePagePanel
            locale={locale}
            token={session.accessToken}
            onCreated={(page) => {
              queryClient.setQueryData<BuilderPageSummary[]>(
                builderQueryKeys.pages(),
                (current) => [...(current ?? []), page],
              );
              setBuilderSelectedId(page.id);
              setTarget("builder");
              setCreatingPage(false);
            }}
            onCancel={() => setCreatingPage(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PanelLoading() {
  return (
    <div className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
      <Loader2 size={16} className="animate-spin" /> Loading editor…
    </div>
  );
}

function BuilderPageManager({
  token,
  locale,
  selectedPageId,
  onSelectedPageChange,
}: {
  token: string;
  locale: Locale;
  selectedPageId: string | null;
  onSelectedPageChange: (id: string | null) => void;
}) {
  const queryClient = useQueryClient();
  const pages = useQuery({
    queryKey: builderQueryKeys.pages(),
    queryFn: ({ signal }) => builderService.getPages(token, signal),
  });
  const localizedPages = useMemo(
    () => pages.data?.filter((page) => page.locale === locale) ?? [],
    [locale, pages.data],
  );

  useEffect(() => {
    if (localizedPages.some((page) => page.id === selectedPageId)) return;
    onSelectedPageChange(
      localizedPages.find((page) => page.isHomepage)?.id ?? localizedPages[0]?.id ?? null,
    );
  }, [localizedPages, onSelectedPageChange, selectedPageId]);

  const selected = localizedPages.find((page) => page.id === selectedPageId) ?? null;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-muted">
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {pages.isLoading ? <PanelLoading /> : null}
        {pages.error ? <PanelError /> : null}
        {selected ? (
          <BuilderPageEditor
            key={selected.id}
            summary={selected}
            token={token}
            onDeleted={() => {
              queryClient.setQueryData<BuilderPageSummary[]>(builderQueryKeys.pages(), (current) =>
                current?.filter((page) => page.id !== selected.id),
              );
              onSelectedPageChange(null);
            }}
          />
        ) : pages.isSuccess ? (
          <div className="grid min-h-80 place-items-center border border-dashed border-border bg-background text-sm text-muted-foreground">
            Select a page from the sidebar or create a new {locale.toUpperCase()} page.
          </div>
        ) : null}
      </main>
    </div>
  );
}

function CreatePagePanel({
  locale,
  token,
  onCreated,
  onCancel,
}: {
  locale: Locale;
  token: string;
  onCreated: (page: BuilderPage) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const create = useMutation({
    mutationFn: () => {
      const hero = createRegisteredSection("hero-banner");
      const initialHero = {
        ...hero,
        content: { ...builderObject(hero.content), heading: title },
      };
      const document: BuilderDocument = {
        schemaVersion: 1,
        type: "page",
        template: "builder",
        settings: { headerMode: "media-overlay", footerVisible: true },
        children: [initialHero],
      };
      return builderService.create({ title, slug, locale, template: "builder", document }, token);
    },
    onSuccess: onCreated,
  });

  return (
    <form
      className="grid gap-5 px-6 pb-6"
      onSubmit={(event) => {
        event.preventDefault();
        create.mutate();
      }}
    >
      <label>
        <span className="type-caption">Page title</span>
        <input
          className={cn(controlClass, "mt-2")}
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label>
        <span className="type-caption">URL slug</span>
        <input
          className={cn(controlClass, "mt-2")}
          required
          placeholder="new-page"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
        />
      </label>
      <div className="flex justify-end gap-2 border-t border-border pt-5">
        <button type="button" onClick={onCancel} className="min-h-10 px-4 text-sm text-body">
          Cancel
        </button>
        <button
          type="submit"
          disabled={create.isPending}
          className="min-h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          Create
        </button>
      </div>
      {create.isError ? (
        <p className="col-span-full text-sm text-error">Could not create this page.</p>
      ) : null}
    </form>
  );
}

function BuilderPageEditor({
  summary,
  token,
  onDeleted,
}: {
  summary: BuilderPageSummary;
  token: string;
  onDeleted: () => void;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const pageQuery = useQuery({
    queryKey: builderQueryKeys.page(summary.id),
    queryFn: ({ signal }) => builderService.getPage(summary.id, token, signal),
  });
  const [title, setTitle] = useState(summary.title);
  const [slug, setSlug] = useState(summary.slug);
  const [seoData, setSeoData] = useState<BuilderPage["seoData"] | null>(null);
  const [document, setDocument] = useState<BuilderDocument | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [builderPreviewSize, setBuilderPreviewSize] = useState<PreviewSize>("desktop");
  const [sectionPanelOpen, setSectionPanelOpen] = useState(true);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(true);
  const [removeSectionOpen, setRemoveSectionOpen] = useState(false);
  const [deletePageOpen, setDeletePageOpen] = useState(false);

  useEffect(() => {
    if (!pageQuery.data) return;
    setTitle(pageQuery.data.title);
    setSlug(pageQuery.data.slug);
    setSeoData(structuredClone(pageQuery.data.seoData));
    setDocument(structuredClone(pageQuery.data.document));
    setSelectedSectionId(pageQuery.data.document.children[0]?.id ?? null);
  }, [pageQuery.data]);

  useEffect(() => {
    if (!document || document.children.some((section) => section.id === selectedSectionId)) return;
    setSelectedSectionId(document.children[0]?.id ?? null);
  }, [document, selectedSectionId]);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: builderQueryKeys.pages() }),
      queryClient.invalidateQueries({ queryKey: contentQueryKeys.all }),
    ]);
    setPreviewVersion((version) => version + 1);
  };
  const save = useMutation({
    mutationFn: async () => {
      if (!document) throw new Error("No builder document loaded.");
      await builderService.updateMetadata(summary.id, { title, slug, seoData: seoData! }, token);
      return builderService.saveDocument(summary.id, document, token);
    },
    onSuccess: async (updated) => {
      queryClient.setQueryData(builderQueryKeys.page(summary.id), updated);
      await refresh();
    },
  });
  const remove = useMutation({
    mutationFn: () => builderService.delete(summary.id, token),
    onSuccess: onDeleted,
  });

  if (pageQuery.isLoading || !pageQuery.data || !document || !seoData) return <PanelLoading />;
  if (pageQuery.error) return <PanelError />;
  const pending = save.isPending || remove.isPending;
  const dirty =
    title !== pageQuery.data.title ||
    slug !== pageQuery.data.slug ||
    JSON.stringify(seoData) !== JSON.stringify(pageQuery.data.seoData) ||
    JSON.stringify(document) !== JSON.stringify(pageQuery.data.document);
  const selectedSectionIndex = document.children.findIndex(
    (section) => section.id === selectedSectionId,
  );
  const selectedSection =
    selectedSectionIndex >= 0 ? document.children[selectedSectionIndex] : null;
  const removeSelectedSection = () => {
    if (!selectedSection) return;
    setRemoveSectionOpen(true);
  };

  const confirmRemoveSelectedSection = () => {
    if (!selectedSection) return;

    const children = document.children.filter((section) => section.id !== selectedSection.id);
    const firstSection = children[0];
    const { removedSections: _, ...cleanSettings } = document.settings;
    setDocument({
      ...document,
      settings: {
        ...cleanSettings,
        headerMode: isHeroSection(firstSection) ? "media-overlay" : "solid",
      },
      children,
    });
    const nextSection = children[Math.min(selectedSectionIndex, children.length - 1)] ?? null;
    setSelectedSectionId(nextSection?.id ?? null);
    setRemoveSectionOpen(false);
  };
  const moveSelectedSection = (position: number) => {
    if (!selectedSection) return;
    const targetIndex = Math.max(0, Math.min(document.children.length - 1, position - 1));
    if (targetIndex === selectedSectionIndex) return;
    const children = document.children.filter((section) => section.id !== selectedSection.id);
    children.splice(targetIndex, 0, selectedSection);
    const firstSection = children[0];
    setDocument({
      ...document,
      settings: {
        ...document.settings,
        headerMode: isHeroSection(firstSection) ? "media-overlay" : "solid",
      },
      children,
    });
  };
  const updateSelectedLayout = (key: "layoutGroup" | "layoutColumn", value: JsonValue) => {
    if (!selectedSection) return;
    setDocument({
      ...document,
      children: document.children.map((section) =>
        section.id === selectedSection.id
          ? {
              ...section,
              settings: { ...(section.settings ?? {}), [key]: value },
            }
          : section,
      ),
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <section className="shrink-0 border-b border-border bg-background">
        <div className="flex min-h-14 items-center gap-1 px-4">
          {(["content", "seo", "settings"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "self-stretch border-b-2 px-4 text-sm font-semibold transition-colors",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab === "seo" ? "SEO" : humanize(tab)}
            </button>
          ))}
          {activeTab === "content" ? (
            <div className="ms-auto flex rounded-md border border-border bg-muted p-1">
              {(
                [
                  ["desktop", Monitor],
                  ["tablet", Tablet],
                  ["mobile", Smartphone],
                ] as const
              ).map(([device, Icon]) => (
                <button
                  key={device}
                  type="button"
                  title={`${humanize(device)} preview`}
                  onClick={() => setBuilderPreviewSize(device)}
                  className={cn(
                    "grid size-8 place-items-center rounded",
                    builderPreviewSize === device
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            disabled={pending}
            onClick={() => save.mutate()}
            className={cn(
              "inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60",
              activeTab !== "content" && "ms-auto",
            )}
          >
            {save.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {save.isPending ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </button>
          <a
            href={`/${summary.slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-primary"
          >
            View live page ↗
          </a>
        </div>
      </section>

      {activeTab === "content" ? (
        <div
          className="relative grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] overflow-hidden bg-muted transition-[grid-template-columns] duration-300"
          style={{
            gridTemplateColumns: `${sectionPanelOpen ? "18rem" : "3rem"} minmax(0, 1fr) ${settingsPanelOpen ? "25rem" : "3rem"}`,
          }}
        >
          <BuilderOutline
            document={document}
            selectedSectionId={selectedSectionId}
            onSelectedSectionChange={setSelectedSectionId}
            onChange={setDocument}
            open={sectionPanelOpen}
            onToggle={() => setSectionPanelOpen((value) => !value)}
          />
          <section
            className={cn(
              "col-start-3 row-start-1 overflow-y-auto border-s border-border bg-background",
              settingsPanelOpen ? "p-5" : "p-1",
            )}
          >
            {settingsPanelOpen ? (
              <>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {selectedSectionId ? "Section settings" : "Select a section"}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedSectionId
                        ? "Edit the selected section and see it in the preview."
                        : "Choose a section from the left panel to edit it."}
                    </p>
                  </div>
                  {selectedSection ? (
                    <button
                      type="button"
                      onClick={removeSelectedSection}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-error hover:bg-error/10"
                    >
                      <Trash2 size={14} />
                      Remove section
                    </button>
                  ) : null}
                  <button
                    type="button"
                    title="Collapse settings panel"
                    onClick={() => setSettingsPanelOpen(false)}
                    className="grid size-9 shrink-0 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                  >
                    <PanelRight size={15} />
                  </button>
                </div>
                {selectedSection ? (
                  <div className="mt-5 space-y-3">
                    <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-background p-4">
                      <span>
                        <span className="block text-sm font-semibold text-foreground">
                          Section visibility
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          Show or hide this section on the website.
                        </span>
                      </span>
                      <span className="relative inline-flex shrink-0 items-center">
                        <input
                          type="checkbox"
                          aria-label="Show this section on the website"
                          className="peer sr-only"
                          checked={selectedSection.visible !== false}
                          onChange={(event) => {
                            const children = document.children.map((section) =>
                              section.id === selectedSection.id
                                ? { ...section, visible: event.target.checked }
                                : section,
                            );
                            const firstSection = children[0];
                            setDocument({
                              ...document,
                              settings: {
                                ...document.settings,
                                headerMode: isHeroSection(firstSection) ? "media-overlay" : "solid",
                              },
                              children,
                            });
                          }}
                        />
                        <span className="h-6 w-11 rounded-full bg-muted-foreground/30 transition-colors after:absolute after:start-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5" />
                      </span>
                    </label>
                    <label className="flex items-center justify-between gap-4 rounded-md border border-border bg-background p-4">
                      <span>
                        <span className="block text-sm font-semibold text-foreground">
                          Section position
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          Choose where this section appears on the page.
                        </span>
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={document.children.length}
                        value={selectedSectionIndex + 1}
                        onChange={(event) => moveSelectedSection(Number(event.target.value))}
                        aria-label="Section position"
                        className="w-16 shrink-0 rounded border border-border bg-background px-2 py-2 text-center"
                      />
                    </label>
                    <div className="rounded-md border border-border bg-background p-4">
                      <label className="block text-sm font-semibold text-foreground">
                        Section arrangement
                        <select
                          className={cn(controlClass, "mt-2")}
                          value={selectedSection.settings?.["layoutGroup"] ? "columns" : "full"}
                          onChange={(event) => {
                            const inColumns = event.target.value === "columns";
                            setDocument({
                              ...document,
                              children: document.children.map((section) =>
                                section.id === selectedSection.id
                                  ? {
                                      ...section,
                                      settings: {
                                        ...(section.settings ?? {}),
                                        layoutGroup: inColumns
                                          ? String(section.settings?.["layoutGroup"] || "group-1")
                                          : "",
                                        layoutColumn: Number(
                                          section.settings?.["layoutColumn"] ?? 1,
                                        ),
                                      },
                                    }
                                  : section,
                              ),
                            });
                          }}
                        >
                          <option value="full">Full-width section</option>
                          <option value="columns">Place in a shared column group</option>
                        </select>
                      </label>
                      {selectedSection.settings?.["layoutGroup"] ? (
                        <div className="mt-4 grid grid-cols-[1fr_5rem] gap-3">
                          <label className="block text-sm font-medium text-foreground">
                            Group name
                            <input
                              className={cn(controlClass, "mt-2")}
                              value={String(selectedSection.settings["layoutGroup"])}
                              onChange={(event) =>
                                updateSelectedLayout("layoutGroup", event.target.value)
                              }
                            />
                          </label>
                          <label className="block text-sm font-medium text-foreground">
                            Column
                            <input
                              type="number"
                              min={1}
                              max={4}
                              className={cn(controlClass, "mt-2 text-center")}
                              value={Number(selectedSection.settings["layoutColumn"] ?? 1)}
                              onChange={(event) =>
                                updateSelectedLayout(
                                  "layoutColumn",
                                  Math.max(1, Math.min(4, Number(event.target.value) || 1)),
                                )
                              }
                            />
                          </label>
                          <p className="col-span-2 text-xs leading-5 text-muted-foreground">
                            Sections with the same group name share one row. Sections using the same
                            column number stack vertically.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
                <BuilderSectionsEditor
                  document={document}
                  onChange={setDocument}
                  showAddControls={false}
                  selectedSectionId={selectedSectionId}
                />
              </>
            ) : (
              <button
                type="button"
                title="Open settings panel"
                onClick={() => setSettingsPanelOpen(true)}
                className="grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <PanelRight size={16} />
              </button>
            )}
          </section>
          <section className="col-start-2 row-start-1 min-h-0 overflow-hidden bg-background">
            <div className="h-full bg-background">
              <ScaledPagePreview
                slug={slug}
                title={title}
                version={previewVersion}
                size={builderPreviewSize}
              />
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "seo" ? (
        <div className="flex-1 overflow-y-auto">
          <SeoFields value={seoData} onChange={setSeoData} />
        </div>
      ) : null}

      {activeTab === "settings" ? (
        <section className="flex-1 overflow-y-auto bg-background p-6">
          <h3 className="text-base font-semibold text-foreground">Page settings</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The title identifies the page in the admin. The URL controls where visitors find it.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label>
              <span className="text-sm font-medium text-foreground">Page title</span>
              <input
                className={cn(controlClass, "mt-2")}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label>
              <span className="text-sm font-medium text-foreground">Page URL</span>
              <div className="mt-2 flex items-center border border-border bg-background focus-within:border-primary">
                <span className="ps-3 text-sm text-muted-foreground">/</span>
                <input
                  className="min-h-10 min-w-0 flex-1 bg-transparent px-1 pe-3 text-sm outline-none"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                />
              </div>
            </label>
          </div>
          <label className="mt-6 flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-4 text-sm font-medium text-foreground">
            Show the global footer on this page
            <input
              type="checkbox"
              checked={document.settings.footerVisible !== false}
              onChange={(event) =>
                setDocument({
                  ...document,
                  settings: { ...document.settings, footerVisible: event.target.checked },
                })
              }
            />
          </label>
          {!summary.isSystemPage ? (
            <div className="mt-8 border-t border-error/20 pt-6">
              <p className="text-sm font-semibold text-error">Delete this page</p>
              <p className="mt-1 text-sm text-muted-foreground">
                This permanently removes the page and cannot be undone.
              </p>
              <button
                type="button"
                disabled={pending}
                onClick={() => setDeletePageOpen(true)}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-error/30 px-5 text-sm font-semibold text-error disabled:opacity-60"
              >
                <Trash2 size={14} /> Permanently delete page
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
      <ConfirmDialog
        open={removeSectionOpen}
        onOpenChange={setRemoveSectionOpen}
        title="Remove section?"
        description={`Remove this ${humanize(
          selectedSection?.type === "section"
            ? getSectionKind(selectedSection)
            : (selectedSection?.type ?? "selected"),
        )} section from the page?`}
        confirmLabel="Remove section"
        onConfirm={confirmRemoveSelectedSection}
      />
      <ConfirmDialog
        open={deletePageOpen}
        onOpenChange={setDeletePageOpen}
        title="Permanently delete page?"
        description={`Delete “${summary.title}” and all of its content from the database? This cannot be undone.`}
        confirmLabel="Delete page"
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </div>
  );
}

function ScaledPagePreview({
  slug,
  title,
  version,
  size,
}: {
  slug: string;
  title: string;
  version: number;
  size: PreviewSize;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const viewport = {
    desktop: { width: 1440, height: 900 },
    tablet: { width: 820, height: 1100 },
    mobile: { width: 390, height: 844 },
  }[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const update = () => setCanvasSize({ width: canvas.clientWidth, height: canvas.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const scale =
    canvasSize.width && canvasSize.height
      ? Math.min(
          1,
          Math.max(
            0.25,
            Math.min(canvasSize.width / viewport.width, canvasSize.height / viewport.height),
          ),
        )
      : 1;
  return (
    <div
      ref={canvasRef}
      className="flex size-full items-start justify-center overflow-hidden bg-background"
    >
      <div
        className="relative shrink-0 overflow-hidden bg-white"
        style={{ width: viewport.width * scale, height: viewport.height * scale }}
      >
        <iframe
          key={`${slug}-${version}-${size}`}
          src={`/${slug}?builderPreview=${version}`}
          title={`${humanize(size)} preview of ${title}`}
          className="absolute start-0 top-0 border-0 bg-white"
          style={{
            width: viewport.width,
            height: viewport.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );
}

function BuilderOutline({
  document,
  onChange,
  selectedSectionId,
  onSelectedSectionChange,
  open,
  onToggle,
}: {
  document: BuilderDocument;
  onChange: (document: BuilderDocument) => void;
  selectedSectionId: string | null;
  onSelectedSectionChange: (id: string | null) => void;
  open: boolean;
  onToggle: () => void;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const add = (kind: BuilderSectionKind) => {
    const section = createRegisteredSection(kind);
    const children = [...document.children, section];
    onChange({
      ...document,
      settings: {
        ...document.settings,
        headerMode: isHeroSection(children[0]) ? "media-overlay" : "solid",
      },
      children,
    });
    onSelectedSectionChange(section.id);
    setLibraryOpen(false);
  };
  if (!open) {
    return (
      <aside className="col-start-1 row-start-1 border-e border-border bg-background p-1">
        <button
          type="button"
          title="Open section panel"
          onClick={onToggle}
          className="grid size-10 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <PanelLeft size={16} />
        </button>
      </aside>
    );
  }
  return (
    <aside className="col-start-1 row-start-1 overflow-y-auto border-e border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Page sections
          </p>
          <span className="text-xs text-muted-foreground">{document.children.length}</span>
        </div>
        <button
          type="button"
          title="Collapse section panel"
          onClick={onToggle}
          className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground hover:text-foreground"
        >
          <PanelLeft size={15} />
        </button>
      </div>
      <div className="mt-3 space-y-1">
        {document.children.map((section, index) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectedSectionChange(section.id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md border px-3 py-3 text-start text-sm transition-colors",
              selectedSectionId === section.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-transparent text-foreground hover:bg-muted",
            )}
          >
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-[11px] font-semibold">
              {index + 1}
            </span>
            <span className="truncate">
              {humanize(section.type === "section" ? getSectionKind(section) : section.type)}
            </span>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setLibraryOpen((value) => !value)}
        className="mt-6 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground"
      >
        <Plus size={14} /> Add section
      </button>
      {libraryOpen ? (
        <div className="mt-3 space-y-5 rounded-lg border border-border bg-muted/20 p-3">
          <label className="block">
            <span className="sr-only">Search section types</span>
            <input
              className={controlClass}
              placeholder="Search sections…"
              value={librarySearch}
              onChange={(event) => setLibrarySearch(event.target.value)}
            />
          </label>
          {sectionCategories.map((category) => (
            <div key={category.label}>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {category.label}
              </p>
              <div className="grid gap-2">
                {category.kinds
                  .filter((kind) =>
                    `${humanize(kind)} ${sectionHelp[kind]}`
                      .toLowerCase()
                      .includes(librarySearch.trim().toLowerCase()),
                  )
                  .map((kind) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => add(kind)}
                      className="rounded-md border border-border bg-background p-3 text-start hover:border-primary"
                    >
                      <span className="block text-xs font-semibold text-foreground">
                        {humanize(kind)}
                      </span>
                      <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">
                        {sectionHelp[kind]}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </aside>
  );
}

function SeoFields({
  value,
  onChange,
}: {
  value: BuilderPage["seoData"];
  onChange: (value: BuilderPage["seoData"]) => void;
}) {
  const update = <Key extends keyof BuilderPage["seoData"]>(
    key: Key,
    next: BuilderPage["seoData"][Key],
  ) => onChange({ ...value, [key]: next });

  return (
    <section className="min-h-full bg-background p-6">
      <h3 className="text-base font-semibold text-foreground">Search engine settings</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Control how this page appears in Google and when shared on social media.
      </p>
      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-foreground">Search result title</span>
          <input
            className={cn(controlClass, "mt-2")}
            value={value.title ?? ""}
            onChange={(event) => update("title", event.target.value || null)}
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Recommended: about 50–60 characters.
          </span>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-foreground">Search description</span>
          <textarea
            className={cn(controlClass, "mt-2 min-h-24 resize-y")}
            value={value.description ?? ""}
            onChange={(event) => update("description", event.target.value || null)}
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Recommended: about 140–160 characters.
          </span>
        </label>
        <label className="block">
          <span className="text-sm font-medium text-foreground">Canonical URL</span>
          <input
            className={cn(controlClass, "mt-2")}
            dir="ltr"
            placeholder="https://example.com/en/page"
            value={value.canonicalUrl ?? ""}
            onChange={(event) => update("canonicalUrl", event.target.value || null)}
          />
        </label>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm font-medium text-foreground">Search visibility</p>
          <div className="mt-3 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-body">
              <input
                type="checkbox"
                checked={value.robots.index}
                onChange={(event) =>
                  update("robots", { ...value.robots, index: event.target.checked })
                }
              />
              Allow search engines to index this page
            </label>
            <label className="flex items-center gap-2 text-sm text-body">
              <input
                type="checkbox"
                checked={value.robots.follow}
                onChange={(event) =>
                  update("robots", { ...value.robots, follow: event.target.checked })
                }
              />
              Allow search engines to follow its links
            </label>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <h4 className="text-sm font-semibold text-foreground">Social sharing</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional title, description, and image used by social platforms.
        </p>
        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-foreground">Social title</span>
            <input
              className={cn(controlClass, "mt-2")}
              value={value.openGraph.title ?? ""}
              onChange={(event) =>
                update("openGraph", { ...value.openGraph, title: event.target.value || null })
              }
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Social description</span>
            <textarea
              className={cn(controlClass, "mt-2 min-h-20 resize-y")}
              value={value.openGraph.description ?? ""}
              onChange={(event) =>
                update("openGraph", {
                  ...value.openGraph,
                  description: event.target.value || null,
                })
              }
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-foreground">Social image URL</span>
            <input
              className={cn(controlClass, "mt-2")}
              dir="ltr"
              value={value.openGraph.imageUrl ?? ""}
              onChange={(event) =>
                update("openGraph", {
                  ...value.openGraph,
                  imageUrl: event.target.value || null,
                })
              }
            />
          </label>
        </div>
      </div>
    </section>
  );
}

function changeBuilderNode(
  node: BuilderNode,
  id: string,
  change: (node: BuilderNode) => BuilderNode,
): BuilderNode {
  if (node.id === id) return change(node);
  return node.children
    ? { ...node, children: node.children.map((child) => changeBuilderNode(child, id, change)) }
    : node;
}

function removeBuilderNode(node: BuilderNode, id: string): BuilderNode {
  return node.children
    ? {
        ...node,
        children: node.children
          .filter((child) => child.id !== id)
          .map((child) => removeBuilderNode(child, id)),
      }
    : node;
}

function createOptionalButton(kind: Exclude<BuilderSectionKind, "cards">): BuilderNode {
  return {
    id: createId(),
    type: "button",
    visible: true,
    content: {
      label: kind === "call-to-action" ? "Contact us" : "Learn more",
      href: "/contact",
      variant: kind === "hero" || kind === "call-to-action" ? "inverse" : "primary",
    },
  };
}

function SectionInput({
  label,
  node,
  field,
  multiline,
  section,
  onChange,
}: {
  label: string;
  node: BuilderNode | undefined;
  field: string;
  multiline?: boolean;
  section: BuilderNode;
  onChange: (section: BuilderNode) => void;
}) {
  if (!node) return null;
  const value = String(builderObject(node.content)[field] ?? "");
  const update = (next: string) =>
    onChange(
      changeBuilderNode(section, node.id, (current) => ({
        ...current,
        content: { ...builderObject(current.content), [field]: next },
      })),
    );
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      {multiline ? (
        <textarea
          className={cn(controlClass, "mt-2")}
          rows={4}
          value={value}
          onChange={(event) => update(event.target.value)}
        />
      ) : (
        <input
          className={cn(controlClass, "mt-2")}
          value={value}
          onChange={(event) => update(event.target.value)}
        />
      )}
    </label>
  );
}

function SectionSettingInput({
  label,
  field,
  section,
  onChange,
}: {
  label: string;
  field: string;
  section: BuilderNode;
  onChange: (section: BuilderNode) => void;
}) {
  const legacyContent = builderObject(section.content);
  const value = String(section.settings?.[field] ?? legacyContent[field] ?? "");
  return (
    <label className="block text-sm font-medium text-foreground">
      {label}
      <input
        className={cn(controlClass, "mt-2")}
        dir="ltr"
        value={value}
        onChange={(event) =>
          onChange({
            ...section,
            settings: { ...(section.settings ?? {}), [field]: event.target.value },
          })
        }
      />
    </label>
  );
}

function BuilderSectionsEditor({
  document,
  onChange,
  showAddControls = true,
  selectedSectionId,
}: {
  document: BuilderDocument;
  onChange: (document: BuilderDocument) => void;
  showAddControls?: boolean;
  selectedSectionId?: string | null;
}) {
  const setSections = (children: BuilderNode[]) =>
    onChange({
      ...document,
      settings: {
        ...document.settings,
        headerMode: isHeroSection(children[0]) ? "media-overlay" : "solid",
      },
      children,
    });
  const setSection = (index: number, section: BuilderNode) => {
    const normalized =
      section.type === "section"
        ? {
            ...section,
            settings: {
              ...(section.settings ?? {}),
              sectionType: getSectionKind(section),
            },
          }
        : section;
    setSections(document.children.map((item, i) => (i === index ? normalized : item)));
  };
  return (
    <div className="mt-6">
      {showAddControls ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Choose exactly what you want to add
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(sectionHelp) as BuilderSectionKind[]).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setSections([...document.children, createRegisteredSection(kind)])}
                className="rounded-md border border-border bg-background px-3 py-2 text-left hover:border-primary"
              >
                <span className="block text-xs font-semibold text-foreground">
                  {humanize(kind)}
                </span>
                <span className="block text-[11px] text-muted-foreground">{sectionHelp[kind]}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {document.children.length === 0 ? (
        <div className="mt-5 rounded-lg border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
          This page is empty. Choose a section above.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {document.children.map((section, index) => {
            if (selectedSectionId && section.id !== selectedSectionId) return null;
            const common = {
              section,
              index,
              focused: Boolean(selectedSectionId),
              onChange: (next: BuilderNode) => setSection(index, next),
            };
            return section.type === "section" ? (
              <TightSection key={section.id} {...common} />
            ) : (
              <StoredSection
                key={section.id}
                {...common}
                repeatableButtons={document.template === "home" && section.type === "hero"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function StoredSection({
  section,
  index,
  repeatableButtons,
  onChange,
  focused = false,
}: {
  section: BuilderNode;
  index: number;
  repeatableButtons: boolean;
  onChange: (section: BuilderNode) => void;
  focused?: boolean;
}) {
  const content = repeatableButtons
    ? normalizeSystemHero(section.content ?? {})
    : (section.content ?? {});
  const automaticSolutionCatalog =
    section.type === "catalog" && Object.keys(builderObject(content)).length === 0;
  const homeInsuranceServices = section.type === "insurance-services";
  return (
    <details
      id={`editor-section-${section.id}`}
      className={cn(
        "group bg-background",
        focused ? "border-0" : "rounded-lg border border-border",
      )}
      open={focused || undefined}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-3 px-4 py-4",
          focused && "hidden",
        )}
      >
        <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-semibold">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{humanize(section.type)}</span>
          <span className="block truncate text-xs text-muted-foreground">
            Edit this section's content
          </span>
        </span>
        <ChevronDown size={15} className="group-open:rotate-180" />
      </summary>
      <div className={cn("space-y-5", focused ? "p-0" : "border-t border-border p-5")}>
        {homeInsuranceServices ? (
          <HomeInsuranceServicesEditor
            value={content}
            onChange={(next) => onChange({ ...section, content: next })}
          />
        ) : automaticSolutionCatalog ? (
          <div className="rounded-md border border-border bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">Automatic solution catalogue</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              This list is built from the individual solution pages. Select Health, Life, Motor or
              another solution in the Pages panel to edit what appears here.
            </p>
          </div>
        ) : repeatableButtons ? (
          <SystemHeroEditor
            value={content}
            onChange={(next) => onChange({ ...section, content: next })}
          />
        ) : (
          <JsonFields
            value={content}
            onChange={(next) => onChange({ ...section, content: next })}
          />
        )}
      </div>
    </details>
  );
}

function HomeInsuranceServicesEditor({
  value,
  onChange,
}: {
  value: JsonValue;
  onChange: (value: JsonValue) => void;
}) {
  const content = builderObject(value);
  const items = Array.isArray(content["items"])
    ? content["items"].map((item) => builderObject(item))
    : [];
  const setField = (key: string, next: JsonValue) => onChange({ ...content, [key]: next });
  const setItem = (index: number, key: string, next: JsonValue) =>
    setField(
      "items",
      items.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: next } : item)),
    );

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <StructuredField
          definition={{ key: "eyebrow", label: "Eyebrow" }}
          value={content["eyebrow"]}
          onChange={(next) => setField("eyebrow", next)}
        />
        <StructuredField
          definition={{ key: "title", label: "Section heading" }}
          value={content["title"]}
          onChange={(next) => setField("title", next)}
        />
        <StructuredField
          definition={{ key: "lead", label: "Lead", multiline: true }}
          value={content["lead"]}
          onChange={(next) => setField("lead", next)}
        />
      </div>

      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Service cards</p>
            <p className="mt-1 text-xs text-muted-foreground">
              The title and summary come from the selected solution page.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setField("items", [
                ...items,
                {
                  solutionSlug: "health",
                  imageUrl: "",
                  href: "",
                  position: items.length + 1,
                },
              ])
            }
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Plus size={12} /> Add card
          </button>
        </div>
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <details key={index} className="group" open={items.length === 1}>
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                <span className="grid size-6 place-items-center rounded-full bg-muted text-xs font-semibold">
                  {Number(item["position"] ?? index + 1)}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                  {String(item["solutionSlug"] ?? `Card ${index + 1}`)}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    setField(
                      "items",
                      items.filter((_, itemIndex) => itemIndex !== index),
                    );
                  }}
                  className="text-xs font-semibold text-error"
                >
                  Remove
                </button>
                <ChevronDown size={14} className="group-open:rotate-180" />
              </summary>
              <div className="grid gap-4 bg-muted/20 px-4 pb-4 pt-2">
                <StructuredField
                  definition={{ key: "solutionSlug", label: "Solution page slug" }}
                  value={item["solutionSlug"]}
                  onChange={(next) => setItem(index, "solutionSlug", next)}
                />
                <label className="block text-sm font-medium text-foreground">
                  Position
                  <input
                    type="number"
                    min={1}
                    max={Math.max(items.length, 1)}
                    className={cn(controlClass, "mt-2")}
                    value={Number(item["position"] ?? index + 1)}
                    onChange={(event) =>
                      setItem(index, "position", Math.max(1, Number(event.target.value) || 1))
                    }
                  />
                </label>
                <StructuredField
                  definition={{ key: "imageUrl", label: "Card image URL" }}
                  value={item["imageUrl"]}
                  onChange={(next) => setItem(index, "imageUrl", next)}
                />
                <StructuredField
                  definition={{ key: "href", label: "Link destination" }}
                  value={item["href"]}
                  onChange={(next) => setItem(index, "href", next)}
                />
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

type StructuredFieldDefinition = {
  key: string;
  label: string;
  multiline?: boolean;
  control?: "text" | "number" | "select" | "checkbox";
  options?: string[];
};

const structuredSectionSchemas: Partial<
  Record<
    BuilderSectionKind,
    {
      fields: StructuredFieldDefinition[];
      collectionLabel?: string;
      itemFields?: StructuredFieldDefinition[];
      newItem?: Record<string, JsonValue>;
    }
  >
> = {
  "hero-banner": {
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "heading", label: "Hero title" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "desktopImageUrl", label: "Desktop background image URL" },
      { key: "mobileImageUrl", label: "Mobile background image URL" },
      { key: "imageAlt", label: "Image description" },
    ],
    collectionLabel: "Hero buttons",
    itemFields: [
      { key: "label", label: "Button label" },
      { key: "href", label: "Link destination" },
      {
        key: "variant",
        label: "Button style",
        control: "select",
        options: ["inverse", "inverseOutline"],
      },
    ],
    newItem: { label: "Learn more", href: "", variant: "inverse" },
  },
  "editorial-story": {
    fields: [
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
    ],
    collectionLabel: "Story paragraphs",
    itemFields: [{ key: "text", label: "Paragraph", multiline: true }],
    newItem: { text: "Add another paragraph." },
  },
  callout: {
    fields: [
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "buttonLabel", label: "Button label (optional)" },
      { key: "buttonHref", label: "Button destination" },
    ],
  },
  "faq-groups": {
    fields: [
      { key: "eyebrow", label: "Eyebrow / section label (optional)" },
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "showArrows", label: "Show expand arrows", control: "checkbox" },
      { key: "smoothMotion", label: "Use smooth open and close motion", control: "checkbox" },
    ],
    collectionLabel: "Grouped questions",
    itemFields: [
      { key: "group", label: "Group title" },
      { key: "question", label: "Question" },
      { key: "answer", label: "Answer", multiline: true },
    ],
    newItem: { group: "General", question: "New question", answer: "Write the answer here." },
  },
  "address-block": {
    fields: [
      { key: "eyebrow", label: "Eyebrow / section label (optional)" },
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "layout", label: "Layout", control: "select", options: ["default", "compact"] },
      { key: "icon", label: "Icon", control: "select", options: ["none", "map-pin"] },
      { key: "address", label: "Address (one line per row)", multiline: true },
      { key: "mapLabel", label: "Map button label (optional)" },
      { key: "mapUrl", label: "Map link" },
    ],
  },
  statistics: {
    fields: [
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "layout", label: "Layout", control: "select", options: ["minimal", "boxed"] },
    ],
    collectionLabel: "Facts and figures",
    itemFields: [
      { key: "value", label: "Value" },
      { key: "label", label: "Label" },
    ],
    newItem: { value: "100%", label: "New fact" },
  },
  steps: {
    fields: [
      { key: "eyebrow", label: "Eyebrow / section label (optional)" },
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "layout", label: "Layout", control: "select", options: ["grid", "split"] },
    ],
    collectionLabel: "Process steps",
    itemFields: [
      { key: "title", label: "Step title" },
      { key: "body", label: "Description", multiline: true },
    ],
    newItem: { title: "New step", body: "Explain what happens in this step." },
  },
  "feature-list": {
    fields: [
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
    ],
    collectionLabel: "List items",
    itemFields: [{ key: "text", label: "Item", multiline: true }],
    newItem: { text: "New list item" },
  },
  faq: {
    fields: [
      { key: "eyebrow", label: "Eyebrow / section label (optional)" },
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "showArrows", label: "Show expand arrows", control: "checkbox" },
      { key: "smoothMotion", label: "Use smooth open and close motion", control: "checkbox" },
    ],
    collectionLabel: "Questions and answers",
    itemFields: [
      { key: "question", label: "Question" },
      { key: "answer", label: "Answer", multiline: true },
    ],
    newItem: { question: "New question", answer: "Write the answer here." },
  },
  testimonials: {
    fields: [
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
    ],
    collectionLabel: "Testimonials",
    itemFields: [
      { key: "quote", label: "Quote", multiline: true },
      { key: "name", label: "Customer name" },
      { key: "role", label: "Customer description" },
    ],
    newItem: { quote: "Add the customer’s experience.", name: "Customer name", role: "Customer" },
  },
  "contact-details": {
    fields: [
      { key: "eyebrow", label: "Eyebrow / section label (optional)" },
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "layout", label: "Layout", control: "select", options: ["cards", "rows"] },
    ],
    collectionLabel: "Contact methods",
    itemFields: [
      { key: "label", label: "Label" },
      { key: "value", label: "Displayed value", multiline: true },
      { key: "href", label: "Link (optional)" },
      {
        key: "icon",
        label: "Icon",
        control: "select",
        options: ["none", "message-circle", "phone", "mail", "map-pin", "clock"],
      },
    ],
    newItem: { label: "Contact method", value: "Add contact details", href: "", icon: "phone" },
  },
  "hours-location": {
    fields: [
      { key: "eyebrow", label: "Eyebrow / section label (optional)" },
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "layout", label: "Layout", control: "select", options: ["split", "rows"] },
      { key: "icon", label: "Icon", control: "select", options: ["none", "clock"] },
      { key: "address", label: "Address", multiline: true },
      { key: "mapLabel", label: "Map button label" },
      { key: "mapUrl", label: "Map link" },
    ],
    collectionLabel: "Opening hours",
    itemFields: [
      { key: "day", label: "Day" },
      { key: "time", label: "Hours" },
    ],
    newItem: { day: "Monday", time: "Open 24 hours" },
  },
  "solutions-catalog": {
    fields: [
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
    ],
    collectionLabel: "Solutions",
    itemFields: [
      { key: "title", label: "Solution name" },
      { key: "summary", label: "Summary", multiline: true },
      { key: "imageUrl", label: "Image URL" },
      { key: "imageAlt", label: "Image description" },
      { key: "linkLabel", label: "Link label" },
      { key: "href", label: "Link destination" },
    ],
    newItem: {
      title: "New solution",
      summary: "Describe this solution.",
      imageUrl: "",
      imageAlt: "",
      linkLabel: "Learn more",
      href: "",
    },
  },
  "automatic-solution-catalog": {
    fields: [
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
    ],
  },
  "solution-cards": {
    fields: [
      { key: "eyebrow", label: "Eyebrow / section label (optional)" },
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
    ],
    collectionLabel: "Service cards",
    itemFields: [
      { key: "solutionSlug", label: "Solution page slug" },
      { key: "imageUrl", label: "Card image URL" },
      { key: "imageAlt", label: "Image description" },
      { key: "href", label: "Link destination" },
      { key: "position", label: "Position", control: "number" },
    ],
    newItem: { solutionSlug: "health", imageUrl: "", imageAlt: "", href: "", position: 1 },
  },
  "solution-introduction": {
    fields: [
      { key: "eyebrow", label: "Eyebrow" },
      { key: "heading", label: "Solution name" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "audienceHeading", label: "Audience heading" },
      { key: "audience", label: "Who this is for", multiline: true },
      { key: "buttonLabel", label: "Quote button label" },
      { key: "buttonHref", label: "Quote button destination" },
    ],
  },
  "coverage-details": {
    fields: [
      { key: "heading", label: "Coverage heading" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "helpHeading", label: "Help heading" },
      { key: "help", label: "How we help", multiline: true },
    ],
    collectionLabel: "Covered items",
    itemFields: [{ key: "text", label: "Covered item", multiline: true }],
    newItem: { text: "Add a covered item" },
  },
  "related-links": {
    fields: [
      { key: "heading", label: "Section heading" },
      { key: "intro", label: "Lead", multiline: true },
    ],
  },
  form: {
    fields: [
      { key: "heading", label: "Form heading" },
      { key: "intro", label: "Lead", multiline: true },
      {
        key: "appearance",
        label: "Field appearance",
        control: "select",
        options: ["boxed", "underline"],
      },
      { key: "columns", label: "Form columns", control: "number" },
      { key: "optionalLabel", label: "Optional field helper text" },
      { key: "recipient", label: "Recipient email" },
      { key: "submitLabel", label: "Submit button label" },
    ],
    collectionLabel: "Form fields",
    itemFields: [
      { key: "label", label: "Field label" },
      { key: "name", label: "Field name" },
      {
        key: "type",
        label: "Field type",
        control: "select",
        options: ["text", "email", "tel", "textarea", "select", "checkbox-group"],
      },
      { key: "placeholder", label: "Placeholder" },
      { key: "options", label: "Options (comma separated)" },
      {
        key: "source",
        label: "Automatic options",
        control: "select",
        options: ["", "solution-pages"],
      },
      { key: "required", label: "Required", control: "checkbox" },
    ],
    newItem: {
      label: "New field",
      name: "newField",
      type: "text",
      placeholder: "",
      options: "",
      source: "",
      required: false,
    },
  },
  "multi-step-form": {
    fields: [
      { key: "heading", label: "Form heading" },
      { key: "intro", label: "Lead", multiline: true },
      { key: "recipient", label: "Recipient email" },
      { key: "submitLabel", label: "Submit button label" },
    ],
    collectionLabel: "Form fields",
    itemFields: [
      { key: "step", label: "Step name" },
      { key: "label", label: "Field label" },
      { key: "name", label: "Field name" },
      {
        key: "type",
        label: "Field type",
        control: "select",
        options: ["text", "email", "tel", "textarea", "select", "checkbox-group"],
      },
      { key: "placeholder", label: "Placeholder" },
      { key: "options", label: "Options (comma separated)" },
      {
        key: "source",
        label: "Automatic options",
        control: "select",
        options: ["", "solution-pages"],
      },
      { key: "required", label: "Required", control: "checkbox" },
    ],
    newItem: {
      step: "Details",
      label: "New field",
      name: "newField",
      type: "text",
      placeholder: "",
      options: "",
      source: "",
      required: false,
    },
  },
};

function StructuredSectionFields({
  section,
  kind,
  onChange,
}: {
  section: BuilderNode;
  kind: BuilderSectionKind;
  onChange: (section: BuilderNode) => void;
}) {
  const schema = structuredSectionSchemas[kind];
  if (!schema) return null;
  const content = builderObject(section.content);
  const items = Array.isArray(content["items"])
    ? content["items"].map((item) => builderObject(item))
    : [];
  const itemFields = schema.itemFields ?? [];
  const newItem = schema.newItem ?? {};
  const hasCollection = Boolean(schema.collectionLabel && schema.itemFields && schema.newItem);
  const setContent = (next: Record<string, JsonValue>) => onChange({ ...section, content: next });
  const setItem = (index: number, key: string, value: JsonValue) =>
    setContent({
      ...content,
      items: items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    });
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {schema.fields.map((field) => (
          <StructuredField
            key={field.key}
            definition={field}
            value={content[field.key]}
            onChange={(value) => setContent({ ...content, [field.key]: value })}
          />
        ))}
      </div>
      {hasCollection ? (
        <div className="rounded-lg border border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{schema.collectionLabel}</p>
              <p className="text-xs text-muted-foreground">{items.length} items</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setContent({ ...content, items: [...items, structuredClone(newItem)] })
              }
              className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Plus size={12} /> Add item
            </button>
          </div>
          <div className="divide-y divide-border">
            {items.map((item, index) => (
              <details key={index} className="group" open={items.length === 1}>
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                  <span className="grid size-6 place-items-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {String(item[itemFields[0]?.key ?? ""] ?? `Item ${index + 1}`)}
                  </span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      setContent({
                        ...content,
                        items: items.filter((_, itemIndex) => itemIndex !== index),
                      });
                    }}
                    className="text-xs font-semibold text-error"
                  >
                    Remove
                  </button>
                  <ChevronDown size={14} className="group-open:rotate-180" />
                </summary>
                <div className="grid gap-4 bg-muted/20 px-4 pb-4 pt-2">
                  {itemFields.map((field) => (
                    <StructuredField
                      key={field.key}
                      definition={field}
                      value={item[field.key]}
                      onChange={(value) => setItem(index, field.key, value)}
                    />
                  ))}
                </div>
              </details>
            ))}
            {!items.length ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No items yet. Add the first one above.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StructuredField({
  definition,
  value,
  onChange,
}: {
  definition: StructuredFieldDefinition;
  value: JsonValue | undefined;
  onChange: (value: JsonValue) => void;
}) {
  if (definition.control === "checkbox") {
    return (
      <label className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-3 text-sm font-medium text-foreground">
        {definition.label}
        <input
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(event.target.checked)}
        />
      </label>
    );
  }
  return (
    <label className="block text-sm font-medium text-foreground">
      {definition.label}
      {definition.control === "select" ? (
        <select
          className={cn(controlClass, "mt-2")}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        >
          {definition.options?.map((option) => (
            <option key={option} value={option}>
              {humanize(option)}
            </option>
          ))}
        </select>
      ) : definition.multiline ? (
        <textarea
          className={cn(controlClass, "mt-2")}
          rows={4}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          type={definition.control === "number" ? "number" : "text"}
          className={cn(controlClass, "mt-2")}
          dir={
            definition.key.toLowerCase().includes("url") ||
            definition.key === "href" ||
            definition.key === "recipient"
              ? "ltr"
              : undefined
          }
          value={String(value ?? "")}
          onChange={(event) =>
            onChange(
              definition.control === "number"
                ? Number(event.target.value) || 0
                : event.target.value,
            )
          }
        />
      )}
    </label>
  );
}

function TightSection({
  section,
  index,
  onChange,
  focused = false,
}: {
  section: BuilderNode;
  index: number;
  onChange: (section: BuilderNode) => void;
  focused?: boolean;
}) {
  const kind = getSectionKind(section);
  const nodes = builderNodes(section);
  const headings = nodes.filter((node) => node.type === "heading");
  const eyebrow = nodes.find((node) => node.settings?.["role"] === "eyebrow");
  const container = nodes.find((node) => node.type === "container");
  const directText = container?.children?.find(
    (node) =>
      (node.type === "text" || node.type === "paragraph") && node.settings?.["role"] !== "eyebrow",
  );
  const text =
    directText ??
    (kind === "cards"
      ? undefined
      : nodes.find(
          (node) =>
            (node.type === "text" || node.type === "paragraph") &&
            node.settings?.["role"] !== "eyebrow",
        ));
  const buttons = nodes.filter((node) => node.type === "button");
  const image = nodes.find((node) => node.type === "image");
  const grid = nodes.find(
    (node) => node.type === "grid" && node.children?.some((x) => x.type === "stack"),
  );
  const input = (
    label: string,
    node: BuilderNode | undefined,
    field: string,
    multiline = false,
  ) => (
    <SectionInput
      label={label}
      node={node}
      field={field}
      multiline={multiline}
      section={section}
      onChange={onChange}
    />
  );
  return (
    <details
      id={`editor-section-${section.id}`}
      className={cn(
        "group bg-background",
        focused ? "border-0" : "rounded-lg border border-border",
      )}
      open={focused || undefined}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center gap-3 px-4 py-4",
          focused && "hidden",
        )}
      >
        <span className="grid size-7 place-items-center rounded-full bg-muted text-xs font-semibold">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{humanize(kind)}</span>
          <span className="block truncate text-xs text-muted-foreground">
            You can edit: {sectionHelp[kind]}
          </span>
        </span>
        <ChevronDown size={15} className="group-open:rotate-180" />
      </summary>
      <div className={cn("space-y-5", focused ? "p-0" : "border-t border-border p-5")}>
        {structuredSectionSchemas[kind] ? (
          <StructuredSectionFields section={section} kind={kind} onChange={onChange} />
        ) : (
          <>
            <div className="grid gap-4">
              {input(kind === "cards" ? "Section heading" : "Heading", headings[0], "text")}
              {kind === "hero" && input("Eyebrow", eyebrow, "text")}
              {input("Lead", text, "text", true)}
              {kind === "image-text" && input("Image URL", image, "url")}
              {kind === "image-text" && input("Image description", image, "alt")}
              {kind === "image-text" && input("Image caption", image, "caption")}
              {kind === "image-text" && grid ? (
                <label className="block text-sm font-medium text-foreground">
                  Image position
                  <select
                    className={cn(controlClass, "mt-2")}
                    value={String(section.settings?.["imagePosition"] ?? "right")}
                    onChange={(event) => {
                      const position = event.target.value;
                      onChange({
                        ...changeBuilderNode(section, grid.id, (node) => ({
                          ...node,
                          children:
                            position === "left"
                              ? [...(node.children ?? [])].sort((a) =>
                                  a.type === "image" ? -1 : 1,
                                )
                              : [...(node.children ?? [])].sort((a) =>
                                  a.type === "image" ? 1 : -1,
                                ),
                        })),
                        settings: { ...(section.settings ?? {}), imagePosition: position },
                      });
                    }}
                  >
                    <option value="right">Image on right</option>
                    <option value="left">Image on left</option>
                  </select>
                </label>
              ) : null}
              {kind === "hero" || kind === "call-to-action" ? (
                <>
                  <SectionSettingInput
                    label="Desktop background image URL"
                    field="desktopImageUrl"
                    section={section}
                    onChange={onChange}
                  />
                  <SectionSettingInput
                    label="Mobile background image URL"
                    field="mobileImageUrl"
                    section={section}
                    onChange={onChange}
                  />
                  <SectionSettingInput
                    label="Image description (for accessibility)"
                    field="imageAlt"
                    section={section}
                    onChange={onChange}
                  />
                </>
              ) : null}
            </div>
            {kind !== "cards" ? (
              buttons.length ? (
                <div className="space-y-4 rounded-md border border-border p-4">
                  <p className="text-sm font-semibold text-foreground">Buttons</p>
                  {buttons.map((currentButton, buttonIndex) => (
                    <div
                      key={currentButton.id}
                      className="space-y-3 border-t border-border pt-4 first:border-0 first:pt-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Button {buttonIndex + 1}
                        </span>
                        <button
                          type="button"
                          className="text-xs font-semibold text-error"
                          onClick={() => onChange(removeBuilderNode(section, currentButton.id))}
                        >
                          Remove
                        </button>
                      </div>
                      {input("Button label", currentButton, "label")}
                      {input("Button link", currentButton, "href")}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="rounded-md border border-dashed border-border px-3 py-2 text-xs font-semibold text-primary"
                    onClick={() =>
                      container &&
                      onChange(
                        changeBuilderNode(section, container.id, (node) => ({
                          ...node,
                          children: [...(node.children ?? []), createOptionalButton(kind)],
                        })),
                      )
                    }
                  >
                    <Plus size={12} className="me-1 inline" />
                    Add another button
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={!container}
                  className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md border border-border px-3 text-xs font-semibold disabled:opacity-50"
                  onClick={() =>
                    container &&
                    onChange(
                      changeBuilderNode(section, container.id, (node) => ({
                        ...node,
                        children: [...(node.children ?? []), createOptionalButton(kind)],
                      })),
                    )
                  }
                >
                  <Plus size={12} /> Add button
                </button>
              )
            ) : null}
            {kind === "cards" && grid ? (
              <CardsFields section={section} grid={grid} onChange={onChange} />
            ) : null}
          </>
        )}
      </div>
    </details>
  );
}

function CardsFields({
  section,
  grid,
  onChange,
}: {
  section: BuilderNode;
  grid: BuilderNode;
  onChange: (section: BuilderNode) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">Cards</p>
      {grid.children?.map((card, index) => {
        const nodes = builderNodes(card);
        const cardImage = nodes.find((x) => x.type === "image");
        const cardButton = nodes.find((x) => x.type === "button");
        return (
          <div key={card.id} className="space-y-3 rounded-md border border-border p-4">
            <div className="flex justify-between">
              <span className="text-sm font-semibold">Card {index + 1}</span>
              <button
                type="button"
                className="text-xs font-semibold text-error"
                onClick={() =>
                  onChange(
                    changeBuilderNode(section, grid.id, (node) => ({
                      ...node,
                      children: (node.children ?? []).filter((x) => x.id !== card.id),
                    })),
                  )
                }
              >
                Remove
              </button>
            </div>
            <SectionInput
              label="Card title"
              node={nodes.find((x) => x.type === "heading")}
              field="text"
              section={section}
              onChange={onChange}
            />
            {cardImage ? (
              <>
                <SectionInput
                  label="Image URL"
                  node={cardImage}
                  field="url"
                  section={section}
                  onChange={onChange}
                />
                <SectionInput
                  label="Image description"
                  node={cardImage}
                  field="alt"
                  section={section}
                  onChange={onChange}
                />
              </>
            ) : (
              <button
                type="button"
                className="rounded-md border border-dashed border-border py-2 text-xs font-semibold text-primary"
                onClick={() =>
                  onChange(
                    changeBuilderNode(section, card.id, (node) => ({
                      ...node,
                      children: [createRegisteredImage(), ...(node.children ?? [])],
                    })),
                  )
                }
              >
                <Plus size={12} className="me-1 inline" />
                Add image
              </button>
            )}
            {cardButton ? (
              <>
                <SectionInput
                  label="Link label"
                  node={cardButton}
                  field="label"
                  section={section}
                  onChange={onChange}
                />
                <SectionInput
                  label="Link destination"
                  node={cardButton}
                  field="href"
                  section={section}
                  onChange={onChange}
                />
                <button
                  type="button"
                  className="text-xs font-semibold text-error"
                  onClick={() => onChange(removeBuilderNode(section, cardButton.id))}
                >
                  Remove link
                </button>
              </>
            ) : (
              <button
                type="button"
                className="rounded-md border border-dashed border-border py-2 text-xs font-semibold text-primary"
                onClick={() =>
                  onChange(
                    changeBuilderNode(section, card.id, (node) => ({
                      ...node,
                      children: [...(node.children ?? []), createOptionalButton("text")],
                    })),
                  )
                }
              >
                <Plus size={12} className="me-1 inline" />
                Add link
              </button>
            )}
            <SectionInput
              label="Card description"
              node={nodes.find((x) => x.type === "text")}
              field="text"
              multiline
              section={section}
              onChange={onChange}
            />
          </div>
        );
      })}
      <button
        type="button"
        className="rounded-md border border-border px-3 py-2 text-xs font-semibold"
        onClick={() =>
          onChange(
            changeBuilderNode(section, grid.id, (node) => ({
              ...node,
              children: [
                ...(node.children ?? []),
                createRegisteredCard((node.children?.length ?? 0) + 1),
              ],
            })),
          )
        }
      >
        <Plus size={12} className="me-1 inline" />
        Add card
      </button>
    </div>
  );
}

function MediaLibrary({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const uploads = useQuery({
    queryKey: uploadQueryKey,
    queryFn: ({ signal }) => uploadService.getAll(token, signal),
  });
  const upload = useMutation({
    mutationFn: (file: File) => uploadService.upload(file, token),
    onSuccess: (created) => {
      queryClient.setQueryData<UploadResponse[]>(uploadQueryKey, (images) => [
        created,
        ...(images ?? []),
      ]);
    },
  });
  const remove = useMutation({
    mutationFn: (fileName: string) => uploadService.delete(fileName, token),
    onSuccess: (_, fileName) => {
      queryClient.setQueryData<UploadResponse[]>(uploadQueryKey, (images) =>
        images?.filter((image) => image.fileName !== fileName),
      );
    },
  });

  const submitFile = (file: File | undefined) => {
    if (file) upload.mutate(file);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
        <div>
          <h2 className="font-display text-xl text-foreground">Media library</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload images and copy their URLs into website content fields.
          </p>
        </div>
        <p className="type-caption">{uploads.data?.length ?? 0} images</p>
      </div>

      <div className="h-0 min-h-0 flex-1 overflow-y-auto overscroll-contain p-6">
        <label
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            submitFile(event.dataTransfer.files[0]);
          }}
          className={cn(
            "flex min-h-40 items-center justify-center border border-dashed px-6 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30",
          )}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={upload.isPending}
            onChange={(event) => {
              submitFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <span>
            {upload.isPending ? (
              <Loader2 className="mx-auto animate-spin text-primary" size={24} />
            ) : (
              <Upload className="mx-auto text-primary" size={24} strokeWidth={1.5} />
            )}
            <span className="mt-4 block text-sm font-semibold text-foreground">
              {upload.isPending ? "Uploading image…" : "Choose an image or drop it here"}
            </span>
            <span className="mt-2 block text-xs text-muted-foreground">
              JPG, PNG, WebP or GIF · maximum 8 MB
            </span>
          </span>
        </label>

        {upload.isError ? (
          <p className="mt-4 border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
            The image could not be uploaded. Check its format and size, then try again.
          </p>
        ) : null}

        {uploads.isLoading ? (
          <PanelLoading />
        ) : uploads.isError ? (
          <div className="mt-6">
            <PanelError />
          </div>
        ) : uploads.data?.length ? (
          <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(11rem,13rem))] gap-4">
            {uploads.data.map((image) => (
              <article
                key={image.fileName}
                className="min-w-0 overflow-hidden rounded-lg border border-border bg-background shadow-sm"
              >
                <div className="h-28 bg-muted">
                  <img
                    src={image.url}
                    alt={image.fileName}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <p
                    className="truncate text-xs font-medium text-foreground"
                    title={image.fileName}
                  >
                    {image.fileName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatFileSize(image.size)}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(image.url);
                        setCopiedUrl(image.url);
                        window.setTimeout(() => setCopiedUrl(null), 1800);
                      }}
                      className="min-h-9 flex-1 rounded-full border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {copiedUrl === image.url ? "Copied" : "Copy URL"}
                    </button>
                    <button
                      type="button"
                      title="Delete image"
                      disabled={remove.isPending && remove.variables === image.fileName}
                      onClick={() => setImageToDelete(image.fileName)}
                      className="grid size-9 place-items-center rounded-full border border-error/30 text-error transition-colors hover:bg-error/5 disabled:opacity-50"
                    >
                      {remove.isPending && remove.variables === image.fileName ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid min-h-48 place-items-center text-center">
            <div>
              <ImageIcon className="mx-auto text-muted-foreground" size={28} strokeWidth={1.25} />
              <p className="mt-4 text-sm font-medium text-foreground">No uploaded images yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your uploaded images will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={imageToDelete !== null}
        onOpenChange={(open) => !open && setImageToDelete(null)}
        title="Permanently delete image?"
        description={`Delete “${imageToDelete ?? "this image"}” from the media library? This cannot be undone.`}
        confirmLabel="Delete image"
        pending={remove.isPending}
        onConfirm={() => {
          if (!imageToDelete) return;
          remove.mutate(imageToDelete, { onSuccess: () => setImageToDelete(null) });
        }}
      />
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PanelError() {
  return (
    <div className="border border-error/30 bg-error/5 p-4 text-sm text-error">
      The editor could not load this content. Check the API and try again.
    </div>
  );
}

function normalizeSystemHero(value: JsonValue): JsonValue {
  const hero = builderObject(value);
  const existing = hero["buttons"];
  const buttons = Array.isArray(existing)
    ? existing
    : [
        { label: hero["primary"] ?? "", href: hero["primaryHref"] ?? "", variant: "inverse" },
        {
          label: hero["secondary"] ?? "",
          href: hero["secondaryHref"] ?? "",
          variant: "inverseOutline",
        },
      ].filter((button) => String(button.label).length > 0);
  const { primary, secondary, primaryHref, secondaryHref, ...clean } = hero;
  void primary;
  void secondary;
  void primaryHref;
  void secondaryHref;
  return { ...clean, buttons };
}

function SystemHeroEditor({
  value,
  onChange,
}: {
  value: JsonValue;
  onChange: (value: JsonValue) => void;
}) {
  const hero = builderObject(value);
  const buttons = Array.isArray(hero["buttons"]) ? hero["buttons"] : [];
  const content = Object.fromEntries(Object.entries(hero).filter(([key]) => key !== "buttons"));
  const setButtons = (next: JsonValue[]) => onChange({ ...hero, buttons: next });
  const updateButton = (index: number, key: string, next: string) =>
    setButtons(
      buttons.map((item, i) => (i === index ? { ...builderObject(item), [key]: next } : item)),
    );
  const moveButton = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= buttons.length) return;
    const next = [...buttons];
    [next[index], next[target]] = [next[target]!, next[index]!];
    setButtons(next);
  };
  return (
    <div className="space-y-5">
      <JsonFields
        value={content}
        onChange={(next) => onChange({ ...builderObject(next), buttons })}
      />
      <div className="space-y-3 rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Hero buttons</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add as many buttons as needed. Their order here is their order on the page.
          </p>
        </div>
        {buttons.map((item, index) => {
          const button = builderObject(item);
          return (
            <div key={index} className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Button {index + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveButton(index, -1)}
                    className="px-2 disabled:opacity-25"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === buttons.length - 1}
                    onClick={() => moveButton(index, 1)}
                    className="px-2 disabled:opacity-25"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setButtons(buttons.filter((_, i) => i !== index))}
                    className="text-xs font-semibold text-error"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <label className="block text-sm font-medium">
                Label
                <input
                  className={cn(controlClass, "mt-2")}
                  value={String(button["label"] ?? "")}
                  onChange={(event) => updateButton(index, "label", event.target.value)}
                />
              </label>
              <label className="block text-sm font-medium">
                Link
                <input
                  className={cn(controlClass, "mt-2")}
                  dir="ltr"
                  value={String(button["href"] ?? "")}
                  onChange={(event) => updateButton(index, "href", event.target.value)}
                />
              </label>
              <label className="block text-sm font-medium">
                Style
                <select
                  className={cn(controlClass, "mt-2")}
                  value={String(button["variant"] ?? "inverse")}
                  onChange={(event) => updateButton(index, "variant", event.target.value)}
                >
                  <option value="inverse">Filled</option>
                  <option value="inverseOutline">Outline</option>
                </select>
              </label>
            </div>
          );
        })}
        <button
          type="button"
          onClick={() =>
            setButtons([
              ...buttons,
              {
                label: "New button",
                href: "/",
                variant: buttons.length === 0 ? "inverse" : "inverseOutline",
              },
            ])
          }
          className="w-full rounded-md border border-dashed border-border py-3 text-xs font-semibold text-primary"
        >
          <Plus size={12} className="me-1 inline" />
          Add button
        </button>
      </div>
    </div>
  );
}

function SiteSettingEditor({
  setting,
  token,
  locale,
  onSaved,
}: {
  setting: SiteSettingResponse;
  token: string;
  locale: Locale;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(setting.value as JsonValue);
  useEffect(() => setDraft(setting.value as JsonValue), [setting]);
  const mutation = useMutation({
    mutationFn: () => siteSettingService.patch(setting.key, draft, token),
    onSuccess: (updated) => {
      queryClient.setQueryData(contentQueryKeys.siteSetting(locale), updated);
      void queryClient.invalidateQueries({ queryKey: contentQueryKeys.all, refetchType: "none" });
      onSaved();
    },
  });

  return (
    <EditorCard title={`${locale.toUpperCase()} global content`} icon={<Globe2 size={15} />}>
      <JsonFields value={draft} onChange={setDraft} />
      <EditorActions
        dirty={JSON.stringify(draft) !== JSON.stringify(setting.value)}
        pending={mutation.isPending}
        error={mutation.isError}
        success={mutation.isSuccess}
        onReset={() => setDraft(structuredClone(setting.value) as JsonValue)}
        onSave={() => mutation.mutate()}
      />
    </EditorCard>
  );
}

function NavigationEditor({
  menu,
  token,
  locale,
  onSaved,
}: {
  menu: NavigationMenu;
  token: string;
  locale: Locale;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const pages = useQuery({
    queryKey: builderQueryKeys.pages(),
    queryFn: ({ signal }) => builderService.getPages(token, signal),
  });
  const availablePages = pages.data?.filter((page) => page.locale === locale) ?? [];
  const [draft, setDraft] = useState<SaveNavigationItem[]>(() => toSaveNavigation(menu.items));
  useEffect(() => setDraft(toSaveNavigation(menu.items)), [menu]);
  const mutation = useMutation({
    mutationFn: () => navigationService.save(locale, menu.name, draft, token),
    onSuccess: (updated) => {
      queryClient.setQueryData(navigationQueryKeys.menu(locale), updated);
      onSaved();
    },
  });

  return (
    <EditorCard title={`${locale.toUpperCase()} primary navigation`} icon={<Menu size={15} />}>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        Add, remove, and reorder links. Nested items automatically become dropdown entries.
      </p>
      <NavigationItemsEditor items={draft} pages={availablePages} onChange={setDraft} />
      <EditorActions
        dirty={JSON.stringify(draft) !== JSON.stringify(toSaveNavigation(menu.items))}
        pending={mutation.isPending}
        error={mutation.isError}
        success={mutation.isSuccess}
        onReset={() => setDraft(toSaveNavigation(menu.items))}
        onSave={() => mutation.mutate()}
      />
    </EditorCard>
  );
}

function NavigationItemsEditor({
  items,
  pages,
  onChange,
  depth = 0,
}: {
  items: SaveNavigationItem[];
  pages: BuilderPageSummary[];
  onChange: (items: SaveNavigationItem[]) => void;
  depth?: number;
}) {
  const update = (index: number, next: SaveNavigationItem) =>
    onChange(items.map((item, itemIndex) => (itemIndex === index ? next : item)));
  const move = (index: number, offset: number) => {
    const next = [...items];
    const destination = index + offset;
    if (destination < 0 || destination >= next.length) return;
    [next[index], next[destination]] = [next[destination]!, next[index]!];
    onChange(next);
  };
  const createItem = (): SaveNavigationItem => ({
    id: createId(),
    label: "New link",
    linkType: pages.length ? "page" : "url",
    pageId: pages[0]?.id ?? null,
    url: pages.length ? null : "/",
    anchor: null,
    openInNewTab: false,
    isVisible: true,
    style: {},
    children: [],
  });

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.id ?? index} className="rounded-lg border border-border bg-muted/20 p-3">
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <input
              aria-label="Navigation label"
              className={controlClass}
              value={item.label}
              onChange={(event) => update(index, { ...item, label: event.target.value })}
            />
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Move up"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className="size-8 text-muted-foreground disabled:opacity-25"
              >
                ↑
              </button>
              <button
                type="button"
                title="Move down"
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
                className="size-8 text-muted-foreground disabled:opacity-25"
              >
                ↓
              </button>
              <button
                type="button"
                title="Remove"
                onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                className="grid size-8 place-items-center text-error"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <select
              className={controlClass}
              value={item.linkType}
              onChange={(event) => {
                const linkType = event.target.value;
                update(index, {
                  ...item,
                  linkType,
                  pageId: linkType === "page" ? (item.pageId ?? pages[0]?.id ?? null) : null,
                  url: linkType === "page" || linkType === "none" ? null : (item.url ?? ""),
                });
              }}
            >
              <option value="page">CMS page</option>
              <option value="url">Custom URL</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="file">File</option>
              <option value="none">Dropdown only</option>
            </select>
            {item.linkType === "page" ? (
              <select
                className={controlClass}
                value={item.pageId ?? ""}
                onChange={(event) => update(index, { ...item, pageId: event.target.value })}
              >
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))}
              </select>
            ) : item.linkType !== "none" ? (
              <input
                className={controlClass}
                dir="ltr"
                placeholder="Destination"
                value={item.url ?? ""}
                onChange={(event) => update(index, { ...item, url: event.target.value })}
              />
            ) : (
              <span />
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-body">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.isVisible}
                onChange={(event) => update(index, { ...item, isVisible: event.target.checked })}
              />{" "}
              Visible
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={item.openInNewTab}
                onChange={(event) => update(index, { ...item, openInNewTab: event.target.checked })}
              />{" "}
              New tab
            </label>
            <input
              className="min-h-8 border-b border-border bg-transparent px-2"
              placeholder="Section anchor"
              value={item.anchor ?? ""}
              onChange={(event) => update(index, { ...item, anchor: event.target.value || null })}
            />
            {depth < 3 ? (
              <button
                type="button"
                onClick={() =>
                  update(index, { ...item, children: [...item.children, createItem()] })
                }
                className="ms-auto font-semibold text-primary"
              >
                + Dropdown item
              </button>
            ) : null}
          </div>
          {item.children.length ? (
            <div className="mt-3 border-s-2 border-border ps-3">
              <NavigationItemsEditor
                items={item.children}
                pages={pages}
                depth={depth + 1}
                onChange={(children) => update(index, { ...item, children })}
              />
            </div>
          ) : null}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, createItem()])}
        className="w-full rounded-lg border border-dashed border-border py-3 text-xs font-semibold text-primary hover:border-primary"
      >
        + Add {depth ? "dropdown item" : "navigation item"}
      </button>
    </div>
  );
}

function toSaveNavigation(items: NavigationMenu["items"]): SaveNavigationItem[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    linkType: item.linkType,
    pageId: item.pageId,
    url: item.url,
    anchor: item.anchor,
    openInNewTab: item.openInNewTab,
    isVisible: item.isVisible,
    style: structuredClone(item.style),
    children: toSaveNavigation(item.children),
  }));
}

function ThemeEditor({
  theme,
  token,
  onSaved,
}: {
  theme: ThemeResponse;
  token: string;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(theme.tokens as JsonValue);
  useEffect(() => setDraft(structuredClone(theme.tokens) as JsonValue), [theme]);
  const mutation = useMutation({
    mutationFn: () =>
      themeService.update(theme.id, theme.name, draft as Record<string, JsonValue>, token),
    onSuccess: (updated) => {
      queryClient.setQueryData(themeQueryKey, updated);
      onSaved();
    },
  });

  return (
    <EditorCard title={theme.name} icon={<Palette size={15} />}>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        These tokens control the current site colours, typography, spacing, container width, and
        radius while preserving the original design by default.
      </p>
      <JsonFields value={draft} onChange={setDraft} />
      <EditorActions
        dirty={JSON.stringify(draft) !== JSON.stringify(theme.tokens)}
        pending={mutation.isPending}
        error={mutation.isError}
        success={mutation.isSuccess}
        onReset={() => setDraft(structuredClone(theme.tokens) as JsonValue)}
        onSave={() => mutation.mutate()}
      />
    </EditorCard>
  );
}

function EditorCard({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-background">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-4 text-start"
      >
        <span className="text-primary">{icon}</span>
        <span className="flex-1 text-sm font-semibold text-foreground">{title}</span>
        <ChevronDown
          size={15}
          className={cn(
            "transition-transform duration-[var(--duration-base)] ease-[var(--ease-cinematic)]",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-cinematic)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-border p-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function JsonFields({
  value,
  onChange,
  path = [],
}: {
  value: JsonValue;
  onChange: (value: JsonValue) => void;
  path?: string[];
}) {
  if (Array.isArray(value)) {
    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <JsonArrayItem
            key={index}
            index={index}
            value={item}
            path={[...path, String(index)]}
            onMoveUp={
              index === 0
                ? undefined
                : () =>
                    onChange(
                      value.map((entry, itemIndex) =>
                        itemIndex === index - 1
                          ? value[index]!
                          : itemIndex === index
                            ? value[index - 1]!
                            : entry,
                      ),
                    )
            }
            onMoveDown={
              index === value.length - 1
                ? undefined
                : () =>
                    onChange(
                      value.map((entry, itemIndex) =>
                        itemIndex === index
                          ? value[index + 1]!
                          : itemIndex === index + 1
                            ? value[index]!
                            : entry,
                      ),
                    )
            }
            onRemove={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
            onChange={(next) =>
              onChange(value.map((entry, itemIndex) => (itemIndex === index ? next : entry)))
            }
          />
        ))}
        <button
          type="button"
          onClick={() => onChange([...value, blankLike(value[0])])}
          className="w-full rounded-md border border-dashed border-border py-2 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary"
        >
          Add item
        </button>
      </div>
    );
  }

  if (value !== null && typeof value === "object") {
    return (
      <div className="space-y-4">
        {Object.entries(value).map(([key, entry]) => (
          <JsonField
            key={key}
            label={humanize(key)}
            fieldKey={key}
            value={entry}
            path={[...path, key]}
            onChange={(next) => onChange({ ...value, [key]: next })}
          />
        ))}
      </div>
    );
  }

  return <PrimitiveInput label={path.at(-1) ?? "Value"} value={value} onChange={onChange} />;
}

function JsonField({
  label,
  fieldKey,
  value,
  path,
  onChange,
}: {
  label: string;
  fieldKey: string;
  value: JsonValue;
  path: string[];
  onChange: (value: JsonValue) => void;
}) {
  const nested = Array.isArray(value) || (value !== null && typeof value === "object");
  if (nested) {
    return <NestedJsonField label={label} value={value} path={path} onChange={onChange} />;
  }
  return <PrimitiveInput label={label} fieldKey={fieldKey} value={value} onChange={onChange} />;
}

function NestedJsonField({
  label,
  value,
  path,
  onChange,
}: {
  label: string;
  value: JsonValue[] | { [key: string]: JsonValue };
  path: string[];
  onChange: (value: JsonValue) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-md border border-border bg-muted/30">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-start"
      >
        <span className="type-caption">{label}</span>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 transition-transform duration-[var(--duration-base)] ease-[var(--ease-cinematic)]",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-cinematic)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-border p-3">
            <JsonFields value={value} path={path} onChange={onChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

function JsonArrayItem({
  index,
  value,
  path,
  onMoveUp,
  onMoveDown,
  onRemove,
  onChange,
}: {
  index: number;
  value: JsonValue;
  path: string[];
  onMoveUp: (() => void) | undefined;
  onMoveDown: (() => void) | undefined;
  onRemove: () => void;
  onChange: (value: JsonValue) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-md border border-border bg-muted/40">
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex flex-1 items-center justify-between text-start"
        >
          <span className="type-caption">Item {index + 1}</span>
          <ChevronDown
            size={14}
            className={cn(
              "transition-transform duration-[var(--duration-base)] ease-[var(--ease-cinematic)]",
              open && "rotate-180",
            )}
          />
        </button>
        <button
          type="button"
          title="Move up"
          disabled={!onMoveUp}
          onClick={onMoveUp}
          className="text-xs text-muted-foreground disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          title="Move down"
          disabled={!onMoveDown}
          onClick={onMoveDown}
          className="text-xs text-muted-foreground disabled:opacity-30"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="ms-2 text-xs text-error hover:underline"
        >
          Remove
        </button>
      </div>
      <div
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-cinematic)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-border p-3">
            <JsonFields value={value} path={path} onChange={onChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PrimitiveInput({
  label,
  fieldKey = "",
  value,
  onChange,
}: {
  label: string;
  fieldKey?: string;
  value: string | number | boolean | null;
  onChange: (value: JsonValue) => void;
}) {
  if (typeof value === "boolean") {
    return (
      <label className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
        />
      </label>
    );
  }

  if (typeof value === "number") {
    return (
      <label className="block">
        <span className="type-caption">{label}</span>
        <input
          className={cn(controlClass, "mt-2")}
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
    );
  }

  const stringValue = value ?? "";
  const multiline =
    stringValue.length > 70 || /body|lead|description|intro|help|audience|notice/i.test(fieldKey);
  return (
    <label className="block">
      <span className="type-caption">{label}</span>
      {multiline ? (
        <textarea
          className={cn(controlClass, "mt-2 min-h-24 resize-y")}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className={cn(controlClass, "mt-2")}
          type="text"
          dir={/url|href|email|phone/i.test(fieldKey) ? "ltr" : undefined}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function EditorActions({
  dirty,
  pending,
  error,
  success,
  onReset,
  onSave,
}: {
  dirty: boolean;
  pending: boolean;
  error: boolean;
  success: boolean;
  onReset: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-5 border-t border-border pt-4">
      {error ? <p className="mb-3 text-xs text-error">Could not save. Please try again.</p> : null}
      {success && !dirty ? (
        <p className="mb-3 text-xs font-medium text-success">Changes saved successfully.</p>
      ) : null}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onReset}
          disabled={!dirty || pending}
          className="inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold text-muted-foreground disabled:opacity-40"
        >
          <RotateCcw size={13} /> Reset
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || pending}
          className="inline-flex min-h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-40"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save
        </button>
      </div>
    </div>
  );
}

function humanize(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
}

function blankLike(value: JsonValue | undefined): JsonValue {
  if (value === undefined || typeof value === "string" || value === null) return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (key === "id") return [key, createId()];
      if (key === "type" || key === "linkType") return [key, entry];
      if (key === "visible" || key === "isVisible") return [key, true];
      return [key, blankLike(entry)];
    }),
  );
}
