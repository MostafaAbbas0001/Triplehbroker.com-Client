import { cn } from "@/lib/utils";

const controlClass =
  "w-full min-h-11 rounded-none border-0 border-b border-input bg-transparent px-0 py-3 text-[1rem] text-foreground placeholder:text-muted-foreground transition-colors duration-[var(--duration-fast)] focus:border-primary focus-visible:border-primary focus-visible:outline-none";

export function inputClass(invalid?: boolean, className?: string) {
  return cn(controlClass, invalid && "border-error", className);
}
