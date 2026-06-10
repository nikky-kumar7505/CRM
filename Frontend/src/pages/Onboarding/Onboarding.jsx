import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getAllOnboardingsApi,
  assignTeamMemberApi,
  updateOnboardingApi,
} from "../../api/onboardingApi.js";
import { getAllUsersApi } from "../../api/authApi.js";
import {
  FiCheckCircle,
  FiPhone,
  FiEye,
  FiUserCheck,
  FiEdit,
  FiSearch,
} from "react-icons/fi";

const Onboarding = () => {
  const { hasRole } = useAuth();
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filters, setFilters] = useState({
    status: "",
    service_type: "",
    search: "",
  });

  // Modals
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);

  const [assignData, setAssignData] = useState({
    team_member_id: "",
    team_member_role: "",
    assignment_notes: "",
    project_start_date: "",
    project_deadline: "",
  });

  useEffect(() => {
    fetchOnboardings();
    if (hasRole(["admin", "sales_manager"])) {
      fetchTeamMembers();
    }
  }, [filters.status, filters.service_type]);

  const fetchOnboardings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.service_type) params.service_type = filters.service_type;
      if (filters.search) params.search = filters.search;
      const res = await getAllOnboardingsApi(params);
      setOnboardings(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Get all team member roles
      const roles = [
        "video_editor",
        "web_developer",
        "video_shooter",
        "social_media_manager",
        "designer",
      ];

      const allMembers = [];
      for (const role of roles) {
        const res = await getAllUsersApi({ role });
        allMembers.push(...res.data.data);
      }
      setTeamMembers(allMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assignTeamMemberApi(selectedOnboarding._id, assignData);
      alert("Team member assigned successfully!");
      setShowAssignModal(false);
      setAssignData({
        team_member_id: "",
        team_member_role: "",
        assignment_notes: "",
        project_start_date: "",
        project_deadline: "",
      });
      fetchOnboardings();
    } catch (error) {
      alert(error.response?.data?.message || "Error assigning team member");
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending_assignment: "badge-warning",
      assigned: "badge-info",
      in_progress: "badge-primary",
      review: "badge-gold",
      completed: "badge-success",
      delivered: "badge-success",
      on_hold: "badge-danger",
    };
    return map[status] || "badge-info";
  };

  const formatService = (s) => {
    return s?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const openAssignModal = (onboarding) => {
    setSelectedOnboarding(onboarding);

    // Auto-suggest role based on service type
    const roleMap = {
      video_editing: "video_editor",
      web_development: "web_developer",
      video_shoot: "video_shooter",
      social_media_management: "social_media_manager",
    };

    setAssignData({
      team_member_id: onboarding.assigned_team_member?._id || "",
      team_member_role:
        onboarding.team_member_role || roleMap[onboarding.service_type] || "",
      assignment_notes: onboarding.assignment_notes || "",
      project_start_date: onboarding.project_start_date
        ? new Date(onboarding.project_start_date).toISOString().split("T")[0]
        : "",
      project_deadline: onboarding.project_deadline
        ? new Date(onboarding.project_deadline).toISOString().split("T")[0]
        : "",
    });

    setShowAssignModal(true);
  };

  // Filter team members based on role selected
  const filteredTeamMembers = assignData.team_member_role
    ? teamMembers.filter((m) => m.role === assignData.team_member_role)
    : teamMembers;

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
        <h1
          className="page-title"
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <FiCheckCircle style={{ color: "#28a745" }} /> Onboarding Clients
        </h1>
        <span
          className="badge badge-success"
          style={{ fontSize: "14px", padding: "6px 16px" }}
        >
          {onboardings.length} Clients
        </span>
      </div>

      {/* ─── Filters ────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="filters-row">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOnboardings();
            }}
            style={{ display: "flex", gap: "8px", flex: 1, flexWrap: "wrap" }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Search client, ID, contact..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              style={{ maxWidth: "260px", minWidth: "160px" }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <FiSearch /> Search
            </button>
          </form>

          <select
            className="form-select"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            style={{ maxWidth: "180px" }}
          >
            <option value="">All Status</option>
            <option value="pending_assignment">Pending Assignment</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="delivered">Delivered</option>
            <option value="on_hold">On Hold</option>
          </select>

          <select
            className="form-select"
            value={filters.service_type}
            onChange={(e) =>
              setFilters({ ...filters, service_type: e.target.value })
            }
            style={{ maxWidth: "180px" }}
          >
            <option value="">All Services</option>
            <option value="video_shoot">Video Shoot</option>
            <option value="video_editing">Video Editing</option>
            <option value="web_development">Web Development</option>
            <option value="social_media_management">Social Media Mgmt</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* ─── Table ──────────────────────────────────────── */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Onboarding ID</th>
              <th>Client</th>
              <th>Contact</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {onboardings.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>
                  No onboarding clients yet. Closed deals will appear here.
                </td>
              </tr>
            ) : (
              onboardings.map((ob) => (
                <tr key={ob._id}>
                  <td>
                    <strong style={{ color: "#10443e" }}>
                      {ob.onboarding_id}
                    </strong>
                  </td>
                  <td>
                    <strong>{ob.client_name}</strong>
                    {ob.business_name && (
                      <div style={{ fontSize: "11px", color: "#797e88" }}>
                        {ob.business_name}
                      </div>
                    )}
                  </td>
                  <td>
                    <a
                      href={`tel:${ob.contact_number}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#10443e",
                        textDecoration: "none",
                      }}
                    >
                      <FiPhone
                        style={{
                          background: "#e8f5f3",
                          padding: "3px",
                          borderRadius: "4px",
                          fontSize: "20px",
                        }}
                      />
                      {ob.contact_number}
                    </a>
                  </td>
                  <td>
                    <span className="badge badge-gold">
                      {formatService(ob.service_type)}
                    </span>
                  </td>
                  <td>
                    <strong>₹{ob.total_amount?.toLocaleString()}</strong>
                    <div style={{ fontSize: "11px", color: "#797e88" }}>
                      Paid: ₹{ob.amount_paid?.toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        ob.payment_status === "fully_paid"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      {ob.payment_status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(ob.onboarding_status)}`}>
                      {ob.onboarding_status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    {ob.assigned_team_member_name ? (
                      <div>
                        <strong style={{ fontSize: "12px" }}>
                          {ob.assigned_team_member_name}
                        </strong>
                        <div style={{ fontSize: "10px", color: "#797e88" }}>
                          {ob.team_member_role?.replace(/_/g, " ")}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: "#dc3545", fontSize: "12px" }}>
                        Not Assigned
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {/* View */}
                      <button
                        className="btn btn-outline btn-sm"
                        title="View Details"
                        onClick={() => {
                          setSelectedOnboarding(ob);
                          setShowDetailModal(true);
                        }}
                      >
                        <FiEye />
                      </button>

                      {/* Assign (Admin & Manager) */}
                      {hasRole(["admin", "sales_manager"]) && (
                        <button
                          className="btn btn-gold btn-sm"
                          title="Assign Team Member"
                          onClick={() => openAssignModal(ob)}
                        >
                          <FiUserCheck />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Detail Modal ───────────────────────────────── */}
      {showDetailModal && selectedOnboarding && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "750px" }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedOnboarding.onboarding_id} —{" "}
                {selectedOnboarding.client_name}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <h4
              style={{
                fontSize: "14px",
                color: "#10443e",
                marginBottom: "10px",
                marginTop: "10px",
              }}
            >
              Client Information
            </h4>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Client Name</label>
                <span>{selectedOnboarding.client_name}</span>
              </div>
              <div className="detail-item">
                <label>Business</label>
                <span>{selectedOnboarding.business_name || "-"}</span>
              </div>
              <div className="detail-item">
                <label>Contact</label>
                <a
                  href={`tel:${selectedOnboarding.contact_number}`}
                  style={{ color: "#10443e", textDecoration: "none" }}
                >
                  📞 {selectedOnboarding.contact_number}
                </a>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <span>{selectedOnboarding.email || "-"}</span>
              </div>
              <div className="detail-item">
                <label>City</label>
                <span>{selectedOnboarding.city || "-"}</span>
              </div>
              <div className="detail-item">
                <label>State</label>
                <span>{selectedOnboarding.state || "-"}</span>
              </div>
            </div>

            <h4
              style={{
                fontSize: "14px",
                color: "#10443e",
                marginBottom: "10px",
                marginTop: "20px",
              }}
            >
              Service Details
            </h4>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Service Type</label>
                <span className="badge badge-gold">
                  {formatService(selectedOnboarding.service_type)}
                </span>
              </div>
              <div className="detail-item">
                <label>Timeline</label>
                <span>{selectedOnboarding.timeline || "-"}</span>
              </div>
            </div>

            {selectedOnboarding.service_details && (
              <div style={{ marginTop: "12px" }}>
                <label className="form-label">Service Details</label>
                <p style={{ fontSize: "13px" }}>
                  {selectedOnboarding.service_details}
                </p>
              </div>
            )}

            {selectedOnboarding.deliverables && (
              <div style={{ marginTop: "12px" }}>
                <label className="form-label">Deliverables</label>
                <p style={{ fontSize: "13px" }}>
                  {selectedOnboarding.deliverables}
                </p>
              </div>
            )}

            {selectedOnboarding.client_requirements && (
              <div style={{ marginTop: "12px" }}>
                <label className="form-label">Client Requirements</label>
                <p style={{ fontSize: "13px" }}>
                  {selectedOnboarding.client_requirements}
                </p>
              </div>
            )}

            <h4
              style={{
                fontSize: "14px",
                color: "#10443e",
                marginBottom: "10px",
                marginTop: "20px",
              }}
            >
              Payment Information
            </h4>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Total Amount</label>
                <span>₹{selectedOnboarding.total_amount?.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Paid Amount</label>
                <span>₹{selectedOnboarding.amount_paid?.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Pending Amount</label>
                <span style={{ color: "#dc3545" }}>
                  ₹{selectedOnboarding.amount_pending?.toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <label>Payment Method</label>
                <span>{selectedOnboarding.payment_method || "-"}</span>
              </div>
            </div>

            {selectedOnboarding.assigned_team_member_name && (
              <>
                <h4
                  style={{
                    fontSize: "14px",
                    color: "#10443e",
                    marginBottom: "10px",
                    marginTop: "20px",
                  }}
                >
                  Team Assignment
                </h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Assigned To</label>
                    <span>{selectedOnboarding.assigned_team_member_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Role</label>
                    <span>
                      {selectedOnboarding.team_member_role?.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Start Date</label>
                    <span>
                      {selectedOnboarding.project_start_date
                        ? new Date(
                            selectedOnboarding.project_start_date
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Deadline</label>
                    <span>
                      {selectedOnboarding.project_deadline
                        ? new Date(
                            selectedOnboarding.project_deadline
                          ).toLocaleDateString("en-IN")
                        : "-"}
                    </span>
                  </div>
                </div>
                {selectedOnboarding.assignment_notes && (
                  <div style={{ marginTop: "12px" }}>
                    <label className="form-label">Assignment Notes</label>
                    <p style={{ fontSize: "13px" }}>
                      {selectedOnboarding.assignment_notes}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Assign Team Member Modal ───────────────────── */}
      {showAssignModal && selectedOnboarding && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div className="modal-header">
              <h3 className="modal-title">
                Assign Team Member — {selectedOnboarding.client_name}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowAssignModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssign}>
              <div
                style={{
                  background: "#f7e7ce",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "12px",
                  color: "#856404",
                }}
              >
                💡 Service Required:{" "}
                <strong>{formatService(selectedOnboarding.service_type)}</strong>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Team Member Role *</label>
                  <select
                    className="form-select"
                    value={assignData.team_member_role}
                    onChange={(e) =>
                      setAssignData({
                        ...assignData,
                        team_member_role: e.target.value,
                        team_member_id: "",
                      })
                    }
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="video_editor">Video Editor</option>
                    <option value="web_developer">Web Developer</option>
                    <option value="video_shooter">Video Shooter</option>
                    <option value="social_media_manager">
                      Social Media Manager
                    </option>
                    <option value="designer">Designer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Person *</label>
                  <select
                    className="form-select"
                    value={assignData.team_member_id}
                    onChange={(e) =>
                      setAssignData({
                        ...assignData,
                        team_member_id: e.target.value,
                      })
                    }
                    required
                    disabled={!assignData.team_member_role}
                  >
                    <option value="">Choose person...</option>
                    {filteredTeamMembers.length === 0 && assignData.team_member_role && (
                      <option value="" disabled>
                        No team members found for this role
                      </option>
                    )}
                    {filteredTeamMembers.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.employee_id})
                      </option>
                    ))}
                  </select>
                  {!assignData.team_member_role && (
                    <small style={{ color: "#797e88", fontSize: "11px" }}>
                      Select a role first
                    </small>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Project Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={assignData.project_start_date}
                    onChange={(e) =>
                      setAssignData({
                        ...assignData,
                        project_start_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Deadline</label>
                  <input
                    type="date"
                    className="form-input"
                    value={assignData.project_deadline}
                    onChange={(e) =>
                      setAssignData({
                        ...assignData,
                        project_deadline: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assignment Notes</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Instructions for the team member..."
                  value={assignData.assignment_notes}
                  onChange={(e) =>
                    setAssignData({
                      ...assignData,
                      assignment_notes: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Assign Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;