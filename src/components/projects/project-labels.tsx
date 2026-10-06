import { cn } from "@/lib/utils";
import type { ProjectSortField, ProjectStatus } from "@/types/projects";

export const projectStatusLabel: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  ON_HOLD: "On hold",
  ARCHIVED: "Archived",
};
export const projectStatusTone: Record<ProjectStatus, string> = {
  PLANNING: "bg-info/10 text-info border-info/20",
  IN_PROGRESS: "bg-warning/10 text-warning border-warning/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  ON_HOLD: "bg-danger/10 text-danger border-danger/20",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
};
export const projectSortLabel: Record<ProjectSortField, string> = {
  createdAt: "Created",
  updatedAt: "Updated",
  name: "Name",
  startDate: "Start date",
  endDate: "End date",
  status: "Status",
};

export const Pill = ({ className, children }: { className: string; children: string }) => (
  <span
    className={cn(
      "inline-flex whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium",
      className,
    )}
  >
    {children}
  </span>
);
export const fmtDate = (d: string | null) =>
  d
    ? new Date(d.length === 10 ? `${d}T00:00:00` : d).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";
