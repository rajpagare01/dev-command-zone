import type { ApplicationStatus, InterviewStatus } from "@/types/jobs";

export const jobLabel = (v: string) => v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, " ");

export const applicationTone: Record<ApplicationStatus, string> = {
  SAVED: "bg-muted text-muted-foreground border-border",
  APPLIED: "bg-info/10 text-info border-info/20",
  SCREENING: "bg-primary/10 text-primary border-primary/20",
  INTERVIEW: "bg-warning/10 text-warning border-warning/20",
  OFFER: "bg-success/10 text-success border-success/20",
  REJECTED: "bg-danger/10 text-danger border-danger/20",
  WITHDRAWN: "bg-muted text-muted-foreground border-border line-through",
};

export const interviewTone: Record<InterviewStatus, string> = {
  SCHEDULED: "bg-info/10 text-info border-info/20",
  COMPLETED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-danger/10 text-danger border-danger/20",
  RESCHEDULED: "bg-warning/10 text-warning border-warning/20",
};
