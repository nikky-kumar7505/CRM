import { useEffect, useMemo, useState } from "react";
import {
  createSlotOneApi,
  createSlotTwoApi,
  getMyReportByDateApi,
  getMyTemplateApi,
} from "../../api/reportApi.js";
import "./DailyTask.css";

const getTodayDateKey = () => new Date().toISOString().slice(0, 10);

const buildInitialValues = (fields, existingData = {}) =>
  fields.reduce((accumulator, field) => {
    accumulator[field.key] = existingData[field.key] ?? "";
    return accumulator;
  }, {});

const renderField = (field, value, onChange) => {
  if (field.type === "textarea") {
    return (
      <textarea
        className="form-input"
        rows="4"
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
        required={field.required}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        className="form-select"
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
        required={field.required}
      >
        <option value="">Select</option>
        {field.options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      className="form-input"
      value={value}
      onChange={(event) => onChange(field.key, event.target.value)}
      required={field.required}
    />
  );
};

const ReportSubmissionPage = () => {
  const [template, setTemplate] = useState(null);
  const [report, setReport] = useState(null);
  const [slotOneValues, setSlotOneValues] = useState({});
  const [slotTwoValues, setSlotTwoValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState("");
  const [feedback, setFeedback] = useState({ error: "", success: "" });

  const todayDate = useMemo(() => getTodayDateKey(), []);

  const loadPage = async () => {
    try {
      setLoading(true);
      setFeedback({ error: "", success: "" });

      const [templateResponse, reportResponse] = await Promise.all([
        getMyTemplateApi(),
        getMyReportByDateApi(todayDate),
      ]);

      const nextTemplate = templateResponse.data.data;
      const nextReport = reportResponse.data.data;

      setTemplate(nextTemplate);
      setReport(nextReport);
      setSlotOneValues(buildInitialValues(nextTemplate.fields || [], nextReport?.slotOne?.data));
      setSlotTwoValues(buildInitialValues(nextTemplate.fields || [], nextReport?.slotTwo?.data));
    } catch (error) {
      setFeedback({
        error:
          error.response?.data?.message ||
          "Unable to load today's report template.",
        success: "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const handleSlotChange = (slotName, fieldKey, value) => {
    if (slotName === "slotOne") {
      setSlotOneValues((previous) => ({ ...previous, [fieldKey]: value }));
      return;
    }

    setSlotTwoValues((previous) => ({ ...previous, [fieldKey]: value }));
  };

  const submitSlot = async (slotName) => {
    try {
      setSavingSlot(slotName);
      setFeedback({ error: "", success: "" });

      if (slotName === "slotOne") {
        await createSlotOneApi(slotOneValues);
      } else {
        await createSlotTwoApi(slotTwoValues);
      }

      await loadPage();
      setFeedback({
        error: "",
        success: `${slotName === "slotOne" ? "Slot one" : "Slot two"} saved successfully.`,
      });
    } catch (error) {
      setFeedback({
        error:
          error.response?.data?.message ||
          "Failed to save report data.",
        success: "",
      });
    } finally {
      setSavingSlot("");
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h3>No Template Assigned</h3>
          <p>Your role does not have a daily report template yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container daily-panel">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Report Submission</h1>
          <p className="daily-meta">
            Submit both report slots using your assigned template for {todayDate}.
          </p>
        </div>
        <span className="inline-status">Status: {report?.status || "draft"}</span>
      </div>

      {feedback.error && (
        <div className="card" style={{ borderLeft: "4px solid #dc3545", color: "#721c24" }}>
          {feedback.error}
        </div>
      )}

      {feedback.success && (
        <div className="card" style={{ borderLeft: "4px solid #28a745", color: "#155724" }}>
          {feedback.success}
        </div>
      )}

      <div className="card daily-stack">
        <div>
          <h3 className="daily-section-title">Slot One</h3>
          <p className="daily-meta">
            Morning or first-half update. Save this before slot two.
          </p>
        </div>

        <div className="daily-form-grid">
          {template.fields.map((field) => (
            <div
              key={`slot-one-${field.key}`}
              className={field.type === "textarea" ? "full-width" : ""}
            >
              <label className="form-label">{field.label}</label>
              {renderField(field, slotOneValues[field.key] ?? "", (fieldKey, value) =>
                handleSlotChange("slotOne", fieldKey, value)
              )}
            </div>
          ))}
        </div>

        <div className="daily-actions">
          <button
            className="btn btn-primary"
            onClick={() => submitSlot("slotOne")}
            disabled={savingSlot === "slotOne"}
          >
            {savingSlot === "slotOne" ? "Saving..." : "Save Slot One"}
          </button>
          {report?.slotOne?.submittedAt && (
            <span className="daily-meta">
              Submitted at {new Date(report.slotOne.submittedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="card daily-stack">
        <div>
          <h3 className="daily-section-title">Slot Two</h3>
          <p className="daily-meta">
            End-of-day update. Slot one must be submitted first.
          </p>
        </div>

        <div className="daily-form-grid">
          {template.fields.map((field) => (
            <div
              key={`slot-two-${field.key}`}
              className={field.type === "textarea" ? "full-width" : ""}
            >
              <label className="form-label">{field.label}</label>
              {renderField(field, slotTwoValues[field.key] ?? "", (fieldKey, value) =>
                handleSlotChange("slotTwo", fieldKey, value)
              )}
            </div>
          ))}
        </div>

        <div className="daily-actions">
          <button
            className="btn btn-primary"
            onClick={() => submitSlot("slotTwo")}
            disabled={savingSlot === "slotTwo" || !report?.slotOne?.submittedAt}
          >
            {savingSlot === "slotTwo" ? "Saving..." : "Save Slot Two"}
          </button>
          {report?.slotTwo?.submittedAt && (
            <span className="daily-meta">
              Submitted at {new Date(report.slotTwo.submittedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportSubmissionPage;
