import type { ReactNode } from "react";
export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div><h1 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1><p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{description}</p></div>{action}
  </header>;
}
