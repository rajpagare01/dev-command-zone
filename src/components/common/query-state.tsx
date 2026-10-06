import type { LucideIcon } from "lucide-react";
import { AlertCircle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QueryError({
  message = "Something went wrong while loading this section.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-5 py-10 text-center">
      <span className="grid size-10 place-items-center rounded-md border border-danger/20 bg-danger/10 text-danger">
        <AlertCircle className="size-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">Unable to load data</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <RotateCw />
        Retry
      </Button>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
      <span className="grid size-10 place-items-center rounded-md border border-border bg-surface-subtle text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
