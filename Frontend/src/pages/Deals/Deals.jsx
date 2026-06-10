import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getAllDealsApi,
  createDealApi,
  updateDealApi,
  deleteDealApi,
  addMeetingApi,
} from "../../api/dealApi.js";

import {
  createOnboardingApi,
  getAllOnboardingsApi,
  updateOnboardingApi,
} from "../../api/onboardingApi.js";
import { getAllLeadsApi } from "../../api/leadApi.js";
import { getAllUsersApi } from "../../api/authApi.js";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiEye,
} from "react-icons/fi";

const Deals = () => {
  const { hasRole } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closers, setClosers] = useState([]);
  const [passedLeads, setPassedLeads] = useState([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [closedDeal, setClosedDeal] = useState(null);
  const [onboardingData, setOnboardingData] = useState({
    client_name: "",
    contact_number: "",
    alternate_contact: "",
    email: "",
    business_name: "",
    business_type: "",
    website: "",
    service_type: "video_editing",
    service_details: "",
    project_scope: "",
    deliverables: "",
    timeline: "",
    total_amount: 0,
    amount_paid: 0,
    payment_status: "partially_paid",
    payment_method: "upi",
    invoice_number: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    project_start_date: "",
    project_deadline: "",
    client_requirements: "",
    special_instructions: "",
    preferred_communication: "whatsapp",
  });

  const [createData, setCreateData] = useState({
    lead_id: "",
    sales_closer_id: "",
    deal_value: "",
    expected_closure_date: "",
    notes: "",
  });

  const [updateData, setUpdateData] = useState({
    deal_stage: "",
    deal_value: "",
    notes: "",
    closer_comment: "",
    qualifier_visible_notes: "",
    payment_status: "",
    payment_amount: "",
  });

  const [meetingData, setMeetingData] = useState({
    meeting_title: "",
    meeting_date: "",
    meeting_time: "",
    meeting_type: "video_call",
    meeting_link: "",
    meeting_notes: "",
  });

  useEffect(() => {
    fetchDeals();
    if (hasRole(["admin", "sales_manager"])) {
      fetchClosers();
      fetchPassedLeads();
    }
  }, []);

  const fetchDeals = async () => {
    try {
      const res = await getAllDealsApi();
      setDeals(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClosers = async () => {
    try {
      const res = await getAllUsersApi({ role: "sales_closer" });
      setClosers(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchPassedLeads = async () => {
    try {
      const res = await getAllLeadsApi({ is_passed_to_closer: "true" });
      setPassedLeads(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      await createDealApi(createData);
      alert("Deal created successfully!");
      setShowCreateModal(false);
      setCreateData({
        lead_id: "",
        sales_closer_id: "",
        deal_value: "",
        expected_closure_date: "",
        notes: "",
      });
      fetchDeals();
    } catch (error) {
      alert(error.response?.data?.message || "Error creating deal");
    }
  };

 const handleUpdateDeal = async (e) => {
  e.preventDefault();
  try {
    const dataToSend = {};
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== "" && updateData[key] !== undefined) {
        dataToSend[key] = updateData[key];
      }
    });
    await updateDealApi(selectedDeal._id, dataToSend);
    // ✅ Show specific alert based on stage
    if (updateData.deal_stage === "closed_won") {
      alert("🎉 Deal closed as WON! Client moved to Onboarding section. You can fill onboarding details now or skip and fill later from Onboarding section.");
    } else if (updateData.deal_stage === "closed_lost") {
      alert("Deal marked as LOST.");
    } else {
      alert("Deal updated!");
    }
    setShowUpdateModal(false);

    // ✅ If closed as WON - open onboarding form for closer
    if (
    updateData.deal_stage === "closed_won" &&
      hasRole(["sales_closer", "admin", "sales_manager"])
    ) {
      // ✅ Fetch full lead data to pre-fill onboarding form
      const leadData = selectedDeal.lead_ref || {};
      setClosedDeal(selectedDeal);
      setOnboardingData({
        client_name: selectedDeal.client_name || "",
        contact_number: selectedDeal.contact_number || "",
        alternate_contact: leadData.alternate_contact || "",
        email: selectedDeal.email || "",
        business_name: selectedDeal.business_name || "",
        business_type: selectedDeal.business_type || "",
        website: leadData.website || "",
        service_type: leadData.service_required || "video_editing",
        service_details: selectedDeal.notes || leadData.requirements || "",
        project_scope: "",
        deliverables: "",
        timeline: "",
        total_amount: updateData.deal_value || selectedDeal.deal_value || 0,
        amount_paid: updateData.payment_amount || 0,
        payment_status: updateData.payment_status || "not_received",
        payment_method: "upi",
        invoice_number: "",
        address: "",
        city: leadData.city || "",
        state: leadData.state || "",
        pincode: "",
        project_start_date: "",
        project_deadline: "",
        client_requirements: leadData.requirements || "",
        special_instructions: "",
        preferred_communication: "whatsapp",
        social_media_manager_name: "",
      });
      setShowOnboardingModal(true);
    }

    fetchDeals();
  } catch (error) {
    alert(error.response?.data?.message || "Error updating deal");
  }
};

// ✅ Submit onboarding form
const handleOnboardingSubmit = async (e) => {
  e.preventDefault();
  try {
    // ✅ Backend already auto-created onboarding when deal was closed
    // So we need to UPDATE the existing one, not create new
    const allOnboardings = await getAllOnboardingsApi();
    const existing = allOnboardings.data.data.find(
      (o) =>
        o.deal_ref?._id === closedDeal._id ||
        o.deal_ref === closedDeal._id
    );

    if (existing) {
      // Update existing onboarding with detailed form data
      await updateOnboardingApi(existing._id, onboardingData);
      alert("✅ Onboarding details saved successfully!");
    } else {
      // Fallback - create new (shouldn't normally happen)
      await createOnboardingApi({
        ...onboardingData,
        deal_id: closedDeal._id,
      });
      alert("✅ Onboarding created successfully!");
    }

    setShowOnboardingModal(false);
    fetchDeals();
  } catch (error) {
    alert(error.response?.data?.message || "Error saving onboarding");
  }
};

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    try {
      await addMeetingApi(selectedDeal._id, meetingData);
      alert("Meeting added!");
      setShowMeetingModal(false);
      setMeetingData({
        meeting_title: "",
        meeting_date: "",
        meeting_time: "",
        meeting_type: "video_call",
        meeting_link: "",
        meeting_notes: "",
      });
      fetchDeals();
    } catch (error) {
      alert(error.response?.data?.message || "Error adding meeting");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this deal?")) {
      try {
        await deleteDealApi(id);
        alert("Deal deleted!");
        fetchDeals();
      } catch (error) {
        alert(error.response?.data?.message || "Error");
      }
    }
  };

  const getStageBadge = (stage) => {
    const map = {
      meeting_scheduled: "badge-info",
      meeting_done: "badge-primary",
      proposal_sent: "badge-gold",
      negotiation: "badge-warning",
      verbal_confirmation: "badge-info",
      payment_pending: "badge-warning",
      closed_won: "badge-success",
      closed_lost: "badge-danger",
      on_hold: "badge-danger",
    };
    return map[stage] || "badge-info";
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
        <h1 className="page-title">Deals Pipeline</h1>
        {hasRole(["admin", "sales_manager"]) && (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FiPlus /> Create Deal
          </button>
        )}
      </div>

      {/* ─── Deals Table ───────────────────────────────────── */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Deal ID</th>
              <th>Client</th>
              <th>Contact</th>
              <th>Stage</th>
              <th>Value</th>
              <th>Payment</th>
              <th>Closer</th>
              <th>Meetings</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "40px" }}>
                  No deals found
                </td>
              </tr>
            ) : (
              deals.map((deal) => (
                <tr key={deal._id}>
                  <td>
                    <strong>{deal.deal_id}</strong>
                  </td>
                  <td>{deal.client_name}</td>
                  <td>{deal.contact_number}</td>
                  <td>
                    <span
                      className={`badge ${getStageBadge(deal.deal_stage)}`}
                    >
                      {deal.deal_stage?.replace("_", " ")}
                    </span>
                  </td>
                  <td>₹{deal.deal_value?.toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge ${
                        deal.payment_status === "fully_paid"
                          ? "badge-success"
                          : deal.payment_status === "partially_paid"
                          ? "badge-warning"
                          : "badge-danger"
                      }`}
                    >
                      {deal.payment_status?.replace("_", " ")}
                    </span>
                  </td>
                  <td>{deal.assigned_to_name}</td>
                  <td>{deal.meetings?.length || 0}</td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setSelectedDeal(deal);
                          setShowDetailModal(true);
                        }}
                      >
                        <FiEye />
                      </button>

                      {hasRole(["admin", "sales_manager", "sales_closer"]) && (
                        <>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => {
                              setSelectedDeal(deal);
                              setUpdateData({
                                deal_stage: deal.deal_stage,
                                deal_value: deal.deal_value,
                                notes: deal.notes || "",
                                closer_comment: deal.closer_comment || "",
                                qualifier_visible_notes:
                                  deal.qualifier_visible_notes || "",
                                payment_status: deal.payment_status,
                                payment_amount: deal.payment_amount || "",
                              });
                              setShowUpdateModal(true);
                            }}
                          >
                            <FiEdit />
                          </button>

                          <button
                            className="btn btn-gold btn-sm"
                            onClick={() => {
                              setSelectedDeal(deal);
                              setShowMeetingModal(true);
                            }}
                          >
                            <FiCalendar />
                          </button>
                        </>
                      )}

                      {hasRole(["admin"]) && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(deal._id)}
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

      {/* ─── Create Deal Modal ─────────────────────────────── */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Create New Deal</h3>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDeal}>
              <div className="form-group">
                <label className="form-label">Select Lead</label>
                <select
                  className="form-select"
                  value={createData.lead_id}
                  onChange={(e) =>
                    setCreateData({ ...createData, lead_id: e.target.value })
                  }
                  required
                >
                  <option value="">Choose lead...</option>
                  {passedLeads.map((lead) => (
                    <option key={lead._id} value={lead._id}>
                      {lead.lead_id} - {lead.lead_name} ({lead.contact_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Sales Closer</label>
                <select
                  className="form-select"
                  value={createData.sales_closer_id}
                  onChange={(e) =>
                    setCreateData({
                      ...createData,
                      sales_closer_id: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Choose closer...</option>
                  {closers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Deal Value (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={createData.deal_value}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        deal_value: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Closure Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={createData.expected_closure_date}
                    onChange={(e) =>
                      setCreateData({
                        ...createData,
                        expected_closure_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={createData.notes}
                  onChange={(e) =>
                    setCreateData({ ...createData, notes: e.target.value })
                  }
                ></textarea>
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
                  Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Deal Detail Modal ─────────────────────────────── */}
      {showDetailModal && selectedDeal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "700px" }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedDeal.deal_id} - {selectedDeal.client_name}
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
                <label>Stage</label>
                <span
                  className={`badge ${getStageBadge(selectedDeal.deal_stage)}`}
                >
                  {selectedDeal.deal_stage?.replace("_", " ")}
                </span>
              </div>
              <div className="detail-item">
                <label>Deal Value</label>
                <span>₹{selectedDeal.deal_value?.toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Payment Status</label>
                <span>{selectedDeal.payment_status?.replace("_", " ")}</span>
              </div>
              <div className="detail-item">
                <label>Closer</label>
                <span>{selectedDeal.assigned_to_name}</span>
              </div>
              <div className="detail-item">
                <label>Contact</label>
                <span>{selectedDeal.contact_number}</span>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <span>{selectedDeal.email || "-"}</span>
              </div>
              <div className="detail-item">
              <label>Lead Qualifier</label>
              <span>{selectedDeal.qualifier_name || "-"}</span>
            </div>
            </div>

            {selectedDeal.notes && (
              <div style={{ marginTop: "16px" }}>
                <label className="form-label">Notes</label>
                <p>{selectedDeal.notes}</p>
              </div>
            )}

            {selectedDeal.qualifier_visible_notes && (
              <div
                style={{
                  marginTop: "16px",
                  background: "#f7e7ce",
                  padding: "12px",
                  borderRadius: "6px",
                }}
              >
                <label className="form-label">Update for Lead Qualifier</label>
                <p>{selectedDeal.qualifier_visible_notes}</p>
              </div>
            )}

            {/* Meetings */}
            {selectedDeal.meetings && selectedDeal.meetings.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <h4 style={{ marginBottom: "10px" }}>Meetings</h4>
                {selectedDeal.meetings.map((meeting, index) => (
                  <div
                    key={index}
                    style={{
                      background: "#f8f8f8",
                      padding: "12px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <strong>{meeting.meeting_title}</strong>
                      <span className="badge badge-info">
                        {meeting.meeting_outcome || "pending"}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px" }}>
                      📅 {new Date(meeting.meeting_date).toLocaleDateString()}{" "}
                      {meeting.meeting_time && `at ${meeting.meeting_time}`}
                    </p>
                    <p style={{ fontSize: "13px" }}>
                      Type: {meeting.meeting_type?.replace("_", " ")}
                    </p>
                    {meeting.meeting_notes && (
                      <p style={{ fontSize: "13px", marginTop: "4px" }}>
                        {meeting.meeting_notes}
                      </p>
                    )}
                  </div>
                ))}
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

      {/* ─── Update Deal Modal ─────────────────────────────── */}
      {showUpdateModal && selectedDeal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                Update {selectedDeal.deal_id}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowUpdateModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateDeal}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Deal Stage</label>
                  <select
                    className="form-select"
                    value={updateData.deal_stage}
                    onChange={(e) =>
                      setUpdateData({ ...updateData, deal_stage: e.target.value })
                    }
                  >
                    {hasRole(["sales_closer"]) ? (
                      <>
                        <option value="">-- Select Stage --</option>
                        <option value="closed_won">Closed Won ✅</option>
                        <option value="closed_lost">Closed Lost ❌</option>
                      </>
                    ) : (
                      <>
                        <option value="meeting_scheduled">Meeting Scheduled</option>
                        <option value="meeting_done">Meeting Done</option>
                        <option value="proposal_sent">Proposal Sent</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="verbal_confirmation">Verbal Confirmation</option>
                        <option value="payment_pending">Payment Pending</option>
                        <option value="closed_won">Closed Won ✅</option>
                        <option value="closed_lost">Closed Lost ❌</option>
                        <option value="on_hold">On Hold</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Deal Value (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={updateData.deal_value}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        deal_value: e.target.value,
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
                    value={updateData.payment_status}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
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
                  <label className="form-label">Payment Amount (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={updateData.payment_amount}
                    onChange={(e) =>
                      setUpdateData({
                        ...updateData,
                        payment_amount: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Closer Comment</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={updateData.closer_comment}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      closer_comment: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Notes for Lead Qualifier (they can see this)
                </label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={updateData.qualifier_visible_notes}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      qualifier_visible_notes: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add Meeting Modal ─────────────────────────────── */}
      {showMeetingModal && selectedDeal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                Add Meeting - {selectedDeal.client_name}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowMeetingModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMeeting}>
              <div className="form-group">
                <label className="form-label">Meeting Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={meetingData.meeting_title}
                  onChange={(e) =>
                    setMeetingData({
                      ...meetingData,
                      meeting_title: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={meetingData.meeting_date}
                    onChange={(e) =>
                      setMeetingData({
                        ...meetingData,
                        meeting_date: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., 11:00 AM"
                    value={meetingData.meeting_time}
                    onChange={(e) =>
                      setMeetingData({
                        ...meetingData,
                        meeting_time: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Meeting Type</label>
                  <select
                    className="form-select"
                    value={meetingData.meeting_type}
                    onChange={(e) =>
                      setMeetingData({
                        ...meetingData,
                        meeting_type: e.target.value,
                      })
                    }
                  >
                    <option value="video_call">Video Call</option>
                    <option value="phone_call">Phone Call</option>
                    <option value="in_person">In Person</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Meeting Link</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://meet.google.com/..."
                    value={meetingData.meeting_link}
                    onChange={(e) =>
                      setMeetingData({
                        ...meetingData,
                        meeting_link: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Meeting Notes</label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={meetingData.meeting_notes}
                  onChange={(e) =>
                    setMeetingData({
                      ...meetingData,
                      meeting_notes: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowMeetingModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── ONBOARDING FORM MODAL (after deal close) ──────── */}
{showOnboardingModal && closedDeal && (
  <div className="modal-overlay">
    <div className="modal-content" style={{ maxWidth: "780px" }}>
      <div className="modal-header">
        <h3 className="modal-title">
          🎉 Client Onboarding — {closedDeal.client_name}
        </h3>
        <button
          className="modal-close"
          onClick={() => setShowOnboardingModal(false)}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          background: "#d4edda",
          padding: "10px 14px",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "13px",
          color: "#155724",
        }}
      >
        ✅ Deal closed! Please fill onboarding details to handover to team.
      </div>

      <form onSubmit={handleOnboardingSubmit}>
        {/* Client Info */}
        <h4 style={{ fontSize: "14px", color: "#10443e", marginBottom: "10px" }}>
          Client Information
        </h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input
              type="text"
              className="form-input"
              value={onboardingData.client_name}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, client_name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Number *</label>
            <input
              type="text"
              className="form-input"
              value={onboardingData.contact_number}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, contact_number: e.target.value })
              }
              required
              maxLength={10}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Alternate Contact</label>
            <input
              type="text"
              className="form-input"
              value={onboardingData.alternate_contact}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, alternate_contact: e.target.value })
              }
              maxLength={10}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={onboardingData.email}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, email: e.target.value })
              }
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Business Name</label>
            <input
              type="text"
              className="form-input"
              value={onboardingData.business_name}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, business_name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Website</label>
            <input
              type="text"
              className="form-input"
              value={onboardingData.website}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, website: e.target.value })
              }
            />
          </div>
        </div>

        {/* Service Info */}
        <h4 style={{ fontSize: "14px", color: "#10443e", marginBottom: "10px", marginTop: "16px" }}>
          Service Details
        </h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Service Type *</label>
            <select
              className="form-select"
              value={onboardingData.service_type}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, service_type: e.target.value })
              }
              required
            >
             <option value="video_shoot">Video Shoot</option>
            <option value="video_editing">Video Editing</option>
            <option value="web_development">Web Development</option>
            </select>
          </div>
          {/* ✅ Show only when service is video_editing */}
          {onboardingData.service_type === "video_editing" && (
            <div className="form-group">
              <label className="form-label">
                Social Media Manager Name
                <span style={{ color: "#797e88", fontSize: "11px", marginLeft: "6px" }}>
                  (Optional - for managing client's social media)
                </span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Priya Sharma"
                value={onboardingData.social_media_manager_name || ""}
                onChange={(e) =>
                  setOnboardingData({
                    ...onboardingData,
                    social_media_manager_name: e.target.value,
                  })
                }
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Timeline</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. 2 weeks, 1 month"
              value={onboardingData.timeline}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, timeline: e.target.value })
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Service Details *</label>
          <textarea
            className="form-input"
            rows="2"
            placeholder="Detailed description of services agreed..."
            value={onboardingData.service_details}
            onChange={(e) =>
              setOnboardingData({ ...onboardingData, service_details: e.target.value })
            }
          ></textarea>
        </div>

        <div className="form-group">
          <label className="form-label">Deliverables</label>
          <textarea
            className="form-input"
            rows="2"
            placeholder="What will be delivered to client..."
            value={onboardingData.deliverables}
            onChange={(e) =>
              setOnboardingData({ ...onboardingData, deliverables: e.target.value })
            }
          ></textarea>
        </div>

        <div className="form-group">
          <label className="form-label">Client Requirements</label>
          <textarea
            className="form-input"
            rows="2"
            placeholder="Specific requirements from client..."
            value={onboardingData.client_requirements}
            onChange={(e) =>
              setOnboardingData({ ...onboardingData, client_requirements: e.target.value })
            }
          ></textarea>
        </div>

        {/* Payment Info */}
        <h4 style={{ fontSize: "14px", color: "#10443e", marginBottom: "10px", marginTop: "16px" }}>
          Payment Information
        </h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Total Amount (₹) *</label>
            <input
              type="number"
              className="form-input"
              value={onboardingData.total_amount}
              onChange={(e) =>
                setOnboardingData({
                  ...onboardingData,
                  total_amount: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount Paid (₹)</label>
            <input
              type="number"
              className="form-input"
              value={onboardingData.amount_paid}
              onChange={(e) =>
                setOnboardingData({
                  ...onboardingData,
                  amount_paid: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Payment Status *</label>
            <select
              className="form-select"
              value={onboardingData.payment_status}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, payment_status: e.target.value })
              }
              required
            >
              <option value="partially_paid">Partially Paid</option>
              <option value="fully_paid">Fully Paid</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              value={onboardingData.payment_method}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, payment_method: e.target.value })
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

        <div className="form-group">
          <label className="form-label">Invoice Number</label>
          <input
            type="text"
            className="form-input"
            value={onboardingData.invoice_number}
            onChange={(e) =>
              setOnboardingData({ ...onboardingData, invoice_number: e.target.value })
            }
          />
        </div>

        {/* Project Info */}
        <h4 style={{ fontSize: "14px", color: "#10443e", marginBottom: "10px", marginTop: "16px" }}>
          Project Schedule
        </h4>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Project Start Date</label>
            <input
              type="date"
              className="form-input"
              value={onboardingData.project_start_date}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, project_start_date: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">Project Deadline</label>
            <input
              type="date"
              className="form-input"
              value={onboardingData.project_deadline}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, project_deadline: e.target.value })
              }
            />
          </div>
        </div>

        {/* Address */}
        <h4 style={{ fontSize: "14px", color: "#10443e", marginBottom: "10px", marginTop: "16px" }}>
          Address
        </h4>
        <div className="form-group">
          <label className="form-label">Address</label>
          <textarea
            className="form-input"
            rows="2"
            value={onboardingData.address}
            onChange={(e) =>
              setOnboardingData({ ...onboardingData, address: e.target.value })
            }
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">City</label>
            <input
              type="text"
              className="form-input"
              value={onboardingData.city}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, city: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label className="form-label">State</label>
            <input
              type="text"
              className="form-input"
              value={onboardingData.state}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, state: e.target.value })
              }
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Pincode</label>
            <input
              type="text"
              className="form-input"
              value={onboardingData.pincode}
              onChange={(e) =>
                setOnboardingData({ ...onboardingData, pincode: e.target.value })
              }
              maxLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Preferred Communication</label>
            <select
              className="form-select"
              value={onboardingData.preferred_communication}
              onChange={(e) =>
                setOnboardingData({
                  ...onboardingData,
                  preferred_communication: e.target.value,
                })
              }
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Special Instructions</label>
          <textarea
            className="form-input"
            rows="2"
            value={onboardingData.special_instructions}
            onChange={(e) =>
              setOnboardingData({
                ...onboardingData,
                special_instructions: e.target.value,
              })
            }
          ></textarea>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowOnboardingModal(false)}
          >
            Skip for Now
          </button>
          <button type="submit" className="btn btn-primary">
            Complete Onboarding
          </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deals;