export interface LeetCodeIntegration {
  username: string;
  totalSolved?: number;
  easy?: number;
  medium?: number;
  hard?: number;
  ranking?: number;
  profileUrl?: string;
  lastSyncedAt?: string;
}

export interface ConnectLeetCodeRequest {
  username: string;
}

export interface ExternalIdentity {
  id: string;
  provider: string; // e.g. 'TELEGRAM'
  providerIdentity: string;
  verified: boolean;
  createdAt: string;
}

export interface TelegramBootstrapResponse {
  token: string;
  expiresAt?: string;
  expiresIn?: number;
}
