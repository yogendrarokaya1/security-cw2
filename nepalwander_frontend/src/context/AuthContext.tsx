"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/types";
import { authApi } from "@/lib/api/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  accessToken: string | null;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setLoading(false);
          return;
        }
        setAccessToken(token);
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (error: unknown) {
        // Only remove token on 401 Unauthorized
        // NOT on network errors, rate limits (429), or server errors (5xx)
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          localStorage.removeItem("accessToken");
          setAccessToken(null);
        }
        // For all other errors (network, 429, 500) — keep token and stay logged in
        // User will be null but token preserved — next page load will retry
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem("accessToken", token);
    setAccessToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      setUser(null);
      window.location.href = "/";
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    loading,
    accessToken,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};