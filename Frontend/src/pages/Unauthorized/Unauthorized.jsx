import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { getLandingPath } from "../../config/access.config.js";

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "linear-gradient(135deg, #f6f3eb 0%, #ebe5d6 100%)",
      }}
    >
      <div
        className="card"
        style={{ maxWidth: "520px", width: "100%", textAlign: "center" }}
      >
        <h1 style={{ fontSize: "28px", marginBottom: "12px" }}>Unauthorized</h1>
        <p style={{ color: "#6b7280", marginBottom: "24px" }}>
          You do not have permission to access this page with your current role.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link className="btn btn-primary" to={getLandingPath(user)}>
            Go to My Dashboard
          </Link>
          <Link className="btn btn-outline" to="/login">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
