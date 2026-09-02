import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_KEY = "aikilink_auth";

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadStored); // { token, user } | null

  useEffect(() => {
    if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    else localStorage.removeItem(STORAGE_KEY);
  }, [auth]);

  const register = useCallback(async (payload) => {
    const data = await api.post("/auth/register", payload);
    setAuth(data);
    return data;
  }, []);

  const login = useCallback(async (payload) => {
    const data = await api.post("/auth/login", payload);
    setAuth(data);
    return data;
  }, []);

  const logout = useCallback(() => setAuth(null), []);

  const value = {
    token: auth?.token || null,
    user: auth?.user || null,
    isAuthenticated: !!auth?.token,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
