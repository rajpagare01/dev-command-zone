import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import type { ApplicationStatus, JobApplication, JobApplicationRequest, JobListParams, SpringPage } from "@/types/jobs";

export const getJobs = (params: JobListParams = {}) => {
  const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
  return apiRequest<SpringPage<JobApplication>>("/api/jobs", { params: query });
};
export const getJob = (id: number) => apiRequest<JobApplication>(`/api/jobs/${id}`);
export const createJob = (data: JobApplicationRequest) => apiRequest<JobApplication>("/api/jobs", { method: "POST", data });
export const updateJob = (id: number, data: JobApplicationRequest) => apiRequest<JobApplication>(`/api/jobs/${id}`, { method: "PUT", data });
export const updateJobStatus = (id: number, status: ApplicationStatus) => apiRequest<JobApplication>(`/api/jobs/${id}/status`, { method: "PATCH", data: { status } });
export const deleteJob = (id: number) => apiRequest<void>(`/api/jobs/${id}`, { method: "DELETE" });

export const jobQueries = {
  all: ["jobs"] as const,
  list: (params: JobListParams) => queryOptions({ queryKey: ["jobs", "list", params], queryFn: () => getJobs(params), placeholderData: keepPreviousData, retry: 1 }),
};
