"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type AuthMode,
  type AuthUser,
  clearAuth,
  fetchCurrentUser,
  getStoredToken,
  getStoredUser,
  isAuthConfigured,
  loginPageUrl,
} from "@/lib/auth";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
  requireAuth: (onAuthed?: () => void, mode?: AuthMode) => boolean;
  signOut: () => void;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isAuthConfigured();

  useEffect(() => {
    const token = getStoredToken();
    const stored = getStoredUser();

    if (!token || !stored) {
      setLoading(false);
      return;
    }

    setUser(stored);
    void fetchCurrentUser(token).then((fresh) => {
      if (fresh) {
        setUser(fresh);
      } else {
        clearAuth();
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  const requireAuth = useCallback(
    (onAuthed?: () => void, mode: AuthMode = "login") => {
      if (user) {
        onAuthed?.();
        return true;
      }

      const next =
        typeof window !== "undefined"
          ? `${window.location.pathname}${window.location.hash}`
          : "/#chat";
      window.location.href = loginPageUrl(mode, next);
      return false;
    },
    [user],
  );

  const signOut = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      configured,
      requireAuth,
      signOut,
      setUser,
    }),
    [user, loading, configured, requireAuth, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
