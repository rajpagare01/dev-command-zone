import { TerminalSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-brand">
        <TerminalSquare className="size-5" />
      </span>
      {!compact && (
        <span className="font-display text-[17px] font-semibold text-foreground">DevCommand</span>
      )}
    </div>
  );
}
