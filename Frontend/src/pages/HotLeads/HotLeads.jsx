import { useState, useEffect } from "react";
import { getHotLeadsApi } from "../../api/leadApi.js";
import { FiZap, FiPhone } from "react-icons/fi";

const HotLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotLeads();
  }, []);

  const fetchHotLeads = async () => {
    try {
      const res = await getHotLeadsApi();
      setLeads(res.data.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatService = (s) => {
    if (!s) return "-";
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FiZap style={{ color: "#dc3545" }} /> Hot Leads
        </h1>
        <span className="badge badge-danger" style={{ fontSize: "14px", padding: "6px 16px" }}>
          {leads.length} Hot Leads
        </span>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Lead ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Service Required</th>
              <th>Budget</th>
              <th>Stage</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                  No hot leads right now
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead._id}>
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
                  <td>{lead.budget ? `₹${lead.budget}` : "-"}</td>
                  <td>
                    <span className="badge badge-danger">
                      🔥 Hot Lead
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HotLeads;