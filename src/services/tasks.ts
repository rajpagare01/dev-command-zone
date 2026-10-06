import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import type { DailyTask, DailyTaskRequest, SpringPage, TaskListParams } from "@/types/tasks";

export const getTasks = (params: TaskListParams = {}) => {
  const query = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  );
  return apiRequest<SpringPage<DailyTask>>("/api/tasks", { params: query });
};
export const getTodayTasks = () => apiRequest<DailyTask[]>("/api/tasks/today");
export const getUpcomingTasks = () => apiRequest<DailyTask[]>("/api/tasks/upcoming");
export const getCompletedTasks = () => apiRequest<DailyTask[]>("/api/tasks/completed");
export const getTask = (id: number) => apiRequest<DailyTask>(`/api/tasks/${id}`);
export const createTask = (data: DailyTaskRequest) =>
  apiRequest<DailyTask>("/api/tasks", { method: "POST", data });
export const updateTask = (id: number, data: DailyTaskRequest) =>
  apiRequest<DailyTask>(`/api/tasks/${id}`, { method: "PUT", data });
export const deleteTask = (id: number) =>
  apiRequest<void>(`/api/tasks/${id}`, { method: "DELETE" });
export const completeTask = (id: number) =>
  apiRequest<DailyTask>(`/api/tasks/${id}/complete`, { method: "PATCH" });
export const startTask = (id: number) =>
  apiRequest<DailyTask>(`/api/tasks/${id}/start`, { method: "PATCH" });

export type TaskView = "today" | "upcoming" | "completed";
const viewFetchers: Record<TaskView, () => Promise<DailyTask[]>> = {
  today: getTodayTasks,
  upcoming: getUpcomingTasks,
  completed: getCompletedTasks,
};

export const taskQueries = {
  all: ["tasks"] as const,
  list: (params: TaskListParams) =>
    queryOptions({
      queryKey: ["tasks", "list", params],
      queryFn: () => getTasks(params),
      placeholderData: keepPreviousData,
      retry: 1,
    }),
  view: (view: TaskView) =>
    queryOptions({ queryKey: ["tasks", "view", view], queryFn: viewFetchers[view], retry: 1 }),
};
