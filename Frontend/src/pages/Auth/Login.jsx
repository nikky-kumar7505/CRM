import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { loginApi } from "../../api/authApi.js";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, token, user } = useAuth();
  const navigate = useNavigate();

  // ─── If already logged in redirect ───────────────────────
  if (token && user) {
    if (user.role === "admin") {
      return <Navigate to="/crm-select" />;
    }
    return <Navigate to="/sales/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // clear previous error
    setLoading(true);

    try {
      const res = await loginApi({ email, password });

      if (res.data.success) {
        login(res.data.token, res.data.data);
        if (res.data.data.role === "admin") {
          navigate("/crm-select");
        } else {
          navigate("/sales/dashboard");
        }
      }
    } catch (err) {
      // ✅ Error stays on screen - no page refresh
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">S</div>
          <h1>Sales CRM</h1>
          <p>Sign in to your account</p>
        </div>

        {/* ✅ Error stays visible - does not disappear */}
        {error && (
          <div className="login-error">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#721c24",
                fontSize: "16px",
                marginLeft: "auto",
              }}
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            {/* ✅ Eye button on password field */}
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: "45px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#797e88",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span className="login-spinner"></span>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;