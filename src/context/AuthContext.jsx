import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiError } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = anon, object = logged in
  const [error, setError] = useState("");

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me", {
        validateStatus: (s) => s < 500,
      });

      if (data && data.email) {
        setUser(data);
      } else {
        setUser(false);
      }
    } catch {
      setUser(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  const login = async (email, password) => {
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (data?.token) {
        localStorage.setItem("stky_token", data.token);
      }

      await checkAuth();

      return true;
    } catch (e) {
      setError(formatApiError(e));
      return false;
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch { }
    localStorage.removeItem("stky_token");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
