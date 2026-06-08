import { createContext, useContext, useState, useEffect } from "react";
import { getMeApi } from "../api/authApi.js";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // ─── Load user on app start ──────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await getMeApi();
          setUser(res.data.data);
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
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.crm_access?.includes(crm);
  };

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};