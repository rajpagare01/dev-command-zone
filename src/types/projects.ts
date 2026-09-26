export type { SpringPage } from "@/types/dsa";

export const PROJECT_STATUSES = ["PLANNING", "IN_PROGRESS", "COMPLETED", "ON_HOLD", "ARCHIVED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export const PROJECT_SORT_FIELDS = ["createdAt", "updatedAt", "name", "startDate", "endDate", "status"] as const;
export type ProjectSortField = (typeof PROJECT_SORT_FIELDS)[number];

export const PROJECT_TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE"] as const;
export type ProjectTaskStatus = (typeof PROJECT_TASK_STATUSES)[number];
export const PROJECT_TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export type ProjectTaskPriority = (typeof PROJECT_TASK_PRIORITIES)[number];
export const PROJECT_TASK_SORT_FIELDS = ["createdAt", "updatedAt", "title", "dueDate", "status", "priority"] as const;
export type ProjectTaskSortField = (typeof PROJECT_TASK_SORT_FIELDS)[number];

export interface Project {
  id: number;
  name: string;
  description: string | null;
  githubUrl: string | null;
  liveUrl: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/** POST/PUT body (PUT = full replacement). Never contains id, user, userId, tasks or timestamps. */
export interface ProjectRequest {
  name: string;
  description?: string;
  githubUrl?: string;
  liveUrl?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export interface ProjectListParams {
  status?: ProjectStatus | undefined;
  search?: string | undefined;
  page?: number | undefined;
  size?: number | undefined;
  sortBy?: ProjectSortField | undefined;
  direction?: "asc" | "desc" | undefined;
}

export interface ProjectTask {
  id: number;
  title: string;
  description: string | null;
  status: ProjectTaskStatus;
  priority: ProjectTaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Never contains id, project, projectId or timestamps — projectId lives only in the URL. */
export interface ProjectTaskRequest {
  title: string;
  description?: string;
  status: ProjectTaskStatus;
  priority: ProjectTaskPriority;
  dueDate?: string;
}

/** No search — the backend does not support it for project tasks. */
export interface ProjectTaskListParams {
  status?: ProjectTaskStatus | undefined;
  priority?: ProjectTaskPriority | undefined;
  page?: number | undefined;
  size?: number | undefined;
  sortBy?: ProjectTaskSortField | undefined;
  direction?: "asc" | "desc" | undefined;
}
