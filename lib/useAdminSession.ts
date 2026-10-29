"use client";

import { useEffect, useState } from "react";

// Client side half of the admin login: restores an existing session cookie on mount
// and exchanges a typed password for a new one. The password is only checked on the server.
export function useAdminSession() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => setIsAuthenticated(Boolean(data.authenticated)))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsChecking(false));
  }, []);

  const login = async (password: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        return null;
      }
      return data.error || "Access denied.";
    } catch {
      return "Could not reach the server. Please try again.";
    }
  };

  const logout = async () => {
    await fetch("/api/admin/session", { method: "DELETE" }).catch(() => {});
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isChecking, login, logout };
}
