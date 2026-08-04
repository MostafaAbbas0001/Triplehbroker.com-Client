import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ExternalLink,
  FileText,
  Globe2,
  Image as ImageIcon,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  Monitor,
  Pencil,
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
import { pageService, type PageResponse } from "@/services/pageService";
import { sectionService, type SectionResponse } from "@/services/sectionService";
import { siteSettingService, type SiteSettingResponse } from "@/services/siteSettingService";
import { uploadQueryKey, uploadService, type UploadResponse } from "@/services/uploadService";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

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
type PageName = "home" | "about" | "solutions" | "claims" | "quote" | "contact" | "faq";
type EditorTarget = PageName | "site" | "media";
type PreviewSize = "desktop" | "tablet" | "mobile";

const PAGES: Array<{ key: PageName; label: string }> = [
  { key: "home", label: "Home" },
  { key: "about", label: "About" },
  { key: "solutions", label: "Solutions" },
  { key: "claims", label: "Claims" },
  { key: "quote", label: "Quote" },
  { key: "contact", label: "Contact" },
  { key: "faq", label: "FAQ" },
];

const SECTION_ORDER: Record<PageName, string[]> = {
  home: ["hero", "insurance-services", "why-triple-h"],
  about: ["hero", "story", "facts", "commitments"],
  solutions: ["hero", "catalog", "detail"],
  claims: ["hero", "process", "prepare", "claims-desk"],
  quote: [
    "hero",
    "progress",
    "cover-step",
    "details-step",
    "contact-step",
    "actions",
    "success",
    "errors",
  ],
  contact: ["hero", "office", "contact-methods", "hours", "form"],
  faq: ["hero", "question-groups"],
};

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
  const [locale, setLocale] = useState<Locale>("en");
  const [target, setTarget] = useState<EditorTarget>("home");
  const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop");
  const [previewVersion, setPreviewVersion] = useState(0);
  const pagesQuery = useQuery({
    queryKey: contentQueryKeys.pages(),
    queryFn: ({ signal }) => pageService.getAll(signal),
  });
  const selectedPage = useMemo(
    () =>
      target === "site" || target === "media"
        ? null
        : (pagesQuery.data?.find(
            (page) => page.slug === (target === "home" ? locale : `${locale}/${target}`),
          ) ?? null),
    [locale, pagesQuery.data, target],
  );
  const sectionsQuery = useQuery({
    queryKey: contentQueryKeys.sections(selectedPage?.id ?? "none"),
    queryFn: ({ signal }) => sectionService.getAllForPage(selectedPage!.id, signal),
    enabled: selectedPage !== null,
  });
  const settingQuery = useQuery({
    queryKey: contentQueryKeys.siteSetting(locale),
    queryFn: ({ signal }) => siteSettingService.getByKey(`site-${locale}`, signal),
    enabled: target === "site",
  });
  const orderedSections = useMemo(() => {
    if (target === "site" || target === "media" || !sectionsQuery.data) return [];
    const order = SECTION_ORDER[target];
    return [...sectionsQuery.data].sort(
      (left, right) => order.indexOf(left.key) - order.indexOf(right.key),
    );
  }, [sectionsQuery.data, target]);

  const previewPath =
    target === "site" || target === "media" || target === "home"
      ? `/${locale}`
      : `/${locale}/${target}`;
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
          target === "media"
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

          <p className="mt-8 px-3 type-caption">Pages</p>
          <nav className="mt-3 space-y-1">
            {PAGES.map((page) => (
              <button
                key={page.key}
                onClick={() => setTarget(page.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-start text-sm transition-colors",
                  target === page.key
                    ? "bg-primary text-primary-foreground"
                    : "text-body hover:bg-muted hover:text-foreground",
                )}
              >
                <FileText size={15} strokeWidth={1.5} /> {page.label}
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
          </div>
        </aside>

        <main className="flex min-w-0 flex-col">
          {target === "media" ? (
            <MediaLibrary token={session.accessToken} />
          ) : (
            <>
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-5">
                <div>
                  <p className="text-sm font-semibold capitalize text-foreground">
                    {target === "site" ? "Global content" : target}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    /{locale}
                    {target === "home" || target === "site" ? "" : `/${target}`}
                  </p>
                </div>
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

              <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-[#dfe4e7] p-6">
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

        {target !== "media" ? (
          <aside className="overflow-y-auto border-s border-border bg-background">
            <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-4 backdrop-blur">
              <p className="text-sm font-semibold text-foreground">Edit content</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Changes appear in the preview after saving.
              </p>
            </div>

            <div className="p-4">
              {pagesQuery.isLoading || sectionsQuery.isLoading || settingQuery.isLoading ? (
                <PanelLoading />
              ) : pagesQuery.error || sectionsQuery.error || settingQuery.error ? (
                <PanelError />
              ) : target === "site" && settingQuery.data ? (
                <SiteSettingEditor
                  setting={settingQuery.data}
                  token={session.accessToken}
                  locale={locale}
                  onSaved={refreshPreview}
                />
              ) : selectedPage ? (
                <>
                  <PageSeoEditor
                    page={selectedPage}
                    token={session.accessToken}
                    onSaved={refreshPreview}
                  />
                  <div className="mt-4 space-y-3">
                    {orderedSections.map((section) => (
                      <SectionEditor
                        key={section.id}
                        section={section}
                        token={session.accessToken}
                        onSaved={refreshPreview}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className="p-4 text-sm text-error">This page is missing from the database.</p>
              )}
            </div>
          </aside>
        ) : null}
      </div>
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

function MediaLibrary({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [dragging, setDragging] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
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
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-6">
        <div>
          <h2 className="font-display text-xl text-foreground">Media library</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload images and copy their URLs into website content fields.
          </p>
        </div>
        <p className="type-caption">{uploads.data?.length ?? 0} images</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-6">
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
                      onClick={() => {
                        if (window.confirm("Delete this image permanently?")) {
                          remove.mutate(image.fileName);
                        }
                      }}
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

function PageSeoEditor({
  page,
  token,
  onSaved,
}: {
  page: PageResponse;
  token: string;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(page.seoData);
  useEffect(() => setDraft(page.seoData), [page]);
  const mutation = useMutation({
    mutationFn: () => pageService.patch(page.id, { seoData: draft }, token),
    onSuccess: (updated) => {
      queryClient.setQueryData<PageResponse[]>(contentQueryKeys.pages(), (pages) =>
        pages?.map((candidate) => (candidate.id === updated.id ? updated : candidate)),
      );
      void queryClient.invalidateQueries({ queryKey: contentQueryKeys.all, refetchType: "none" });
      onSaved();
    },
  });

  return (
    <EditorCard title="Page & SEO" icon={<FileText size={15} />} defaultOpen={false}>
      <JsonFields
        value={draft as unknown as JsonValue}
        onChange={(value) => setDraft(value as never)}
      />
      <EditorActions
        dirty={JSON.stringify(draft) !== JSON.stringify(page.seoData)}
        pending={mutation.isPending}
        error={mutation.isError}
        success={mutation.isSuccess}
        onReset={() => setDraft(page.seoData)}
        onSave={() => mutation.mutate()}
      />
    </EditorCard>
  );
}

function SectionEditor({
  section,
  token,
  onSaved,
}: {
  section: SectionResponse;
  token: string;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState(section.content as JsonValue);
  useEffect(() => setDraft(section.content as JsonValue), [section]);
  const mutation = useMutation({
    mutationFn: () => sectionService.patch(section.pageId, section.id, draft, token),
    onSuccess: (updated) => {
      queryClient.setQueryData<SectionResponse[]>(
        contentQueryKeys.sections(section.pageId),
        (items) => items?.map((item) => (item.id === updated.id ? updated : item)),
      );
      void queryClient.invalidateQueries({ queryKey: contentQueryKeys.all, refetchType: "none" });
      onSaved();
    },
  });

  return (
    <EditorCard title={humanize(section.key)} icon={<Pencil size={15} />}>
      <JsonFields value={draft} onChange={setDraft} />
      <EditorActions
        dirty={JSON.stringify(draft) !== JSON.stringify(section.content)}
        pending={mutation.isPending}
        error={mutation.isError}
        success={mutation.isSuccess}
        onReset={() => setDraft(structuredClone(section.content) as JsonValue)}
        onSave={() => mutation.mutate()}
      />
    </EditorCard>
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
  onRemove,
  onChange,
}: {
  index: number;
  value: JsonValue;
  path: string[];
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
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, blankLike(entry)]));
}
