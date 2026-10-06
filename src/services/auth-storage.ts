const STORAGE_KEY = "devcommand.auth";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
}

interface StoredAuth {
  token: string;
  user: AuthUser;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function stringValue(record: Record<string, unknown> | null, keys: string[]): string | undefined {
  if (!record) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

export function extractAuth(response: Record<string, unknown>, fallbackEmail: string): StoredAuth {
  const token = stringValue(response, ["token", "accessToken", "access_token", "jwt"]);
  if (!token) throw new Error("The authentication response did not include a JWT.");

  const responseUser = response["user"];
  const userRecord =
    responseUser && typeof responseUser === "object"
      ? (responseUser as Record<string, unknown>)
      : response;
  const claims = decodeJwtPayload(token);
  const email =
    stringValue(userRecord, ["email", "username"]) ??
    stringValue(claims, ["email", "sub"]) ??
    fallbackEmail;
  const name =
    stringValue(userRecord, ["name", "fullName", "displayName"]) ??
    stringValue(claims, ["name", "fullName"]) ??
    email.split("@")[0] ??
    "Developer";
  const id = stringValue(userRecord, ["id", "userId"]) ?? stringValue(claims, ["sub", "userId"]);
  return { token, user: { ...(id ? { id } : {}), name, email } };
}

function read(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredAuth;
    if (!stored.token || !stored.user?.email) return null;
    const claims = decodeJwtPayload(stored.token);
    const expiresAt = typeof claims?.["exp"] === "number" ? claims["exp"] * 1000 : undefined;
    if (expiresAt && expiresAt <= Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return stored;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export const authStorage = {
  read,
  getToken: () => read()?.token ?? null,
  save: (auth: StoredAuth) => {
    if (typeof window !== "undefined")
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  },
  clear: () => {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  },
};
