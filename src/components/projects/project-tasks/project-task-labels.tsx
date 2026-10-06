import type {
  ProjectTaskPriority,
  ProjectTaskSortField,
  ProjectTaskStatus,
} from "@/types/projects";

export const taskStatusLabel: Record<ProjectTaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};
export const taskStatusTone: Record<ProjectTaskStatus, string> = {
  TODO: "bg-info/10 text-info border-info/20",
  IN_PROGRESS: "bg-warning/10 text-warning border-warning/20",
  DONE: "bg-success/10 text-success border-success/20",
};
export const taskPriorityLabel: Record<ProjectTaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};
export const taskPriorityTone: Record<ProjectTaskPriority, string> = {
  LOW: "bg-muted text-muted-foreground border-border",
  MEDIUM: "bg-warning/10 text-warning border-warning/20",
  HIGH: "bg-danger/10 text-danger border-danger/20",
};
export const taskSortLabel: Record<ProjectTaskSortField, string> = {
  createdAt: "Created",
  updatedAt: "Updated",
  title: "Title",
  dueDate: "Due date",
  status: "Status",
  priority: "Priority",
};
