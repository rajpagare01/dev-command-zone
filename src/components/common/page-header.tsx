import type { ReactNode } from "react";
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-1 items-end gap-4 border-b border-border pb-5 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        <h1 className="break-words font-display text-2xl font-semibold text-foreground sm:text-[28px]">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </header>
  );
}
