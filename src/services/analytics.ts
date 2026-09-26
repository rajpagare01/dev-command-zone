import { queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import type { AnalyticsOverview, DsaAnalytics, JobAnalytics, LearningAnalytics, ProjectAnalytics, TaskAnalytics } from "@/types/analytics";

export const analyticsService = {
  overview: () => apiRequest<AnalyticsOverview>("/api/analytics/overview"),
  dsa: () => apiRequest<DsaAnalytics>("/api/analytics/dsa"),
  tasks: () => apiRequest<TaskAnalytics>("/api/analytics/tasks"),
  jobs: () => apiRequest<JobAnalytics>("/api/analytics/jobs"),
  learning: () => apiRequest<LearningAnalytics>("/api/analytics/learning"),
  projects: () => apiRequest<ProjectAnalytics>("/api/analytics/projects"),
};

// Always fetch fresh on mount; nothing persisted to storage.
const fresh = { staleTime: 0, refetchOnMount: "always" as const, retry: 1 };
export const analyticsQueries = {
  overview: () => queryOptions({ queryKey: ["analytics", "overview"], queryFn: analyticsService.overview, ...fresh }),
  dsa: () => queryOptions({ queryKey: ["analytics", "dsa"], queryFn: analyticsService.dsa, ...fresh }),
  tasks: () => queryOptions({ queryKey: ["analytics", "tasks"], queryFn: analyticsService.tasks, ...fresh }),
  jobs: () => queryOptions({ queryKey: ["analytics", "jobs"], queryFn: analyticsService.jobs, ...fresh }),
  learning: () => queryOptions({ queryKey: ["analytics", "learning"], queryFn: analyticsService.learning, ...fresh }),
  projects: () => queryOptions({ queryKey: ["analytics", "projects"], queryFn: analyticsService.projects, ...fresh }),
};
