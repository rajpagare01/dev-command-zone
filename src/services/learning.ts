import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import type {
  LearningListParams,
  LearningTopic,
  LearningTopicRequest,
  SpringPage,
} from "@/types/learning";

/** Only non-empty values are sent; strings are trimmed. */
export const buildLearningParams = (params: LearningListParams) =>
  Object.fromEntries(
    Object.entries(params).flatMap(([k, v]) => {
      const val = typeof v === "string" ? v.trim() : v;
      return val === undefined || val === null || val === "" ? [] : [[k, val]];
    }),
  );

export const getLearningTopics = (params: LearningListParams = {}, signal?: AbortSignal) =>
  apiRequest<SpringPage<LearningTopic>>("/api/learning", {
    params: buildLearningParams(params),
    ...(signal ? { signal } : {}),
  });
export const getCompletedTopics = () => apiRequest<LearningTopic[]>("/api/learning/completed");
export const getInProgressTopics = () => apiRequest<LearningTopic[]>("/api/learning/in-progress");
export const getLearningTopic = (id: number) => apiRequest<LearningTopic>(`/api/learning/${id}`);
export const createLearningTopic = (data: LearningTopicRequest) =>
  apiRequest<LearningTopic>("/api/learning", { method: "POST", data });
export const updateLearningTopic = (id: number, data: LearningTopicRequest) =>
  apiRequest<LearningTopic>(`/api/learning/${id}`, { method: "PUT", data });
export const deleteLearningTopic = (id: number) =>
  apiRequest<void>(`/api/learning/${id}`, { method: "DELETE" });
export const updateLearningProgress = (id: number, progress: number) =>
  apiRequest<LearningTopic>(`/api/learning/${id}/progress`, {
    method: "PATCH",
    data: { progress },
  });
export const completeLearningTopic = (id: number) =>
  apiRequest<LearningTopic>(`/api/learning/${id}/complete`, { method: "PATCH" });

export type LearningView = "completed" | "in-progress";
const viewFetchers: Record<LearningView, () => Promise<LearningTopic[]>> = {
  completed: getCompletedTopics,
  "in-progress": getInProgressTopics,
};

export const learningQueries = {
  all: ["learning"] as const,
  list: (params: LearningListParams) =>
    queryOptions({
      queryKey: ["learning", "list", buildLearningParams(params)],
      queryFn: ({ signal }) => getLearningTopics(params, signal),
      placeholderData: keepPreviousData,
      retry: 1,
    }),
  view: (view: LearningView) =>
    queryOptions({ queryKey: ["learning", "view", view], queryFn: viewFetchers[view], retry: 1 }),
};
