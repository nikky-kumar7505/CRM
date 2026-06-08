import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  getAllDealsApi,
  createDealApi,
  updateDealApi,
  deleteDealApi,
  addMeetingApi,
} from "../../api/dealApi.js";
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
      alert("Deal updated!");
      setShowUpdateModal(false);
      fetchDeals();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating deal");
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
                      setUpdateData({
                        ...updateData,
                        deal_stage: e.target.value,
                      })
                    }
                  >
                    <option value="meeting_scheduled">
                      Meeting Scheduled
                    </option>
                    <option value="meeting_done">Meeting Done</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="verbal_confirmation">
                      Verbal Confirmation
                    </option>
                    <option value="payment_pending">Payment Pending</option>
                    <option value="closed_won">Closed Won ✅</option>
                    <option value="closed_lost">Closed Lost ❌</option>
                    <option value="on_hold">On Hold</option>
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
                    <option value="not_paid">Not Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="fully_paid">Fully Paid</option>
                    <option value="refunded">Refunded</option>
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
    </div>
  );
};

export default Deals;