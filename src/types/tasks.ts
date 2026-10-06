export type { SpringPage } from "@/types/dsa";

export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED"] as const;
export const TASK_CATEGORIES = ["DSA", "LEARNING", "PROJECT", "JOB", "PERSONAL"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

export type DailyTaskStatus = (typeof TASK_STATUSES)[number];
export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface DailyTask {
  id: number;
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  status: DailyTaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Full replacement body for POST and PUT. Never includes userId - ownership comes from the JWT. */
export interface DailyTaskRequest {
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  status: DailyTaskStatus;
  dueDate: string | null;
}

/** Only parameters from the verified contract. sortBy is intentionally not used (allowed values unverified). */
export interface TaskListParams {
  category?: TaskCategory | undefined;
  priority?: TaskPriority | undefined;
  status?: DailyTaskStatus | undefined;
  dueDate?: string | undefined;
  page?: number | undefined;
  size?: number | undefined;
}
