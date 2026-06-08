import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { changePasswordApi } from "../../api/authApi.js";

const Settings = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (formData.new_password !== formData.confirm_password) {
      setError("New passwords do not match!");
      return;
    }

    try {
      await changePasswordApi({
        old_password: formData.old_password,
        new_password: formData.new_password,
      });
      setMessage("Password changed successfully!");
      setFormData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Error changing password");
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ marginBottom: "24px" }}>
        Settings
      </h1>

      {/* Profile Info */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>
          Profile Information
        </h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Name</label>
            <span>{user?.name}</span>
          </div>
          <div className="detail-item">
            <label>Email</label>
            <span>{user?.email}</span>
          </div>
          <div className="detail-item">
            <label>Role</label>
            <span>{user?.role?.replace("_", " ")}</span>
          </div>
          <div className="detail-item">
            <label>Employee ID</label>
            <span>{user?.employee_id}</span>
          </div>
          <div className="detail-item">
            <label>Department</label>
            <span>{user?.department}</span>
          </div>
          <div className="detail-item">
            <label>Phone</label>
            <span>{user?.phone || "-"}</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card" style={{ maxWidth: "500px" }}>
        <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>
          Change Password
        </h3>

        {message && (
          <div
            style={{
              background: "#d4edda",
              color: "#155724",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              borderRadius: "6px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              value={formData.old_password}
              onChange={(e) =>
                setFormData({ ...formData, old_password: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={formData.new_password}
              onChange={(e) =>
                setFormData({ ...formData, new_password: e.target.value })
              }
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={formData.confirm_password}
              onChange={(e) =>
                setFormData({ ...formData, confirm_password: e.target.value })
              }
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;