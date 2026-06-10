import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getAllUsersApi,
  registerUserApi,
  updateUserApi,
  deleteUserApi,
  adminChangePasswordApi,
} from "../../api/authApi.js";
import {
  createRoleApi,
  deleteRoleApi,
  getRolesApi,
  updateRoleApi,
} from "../../api/rolesApi.js";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiKey,
} from "react-icons/fi";
import { formatRoleLabel } from "../../config/access.config.js";
import "../DailyTask/DailyTask.css";

const MODULE_OPTIONS = [
  { value: "sales", label: "Sales" },
  { value: "daily", label: "Daily" },
  { value: "attendance", label: "Attendance" },
];

const SYSTEM_ROLE_KEYS = [
  "admin",
];
// const SYSTEM_ROLE_KEYS = [
//   "admin",
//   "sales_manager",
//   "lead_qualifier",
//   "sales_closer",
//   "social_media_manager",
//   "video_editor",
// ];

const buildRoleKey = (label = "") =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getLandingPathForModules = (modules) => {
  if (modules.includes("sales")) return "/sales/dashboard";
  if (modules.includes("daily")) return "/daily/dashboard";
  if (modules.includes("attendance")) return "/attendance";
  return "/daily/dashboard";
};

const Users = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(["admin"]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  const [showUserModal, setShowUserModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    department: "",
    managed_by: "",
  });

  const [roleForm, setRoleForm] = useState({
    label: "",
    key: "",
    department: "",
    allowedModules: ["daily"],
    landingPath: "/daily/dashboard",
    isManager: false,
    isActive: true,
  });

  const roleMap = useMemo(
    () =>
      roles.reduce((accumulator, role) => {
        accumulator[role.key] = role;
        return accumulator;
      }, {}),
    [roles]
  );

  const managerUsers = useMemo(
    () => users.filter((user) => user.isManager || user.role === "admin"),
    [users]
  );

  const selectedRole = roleMap[userForm.role];
  const isEditingSystemRole =
    editingRole && SYSTEM_ROLE_KEYS.includes(editingRole.key);
