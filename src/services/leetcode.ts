import { queryOptions } from "@tanstack/react-query";
import { apiRequest } from "@/services/api";
import type { LeetCodeIntegration, ConnectLeetCodeRequest } from "@/types/integrations";

export const leetcodeService = {
  getIntegration: () => apiRequest<LeetCodeIntegration>("/api/integrations/dsa/leetcode"),
  connect: (data: ConnectLeetCodeRequest) =>
    apiRequest<LeetCodeIntegration>("/api/integrations/dsa/leetcode", { method: "POST", data }),
  sync: () =>
    apiRequest<LeetCodeIntegration>("/api/integrations/dsa/leetcode/sync", { method: "POST" }),
  disconnect: () => apiRequest<void>("/api/integrations/dsa/leetcode", { method: "DELETE" }),
};

export const leetcodeQueries = {
  all: ["integrations", "leetcode"] as const,
  integration: () =>
    queryOptions({
      queryKey: ["integrations", "leetcode"],
      queryFn: leetcodeService.getIntegration,
      retry: false, // Don't retry if not connected (404)
    }),
};
