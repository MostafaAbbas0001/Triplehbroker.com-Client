import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ComponentProps, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------- Layout ---------------- */

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("container-page", className)}>{children}</div>;
}

export function Section({
  as: As = "section",
  tone = "default",
  size = "base",
  bordered = false,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  tone?: "default" | "subtle" | "muted" | "glass" | "inverse";
  size?: "base" | "lg" | "tight";
  bordered?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"section">, "children" | "className">) {
  const tones = {
    default: "bg-background",
    subtle: "bg-subtle",
    muted: "bg-muted",
    glass: "glass",
    inverse: "bg-inverse text-inverse-foreground",
  } as const;
  const sizes = {
    tight: "py-14",
    base: "section-y",
    lg: "section-y-lg",
  } as const;
  return (
    <As className={cn(tones[tone], sizes[size], bordered && "hairline-top", className)} {...rest}>
      {children}
    </As>
  );
}

/* ---------------- Typography ---------------- */

export function Eyebrow({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "inverse";
}) {
  return <p className={cn("type-label", tone === "inverse" && "text-inverse-muted")}>{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "start",
  tone = "default",
  className,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: "start" | "center";
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <div className={cn(align === "center" && "flex justify-center")}>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </div>
      ) : null}
      <h2
        className={cn("type-h2 mt-6 max-w-[22ch]", tone === "inverse" && "text-inverse-foreground")}
      >
        {title}
      </h2>
      {lead ? (
        <p className={cn("type-lead mt-6 max-w-xl", tone === "inverse" && "text-inverse-muted")}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------- Actions ---------------- */

const actionStyles = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border text-[0.875rem] font-semibold tracking-[0.055em] uppercase focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "glass-btn-primary text-[color:var(--button-primary-text)]",
        secondary: "glass-btn text-foreground hover:text-primary",
        inverse: "glass-btn-dark text-[color:var(--button-inverse-text)]",
        inverseOutline: "glass-btn-dark border-white/45 text-[color:var(--button-inverse-text)]",
        ghost:
          "rounded-none border-transparent bg-transparent px-0! text-primary hover:text-foreground",
      },
      size: {
        md: "min-h-12 px-8 py-3.5",
        sm: "min-h-10 px-5 py-2 text-[0.8125rem]",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ActionVariants = VariantProps<typeof actionStyles>;

const ActionAnchorBase = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & ActionVariants
>(({ variant, size, className, ...props }, ref) => (
  <a ref={ref} className={cn(actionStyles({ variant, size }), className)} {...props} />
));
ActionAnchorBase.displayName = "ActionAnchorBase";

export const ActionAnchor = ActionAnchorBase;

/* ---------------- Cinematic media ---------------- */

const stageHeights = {
  full: "min-h-[100svh]",
  tall: "min-h-[70svh]",
  band: "min-h-[52svh]",
} as const;

export function MediaStage({
  src,
  mobileSrc,
  alt,
  height = "tall",
  overlay = "strong",
  priority = false,
  align = "end",
  brandSideOverlay = false,
  topOverlay = false,
  className,
  sectionKey,
  children,
}: {
  src: string;
  mobileSrc?: string;
  alt: string;
  height?: keyof typeof stageHeights;
  overlay?: "strong" | "soft";
  priority?: boolean;
  align?: "end" | "center";
  brandSideOverlay?: boolean;
  topOverlay?: boolean;
  className?: string;
  sectionKey?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("media-frame flex w-full", stageHeights[height], className)}
      data-page-section={sectionKey}
    >
      <picture>
        {mobileSrc ? <source media="(max-width: 767px)" srcSet={mobileSrc} /> : null}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 size-full object-cover"
        />
      </picture>
      {brandSideOverlay ? (
        <div aria-hidden="true" className="brand-side-scrim absolute inset-0" />
      ) : null}
      <div
        aria-hidden="true"
        className={cn("absolute inset-0", overlay === "strong" ? "scrim-strong" : "scrim-soft")}
      />
      {topOverlay ? (
        <div aria-hidden="true" className="top-nav-scrim absolute inset-x-0 top-0 h-44" />
      ) : null}
      <div
        className={cn(
          "relative flex w-full flex-col",
          align === "center" ? "justify-center py-24" : "justify-end pb-14 pt-24 sm:pb-20",
        )}
      >
        {children}
      </div>
    </div>
  );
}
