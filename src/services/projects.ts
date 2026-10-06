import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import type {
  Project,
  ProjectListParams,
  ProjectRequest,
  ProjectStatus,
  SpringPage,
} from "@/types/projects";

/** Drops undefined/null/empty values; trims strings. */
export const cleanParams = (params: object) =>
  Object.fromEntries(
    Object.entries(params).flatMap(([k, v]: [string, unknown]) => {
      const val = typeof v === "string" ? v.trim() : v;
      return val === undefined || val === null || val === "" ? [] : [[k, val]];
    }),
  );

export const getProjects = (params: ProjectListParams = {}, signal?: AbortSignal) =>
  apiRequest<SpringPage<Project>>("/api/projects", {
    params: cleanParams(params),
    ...(signal ? { signal } : {}),
  });
export const getActiveProjects = () => apiRequest<Project[]>("/api/projects/active");
export const getCompletedProjects = () => apiRequest<Project[]>("/api/projects/completed");
export const getProject = (id: number) => apiRequest<Project>(`/api/projects/${id}`);
export const createProject = (data: ProjectRequest) =>
  apiRequest<Project>("/api/projects", { method: "POST", data });
export const updateProject = (id: number, data: ProjectRequest) =>
  apiRequest<Project>(`/api/projects/${id}`, { method: "PUT", data });
export const deleteProject = (id: number) =>
  apiRequest<void>(`/api/projects/${id}`, { method: "DELETE" });
export const updateProjectStatus = (id: number, status: ProjectStatus) =>
  apiRequest<Project>(`/api/projects/${id}/status`, { method: "PATCH", data: { status } });

export type ProjectView = "active" | "completed";
const viewFetchers: Record<ProjectView, () => Promise<Project[]>> = {
  active: getActiveProjects,
  completed: getCompletedProjects,
};

export const projectQueries = {
  all: ["projects"] as const,
  list: (params: ProjectListParams) =>
    queryOptions({
      queryKey: ["projects", "list", cleanParams(params)],
      queryFn: ({ signal }) => getProjects(params, signal),
      placeholderData: keepPreviousData,
      retry: 1,
    }),
  view: (view: ProjectView) =>
    queryOptions({ queryKey: ["projects", "view", view], queryFn: viewFetchers[view], retry: 1 }),
};
