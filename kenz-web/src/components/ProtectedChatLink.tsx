"use client";

import { type ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import { pillClass } from "./PillButton";
import { loginPageUrl } from "@/lib/auth";

type ProtectedChatButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "large";
  mode?: "signup" | "login";
};

export function ProtectedChatButton({
  children,
  className = "",
  variant = "primary",
  mode = "login",
}: ProtectedChatButtonProps) {
  const { user } = useAuth();

  if (user) {
    return (
      <a href="/chat" className={`${pillClass(variant)} ${className}`}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={loginPageUrl(mode, "/chat")}
      className={`${pillClass(variant)} ${className}`}
    >
      {children}
    </a>
  );
}
