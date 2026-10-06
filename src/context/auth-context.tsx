import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { authService, type LoginPayload, type RegisterPayload } from "@/services/api";
import { authStorage, extractAuth, type AuthUser } from "@/services/auth-storage";

export interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | null;
  currentUser: AuthUser | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ token: string; user: AuthUser } | null>(null);
  const navigate = useNavigate();
  const router = useRouter();

  const clearCaches = useCallback(() => {
    const ctx = router.options.context as { queryClient?: { clear: () => void } } | undefined;
    ctx?.queryClient?.clear();
  }, [router]);

  useEffect(() => {
    setSession(authStorage.read());
    const onExpired = () => {
      setSession(null);
      clearCaches();
      if (window.location.pathname === "/login") return; // avoid redirect loops
      toast.error("Session expired. Please sign in again.");
      void navigate({ to: "/login", search: { redirect: undefined }, replace: true });
    };
    window.addEventListener("devcommand:session-expired", onExpired);
    return () => window.removeEventListener("devcommand:session-expired", onExpired);
  }, [navigate, clearCaches]);

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload);
    const auth = extractAuth(response, payload.email);
    authStorage.save(auth);
    setSession(auth);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    await authService.register(payload);
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setSession(null);
    clearCaches();
  }, [clearCaches]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: session !== null,
      token: session?.token ?? null,
      currentUser: session?.user ?? null,
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
