import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import { cleanParams } from "@/services/projects";
import type {
  ProjectTask,
  ProjectTaskListParams,
  ProjectTaskPriority,
  ProjectTaskRequest,
  ProjectTaskStatus,
  SpringPage,
} from "@/types/projects";

const base = (projectId: number) => `/api/projects/${projectId}/tasks`;

export const getProjectTasks = (
  projectId: number,
  params: ProjectTaskListParams = {},
  signal?: AbortSignal,
) =>
  apiRequest<SpringPage<ProjectTask>>(base(projectId), {
    params: cleanParams(params),
    ...(signal ? { signal } : {}),
  });
export const getPendingProjectTasks = (projectId: number) =>
  apiRequest<ProjectTask[]>(`${base(projectId)}/pending`);
export const getCompletedProjectTasks = (projectId: number) =>
  apiRequest<ProjectTask[]>(`${base(projectId)}/completed`);
export const getProjectTask = (projectId: number, taskId: number) =>
  apiRequest<ProjectTask>(`${base(projectId)}/${taskId}`);
export const createProjectTask = (projectId: number, data: ProjectTaskRequest) =>
  apiRequest<ProjectTask>(base(projectId), { method: "POST", data });
export const updateProjectTask = (projectId: number, taskId: number, data: ProjectTaskRequest) =>
  apiRequest<ProjectTask>(`${base(projectId)}/${taskId}`, { method: "PUT", data });
export const deleteProjectTask = (projectId: number, taskId: number) =>
  apiRequest<void>(`${base(projectId)}/${taskId}`, { method: "DELETE" });
export const updateProjectTaskStatus = (
  projectId: number,
  taskId: number,
  status: ProjectTaskStatus,
) =>
  apiRequest<ProjectTask>(`${base(projectId)}/${taskId}/status`, {
    method: "PATCH",
    data: { status },
  });
export const updateProjectTaskPriority = (
  projectId: number,
  taskId: number,
  priority: ProjectTaskPriority,
) =>
  apiRequest<ProjectTask>(`${base(projectId)}/${taskId}/priority`, {
    method: "PATCH",
    data: { priority },
  });

export type ProjectTaskView = "pending" | "completed";

export const projectTaskQueries = {
  project: (projectId: number) => ["project-tasks", projectId] as const,
  list: (projectId: number, params: ProjectTaskListParams) =>
    queryOptions({
      queryKey: ["project-tasks", projectId, "list", cleanParams(params)],
      queryFn: ({ signal }) => getProjectTasks(projectId, params, signal),
      placeholderData: keepPreviousData,
      retry: 1,
    }),
  view: (projectId: number, view: ProjectTaskView) =>
    queryOptions({
      queryKey: ["project-tasks", projectId, "view", view],
      queryFn: () =>
        view === "pending"
          ? getPendingProjectTasks(projectId)
          : getCompletedProjectTasks(projectId),
      retry: 1,
    }),
};
