export type { SpringPage } from "@/types/dsa";

export const APPLICATION_STATUSES = [
  "SAVED",
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const INTERVIEW_STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export const JOB_SORT_FIELDS = ["applicationDate", "createdAt", "company", "status"] as const;
export type JobSortField = (typeof JOB_SORT_FIELDS)[number];
export type SortDirection = "asc" | "desc";

export interface JobApplication {
  id: number;
  company: string;
  role: string;
  location: string | null;
  jobUrl: string | null;
  source: string | null;
  salary: string | null;
  applicationDate: string;
  status: ApplicationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Full body for POST and PUT. Never includes userId - ownership comes from the JWT. */
export interface JobApplicationRequest {
  company: string;
  role: string;
  location: string | null;
  jobUrl: string | null;
  source: string | null;
  salary: string | null;
  applicationDate: string;
  status: ApplicationStatus;
  notes: string | null;
}

export interface JobListParams {
  company?: string | undefined;
  role?: string | undefined;
  source?: string | undefined;
  status?: ApplicationStatus | undefined;
  search?: string | undefined;
  page?: number | undefined;
  size?: number | undefined;
  sortBy?: JobSortField | undefined;
  direction?: SortDirection | undefined;
}

export interface InterviewRound {
  id: number;
  roundNumber: number;
  roundType: string;
  scheduledAt: string | null;
  status: InterviewStatus;
  feedback: string | null;
  notes: string | null;
}

export interface InterviewRoundRequest {
  roundNumber: number;
  roundType: string;
  scheduledAt: string | null;
  status: InterviewStatus;
  feedback: string | null;
  notes: string | null;
}
