"use client";

import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

export default function HomeRedirect() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      window.location.href = "/chat";
    }
  }, [loading, user]);

  return null;
}
