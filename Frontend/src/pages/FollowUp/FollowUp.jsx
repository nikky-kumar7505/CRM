import { useState, useEffect } from "react";
import { getFollowUpLeadsApi, closeLeadApi } from "../../api/leadApi.js";
import { FiClock, FiPhone, FiXCircle } from "react-icons/fi";

const FollowUp = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [closeReason, setCloseReason] = useState("");

  useEffect(() => {
    fetchFollowUpLeads();
  }, []);

  const fetchFollowUpLeads = async () => {
    try {
      const res = await getFollowUpLeadsApi();
      setLeads(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseLead = async (e) => {
    e.preventDefault();
    try {
      await closeLeadApi(selectedLead._id, { closure_reason: closeReason });
      alert("Lead closed successfully!");
      setShowCloseModal(false);
      setCloseReason("");
      fetchFollowUpLeads();
    } catch (error) {
      alert(error.response?.data?.message || "Error closing lead");
    }
  };

  const formatService = (s) => {
    if (!s) return "-";
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const isOverdue = (date) => new Date(date) < new Date();

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const daysUntil = (date) => {
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} days overdue`;
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FiClock style={{ color: "#D4AF37" }} /> Follow Up Leads
        </h1>
        <span className="badge badge-warning" style={{ fontSize: "14px", padding: "6px 16px" }}>
          {leads.length} Follow Ups
        </span>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Service</th>
              <th>Follow Up Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                  No follow-up leads
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead._id}
                  style={{
                    background: isOverdue(lead.next_follow_up_date) ? "#fff5f5" : "inherit",
                  }}
                >
                  <td><strong style={{ color: "#10443e" }}>{lead.lead_id}</strong></td>
                  <td>{lead.lead_name}</td>
                  <td>
                    <a
                      href={`tel:${lead.contact_number}`}
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
                      {lead.contact_number}
                    </a>
                  </td>
                  <td>{formatService(lead.service_required)}</td>
                  <td>
                    <div>
                      <span style={{ fontWeight: "500" }}>
                        {formatDate(lead.next_follow_up_date)}
                      </span>
                      <br />
                      <span
                        style={{
                          fontSize: "11px",
                          color: isOverdue(lead.next_follow_up_date) ? "#dc3545" : "#28a745",
                          fontWeight: "500",
                        }}
                      >
                        {daysUntil(lead.next_follow_up_date)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-warning">
                      {lead.calling_status?.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      title="Close Lead"
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowCloseModal(true);
                      }}
                    >
                      <FiXCircle /> Close
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Close Lead Modal */}
      {showCloseModal && selectedLead && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "420px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Close Lead — {selectedLead.lead_name}</h3>
              <button className="modal-close" onClick={() => setShowCloseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCloseLead}>
              <div className="form-group">
                <label className="form-label">Reason for Closing *</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Why is this lead being closed?"
                  value={closeReason}
                  onChange={(e) => setCloseReason(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCloseModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger">
                  Close Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUp;