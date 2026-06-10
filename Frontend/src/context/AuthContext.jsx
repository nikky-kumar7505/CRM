import { createContext, useContext, useState, useEffect } from "react";
import { getMeApi } from "../api/authApi.js";
import { hasModuleAccess, isManagerUser } from "../config/access.config.js";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      localStorage.removeItem("user");
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // ─── Load user on app start ──────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await getMeApi();
          setUser(res.data.data);
          localStorage.setItem("user", JSON.stringify(res.data.data));
        } catch (error) {
          console.error("Failed to load user:", error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // ─── Login ────────────────────────────────────────────────
  const login = (tokenValue, userData) => {
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  // ─── Logout ───────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // ─── Check Role ───────────────────────────────────────────
  const hasRole = (roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // ─── Check CRM Access ────────────────────────────────────
  const hasCRMAccess = (crm) => {
    return hasModuleAccess(user, crm);
  };

  const isManager = () => isManagerUser(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        hasRole,
        hasCRMAccess,
        isManager,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
