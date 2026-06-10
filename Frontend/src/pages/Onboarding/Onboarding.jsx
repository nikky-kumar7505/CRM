import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getAllOnboardingsApi,
  assignTeamMemberApi,
  updateOnboardingApi,
  generateCredentialLinkApi,
} from "../../api/onboardingApi.js";
import { getAllUsersApi } from "../../api/authApi.js";


import {
  FiCheckCircle,
  FiPhone,
  FiEye,
  FiUserCheck,
  FiEdit,
  FiSearch,
  FiCopy,
  FiCheck,
  FiLink,
  FiMail,
  FiMessageCircle,
} from "react-icons/fi";


// ─── Credentials Section Component ──────────────────────────────────────────
const CredentialsSection = ({ creds, canView }) => {
  const [show, setShow] = useState({});

  const toggleShow = (key) => {
    setShow({ ...show, [key]: !show[key] });
  };

  const renderField = (label, value, isPassword = false) => {
    if (!value) return null;
    return (
      <div className="detail-item">
        <label>{label}</label>
        <span>
          {isPassword && !canView ? (
            "••••••••"
          ) : isPassword ? (
            <>
              {show[label] ? value : "••••••••"}
              <button
                onClick={() => toggleShow(label)}
                style={{
                  marginLeft: "8px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#10443e",
                  fontSize: "12px",
                }}
              >
                {show[label] ? "Hide" : "Show"}
              </button>
            </>
          ) : (
            value
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="detail-grid">
      {renderField("Instagram Username", creds.instagram_username)}
      {renderField("Instagram Password", creds.instagram_password, true)}
      {renderField("Facebook Email", creds.facebook_email)}
      {renderField("Facebook Password", creds.facebook_password, true)}
      {renderField("YouTube Email", creds.youtube_email)}
      {renderField("YouTube Password", creds.youtube_password, true)}
      {renderField("LinkedIn Email", creds.linkedin_email)}
      {renderField("LinkedIn Password", creds.linkedin_password, true)}
      {renderField("Twitter Username", creds.twitter_username)}
      {renderField("Twitter Password", creds.twitter_password, true)}
      {renderField("Other Handle", creds.other_handle_name)}
      {renderField("Other Username", creds.other_handle_username)}
      {renderField("Other Password", creds.other_handle_password, true)}
      {creds.notes_from_client && (
        <div className="detail-item" style={{ gridColumn: "span 2" }}>
          <label>Notes from Client</label>
          <span>{creds.notes_from_client}</span>
        </div>
      )}
    </div>
  );
};



// ─── Main Onboarding Component ──────────────────────────────────────────────
const Onboarding = () => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
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
  const [showFillFormModal, setShowFillFormModal] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);

  const [assignData, setAssignData] = useState({
    team_member_id: "",
    team_member_role: "",
    assignment_notes: "",
    project_start_date: "",
    project_deadline: "",
  });

  const [fillFormData, setFillFormData] = useState({});

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

  // ─── Handlers ────────────────────────────────────────────
 const handleGenerateLink = async (ob) => {
  try {
    const res = await generateCredentialLinkApi(ob._id);
    const link = res.data.link;
    setGeneratedLink(link);
    setSelectedOnboarding(ob);
    setCopied(false);
    setShowLinkModal(true);
  } catch (error) {
    alert(error.response?.data?.message || "Error generating link");
  }
};

  // ─── Copy to clipboard handler ──────────────────
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      // Reset "Copied" text after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback if clipboard API fails
      const textArea = document.createElement("textarea");
      textArea.value = generatedLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const openFillFormModal = (ob) => {
    setSelectedOnboarding(ob);
    setFillFormData({
      client_name: ob.client_name || "",
      contact_number: ob.contact_number || "",
      alternate_contact: ob.alternate_contact || "",
      email: ob.email || "",
      business_name: ob.business_name || "",
      website: ob.website || "",
      service_type: ob.service_type || "video_editing",
      service_details: ob.service_details || "",
      deliverables: ob.deliverables || "",
      timeline: ob.timeline || "",
      total_amount: ob.total_amount || 0,
      amount_paid: ob.amount_paid || 0,
      payment_status: ob.payment_status || "not_received",
      payment_method: ob.payment_method || "upi",
      invoice_number: ob.invoice_number || "",
      address: ob.address || "",
      city: ob.city || "",
      state: ob.state || "",
      pincode: ob.pincode || "",
      project_start_date: ob.project_start_date
        ? new Date(ob.project_start_date).toISOString().split("T")[0]
        : "",
      project_deadline: ob.project_deadline
        ? new Date(ob.project_deadline).toISOString().split("T")[0]
        : "",
      client_requirements: ob.client_requirements || "",
      special_instructions: ob.special_instructions || "",
      preferred_communication: ob.preferred_communication || "whatsapp",
      social_media_manager_name: ob.social_media_manager_name || "",
    });
    setShowFillFormModal(true);
  };

  const handleFillForm = async (e) => {
    e.preventDefault();
    try {
      await updateOnboardingApi(selectedOnboarding._id, fillFormData);
      alert("✅ Onboarding details saved successfully!");
      setShowFillFormModal(false);
      fetchOnboardings();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving");
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
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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
                <td
                  colSpan="9"
                  style={{ textAlign: "center", padding: "40px" }}
                >
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
                          : ob.payment_status === "partially_paid"
                          ? "badge-warning"
                          : "badge-danger"
                      }`}
                    >
                      {ob.payment_status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${getStatusBadge(ob.onboarding_status)}`}
                    >
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
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {/* View Details */}
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

                      {/* ✅ Fill / Edit Onboarding Form */}
                      {hasRole(["admin", "sales_manager", "sales_closer"]) && (
                        <button
                          className="btn btn-sm"
                          title="Fill / Edit Onboarding Form"
                          onClick={() => openFillFormModal(ob)}
                          style={{
                            background: "#f7e7ce",
                            borderColor: "#D4AF37",
                            color: "#856404",
                            border: "1px solid",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          📝
                        </button>
                      )}

                      {/* Assign Team (Admin & Manager) */}
                      {hasRole(["admin", "sales_manager"]) && (
                        <button
                          className="btn btn-gold btn-sm"
                          title="Assign Team Member"
                          onClick={() => openAssignModal(ob)}
                        >
                          <FiUserCheck />
                        </button>
                      )}

                      {/* Generate Credential Link - only for video_editing */}
                      {ob.service_type === "video_editing" &&
                        hasRole(["admin", "sales_manager", "sales_closer"]) && (
                          <button
                            className="btn btn-gold btn-sm"
                            title="Send Credential Form Link"
                            onClick={() => handleGenerateLink(ob)}
                          >
                            🔗
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
                <span>
                  ₹{selectedOnboarding.total_amount?.toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <label>Paid Amount</label>
                <span>
                  ₹{selectedOnboarding.amount_paid?.toLocaleString()}
                </span>
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

            {selectedOnboarding?.assigned_team_member_name && (
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
                    <span>
                      {selectedOnboarding.assigned_team_member_name}
                    </span>
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

            {/* ─── Social Media Credentials Section ──────────── */}
            {selectedOnboarding.collected_credentials &&
              selectedOnboarding.collected_credentials.submitted_at && (
                <>
                  <h4
                    style={{
                      fontSize: "14px",
                      color: "#10443e",
                      marginBottom: "10px",
                      marginTop: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    🔐 Social Media Credentials
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#28a745",
                        background: "#d4edda",
                        padding: "2px 10px",
                        borderRadius: "12px",
                        fontWeight: "500",
                      }}
                    >
                      Submitted{" "}
                      {new Date(
                        selectedOnboarding.collected_credentials.submitted_at
                      ).toLocaleDateString("en-IN")}
                    </span>
                  </h4>

                  {!hasRole(["admin", "sales_manager"]) && (
                    <div
                      style={{
                        background: "#fff3cd",
                        color: "#856404",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        marginBottom: "12px",
                      }}
                    >
                      🔒 Passwords are hidden. Only Admin and Sales Manager can
                      view them.
                    </div>
                  )}

                  <CredentialsSection
                    creds={selectedOnboarding.collected_credentials}
                    canView={hasRole(["admin", "sales_manager"])}
                  />
                </>
              )}

            {/* Waiting message if link generated but not submitted */}
            {selectedOnboarding.credential_token &&
              !selectedOnboarding.credential_token_used && (
                <div
                  style={{
                    background: "#fff3cd",
                    color: "#856404",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    marginTop: "20px",
                    fontSize: "13px",
                  }}
                >
                  ⏳ <strong>Waiting for client</strong> to submit social media
                  credentials.
                </div>
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
                <strong>
                  {formatService(selectedOnboarding.service_type)}
                </strong>
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
                    {filteredTeamMembers.length === 0 &&
                      assignData.team_member_role && (
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

      {/* ─── Fill / Edit Onboarding Form Modal ───────────── */}
      {showFillFormModal && selectedOnboarding && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "780px" }}>
            <div className="modal-header">
              <h3 className="modal-title">
                📝 Fill Onboarding Details — {selectedOnboarding.client_name}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowFillFormModal(false)}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                background: "#fff3cd",
                padding: "10px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "13px",
                color: "#856404",
              }}
            >
              💡 Complete the onboarding details below. All fields can be
              updated anytime.
            </div>

            <form onSubmit={handleFillForm}>
              <h4
                style={{
                  fontSize: "14px",
                  color: "#10443e",
                  marginBottom: "10px",
                }}
              >
                Client Information
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Client Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fillFormData.client_name}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        client_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fillFormData.contact_number}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        contact_number: e.target.value,
                      })
                    }
                    required
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={fillFormData.email}
                    onChange={(e) =>
                      setFillFormData({ ...fillFormData, email: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={fillFormData.business_name}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        business_name: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <h4
                style={{
                  fontSize: "14px",
                  color: "#10443e",
                  marginBottom: "10px",
                  marginTop: "16px",
                }}
              >
                Service Details
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Service Type *</label>
                  <select
                    className="form-select"
                    value={fillFormData.service_type}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        service_type: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="video_shoot">Video Shoot</option>
                    <option value="video_editing">Video Editing</option>
                    <option value="web_development">Web Development</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Timeline</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 2 weeks"
                    value={fillFormData.timeline}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        timeline: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Social Media Manager only for video_editing */}
              {fillFormData.service_type === "video_editing" && (
                <div className="form-group">
                  <label className="form-label">
                    Social Media Manager Name
                    <span
                      style={{
                        color: "#797e88",
                        fontSize: "11px",
                        marginLeft: "6px",
                      }}
                    >
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={fillFormData.social_media_manager_name || ""}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        social_media_manager_name: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Service Details</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={fillFormData.service_details}
                  onChange={(e) =>
                    setFillFormData({
                      ...fillFormData,
                      service_details: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Client Requirements</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={fillFormData.client_requirements}
                  onChange={(e) =>
                    setFillFormData({
                      ...fillFormData,
                      client_requirements: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <h4
                style={{
                  fontSize: "14px",
                  color: "#10443e",
                  marginBottom: "10px",
                  marginTop: "16px",
                }}
              >
                Payment
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={fillFormData.total_amount}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        total_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount Paid (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={fillFormData.amount_paid}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        amount_paid: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select
                    className="form-select"
                    value={fillFormData.payment_status}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        payment_status: e.target.value,
                      })
                    }
                  >
                    <option value="not_received">Not Received</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="fully_paid">Fully Paid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={fillFormData.payment_method}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        payment_method: e.target.value,
                      })
                    }
                  >
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <h4
                style={{
                  fontSize: "14px",
                  color: "#10443e",
                  marginBottom: "10px",
                  marginTop: "16px",
                }}
              >
                Project Schedule
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={fillFormData.project_start_date}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        project_start_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Deadline</label>
                  <input
                    type="date"
                    className="form-input"
                    value={fillFormData.project_deadline}
                    onChange={(e) =>
                      setFillFormData({
                        ...fillFormData,
                        project_deadline: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowFillFormModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Generate Link Modal ─────────────────────────────── */}
      {showLinkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "560px" }}>

            {/* Header */}
            <div className="modal-header" style={{ borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#f7e7ce",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#856404",
                    fontSize: "20px",
                  }}
                >
                  <FiLink />
                </div>
                <div>
                  <h3 className="modal-title" style={{ marginBottom: "2px" }}>
                    🔗 Credential Collection Link
                  </h3>
                  <p style={{ fontSize: "12px", color: "#797e88", margin: 0 }}>
                    For: {selectedOnboarding?.client_name}
                  </p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowLinkModal(false)}
              >
                ✕
              </button>
            </div>

            {/* Info Banner */}
            <div
              style={{
                background: "#d4edda",
                color: "#155724",
                padding: "12px 14px",
                borderRadius: "8px",
                marginBottom: "16px",
                marginTop: "16px",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ✅ Link generated successfully! Share it with the client.
            </div>

            {/* Link Display Box */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: "600" }}>
                Secure Credential Collection Link
              </label>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "stretch",
                }}
              >
                <input
                  type="text"
                  value={generatedLink}
                  readOnly
                  className="form-input"
                  style={{
                    fontSize: "13px",
                    fontFamily: "monospace",
                    background: "#f8f9fa",
                    cursor: "text",
                    userSelect: "all",
                  }}
                  onClick={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={copied ? "btn btn-success" : "btn btn-primary"}
                  style={{
                    minWidth: "110px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    whiteSpace: "nowrap",
                    background: copied ? "#28a745" : "#10443e",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "0 16px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "13px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {copied ? (
                    <>
                      <FiCheck size={16} /> Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy size={16} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div
              style={{
                background: "#fff3cd",
                padding: "14px",
                borderRadius: "8px",
                marginTop: "16px",
                fontSize: "13px",
                color: "#856404",
              }}
            >
              <strong>📋 Instructions:</strong>
              <ol
                style={{
                  margin: "8px 0 0 18px",
                  padding: 0,
                  lineHeight: "1.7",
                }}
              >
                <li>Copy the link above using the Copy button</li>
                <li>Send the link to the client via WhatsApp / Email</li>
                <li>The client will open the link and fill their social media credentials</li>
                <li>Once submitted, credentials will appear in this onboarding's details</li>
              </ol>
            </div>

            {/* Quick Share Buttons */}
            <div style={{ marginTop: "16px" }}>
              <p style={{ fontSize: "12px", color: "#797e88", marginBottom: "8px" }}>
                Quick share with client:
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${selectedOnboarding?.contact_number || ""}?text=${encodeURIComponent(
                    `Hi ${selectedOnboarding?.client_name || "Client"},\n\nPlease fill your social media credentials at the link below for our social media management service:\n\n${generatedLink}\n\nThank you!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#25D366",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FiMessageCircle size={14} /> WhatsApp
                </a>

                {/* Email */}
                {selectedOnboarding?.email && (
                  <a
                    href={`mailto:${selectedOnboarding.email}?subject=${encodeURIComponent(
                      "Social Media Credentials Form"
                    )}&body=${encodeURIComponent(
                      `Hi ${selectedOnboarding?.client_name || "Client"},\n\nPlease fill your social media credentials at the link below for our social media management service:\n\n${generatedLink}\n\nThank you!`
                    )}`}
                    style={{
                      background: "#0078D4",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontSize: "13px",
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FiMail size={14} /> Email
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div
              className="modal-footer"
              style={{ marginTop: "20px", borderTop: "1px solid #f0f0f0" }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowLinkModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Onboarding;