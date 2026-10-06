import { queryOptions } from "@tanstack/react-query";
import { apiRequest } from "./api";
import { ExternalIdentity, TelegramBootstrapResponse } from "@/types/integrations";

export function getIdentities(): Promise<ExternalIdentity[]> {
  return apiRequest<ExternalIdentity[]>("/api/integrations/identities");
}

export function deleteIdentity(id: string): Promise<void> {
  return apiRequest<void>(`/api/integrations/identities/${id}`, { method: "DELETE" });
}

export function bootstrapTelegram(): Promise<TelegramBootstrapResponse> {
  return apiRequest<TelegramBootstrapResponse>("/api/integrations/telegram/bootstrap", {
    method: "POST",
  });
}

export const identityQueries = {
  all: () => ["identities"] as const,
  identities: () =>
    queryOptions({
      queryKey: [...identityQueries.all()],
      queryFn: getIdentities,
    }),
};
