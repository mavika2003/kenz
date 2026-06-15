"use client";

import { useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { loginPageUrl } from "@/lib/auth";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = loginPageUrl("login", "/chat");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange text-sm text-black/60">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  return children;
}
