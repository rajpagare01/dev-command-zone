const API_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:8080";

export interface ApiRequestOptions extends RequestInit { token?: string }

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers, ...init } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
  return response.json() as Promise<T>;
}

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string }
export interface AuthResponse { token: string }
export const authService = {
  login: (payload: LoginPayload) => apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload: RegisterPayload) => apiRequest<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
};
