import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { get } from "../utils/apiClient";
import { keyFor, ensureScopedMigration } from "../utils/userScopedStorage";

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

      // Sync backend progress into scoped local storage for UI counters.
      ensureScopedMigration();
      if (typeof data?.xp === "number") {
        localStorage.setItem(keyFor("serverXP"), String(Math.max(0, Math.round(data.xp))));
      }

      if (data?.certification && typeof data.certification === "object") {
        const cert = data.certification;
        const attempts = Array.isArray(cert.attempts) ? cert.attempts : [];
        localStorage.setItem(keyFor("certificationAttempts"), JSON.stringify(attempts));

        if (cert.isCertified && cert.certificateId) {
          const cachedCertificate = {
            id: cert.certificateId,
            holderName: localStorage.getItem("userName") || "CyberSafe User",
            issueDate: cert.issuedAt || new Date().toISOString(),
            expiryDate: cert.expiryDate || new Date().toISOString(),
            score: cert.score || 0,
            attemptNumber: attempts.length || 1,
            verificationUrl: `https://cybersafe.app/verify/${cert.certificateId}`,
          };
          localStorage.setItem(keyFor("certificate"), JSON.stringify(cachedCertificate));
        }
      }
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
      localStorage.removeItem(`serverXP_${uid}`);
    } catch (_) {}
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, setAuth, logout }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
