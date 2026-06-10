import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getAllUsersApi,
  registerUserApi,
  updateUserApi,
  deleteUserApi,
  adminChangePasswordApi,
} from "../../api/authApi.js";
import { FiPlus, FiEdit, FiTrash2, FiEye, FiEyeOff, FiKey } from "react-icons/fi";

const Users = () => {
  const { hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "lead_qualifier",
    phone: "",
    department: "Sales",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsersApi();
      setUsers(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setEditUser(null);
    setShowPassword(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "lead_qualifier",
      phone: "",
      department: "Sales",
    });
    setShowModal(true);
  };

  const openEditModal = (u) => {
    setEditUser(u);
    setShowPassword(false);
    setFormData({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      phone: u.phone || "",
      department: u.department || "Sales",
    });
    setShowModal(true);
  };

  const openPasswordModal = (u) => {
    setSelectedUser(u);
    setNewPassword("");
    setShowNewPassword(false);
    setShowPasswordModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editUser) {
        const updateData = { ...formData };
        delete updateData.password;
        await updateUserApi(editUser._id, updateData);
        alert("User updated successfully!");
      } else {
        await registerUserApi(formData);
        alert("User created successfully!");
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Error occurred");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await adminChangePasswordApi(selectedUser._id, {
        new_password: newPassword,
      });
      alert(`Password changed successfully for ${selectedUser.name}!`);
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (error) {
      alert(error.response?.data?.message || "Error changing password");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteUserApi(id);
        alert("User deleted!");
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.message || "Error deleting user");
      }
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: "badge-danger",
      sales_manager: "badge-primary",
      lead_qualifier: "badge-info",
      sales_closer: "badge-gold",
    };
    return badges[role] || "badge-info";
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        {hasRole(["admin"]) && (
          <button className="btn btn-primary" onClick={openCreateModal}>
            <FiPlus /> Add User
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>EMP ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              {hasRole(["admin"]) && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.employee_id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || "-"}</td>
                <td>
                  <span className={`badge ${getRoleBadge(u.role)}`}>
                    {u.role?.replace(/_/g, " ")}
                  </span>
                </td>
                <td>{u.department}</td>
                <td>
                  <span
                    className={`badge ${
                      u.is_active ? "badge-success" : "badge-danger"
                    }`}
                  >
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                {hasRole(["admin"]) && (
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {/* Edit */}
                      <button
                        className="btn btn-outline btn-sm"
                        title="Edit User"
                        onClick={() => openEditModal(u)}
                      >
                        <FiEdit />
                      </button>

                      {/* Change Password */}
                      <button
                        className="btn btn-gold btn-sm"
                        title="Change Password"
                        onClick={() => openPasswordModal(u)}
                      >
                        <FiKey />
                      </button>

                      {/* Delete - cannot delete admin */}
                      {u.role !== "admin" && (
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete User"
                          onClick={() => handleDelete(u._id, u.name)}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ─── Create/Edit Modal ─────────────────────────────── */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editUser ? "Edit User" : "Create New User"}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={!!editUser}
                    placeholder="Enter email"
                  />
                </div>
              </div>

              {/* PASSWORD - Only when creating */}
              {!editUser && (
                <div className="form-group">
                  <label className="form-label">
                    Password <span style={{ color: "red" }}>*</span>
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-input"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      style={{ paddingRight: "40px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#797e88",
                        fontSize: "16px",
                      }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <optgroup label="Sales Team">
                      <option value="admin">Admin</option>
                      <option value="sales_manager">Sales Manager</option>
                      <option value="lead_qualifier">Lead Qualifier</option>
                      <option value="sales_closer">Sales Closer</option>
                    </optgroup>
                    <optgroup label="Production Team">
                      <option value="video_editor">Video Editor</option>
                      <option value="web_developer">Web Developer</option>
                      <option value="video_shooter">Video Shooter</option>
                      <option value="social_media_manager">Social Media Manager</option>
                      <option value="designer">Designer</option>
                    </optgroup>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10 digit phone number"
                    maxLength={10}
                    minLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Enter department"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Change Password Modal ─────────────────────────── */}
      {showPasswordModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "400px" }}>
            <div className="modal-header">
              <h3 className="modal-title">
                Change Password - {selectedUser.name}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowPasswordModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">
                  New Password <span style={{ color: "red" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#797e88",
                      fontSize: "16px",
                    }}
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {/* Show password value when eye is on */}
                {showNewPassword && newPassword && (
                  <div
                    style={{
                      marginTop: "6px",
                      padding: "6px 10px",
                      background: "#f7e7ce",
                      borderRadius: "4px",
                      fontSize: "13px",
                      color: "#10443e",
                      fontWeight: "500",
                    }}
                  >
                    Password: {newPassword}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;