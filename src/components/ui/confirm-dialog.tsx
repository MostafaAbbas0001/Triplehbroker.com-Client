import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Remove",
  cancelLabel = "Cancel",
  pending = false,
  destructive = true,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !pending && onOpenChange(nextOpen)}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pt-2 leading-relaxed">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-3 gap-2 sm:space-x-0">
          <button
            type="button"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            className="min-h-10 rounded-full border border-border px-5 text-sm font-semibold text-foreground disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={cn(
              "min-h-10 rounded-full px-5 text-sm font-semibold disabled:opacity-50",
              destructive ? "bg-error text-white" : "bg-primary text-primary-foreground",
            )}
          >
            {pending ? "Please wait…" : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
