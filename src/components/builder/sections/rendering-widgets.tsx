import { useState } from "react";
import { ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LegacySectionRenderProps } from "./rendering";
import { stringValue } from "./rendering";

export function SectionAccordionItem({
  question,
  answer,
  showArrow,
  smooth,
  large = false,
}: {
  question: string;
  answer: string;
  showArrow: boolean;
  smooth: boolean;
  large?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center justify-between gap-6 py-5 text-start text-foreground",
          large ? "font-display text-xl" : "type-h4",
        )}
      >
        <span>{question}</span>
        {showArrow ? (
          <ChevronDown
            size={18}
            className={cn(
              "shrink-0 transition-transform",
              smooth ? "duration-300" : "duration-0",
              open && "rotate-180",
            )}
          />
        ) : null}
      </button>
      <div
        className={cn(
          "grid",
          smooth ? "transition-[grid-template-rows,opacity] duration-300 ease-out" : "duration-0",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <p className={cn("type-body max-w-3xl pb-6", !large && "type-small")}>{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function ContactIcon({ name, className }: { name: string; className?: string }) {
  const Icon =
    name === "message-circle"
      ? MessageCircle
      : name === "phone"
        ? Phone
        : name === "mail"
          ? Mail
          : name === "clock"
            ? Clock
            : name === "map-pin"
              ? MapPin
              : null;
  return Icon ? <Icon aria-hidden="true" className={cn("size-4", className)} /> : null;
}

export function LegacyMediaSection({
  node,
  content,
  children,
  common,
  hasSpacing,
}: LegacySectionRenderProps) {
  const desktopImage =
    stringValue(node.settings?.["desktopImageUrl"]) ||
    stringValue(content["desktopImageUrl"]) ||
    stringValue(node.settings?.["mobileImageUrl"]) ||
    stringValue(content["mobileImageUrl"]);
  const mobileImage =
    stringValue(node.settings?.["mobileImageUrl"]) ||
    stringValue(content["mobileImageUrl"]) ||
    desktopImage;
  const imageAlt = stringValue(node.settings?.["imageAlt"]) || stringValue(content["imageAlt"]);
  return (
    <section
      {...common}
      id={stringValue(node.settings?.["anchor"]) || undefined}
      className={cn("relative overflow-hidden", !hasSpacing && "section-y")}
    >
      {desktopImage ? (
        <picture className="absolute inset-0 block size-full">
          <source media="(max-width: 640px)" srcSet={mobileImage} />
          <img src={desktopImage} alt={imageAlt} className="size-full object-cover" />
        </picture>
      ) : null}
      {desktopImage ? (
        <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,34,80,0.9),rgba(0,34,80,0.3))]" />
      ) : null}
      <div className="relative z-[1] text-[color:var(--hero-heading)] [--body:var(--hero-body)] [--foreground:var(--hero-heading)]">
        {children}
      </div>
    </section>
  );
}
