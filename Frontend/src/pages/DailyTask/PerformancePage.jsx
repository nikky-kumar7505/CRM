import { useEffect, useState } from "react";
import {
  getMonthlyPerformanceApi,
  getTeamPerformanceApi,
  getWeeklyPerformanceApi,
} from "../../api/reportApi.js";
import "./DailyTask.css";

const PerformancePage = ({ mode = "weekly" }) => {
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        setLoading(true);
        setError("");

        let response;
        if (mode === "monthly") {
          response = await getMonthlyPerformanceApi();
        } else if (mode === "team") {
          response = await getTeamPerformanceApi();
        } else {
          response = await getWeeklyPerformanceApi();
        }

        setPerformance(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load performance data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, [mode]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const summary = performance?.summary || {};
  const titleMap = {
    weekly: "Weekly Performance",
    monthly: "Monthly Performance",
    team: "Team Performance",
  };

  return (
    <div className="page-container daily-panel">
      <div className="page-header">
        <div>
          <h1 className="page-title">{titleMap[mode]}</h1>
          <p className="daily-meta">
            {performance?.startDate
              ? `${new Date(performance.startDate).toLocaleDateString()} - ${new Date(
                  performance.endDate
                ).toLocaleDateString()}`
              : "Performance window unavailable"}
          </p>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: "4px solid #dc3545", color: "#721c24" }}>
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>{summary.totalReports || 0}</h3>
            <p>Total Reports</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{summary.completedReports || 0}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{summary.reviewedReports || 0}</h3>
            <p>Reviewed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{summary.averageRating || 0}</h3>
            <p>Average Rating</p>
          </div>
        </div>
      </div>

      {mode === "team" ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Total</th>
                <th>Completed</th>
                <th>Reviewed</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {(performance?.employees || []).map((entry) => (
                <tr key={entry.employee?._id}>
                  <td>
                    <strong>{entry.employee?.name}</strong>
                    <div className="daily-meta">{entry.employee?.employee_id}</div>
                  </td>
                  <td>{entry.employee?.role?.replace(/_/g, " ")}</td>
                  <td>{entry.summary?.totalReports || 0}</td>
                  <td>{entry.summary?.completedReports || 0}</td>
                  <td>{entry.summary?.reviewedReports || 0}</td>
                  <td>{entry.summary?.averageRating || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <h3 className="daily-section-title">Included Reports</h3>
          {(performance?.reports || []).length === 0 ? (
            <p className="daily-meta">No reports found for this period.</p>
          ) : (
            <div className="daily-kv-list">
              {performance.reports.map((report) => (
                <div className="daily-kv-item" key={report._id}>
                  <strong>{new Date(report.reportDate).toLocaleDateString()}</strong>
                  <span>
                    Status: {report.status} {report.review?.rating ? `• Rating ${report.review.rating}/5` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PerformancePage;
