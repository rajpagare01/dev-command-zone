import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { authStorage } from "@/services/auth-storage";

const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:8080";

export interface ApiErrorDetails {
  status?: number;
  message: string;
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  status: number | undefined;
  fieldErrors: Record<string, string> | undefined;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = "ApiError";
    this.status = details.status;
    this.fieldErrors = details.fieldErrors;
  }
}

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && authStorage.getToken()) {
      authStorage.clear();
      if (typeof window !== "undefined") window.dispatchEvent(new Event("devcommand:session-expired"));
    }
    return Promise.reject(toApiError(error));
  },
);

function getMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  for (const key of ["message", "error", "detail"]) {
    const value = Reflect.get(data, key);
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function getFieldErrors(data: unknown): Record<string, string> | undefined {
  if (!data || typeof data !== "object") return undefined;
  const candidate = Reflect.get(data, "fieldErrors") ?? Reflect.get(data, "errors");
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return undefined;
  return Object.fromEntries(
    Object.entries(candidate).flatMap(([key, value]) => typeof value === "string" ? [[key, value]] : []),
  );
}

function toApiError(error: unknown): ApiError {
  if (!(error instanceof AxiosError)) return new ApiError({ message: "Something went wrong. Please try again." });
  if (!error.response) return new ApiError({ message: "Unable to connect to server." });
  const fieldErrors = getFieldErrors(error.response.data);
  return new ApiError({
    status: error.response.status,
    message: getMessage(error.response.data) ?? "The server could not complete your request.",
    ...(fieldErrors ? { fieldErrors } : {}),
  });
}

export async function apiRequest<T>(path: string, options: AxiosRequestConfig = {}): Promise<T> {
  const response = await api.request<T>({ url: path, ...options });
  return response.data;
}

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string }
export type AuthResponse = Record<string, unknown>;

export const authService = {
  login: (payload: LoginPayload) => apiRequest<AuthResponse>("/api/auth/login", { method: "POST", data: payload }),
  register: (payload: RegisterPayload) => apiRequest<unknown>("/api/auth/register", { method: "POST", data: payload }),
};
