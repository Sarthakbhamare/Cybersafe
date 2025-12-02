import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { get } from "../utils/apiClient";

const AuthContext = createContext({
  user: null,
  loading: true,
  setAuth: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const data = await get("/auth/me");
      setUser(data);
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchProfile();
  }, []);

  const setAuth = ({ token, demographic, name, email, userId }) => {
    try {
      if (token) localStorage.setItem("token", token);
      if (demographic) localStorage.setItem("demographic", demographic);
      if (name) localStorage.setItem("userName", name);
      if (email) localStorage.setItem("userEmail", email);
      if (userId) localStorage.setItem("userId", userId);
    } catch (_) {
      // ignore storage failures
    }
    fetchProfile();
  };

  const logout = () => {
    try {
      const uid = localStorage.getItem("userId") || localStorage.getItem("userEmail") || "anon";
      localStorage.removeItem("token");
      localStorage.removeItem("demographic");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem(`certificate_${uid}`);
      localStorage.removeItem(`certificationAttempts_${uid}`);
    } catch (_) {}
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, setAuth, logout }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
