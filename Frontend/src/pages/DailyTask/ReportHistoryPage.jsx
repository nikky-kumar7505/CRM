import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyReportsApi, getTeamReportsApi } from "../../api/reportApi.js";
import "./DailyTask.css";

const ReportHistoryPage = ({ scope = "mine" }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");
        const response =
          scope === "team" ? await getTeamReportsApi() : await getMyReportsApi();
        setReports(response.data.data || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Failed to load reports."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [scope]);

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
          <h1 className="page-title">
            {scope === "team" ? "Team Reports" : "My Reports"}
          </h1>
          <p className="daily-meta">
            {scope === "team"
              ? "Review all reports available within your scope."
              : "Browse your submitted daily reports and open full details."}
          </p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: "4px solid #dc3545", color: "#721c24" }}>
          {error}
        </div>
      )}

      {reports.length === 0 ? (
        <div className="empty-state">
          <h3>No Reports Found</h3>
          <p>No reports are available for this view yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {scope === "team" && <th>Employee</th>}
                <th>Date</th>
                <th>Role</th>
                <th>Status</th>
                <th>Review</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  {scope === "team" && (
                    <td>
                      <strong>{report.employee?.name}</strong>
                      <div className="daily-meta">{report.employee?.employee_id}</div>
                    </td>
                  )}
                  <td>{new Date(report.reportDate).toLocaleDateString()}</td>
                  <td>{report.role?.replace(/_/g, " ")}</td>
                  <td>
                    <span className="badge badge-info">{report.status}</span>
                  </td>
                  <td>{report.review?.rating ? `${report.review.rating}/5` : "Pending"}</td>
                  <td>
                    <Link className="daily-table-link" to={`/daily/reports/${report._id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportHistoryPage;
