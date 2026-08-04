import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: (props: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="type-label">
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <p id={hintId} className="type-caption">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[0.8125rem] text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ChoiceCard({
  checked,
  children,
  ...props
}: React.ComponentProps<"input"> & { checked?: boolean; children: ReactNode }) {
  return (
    <label
      className={cn(
        "glass-pressable flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl px-4 py-4",
        checked && "border-primary/50 ring-1 ring-primary/40",
      )}
    >
      <input className="mt-1.5 size-3.5 accent-[var(--primary)]" checked={checked} {...props} />
      <span className="text-[1rem] text-foreground">{children}</span>
    </label>
  );
}
