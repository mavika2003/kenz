"use client";

import { type ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { loginPageUrl } from "@/lib/auth";

type ProtectedPlannerLinkProps = {
  children: ReactNode;
  className?: string;
  mode?: "signup" | "login";
};

export function ProtectedPlannerLink({
  children,
  className = "",
  mode = "login",
}: ProtectedPlannerLinkProps) {
  const { user } = useAuth();
  const href = user ? "/planner" : loginPageUrl(mode, "/planner");

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
