import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getAllLeadsApi,
  createLeadApi,
  createLeadCSVApi,
  updateLeadApi,
  deleteLeadApi,
  assignLeadApi,
  addCallLogApi,
  passToCloserApi,
  bulkUpdateLeadsApi,
} from "../../api/leadApi.js";
import { getAllUsersApi } from "../../api/authApi.js";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPhone,
  FiUserCheck,
  FiArrowRight,
  FiEye,
  FiSearch,
  FiUpload,
  FiCheckSquare,
  FiSquare,
  FiDownload,
} from "react-icons/fi";
import "./Leads.css";

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar",
  "Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh",
  "Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra",
  "Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Other",
];

// ✅ Services dropdown options (frontend only)
const SERVICE_OPTIONS = [
  { value: "video_shoot", label: "Video Shoot" },
  { value: "video_editing", label: "Video Editing" },
  { value: "web_development", label: "Web Development" },
  { value: "social_media_management", label: "Social Media Management" },
];

const Leads = () => {
  const { user, hasRole } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qualifiers, setQualifiers] = useState([]);
  const [autoAssignInfo, setAutoAssignInfo] = useState(null);
  const [filters, setFilters] = useState({
    current_stage: "",
    priority: "",
    search: "",
    page: 1,
  });
  const [pagination, setPagination] = useState({});

  // ✅ Bulk selection state
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState({
    calling_status: "",
    current_stage: "",
    comment: "",
  });

  // Create mode: "manual" or "csv"
  const [createMode, setCreateMode] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvLoading, setCsvLoading] = useState(false);
  const [csvResult, setCsvResult] = useState(null);

  // Modals
  const [showCreateChoiceModal, setShowCreateChoiceModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCallLogModal, setShowCallLogModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [formData, setFormData] = useState({
  lead_name: "",
  contact_number: "",
  email: "",
  service_required: "",   // ✅ This stores the service type
  requirements: "",        // (used for compatibility)
  lead_source: "other",
  priority: "medium",
  city: "",
  state: "",
});
  

  const [editFormData, setEditFormData] = useState({
  lead_name: "",
  contact_number: "",
  email: "",
  service_required: "",   // ✅ NEW
  requirements: "",       // Detailed requirements (filled by qualifier)
  lead_source: "other",
  priority: "medium",
  current_stage: "new",
  city: "",
  state: "",
  calling_status: "pending",
  next_follow_up_date: "",
  comment: "",
  budget: "",
  expected_closing_date: "",
});

  const [assignData, setAssignData] = useState({ qualifier_id: "" });
  const [callLogData, setCallLogData] = useState({
  calling_status: "interested",
  comment: "",
  requirements: "",
  budget: "",
  expected_closing_date: "",
  priority: "",
  next_follow_up_date: "",
});

  useEffect(() => {
    fetchLeads();
    if (hasRole(["admin", "sales_manager"])) {
      fetchQualifiers();
    }
  }, [filters.current_stage, filters.priority, filters.page]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.current_stage) params.current_stage = filters.current_stage;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      params.page = filters.page;
      params.limit = 10;
      const res = await getAllLeadsApi(params);
      setLeads(res.data.data);
      setPagination({
        total: res.data.total,
        totalPages: res.data.totalPages,
        currentPage: res.data.currentPage,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQualifiers = async () => {
    try {
      const res = await getAllUsersApi({ role: "lead_qualifier" });
      setQualifiers(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ─── Bulk Selection ──────────────────────────────────────
  const toggleSelectLead = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map((l) => l._id));
    }
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { lead_ids: selectedLeads };
      if (bulkData.calling_status) dataToSend.calling_status = bulkData.calling_status;
      if (bulkData.current_stage) dataToSend.current_stage = bulkData.current_stage;
      if (bulkData.comment) dataToSend.comment = bulkData.comment;

      await bulkUpdateLeadsApi(dataToSend);
      alert(`${selectedLeads.length} leads updated successfully!`);
      setShowBulkModal(false);
      setSelectedLeads([]);
      setBulkData({ calling_status: "", current_stage: "", comment: "" });
      fetchLeads();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating leads");
    }
  };

  // ─── CSV Upload ──────────────────────────────────────────
  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert("Please select a CSV file");
      return;
    }
    setCsvLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("csv_file", csvFile);
      const res = await createLeadCSVApi(formDataObj);
      setCsvResult(res.data);
      fetchLeads();
    } catch (error) {
      alert(error.response?.data?.message || "Error uploading CSV");
    } finally {
      setCsvLoading(false);
    }
  };

  // ─── Download sample CSV ─────────────────────────────────
  const downloadSampleCSV = () => {
    const sample = `lead_name,contact_number,email,service_type,lead_source,city,state,priority,requirements
Rahul Sharma,9876543210,rahul@gmail.com,video_editing,instagram,Mumbai,Maharashtra,high,Need 10 reels edited per month
Sneha Coach,8765432109,sneha@gmail.com,social_media_management,facebook,Delhi,Delhi,medium,Full social media management
Vikram Brand,7654321098,vikram@gmail.com,web_development,referral,Bangalore,Karnataka,urgent,E-commerce website`;

    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Form handlers ───────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const openEditModal = (lead) => {
  setSelectedLead(lead);
  setEditFormData({
    lead_name: lead.lead_name || "",
    contact_number: lead.contact_number || "",
    email: lead.email || "",
    service_required: lead.service_required || "",  // ✅ Pre-fill
    requirements: lead.requirements || "",
    lead_source: lead.lead_source || "other",
    priority: lead.priority || "medium",
    current_stage: lead.current_stage || "new",
    city: lead.city || "",
    state: lead.state || "",
    calling_status: lead.calling_status || "pending",
    next_follow_up_date: lead.next_follow_up_date
      ? new Date(lead.next_follow_up_date).toISOString().split("T")[0]
      : "",
    comment: lead.comment || "",
    budget: lead.budget || "",
    expected_closing_date: lead.expected_closing_date
      ? new Date(lead.expected_closing_date).toISOString().split("T")[0]
      : "",
  });
  setShowEditModal(true);
};

  const handleCreateLead = async (e) => {
  e.preventDefault();
  setAutoAssignInfo(null);
  try {
    const dataToSend = {
      ...formData,
      service_required: formData.service_required,  // ✅ Send as separate field
      business_type: "other",
    };
    const res = await createLeadApi(dataToSend);
    if (res.data.auto_assign_info) {
      setAutoAssignInfo(res.data.auto_assign_info);
    }
    setShowCreateModal(false);
    setFormData({
      lead_name: "",
      contact_number: "",
      email: "",
      service_required: "",
      requirements: "",
      lead_source: "other",
      priority: "medium",
      city: "",
      state: "",
    });
    fetchLeads();
  } catch (error) {
    alert(error.response?.data?.message || "Error creating lead");
  }
};
  const handleEditLead = async (e) => {
    e.preventDefault();
    try {
      await updateLeadApi(selectedLead._id, {
        ...editFormData,
        requirements: editFormData.service_type || editFormData.requirements,
      });
      alert("Lead updated successfully!");
      setShowEditModal(false);
      fetchLeads();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating lead");
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await assignLeadApi(selectedLead._id, assignData);
      alert("Lead assigned successfully!");
      setShowAssignModal(false);
      fetchLeads();
    } catch (error) {
      alert(error.response?.data?.message || "Error assigning lead");
    }
  };

  const handleCallLog = async (e) => {
  e.preventDefault();
  try {
    await addCallLogApi(selectedLead._id, {
      calling_status: callLogData.calling_status,
      comment: callLogData.comment,
    });

    // Update lead with extra fields
    const updateFields = {};
    if (callLogData.budget) updateFields.budget = callLogData.budget;
    if (callLogData.requirements) updateFields.requirements = callLogData.requirements;
    if (callLogData.expected_closing_date) updateFields.next_follow_up_date = callLogData.expected_closing_date;
    if (callLogData.priority) updateFields.priority = callLogData.priority;
    if (callLogData.next_follow_up_date) updateFields.next_follow_up_date = callLogData.next_follow_up_date;

    // Set stage based on priority
    if (callLogData.priority === "low" && callLogData.calling_status === "not_interested") {
      updateFields.current_stage = "follow_up";
    }

    if (Object.keys(updateFields).length > 0) {
      await updateLeadApi(selectedLead._id, updateFields);
    }

    // ✅ Create follow up notification for qualifier
    if (callLogData.next_follow_up_date) {
      alert(`Follow up scheduled for ${callLogData.next_follow_up_date}`);
    }

    alert("Status updated successfully!");
    setShowCallLogModal(false);
    setCallLogData({
      calling_status: "interested",
      comment: "",
      requirements: "",
      budget: "",
      expected_closing_date: "",
      priority: "",
      next_follow_up_date: "",
    });
    fetchLeads();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating status");
    }
  };

  const handlePassToCloser = async (lead) => {
    if (window.confirm(`Pass "${lead.lead_name}" to Sales Closer?`)) {
      try {
        await passToCloserApi(lead._id);
        alert("Lead passed to Sales Closer!");
        fetchLeads();
      } catch (error) {
        alert(error.response?.data?.message || "Error");
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete lead "${name}"?`)) {
      try {
        await deleteLeadApi(id);
        alert("Lead deleted!");
        fetchLeads();
      } catch (error) {
        alert(error.response?.data?.message || "Error");
      }
    }
  };

 const getStageBadge = (stage) => {
  const map = {
    new: "badge-info",
    fresh: "badge-info",         // ✅ ADD
    interested: "badge-primary",
    contacted: "badge-warning",  // ✅ CHANGED color
    follow_up: "badge-warning",
    proposal_sent: "badge-gold",
    negotiation: "badge-warning",
    hot_lead: "badge-danger",
    meeting_scheduled: "badge-primary",
    closed_won: "badge-success",
    closed_lost: "badge-danger",
    not_interested: "badge-danger",
  };
  return map[stage] || "badge-info";
};

  const getServiceLabel = (val) => {
    const found = SERVICE_OPTIONS.find((s) => s.value === val);
    return found ? found.label : val || "-";
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
        <h1 className="page-title">Leads</h1>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {/* ✅ Bulk update button (Lead Qualifier) */}
          {hasRole(["admin", "sales_manager", "lead_qualifier"]) &&
            selectedLeads.length > 0 && (
              <button
                className="btn btn-gold"
                onClick={() => setShowBulkModal(true)}
              >
                <FiCheckSquare /> Update {selectedLeads.length} Selected
              </button>
            )}

          {/* ✅ Create Lead (Admin & Manager) */}
          {hasRole(["admin", "sales_manager"]) && (
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateChoiceModal(true)}
            >
              <FiPlus /> Add Lead
            </button>
          )}
        </div>
      </div>

      {/* ✅ Auto Assign Info Banner */}
      {autoAssignInfo && (
        <div className="auto-assign-banner">
          <span>✅ {autoAssignInfo}</span>
          <button onClick={() => setAutoAssignInfo(null)}>✕</button>
        </div>
      )}

      {/* ─── Filters ────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: "16px" }}>
        <div className="filters-row">
          <form
            onSubmit={(e) => { e.preventDefault(); fetchLeads(); }}
            style={{ display: "flex", gap: "8px", flex: 1, flexWrap: "wrap" }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Search name, phone, email..."
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
            value={filters.current_stage}
            onChange={(e) =>
              setFilters({ ...filters, current_stage: e.target.value, page: 1 })
            }
            style={{ maxWidth: "160px" }}
          >
            <option value="">All Stages</option>
            <option value="new">New</option>
             <option value="fresh">Fresh</option>
            <option value="interested">Interested</option>
            <option value="contacted">Contacted</option>
            <option value="follow_up">Follow Up</option>
            <option value="hot_lead">Hot Lead</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="negotiation">Negotiation</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </select>

          <select
            className="form-select"
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value, page: 1 })
            }
            style={{ maxWidth: "140px" }}
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* ─── Table ──────────────────────────────────────── */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {/* ✅ Checkbox column for lead qualifier */}
              {hasRole(["admin", "sales_manager", "lead_qualifier"]) && (
                <th style={{ width: "40px" }}>
                  <button
                    onClick={toggleSelectAll}
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    {selectedLeads.length === leads.length && leads.length > 0 ? (
                      <FiCheckSquare />
                    ) : (
                      <FiSquare />
                    )}
                  </button>
                </th>
              )}
              <th>Lead ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Service</th>
              <th>Stage</th>
              <th>Priority</th>
              {!hasRole(["lead_qualifier"]) && <th>Assigned To</th>}
              {hasRole(["lead_qualifier"]) && <th>Assigned By</th>}
              <th>Calls</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td
                  colSpan="11"
                  style={{ textAlign: "center", padding: "50px" }}
                >
                  No leads found
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead._id}
                  className={
                    selectedLeads.includes(lead._id) ? "row-selected" : ""
                  }
                >
                  {/* Checkbox */}
                  {hasRole(["admin", "sales_manager", "lead_qualifier"]) && (
                    <td>
                      <button
                        onClick={() => toggleSelectLead(lead._id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "16px",
                          color: selectedLeads.includes(lead._id)
                            ? "#10443e"
                            : "#ccc",
                        }}
                      >
                        {selectedLeads.includes(lead._id) ? (
                          <FiCheckSquare />
                        ) : (
                          <FiSquare />
                        )}
                      </button>
                    </td>
                  )}
                  <td>
                    <strong style={{ color: "#10443e" }}>{lead.lead_id}</strong>
                  </td>
                  <td>{lead.lead_name}</td>
                  <td>
                    {/* ✅ Phone icon with call link */}
                    <a
                      href={`tel:${lead.contact_number}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#10443e",
                        textDecoration: "none",
                        fontWeight: "500",
                      }}
                    >
                      <FiPhone
                        style={{
                          background: "#e8f5f3",
                          padding: "4px",
                          borderRadius: "6px",
                          fontSize: "22px",
                          flexShrink: 0,
                        }}
                      />
                      {lead.contact_number}
                    </a>
                  </td>
                  {/* ✅ Service column instead of Business */}
                  <td>
                    <span className="badge badge-gold">
                      {getServiceLabel(lead.service_required)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStageBadge(lead.current_stage)}`}>
                      {lead.current_stage?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        lead.priority === "urgent"
                          ? "badge-danger"
                          : lead.priority === "high"
                          ? "badge-warning"
                          : "badge-info"
                      }`}
                    >
                      {lead.priority}
                    </span>
                  </td>
                 {!hasRole(["lead_qualifier"]) && (
                    <td>{lead.assigned_to_name || "Unassigned"}</td>
                  )}
                  {hasRole(["lead_qualifier"]) && (
                    <td>{lead.assigned_by_name || "-"}</td>
                  )}

                  <td>{lead.total_calls}</td>
                  <td>
                    <div className="action-btns">
                      {/* View */}
                      <button
                        className="btn btn-outline btn-sm"
                        title="View"
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowDetailModal(true);
                        }}
                      >
                        <FiEye />
                      </button>

                      {/* Edit */}
                      {hasRole(["admin", "sales_manager"]) && (
                        <button
                          className="btn btn-outline btn-sm"
                          title="Edit Lead"
                          onClick={() => openEditModal(lead)}
                        >
                          <FiEdit />
                        </button>
                      )}

                      {/* Update Status (Call Log) */}
                      {hasRole(["admin", "sales_manager", "lead_qualifier"]) && (
                        <button
                          className="btn btn-outline btn-sm"
                          title="Update Status"
                          onClick={() => {
                            setSelectedLead(lead);
                            // ✅ Pre-fill with EXISTING data from lead
                            setCallLogData({
                              calling_status: lead.calling_status === "pending" ? "interested" : (lead.calling_status || "interested"),
                              comment: lead.comment || "",
                              requirements: lead.requirements || "",
                              budget: lead.budget || "",
                              expected_closing_date: lead.next_follow_up_date
                                ? new Date(lead.next_follow_up_date).toISOString().split("T")[0]
                                : "",
                              priority: lead.priority === "medium" ? "" : (lead.priority || ""),
                              next_follow_up_date: lead.next_follow_up_date
                                ? new Date(lead.next_follow_up_date).toISOString().split("T")[0]
                                : "",
                            });
                            setShowCallLogModal(true);
                          }}
                        >
                          <FiPhone />
                        </button>
                      )}

                      {/* Assign */}
                      {hasRole(["admin", "sales_manager"]) && (
                        <button
                          className="btn btn-outline btn-sm"
                          title="Assign"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowAssignModal(true);
                          }}
                        >
                          <FiUserCheck />
                        </button>
                      )}

                      {/* Pass to Closer */}
                      {!lead.is_passed_to_closer &&
                        hasRole(["admin", "sales_manager", "lead_qualifier"]) && (
                          <button
                            className="btn btn-gold btn-sm"
                            title="Pass to Closer"
                            onClick={() => handlePassToCloser(lead)}
                          >
                            <FiArrowRight />
                          </button>
                        )}

                      {/* Delete */}
                      {hasRole(["admin", "sales_manager"]) && (
                        <button
                          className="btn btn-danger btn-sm"
                          title="Delete"
                          onClick={() => handleDelete(lead._id, lead.lead_name)}
                        >
                          <FiTrash2 />
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

      {/* ─── Pagination ──────────────────────────────────── */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              className={`pagination-btn ${
                pagination.currentPage === i + 1 ? "active" : ""
              }`}
              onClick={() => setFilters({ ...filters, page: i + 1 })}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* ✅ Create Choice Modal */}
      {showCreateChoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "480px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Lead</h3>
              <button
                className="modal-close"
                onClick={() => setShowCreateChoiceModal(false)}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "10px 0 20px" }}>
              <p
                style={{
                  color: "#797e88",
                  fontSize: "14px",
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                How would you like to add leads?
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Manual */}
                <div
                  className="choice-card"
                  onClick={() => {
                    setShowCreateChoiceModal(false);
                    setShowCreateModal(true);
                  }}
                >
                  <div className="choice-icon" style={{ background: "#e8f5f3", color: "#10443e" }}>
                    <FiPlus />
                  </div>
                  <h4>Create Manually</h4>
                  <p>Add a single lead by filling in the client details form</p>
                </div>

                {/* CSV */}
                <div
                  className="choice-card"
                  onClick={() => {
                    setShowCreateChoiceModal(false);
                    setCreateMode("csv");
                    setCsvResult(null);
                    setCsvFile(null);
                  }}
                >
                  <div className="choice-icon" style={{ background: "#f7e7ce", color: "#D4AF37" }}>
                    <FiUpload />
                  </div>
                  <h4>Upload CSV</h4>
                  <p>Import multiple leads at once using a CSV file</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ CSV Upload Modal */}
      {createMode === "csv" && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Upload CSV File</h3>
              <button
                className="modal-close"
                onClick={() => setCreateMode(null)}
              >
                ✕
              </button>
            </div>

            {csvResult ? (
              <div style={{ padding: "10px 0" }}>
                <div
                  style={{
                    background: "#d4edda",
                    color: "#155724",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  ✅ <strong>{csvResult.created} leads</strong> created
                  successfully!
                </div>
                {csvResult.errors && csvResult.errors.length > 0 && (
                  <div
                    style={{
                      background: "#fff3cd",
                      color: "#856404",
                      padding: "12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      marginBottom: "16px",
                    }}
                  >
                    <strong>Some rows had errors:</strong>
                    <ul style={{ margin: "8px 0 0 16px" }}>
                      {csvResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="modal-footer">
                  <button
                    className="btn btn-primary"
                    onClick={() => setCreateMode(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCSVUpload}>
                {/* Sample download */}
                <div
                  style={{
                    background: "#f0f7f6",
                    padding: "14px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    fontSize: "13px",
                    color: "#10443e",
                  }}
                >
                  <strong>CSV Format Required:</strong>
                  <br />
                  lead_name, contact_number, email, service_type,
                  lead_source, city, state, priority, requirements
                  <br />
                  <br />
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={downloadSampleCSV}
                  >
                    <FiDownload /> Download Sample CSV
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    className="form-input"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    required
                  />
                  {csvFile && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#10443e",
                        marginTop: "6px",
                      }}
                    >
                      ✅ Selected: {csvFile.name}
                    </p>
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setCreateMode(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={csvLoading}
                  >
                    {csvLoading ? "Uploading..." : "Upload & Create Leads"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ✅ Create Lead Modal (Manual) - Removed Business Type, Business Name, Budget */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "640px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Lead</h3>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateLead}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Client Name *</label>
                  <input
                    type="text"
                    name="lead_name"
                    className="form-input"
                    value={formData.lead_name}
                    onChange={handleChange}
                    required
                    placeholder="Full name of client"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="text"
                    name="contact_number"
                    className="form-input"
                    value={formData.contact_number}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    minLength={10}
                    pattern="[0-9]{10}"
                    placeholder="10 digit number"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="client@email.com"
                  />
                </div>
                {/* ✅ Service Type dropdown (4 options only) */}
                <div className="form-group">
                  <label className="form-label">Service Required *</label>
                  <select
                    name="service_required"
                    className="form-select"
                    value={formData.service_required}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Service</option>
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Lead Source</label>
                  <select
                    name="lead_source"
                    className="form-select"
                    value={formData.lead_source}
                    onChange={handleChange}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="referral">Referral</option>
                    <option value="website">Website</option>
                    <option value="cold_call">Cold Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <select
                    name="state"
                    className="form-select"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Edit Lead Modal ─────────────────────────────── */}
      {showEditModal && selectedLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3 className="modal-title">
                Edit Lead - {selectedLead.lead_id}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditLead}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Client Name *</label>
                  <input
                    type="text"
                    name="lead_name"
                    className="form-input"
                    value={editFormData.lead_name}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number *</label>
                  <input
                    type="text"
                    name="contact_number"
                    className="form-input"
                    value={editFormData.contact_number}
                    onChange={handleEditChange}
                    required
                    maxLength={10}
                    minLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={editFormData.email}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                <label className="form-label">Service Required</label>
                <select
                  name="service_required"
                  className="form-select"
                  value={editFormData.service_required}
                  onChange={handleEditChange}
                >
                  <option value="">Select Service</option>
                  {SERVICE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Current Stage</label>
                  <select
                    name="current_stage"
                    className="form-select"
                    value={editFormData.current_stage}
                    onChange={handleEditChange}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="interested">Interested</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="follow_up">Follow Up</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="hot_lead">Hot Lead</option>
                    <option value="meeting_scheduled">Meeting Scheduled</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    name="priority"
                    className="form-select"
                    value={editFormData.priority}
                    onChange={handleEditChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Budget (₹)</label>
                  <input
                    type="text"
                    name="budget"
                    className="form-input"
                    value={editFormData.budget}
                    onChange={handleEditChange}
                    placeholder="Client budget"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Lead Source</label>
                  <select
                    name="lead_source"
                    className="form-select"
                    value={editFormData.lead_source}
                    onChange={handleEditChange}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="referral">Referral</option>
                    <option value="website">Website</option>
                    <option value="cold_call">Cold Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    value={editFormData.city}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <select
                    name="state"
                    className="form-select"
                    value={editFormData.state}
                    onChange={handleEditChange}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Calling Status</label>
                  <select
                    name="calling_status"
                    className="form-select"
                    value={editFormData.calling_status}
                    onChange={handleEditChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="interested">Interested</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="busy">Busy</option>
                    <option value="switched_off">Switched Off</option>
                    <option value="no_answer">No Answer</option>
                    <option value="cut_call">Cut Call</option>
                    <option value="wrong_number">Wrong Number</option>
                    <option value="callback_requested">Callback Requested</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Next Follow Up Date</label>
                  <input
                    type="date"
                    name="next_follow_up_date"
                    className="form-input"
                    value={editFormData.next_follow_up_date}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                  name="comment"
                  className="form-input"
                  rows="2"
                  value={editFormData.comment}
                  onChange={handleEditChange}
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ────────────────────────────────── */}
      {showDetailModal && selectedLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedLead.lead_id} — {selectedLead.lead_name}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <label>Contact</label>
                <a
                  href={`tel:${selectedLead.contact_number}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#10443e",
                    textDecoration: "none",
                  }}
                >
                  <FiPhone /> {selectedLead.contact_number}
                </a>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <span>{selectedLead.email || "-"}</span>
              </div>
              <div className="detail-item">
                <label>Service Required</label>
                <span>{getServiceLabel(selectedLead.service_required)}</span>
              </div>

              {/* After detail-grid, BEFORE call history, ADD this section */}
              {selectedLead.requirements && (
                <div style={{ marginTop: "16px", padding: "12px", background: "#f0f7f6", borderRadius: "8px" }}>
                  <label className="form-label" style={{ fontWeight: "600", color: "#10443e" }}>
                    📋 Detailed Requirements (from client)
                  </label>
                  <p style={{ fontSize: "13px", marginTop: "6px" }}>
                    {selectedLead.requirements}
                  </p>
                </div>
              )}
              
              <div className="detail-item">
                <label>Stage</label>
                <span className={`badge ${getStageBadge(selectedLead.current_stage)}`}>
                  {selectedLead.current_stage?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="detail-item">
                <label>Priority</label>
                <span>{selectedLead.priority}</span>
              </div>
              <div className="detail-item">
                <label>Assigned To</label>
                <span>{selectedLead.assigned_to_name || "Unassigned"}</span>
              </div>
              <div className="detail-item">
                <label>Assigned By</label>
                <span>{selectedLead.assigned_by_name || "-"}</span>
              </div>
              <div className="detail-item">
                <label>Budget</label>
                <span>{selectedLead.budget ? `₹${selectedLead.budget}` : "-"}</span>
              </div>
              <div className="detail-item">
                <label>Lead Source</label>
                <span>{selectedLead.lead_source}</span>
              </div>
              <div className="detail-item">
                <label>Total Calls</label>
                <span>{selectedLead.total_calls}</span>
              </div>
              <div className="detail-item">
                <label>City</label>
                <span>{selectedLead.city || "-"}</span>
              </div>
              <div className="detail-item">
                <label>State</label>
                <span>{selectedLead.state || "-"}</span>
              </div>
            </div>

            {/* ✅ Latest Call Only for Lead Qualifier */}
            {selectedLead.call_history && selectedLead.call_history.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h4 style={{ marginBottom: "10px", fontSize: "14px" }}>
                  {hasRole(["lead_qualifier"])
                    ? "Latest Call Update"
                    : `Call History (${selectedLead.call_history.length} calls)`}
                </h4>

                {/* For Lead Qualifier: show only last 1 call */}
                {hasRole(["lead_qualifier"]) ? (
                  (() => {
                    const latestCall = [...selectedLead.call_history].reverse()[0];
                    return (
                      <div className="call-history-item">
                        <div className="call-history-header">
                          <span className="badge badge-info">
                            {latestCall.calling_status?.replace(/_/g, " ")}
                          </span>
                          <span style={{ fontSize: "12px", color: "#797e88" }}>
                            {new Date(latestCall.call_date).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(latestCall.call_date).toLocaleTimeString("en-IN", {
                              hour: "2-digit", minute: "2-digit", hour12: true,
                            })}
                          </span>
                        </div>
                        <p style={{ marginTop: "6px", fontSize: "13px" }}>
                          {latestCall.comment}
                        </p>
                        <small style={{ color: "#797e88" }}>
                          By: {latestCall.called_by_name}
                        </small>
                      </div>
                    );
                  })()
                ) : (
                  // For Admin/Manager: show all calls newest first
                  [...selectedLead.call_history]
                    .reverse()
                    .map((call, index) => (
                      <div key={index} className="call-history-item">
                        <div className="call-history-header">
                          <span className="badge badge-info">
                            {call.calling_status?.replace(/_/g, " ")}
                          </span>
                          <span style={{ fontSize: "12px", color: "#797e88" }}>
                            {new Date(call.call_date).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(call.call_date).toLocaleTimeString("en-IN", {
                              hour: "2-digit", minute: "2-digit", hour12: true,
                            })}
                          </span>
                        </div>
                        <p style={{ marginTop: "6px", fontSize: "13px" }}>
                          {call.comment}
                        </p>
                        <small style={{ color: "#797e88" }}>
                          By: {call.called_by_name}
                        </small>
                      </div>
                    ))
                )}
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

      {/* ─── Assign Modal ────────────────────────────────── */}
      {showAssignModal && selectedLead && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                Assign "{selectedLead.lead_name}"
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowAssignModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label className="form-label">Select Lead Qualifier</label>
                <select
                  className="form-select"
                  value={assignData.qualifier_id}
                  onChange={(e) =>
                    setAssignData({ qualifier_id: e.target.value })
                  }
                  required
                >
                  <option value="">Choose qualifier...</option>
                  {qualifiers.map((q) => (
                    <option key={q._id} value={q._id}>
                      {q.name} ({q.employee_id})
                    </option>
                  ))}
                </select>
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
                  Assign Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Update Status Modal (Call Log) - Updated fields */}
      {showCallLogModal && selectedLead && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#e8f5f3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#10443e",
                    fontSize: "18px",
                  }}
                >
                  <FiPhone />
                </div>
                <div>
                  <h3 className="modal-title" style={{ marginBottom: "2px" }}>
                    Update Status
                  </h3>
                  <p style={{ fontSize: "12px", color: "#797e88", margin: 0 }}>
                    {selectedLead.lead_name} — {selectedLead.lead_id}
                  </p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowCallLogModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCallLog}>
             {/* In the Update Status modal (Call Log Modal), replace the status dropdown with: */}
                   {selectedLead.service_required && (
                    <div
                      style={{
                        background: "#f7e7ce",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        fontSize: "13px",
                        color: "#856404",
                      }}
                    >
                      💼 Service Required:{" "}
                      <strong>
                        {getServiceLabel(selectedLead.service_required)}
                      </strong>
                      <div style={{ fontSize: "11px", marginTop: "4px", color: "#797e88" }}>
                        (Set by {selectedLead.created_by_name || "Admin"})
                      </div>
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label className="form-label">Call Status *</label>
                    <select
                      className="form-select"
                      value={callLogData.calling_status}
                      onChange={(e) =>
                        setCallLogData({
                          ...callLogData,
                          calling_status: e.target.value,
                        })
                      }
                    >
                      <option value="interested">Interested</option>
                      <option value="not_interested">Not Interested</option>
                      <option value="callback_requested">Callback Requested</option>
                      <option value="no_answer">No Answer</option>
                    </select>
                  </div>

                  {/* ✅ Add Priority dropdown AFTER calling status */}
                  <div className="form-group">
                    <label className="form-label">Lead Priority</label>
                    <select
                      className="form-select"
                      value={callLogData.priority || ""}
                      onChange={(e) => {
                        setCallLogData({ ...callLogData, priority: e.target.value });
                      }}
                    >
                      <option value="">-- Select Priority --</option>
                      <option value="low">Low</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                      <option value="hot">Hot 🔥</option>
                    </select>
                  </div>

                  {/* ✅ Show Follow Up Date when priority is "low" and status is "not_interested" */}
                  {callLogData.priority === "low" && callLogData.calling_status === "not_interested" && (
                    <div className="form-group">
                      <label className="form-label">
                        Next Follow Up Date *
                        <span style={{ color: "#D4AF37", fontSize: "11px", marginLeft: "6px" }}>
                          (Low priority - schedule follow up)
                        </span>
                      </label>
                      <input
                        type="date"
                        className="form-input"
                        value={callLogData.next_follow_up_date || ""}
                        onChange={(e) =>
                          setCallLogData({
                            ...callLogData,
                            next_follow_up_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  )}

              {/* ✅ Requirements from client */}
              <div className="form-group">
                <label className="form-label">
                  Client Requirements
                  <span style={{ color: "#797e88", fontSize: "11px", marginLeft: "6px" }}>
                    (what exactly does client need?)
                  </span>
                </label>
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="e.g. Need 10 reels edited per month, 30 sec each, with subtitles"
                  value={callLogData.requirements}
                  onChange={(e) =>
                    setCallLogData({
                      ...callLogData,
                      requirements: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              {/* ✅ Budget from client */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Budget (₹)
                    <span style={{ color: "#797e88", fontSize: "11px", marginLeft: "6px" }}>
                      (client's budget)
                    </span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 15000"
                    value={callLogData.budget}
                    onChange={(e) =>
                      setCallLogData({ ...callLogData, budget: e.target.value })
                    }
                  />
                </div>

                {/* ✅ Expected Closing Date */}
                <div className="form-group">
                  <label className="form-label">
                    Expected Closing Date
                    <span style={{ color: "#797e88", fontSize: "11px", marginLeft: "6px" }}>
                      (when client might decide)
                    </span>
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={callLogData.expected_closing_date}
                    onChange={(e) =>
                      setCallLogData({
                        ...callLogData,
                        expected_closing_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Comment */}
              <div className="form-group">
                <label className="form-label">Call Notes *</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="What happened during the call? Key points discussed..."
                  value={callLogData.comment}
                  onChange={(e) =>
                    setCallLogData({ ...callLogData, comment: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowCallLogModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Bulk Update Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "460px" }}>
            <div className="modal-header">
              <h3 className="modal-title">
                Bulk Update — {selectedLeads.length} Leads Selected
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowBulkModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkUpdate}>
              <p
                style={{
                  fontSize: "13px",
                  color: "#797e88",
                  marginBottom: "16px",
                }}
              >
                Update the same status for all {selectedLeads.length} selected
                leads at once.
              </p>

              <div className="form-group">
                <label className="form-label">Calling Status</label>
                <select
                  className="form-select"
                  value={bulkData.calling_status}
                  onChange={(e) =>
                    setBulkData({ ...bulkData, calling_status: e.target.value })
                  }
                >
                  <option value="">-- Select Status --</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="busy">Busy</option>
                  <option value="switched_off">Switched Off</option>
                  <option value="no_answer">No Answer</option>
                  <option value="cut_call">Cut Call</option>
                  <option value="wrong_number">Wrong Number</option>
                  <option value="callback_requested">Callback Requested</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Lead Stage</label>
                <select
                  className="form-select"
                  value={bulkData.current_stage}
                  onChange={(e) =>
                    setBulkData({ ...bulkData, current_stage: e.target.value })
                  }
                >
                  <option value="">-- Select Stage --</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="interested">Interested</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="follow_up">Follow Up</option>
                  <option value="hot_lead">Hot Lead</option>
                  <option value="closed_lost">Closed Lost</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Optional comment for all selected leads"
                  value={bulkData.comment}
                  onChange={(e) =>
                    setBulkData({ ...bulkData, comment: e.target.value })
                  }
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowBulkModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update {selectedLeads.length} Leads
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;