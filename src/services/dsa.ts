import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import type { DsaListParams, DsaProblem, DsaProblemRequest, SpringPage } from "@/types/dsa";

export const getDsaProblems = (params: DsaListParams) => {
  // Only send filters that are set; backend treats missing params as "no filter".
  const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""));
  return apiRequest<SpringPage<DsaProblem>>("/api/dsa", { params: query });
};
export const getDsaProblem = (id: number) => apiRequest<DsaProblem>(`/api/dsa/${id}`);
export const createDsaProblem = (data: DsaProblemRequest) => apiRequest<DsaProblem>("/api/dsa", { method: "POST", data });
export const updateDsaProblem = (id: number, data: DsaProblemRequest) => apiRequest<DsaProblem>(`/api/dsa/${id}`, { method: "PUT", data });
export const deleteDsaProblem = (id: number) => apiRequest<void>(`/api/dsa/${id}`, { method: "DELETE" });
export const solveDsaProblem = (id: number) => apiRequest<DsaProblem>(`/api/dsa/${id}/solve`, { method: "PATCH" });
export const reviseDsaProblem = (id: number) => apiRequest<DsaProblem>(`/api/dsa/${id}/revision`, { method: "PATCH" });

export const dsaQueries = {
  all: ["dsa"] as const,
  list: (params: DsaListParams) => queryOptions({ queryKey: ["dsa", "list", params], queryFn: () => getDsaProblems(params), placeholderData: keepPreviousData, retry: 1 }),
};
