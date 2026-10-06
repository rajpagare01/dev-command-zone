export type { SpringPage } from "@/types/dsa";

export const LEARNING_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"] as const;
export type LearningStatus = (typeof LEARNING_STATUSES)[number];
export const LEARNING_SORT_FIELDS = [
  "createdAt",
  "progress",
  "hoursSpent",
  "technology",
  "topic",
] as const;
export type LearningSortField = (typeof LEARNING_SORT_FIELDS)[number];

export interface LearningTopic {
  id: number;
  technology: string;
  topic: string;
  progress: number;
  status: LearningStatus;
  hoursSpent: number | null;
  resourceUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Full body for POST and PUT (PUT is a full replacement). Never includes userId. */
export interface LearningTopicRequest {
  technology: string;
  topic: string;
  progress: number;
  status: LearningStatus;
  hoursSpent: number | null;
  resourceUrl: string | null;
  notes: string | null;
}

export interface LearningListParams {
  technology?: string | undefined;
  status?: LearningStatus | undefined;
  progress?: number | undefined;
  search?: string | undefined;
  page?: number | undefined;
  size?: number | undefined;
  sortBy?: LearningSortField | undefined;
  direction?: "asc" | "desc" | undefined;
}
