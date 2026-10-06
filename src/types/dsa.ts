export const DSA_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export const DSA_STATUSES = ["TODO", "SOLVED", "REVISION", "MASTERED"] as const;
export const DSA_SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "title",
  "dateSolved",
  "revisionDate",
  "difficulty",
  "status",
] as const;

export type DsaDifficulty = (typeof DSA_DIFFICULTIES)[number];
export type DsaStatus = (typeof DSA_STATUSES)[number];
export type DsaSortField = (typeof DSA_SORT_FIELDS)[number];
export type SortDirection = "asc" | "desc";

/** Mirrors DsaProblemResponse from the Spring Boot backend. */
export interface DsaProblem {
  id: number;
  title: string;
  platform: string;
  problemUrl: string | null;
  topic: string;
  difficulty: DsaDifficulty;
  status: DsaStatus;
  dateSolved: string | null;
  timeTaken: number | null;
  notes: string | null;
  revisionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Mirrors the create/update request DTO (full replacement on PUT). No userId - derived from JWT. */
export interface DsaProblemRequest {
  title: string;
  platform: string;
  problemUrl: string | null;
  topic: string;
  difficulty: DsaDifficulty;
  status: DsaStatus;
  dateSolved: string | null;
  timeTaken: number | null;
  notes: string | null;
  revisionDate: string | null;
}

export interface DsaListParams {
  topic?: string | undefined;
  platform?: string | undefined;
  difficulty?: DsaDifficulty | undefined;
  status?: DsaStatus | undefined;
  page: number;
  size: number;
  sortBy: DsaSortField;
  direction: SortDirection;
}

/** Spring Data Page<T> response. */
export interface SpringPage<T> {
  content: T[];
  pageable?: { pageNumber: number; pageSize: number };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first?: boolean;
  size: number;
  number: number;
  empty: boolean;
}
