import type { LearningStatus } from "@/types/learning";
export const statusLabel: Record<LearningStatus, string> = { NOT_STARTED: "Not started", IN_PROGRESS: "In progress", COMPLETED: "Completed", ON_HOLD: "On hold" };
export const statusTone: Record<LearningStatus, string> = { NOT_STARTED: "bg-info/10 text-info border-info/20", IN_PROGRESS: "bg-warning/10 text-warning border-warning/20", COMPLETED: "bg-success/10 text-success border-success/20", ON_HOLD: "bg-danger/10 text-danger border-danger/20" };
export const sortLabel = { createdAt: "Date added", progress: "Progress", hoursSpent: "Hours spent", technology: "Technology", topic: "Topic" } as const;
