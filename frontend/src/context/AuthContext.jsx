import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchCurrentUser } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage token
  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem("token");
      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        const data = await fetchCurrentUser(stored);
        setUser(data.user);
        setToken(stored);
      } catch {
        // Token expired or invalid — clear it
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restore();
  }, []);

  const login = (userData, jwtToken) => {
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, logout, isAuthenticated: !!user }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
