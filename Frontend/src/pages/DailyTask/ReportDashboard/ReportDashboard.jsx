import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMonthlyPerformanceApi,
  getMyReportsApi,
  getMyTemplateApi,
  getWeeklyPerformanceApi,
} from "../../../api/reportApi.js";
import "./../DailyTask.css";

const ReportDashboard = () => {
  const [summary, setSummary] = useState({
    template: null,
    latestReport: null,
    weekly: null,
    monthly: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const [templateResult, reportsResult, weeklyResult, monthlyResult] =
          await Promise.allSettled([
            getMyTemplateApi(),
            getMyReportsApi(),
            getWeeklyPerformanceApi(),
            getMonthlyPerformanceApi(),
          ]);

        const templateResponse =
          templateResult.status === "fulfilled" ? templateResult.value : null;
        const reportsResponse =
          reportsResult.status === "fulfilled" ? reportsResult.value : null;
        const weeklyResponse =
          weeklyResult.status === "fulfilled" ? weeklyResult.value : null;
        const monthlyResponse =
          monthlyResult.status === "fulfilled" ? monthlyResult.value : null;

        setSummary({
          template: templateResponse?.data?.data || null,
          latestReport: reportsResponse?.data?.data?.[0] || null,
          weekly: weeklyResponse?.data?.data?.summary || null,
          monthly: monthlyResponse?.data?.data?.summary || null,
        });
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container daily-panel">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Workspace Dashboard</h1>
          <p className="daily-meta">
            A quick view of template readiness, recent submissions, and performance.
          </p>
        </div>
      </div>

      <div className="daily-grid">
        <div className="card daily-summary-card">
          <h3>Assigned Template</h3>
          <p className="daily-meta">
            {summary.template
              ? `${summary.template.role} • ${summary.template.fields.length} fields`
              : "No template assigned"}
          </p>
        </div>
        <div className="card daily-summary-card">
          <h3>Latest Report</h3>
          <p className="daily-meta">
            {summary.latestReport
              ? `${new Date(summary.latestReport.reportDate).toLocaleDateString()} • ${summary.latestReport.status}`
              : "No report submitted yet"}
          </p>
        </div>
        <div className="card daily-summary-card">
          <h3>Weekly Performance</h3>
          <p className="daily-meta">
            Completed: {summary.weekly?.completedReports || 0} • Reviewed: {summary.weekly?.reviewedReports || 0}
          </p>
        </div>
        <div className="card daily-summary-card">
          <h3>Monthly Performance</h3>
          <p className="daily-meta">
            Reports: {summary.monthly?.totalReports || 0} • Avg Rating: {summary.monthly?.averageRating || 0}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="daily-section-title">Quick Actions</h3>
        <div className="daily-actions">
          <Link className="btn btn-primary" to="/daily/report">
            Submit Daily Report
          </Link>
          <Link className="btn btn-outline" to="/daily/history">
            View My Reports
          </Link>
          <Link className="btn btn-outline" to="/daily/weekly-performance">
            Open Weekly Performance
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReportDashboard;
