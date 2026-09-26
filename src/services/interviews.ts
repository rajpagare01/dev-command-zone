import { queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import type { InterviewRound, InterviewRoundRequest } from "@/types/jobs";

const base = (jobId: number) => `/api/jobs/${jobId}/interviews`;
export const getInterviewRounds = (jobId: number) => apiRequest<InterviewRound[]>(base(jobId));
export const getInterviewRound = (jobId: number, roundId: number) => apiRequest<InterviewRound>(`${base(jobId)}/${roundId}`);
export const createInterviewRound = (jobId: number, data: InterviewRoundRequest) => apiRequest<InterviewRound>(base(jobId), { method: "POST", data });
export const updateInterviewRound = (jobId: number, roundId: number, data: InterviewRoundRequest) => apiRequest<InterviewRound>(`${base(jobId)}/${roundId}`, { method: "PUT", data });
export const deleteInterviewRound = (jobId: number, roundId: number) => apiRequest<void>(`${base(jobId)}/${roundId}`, { method: "DELETE" });

export const interviewQueries = {
  list: (jobId: number) => queryOptions({ queryKey: ["jobs", "interviews", jobId], queryFn: () => getInterviewRounds(jobId), retry: 1 }),
};
