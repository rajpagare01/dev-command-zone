import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { authService, type LoginPayload, type RegisterPayload } from "@/services/api";
import { authStorage, extractAuth, type AuthUser } from "@/services/auth-storage";

export interface AuthContextValue {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentUser(authStorage.read()?.user ?? null);
    const clearSession = () => {
      setCurrentUser(null);
      toast.error("Session expired. Please sign in again.");
      void navigate({ to: "/login", replace: true });
    };
    window.addEventListener("devcommand:session-expired", clearSession);
    return () => window.removeEventListener("devcommand:session-expired", clearSession);
  }, [navigate]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    const auth = extractAuth(response, payload.email);
    authStorage.save(auth);
    setCurrentUser(auth.user);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await authService.register(payload);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setCurrentUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: currentUser !== null,
    currentUser,
    login,
    register,
    logout,
  }), [currentUser, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