console.log(editingRole);
console.log(SYSTEM_ROLE_KEYS);

  const loadData = async () => {
    try {
      setLoading(true);
      setFeedback({ error: "", success: "" });
      const [usersResponse, rolesResponse] = await Promise.all([
        getAllUsersApi(),
        getRolesApi({ include_inactive: "true" }),
      ]);
      setUsers(usersResponse.data.data || []);
      setRoles(rolesResponse.data.data || []);
    } catch (error) {
      setFeedback({
        error: error.response?.data?.message || "Failed to load management data.",
        success: "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetUserForm = (roleKey = "") => {
    const nextRole = roleKey || roles[0]?.key || "";
    const nextRoleConfig = roleMap[nextRole];

    setUserForm({
      name: "",
      email: "",
      password: "",
      role: nextRole,
      phone: "",
      department: nextRoleConfig?.department || "",
      managed_by: "",
    });
    setEditingUser(null);
    setShowPassword(false);
  };

  const openCreateUserModal = () => {
    resetUserForm(roles.find((role) => role.key === "lead_qualifier")?.key);
    setShowUserModal(true);
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setShowPassword(false);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone || "",
      department: user.department || roleMap[user.role]?.department || "",
      managed_by: user.managed_by?._id || user.managed_by || "",
    });
    setShowUserModal(true);
  };

  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowNewPassword(false);
    setShowPasswordModal(true);
  };

  const openCreateRoleModal = () => {
    setEditingRole(null);
    setRoleForm({
      label: "",
      key: "",
      department: "",
      allowedModules: ["daily"],
      landingPath: "/daily/dashboard",
      isManager: false,
      isActive: true,
    });
    setShowRoleModal(true);
  };

  const openEditRoleModal = (role) => {
    setEditingRole(role);
    setRoleForm({
      label: role.label,
      key: role.key,
      department: role.department,
      allowedModules: role.allowedModules || ["daily"],
      landingPath: role.landingPath || getLandingPathForModules(role.allowedModules || []),
      isManager: Boolean(role.isManager),
      isActive: role.isActive,
    });
    setShowRoleModal(true);
  };

  const handleUserFieldChange = (event) => {
    const { name, value } = event.target;
    if (name === "role") {
      const nextRole = roleMap[value];
      setUserForm((previous) => ({
        ...previous,
        role: value,
        department: nextRole?.department || previous.department,
        managed_by: nextRole?.isManager ? "" : previous.managed_by,
      }));
      return;
    }

    setUserForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleRoleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;

    if (name === "label") {
      setRoleForm((previous) => ({
        ...previous,
        label: value,
        key: editingRole ? previous.key : buildRoleKey(value),
      }));
      return;
    }

    if (type === "checkbox" && name === "isManager") {
      setRoleForm((previous) => ({ ...previous, isManager: checked }));
      return;
    }

    if (type === "checkbox" && name === "isActive") {
      setRoleForm((previous) => ({ ...previous, isActive: checked }));
      return;
    }

    setRoleForm((previous) => ({ ...previous, [name]: value }));
  };

  const toggleModule = (moduleName) => {
    setRoleForm((previous) => {
      const exists = previous.allowedModules.includes(moduleName);
      const allowedModules = exists
        ? previous.allowedModules.filter((item) => item !== moduleName)
        : [...previous.allowedModules, moduleName];

      const safeModules = allowedModules.length > 0 ? allowedModules : ["daily"];

      return {
        ...previous,
        allowedModules: safeModules,
        landingPath: getLandingPathForModules(safeModules),
      };
    });
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...userForm,
        managed_by: userForm.managed_by || null,
      };

      if (editingUser) {
        delete payload.password;
        await updateUserApi(editingUser._id, payload);
        setFeedback({ error: "", success: "User updated successfully." });
      } else {
        await registerUserApi(payload);
        setFeedback({ error: "", success: "User created successfully." });
      }

      setShowUserModal(false);
      await loadData();
    } catch (error) {
      setFeedback({
        error: error.response?.data?.message || "Failed to save user.",
        success: "",
      });
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();

    try {
      await adminChangePasswordApi(selectedUser._id, {
        new_password: newPassword,
      });
      setFeedback({ error: "", success: `Password updated for ${selectedUser.name}.` });
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (error) {
      setFeedback({
        error: error.response?.data?.message || "Failed to change password.",
        success: "",
      });
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.name}?`)) {
      return;
    }

    try {
      await deleteUserApi(user._id);
      setFeedback({ error: "", success: "User deleted successfully." });
      await loadData();
    } catch (error) {
      setFeedback({
        error: error.response?.data?.message || "Failed to delete user.",
        success: "",
      });
    }
  };

  const handleRoleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...roleForm,
        key: buildRoleKey(roleForm.key || roleForm.label),
      };

      if (editingRole) {
        await updateRoleApi(editingRole._id, payload);
        setFeedback({ error: "", success: "Role updated successfully." });
      } else {
        await createRoleApi(payload);
        setFeedback({ error: "", success: "Role created successfully." });
      }

      setShowRoleModal(false);
      await loadData();
    } catch (error) {
      setFeedback({
        error: error.response?.data?.message || "Failed to save role.",
        success: "",
      });
    }
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Delete role ${role.label}?`)) {
      return;
    }

    try {
      await deleteRoleApi(role._id);
      setFeedback({ error: "", success: "Role deleted successfully." });
      await loadData();
    } catch (error) {
      setFeedback({
        error: error.response?.data?.message || "Failed to delete role.",
        success: "",
      });
    }
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
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="daily-meta">
            Manage employees, role assignments, managers, and future role definitions.
          </p>
        </div>

        {activeTab === "users" && isAdmin && (
          <button className="btn btn-primary" onClick={openCreateUserModal}>
            <FiPlus /> Add User
          </button>
        )}

        {activeTab === "roles" && isAdmin && (
          <button className="btn btn-primary" onClick={openCreateRoleModal}>
            <FiPlus /> Add Role
          </button>
        )}
      </div>

      {feedback.error && (
        <div className="card" style={{ marginBottom: "16px", borderLeft: "4px solid #dc3545", color: "#721c24" }}>
          {feedback.error}
        </div>
      )}

      {feedback.success && (
        <div className="card" style={{ marginBottom: "16px", borderLeft: "4px solid #28a745", color: "#155724" }}>
          {feedback.success}
        </div>
      )}

      <div className="tab-list">
        <button
          className={`tab-button ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        {isAdmin && (
          <button
            className={`tab-button ${activeTab === "roles" ? "active" : ""}`}
            onClick={() => setActiveTab("roles")}
          >
            Roles
          </button>
        )}
      </div>

      {activeTab === "users" ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>EMP ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Manager</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.employee_id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge badge-info">
                      {roleMap[user.role]?.label || formatRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>{user.department}</td>
                  <td>{user.managed_by?.name || "-"}</td>
                  <td>
                    <span className={`badge ${user.is_active ? "badge-success" : "badge-danger"}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-outline btn-sm"
                          title="Edit User"
                          onClick={() => openEditUserModal(user)}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn btn-gold btn-sm"
                          title="Change Password"
                          onClick={() => openPasswordModal(user)}
                        >
                          <FiKey />
                        </button>
                        {user.role !== "admin" && (
                          <button
                            className="btn btn-danger btn-sm"
                            title="Delete User"
                            onClick={() => handleDeleteUser(user)}
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
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Label</th>
                <th>Key</th>
                <th>Department</th>
                <th>Modules</th>
                <th>Manager</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role._id}>
                  <td>{role.label}</td>
                  <td>{role.key}</td>
                  <td>{role.department}</td>
                  <td>{(role.allowedModules || []).join(", ")}</td>
                  <td>{role.isManager ? "Yes" : "No"}</td>
                  <td>
                    <span className={`badge ${role.isActive ? "badge-success" : "badge-danger"}`}>
                      {role.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => openEditRoleModal(role)}
                      >
                        <FiEdit />
                      </button>
                      {!SYSTEM_ROLE_KEYS.includes(role.key) && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteRole(role)}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingUser ? "Edit User" : "Create New User"}
              </h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleUserSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={userForm.name}
                    onChange={handleUserFieldChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={userForm.email}
                    onChange={handleUserFieldChange}
                    required
                    disabled={Boolean(editingUser)}
                  />
                </div>
              </div>

              {!editingUser && (
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="form-input"
                      value={userForm.password}
                      onChange={handleUserFieldChange}
                      required
                      minLength={6}
                      style={{ paddingRight: "44px" }}
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
                    value={userForm.role}
                    onChange={handleUserFieldChange}
                    required
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
                    value={userForm.phone}
                    onChange={handleUserFieldChange}
                    placeholder="10 digit phone number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    value={userForm.department}
                    onChange={handleUserFieldChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Manager</label>
                  <select
                    name="managed_by"
                    className="form-select"
                    value={userForm.managed_by}
                    onChange={handleUserFieldChange}
                    disabled={selectedRole?.isManager}
                  >
                    <option value="">No manager</option>
                    {managerUsers
                      .filter((manager) => manager._id !== editingUser?._id)
                      .map((manager) => (
                        <option key={manager._id} value={manager._id}>
                          {manager.name} ({roleMap[manager.role]?.label || formatRoleLabel(manager.role)})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="daily-meta" style={{ marginBottom: "16px" }}>
                Workspace access: {(selectedRole?.allowedModules || []).join(", ") || "N/A"}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowUserModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? "Update User" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Change Password - {selectedUser.name}</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-input"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={6}
                    style={{ paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                    }}
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>
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

      {showRoleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingRole ? "Edit Role" : "Create Role"}
              </h3>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleRoleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Label</label>
                  <input
                    className="form-input"
                    name="label"
                    value={roleForm.label}
                    onChange={handleRoleFieldChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Key</label>
                  <input
                    className="form-input"
                    name="key"
                    value={roleForm.key}
                    onChange={handleRoleFieldChange}
                    required
                    disabled={Boolean(editingRole)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    className="form-input"
                    name="department"
                    value={roleForm.department}
                    onChange={handleRoleFieldChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Landing Path</label>
                  <input
                    className="form-input"
                    name="landingPath"
                    value={roleForm.landingPath}
                    onChange={handleRoleFieldChange}
                    disabled={isEditingSystemRole}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Allowed Modules</label>
                <div className="checkbox-grid">
                  {MODULE_OPTIONS.map((moduleOption) => (
                    <label className="checkbox-row" key={moduleOption.value}>
                      <input
                        type="checkbox"
                        checked={roleForm.allowedModules.includes(moduleOption.value)}
                        onChange={() => toggleModule(moduleOption.value)}
                        disabled={isEditingSystemRole}
                      />
                      <span>{moduleOption.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    name="isManager"
                    checked={roleForm.isManager}
                    onChange={handleRoleFieldChange}
                    disabled={isEditingSystemRole}
                  />
                  <span>Manager role</span>
                </label>
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={roleForm.isActive}
                    onChange={handleRoleFieldChange}
                    disabled={isEditingSystemRole}
                  />
                  <span>Active role</span>
                </label>
              </div>

              {isEditingSystemRole && (
                <p className="daily-meta" style={{ marginTop: "12px" }}>
                  Core seeded roles stay locked to protect existing Sales behavior.
                </p>
              )}

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowRoleModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRole ? "Update Role" : "Create Role"}
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
