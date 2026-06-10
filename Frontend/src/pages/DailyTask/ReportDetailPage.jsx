import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReportByIdApi, reviewReportApi } from "../../api/reportApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import "./DailyTask.css";

const renderDataSection = (title, data) => (
  <div className="card daily-stack">
    <h3 className="daily-section-title">{title}</h3>
    {data && Object.keys(data).length > 0 ? (
      <div className="daily-kv-list">
        {Object.entries(data).map(([key, value]) => (
          <div className="daily-kv-item" key={`${title}-${key}`}>
            <strong>{key.replace(/_/g, " ")}</strong>
            <span>{String(value || "-")}</span>
          </div>
        ))}
      </div>
    ) : (
      <p className="daily-meta">No data submitted for this slot.</p>
    )}
  </div>
);

const ReportDetailPage = () => {
  const { reportId } = useParams();
  const { user, isManager } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({
    rating: "",
    remarks: "",
  });

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getReportByIdApi(reportId);
      const nextReport = response.data.data;
      setReport(nextReport);
      setReviewForm({
        rating: nextReport.review?.rating || "",
        remarks: nextReport.review?.remarks || "",
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to load report details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportId]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    try {
      await reviewReportApi(reportId, {
        rating: Number(reviewForm.rating),
        remarks: reviewForm.remarks,
      });
      await loadReport();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Unable to save review."
      );
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const canReview =
    report &&
    report.employee?._id !== user?._id &&
    (user?.role === "admin" || isManager());

  return (
    <div className="page-container daily-panel">
      <div className="page-header">
        <div>
          <h1 className="page-title">Report Details</h1>
          <p className="daily-meta">
            {report?.employee?.name || "My report"} •{" "}
            {report ? new Date(report.reportDate).toLocaleDateString() : ""}
          </p>
        </div>
        <span className="inline-status">Status: {report?.status}</span>
      </div>

      {error && (
        <div className="card" style={{ borderLeft: "4px solid #dc3545", color: "#721c24" }}>
          {error}
        </div>
      )}

      <div className="card daily-timeline">
        <div className="daily-timeline-item">
          <div>
            <strong>Employee</strong>
            <div className="daily-meta">
              {report?.employee?.name} • {report?.employee?.employee_id}
            </div>
          </div>
          <div>
            <strong>Role</strong>
            <div className="daily-meta">{report?.employee?.role?.replace(/_/g, " ")}</div>
          </div>
        </div>
        <div className="daily-timeline-item">
          <div>
            <strong>Slot One</strong>
            <div className="daily-meta">
              {report?.slotOne?.submittedAt
                ? new Date(report.slotOne.submittedAt).toLocaleString()
                : "Not submitted"}
            </div>
          </div>
          <div>
            <strong>Slot Two</strong>
            <div className="daily-meta">
              {report?.slotTwo?.submittedAt
                ? new Date(report.slotTwo.submittedAt).toLocaleString()
                : "Not submitted"}
            </div>
          </div>
        </div>
      </div>

      {renderDataSection("Slot One Data", report?.slotOne?.data)}
      {renderDataSection("Slot Two Data", report?.slotTwo?.data)}

      <div className="card daily-stack">
        <h3 className="daily-section-title">Review</h3>

        {report?.review?.reviewedAt && (
          <div className="daily-meta">
            Reviewed by {report.review.reviewedBy?.name || "Manager"} on{" "}
            {new Date(report.review.reviewedAt).toLocaleString()}
          </div>
        )}

        {canReview ? (
          <form onSubmit={handleReviewSubmit} className="daily-stack">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Rating</label>
                <select
                  className="form-select"
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm((previous) => ({
                      ...previous,
                      rating: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select rating</option>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input
                  className="form-input"
                  value={reviewForm.remarks}
                  onChange={(event) =>
                    setReviewForm((previous) => ({
                      ...previous,
                      remarks: event.target.value,
                    }))
                  }
                  placeholder="Share feedback for the employee"
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit">
              Save Review
            </button>
          </form>
        ) : (
          <div className="daily-meta">
            {report?.review?.rating
              ? `Rating: ${report.review.rating}/5`
              : "No review has been added yet."}
            {report?.review?.remarks ? ` Remarks: ${report.review.remarks}` : ""}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailPage;
