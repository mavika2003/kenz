"use client";

import { useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { loginPageUrl } from "@/lib/auth";

type RequireAuthProps = {
  children: ReactNode;
  next?: string;
};

export default function RequireAuth({ children, next = "/chat" }: RequireAuthProps) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = loginPageUrl("login", next);
    }
  }, [loading, next, user]);

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
