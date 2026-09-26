import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import type { ApplicationStatus, JobApplication, JobApplicationRequest, JobListParams, SpringPage } from "@/types/jobs";

/** Only non-empty values are sent; Axios URL-encodes each param. */
export const buildJobParams = (params: JobListParams) =>
  Object.fromEntries(Object.entries(params).flatMap(([k, v]) => {
    const val = typeof v === "string" ? v.trim() : v;
    return val === undefined || val === null || val === "" ? [] : [[k, val]];
  }));
export const getJobs = (params: JobListParams = {}, signal?: AbortSignal) =>
  apiRequest<SpringPage<JobApplication>>("/api/jobs", { params: buildJobParams(params), ...(signal ? { signal } : {}) });
export const getJob = (id: number) => apiRequest<JobApplication>(`/api/jobs/${id}`);
export const createJob = (data: JobApplicationRequest) => apiRequest<JobApplication>("/api/jobs", { method: "POST", data });
export const updateJob = (id: number, data: JobApplicationRequest) => apiRequest<JobApplication>(`/api/jobs/${id}`, { method: "PUT", data });
export const updateJobStatus = (id: number, status: ApplicationStatus) => apiRequest<JobApplication>(`/api/jobs/${id}/status`, { method: "PATCH", data: { status } });
export const deleteJob = (id: number) => apiRequest<void>(`/api/jobs/${id}`, { method: "DELETE" });

export const jobQueries = {
  all: ["jobs"] as const,
  // Each param set has its own cache key; superseded requests are aborted via signal, so older responses never overwrite newer ones.
  list: (params: JobListParams) => queryOptions({ queryKey: ["jobs", "list", buildJobParams(params)], queryFn: ({ signal }) => getJobs(params, signal), placeholderData: keepPreviousData, retry: 1 }),
};
