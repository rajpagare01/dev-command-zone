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

// Named service functions for the dedicated Analytics page.
export const getOverviewAnalytics = () => analyticsService.overview();
export const getDsaAnalytics = () => analyticsService.dsa();
export const getTaskAnalytics = () => analyticsService.tasks();
export const getJobAnalytics = () => analyticsService.jobs();
export const getLearningAnalytics = () => analyticsService.learning();
export const getProjectAnalytics = () => analyticsService.projects();

export interface AnalyticsPageData {
  overview: AnalyticsOverview;
  dsa: DsaAnalytics;
  tasks: TaskAnalytics;
  jobs: JobAnalytics;
  learning: LearningAnalytics;
  projects: ProjectAnalytics;
}

// All six endpoints fire in parallel; the page renders only real backend data.
export async function fetchAllAnalytics(): Promise<AnalyticsPageData> {
  const [overview, dsa, tasks, jobs, learning, projects] = await Promise.all([
    getOverviewAnalytics(),
    getDsaAnalytics(),
    getTaskAnalytics(),
    getJobAnalytics(),
    getLearningAnalytics(),
    getProjectAnalytics(),
  ]);
  return { overview, dsa, tasks, jobs, learning, projects };
}

export const analyticsPageQuery = () =>
  queryOptions({ queryKey: ["analytics", "page"], queryFn: fetchAllAnalytics, ...fresh });
