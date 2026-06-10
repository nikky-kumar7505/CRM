import { useState, useEffect } from "react";
import { getAllOnboardingsApi } from "../../api/onboardingApi.js";
import { FiUserCheck, FiPhone } from "react-icons/fi";

const RETAINABLE_SERVICES = ["social_media_management", "video_shoot"];

const RetainableClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await getAllOnboardingsApi();
      const filtered = res.data.data.filter((c) =>
        RETAINABLE_SERVICES.includes(c.service_type)
      );
      setClients(filtered);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FiUserCheck style={{ color: "#28a745" }} /> Retainable Clients
        </h1>
      </div>

      <div className="card" style={{ marginBottom: "16px", padding: "14px 20px" }}>
        <p style={{ fontSize: "13px", color: "#797e88", margin: 0 }}>
          💡 <strong>Retainable clients</strong> = Social Media Management & Video Shoots.
          Approach them for renewal or upselling.
        </p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Contact</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>No retainable clients</td></tr>
            ) : (
              clients.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.onboarding_id}</strong></td>
                  <td>{c.client_name}</td>
                  <td>
                    <a href={`tel:${c.contact_number}`} style={{ color: "#10443e", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px" }}>
                      <FiPhone /> {c.contact_number}
                    </a>
                  </td>
                  <td>{c.service_type?.replace(/_/g, " ")}</td>
                  <td>₹{c.total_amount?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${c.payment_status === "fully_paid" ? "badge-success" : "badge-warning"}`}>
                      {c.payment_status?.replace(/_/g, " ")}
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

export default RetainableClients;