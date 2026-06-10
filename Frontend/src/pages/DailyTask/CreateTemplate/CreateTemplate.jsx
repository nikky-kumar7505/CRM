import { useEffect, useMemo, useState } from "react";
import "./CreateTemplate.css";
import { useTemplate } from "../../../hooks/useTemplate";
import { getRolesApi } from "../../../api/rolesApi.js";
import "../DailyTask.css";

const FIELD_TYPES = [
  "text",
  "textarea",
  "number",
  "select",
  "date",
];

const CreateTemplate = () => {
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [feedback, setFeedback] = useState("");
  const { createTemplate, loading } = useTemplate();
  const [fields, setFields] = useState([
    {
      key: "",
      label: "",
      type: "text",
      required: false,
      options: [],
      optionsText: "",
    },
  ]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const response = await getRolesApi();
        setRoles(response.data.data || []);
      } catch (error) {
        console.error("Failed to load roles:", error);
      }
    };

    loadRoles();
  }, []);

  const selectedRole = useMemo(
    () => roles.find((item) => item.key === role),
    [role, roles]
  );

  const handleFieldChange = (index, field, value) => {
    const updated = [...fields];
    updated[index][field] = value;
    setFields(updated);
  };

  const addField = () => {
    setFields([
      ...fields,
      {
        key: "",
        label: "",
        type: "text",
        required: false,
        options: [],
        optionsText: "",
      },
    ]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      role,
      fields: fields.map((field) => ({
        key: field.key,
        label: field.label,
        type: field.type,
        required: field.required,
        options:
          field.type === "select"
            ? field.optionsText
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
      })),
    };

    try {
      await createTemplate(payload);
      setFeedback("Template created successfully.");
      setRole("");
      setFields([
        {
          key: "",
          label: "",
          type: "text",
          required: false,
          options: [],
          optionsText: "",
        },
      ]);
    } catch (error) {
      setFeedback(
        error.response?.data?.message || "Failed to create template."
      );
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          Create Report Template
        </h1>
      </div>

      {feedback && (
        <div className="card" style={{ marginBottom: "16px" }}>
          {feedback}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="card template-builder"
      >
        <div className="form-group">
          <label className="form-label">
            Role
          </label>

          <select
            className="form-select"
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            required
          >
            <option value="">Select role</option>
            {roles.map((item) => (
              <option key={item._id} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
          {selectedRole && (
            <p className="daily-meta" style={{ marginTop: "8px" }}>
              Department: {selectedRole.department} • Workspace:{" "}
              {(selectedRole.allowedModules || []).join(", ")}
            </p>
          )}
        </div>

        <div className="template-fields">
          {fields.map((field, index) => (
            <div
              key={index}
              className="template-field-card"
            >
              <div className="template-field-header">
                <h3>
                  Field #{index + 1}
                </h3>

                {fields.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      removeField(index)
                    }
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Field Key
                  </label>

                  <input
                    className="form-input"
                    placeholder="moduleName"
                    value={field.key}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "key",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Field Label
                  </label>

                  <input
                    className="form-input"
                    placeholder="Module Name"
                    value={field.label}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "label",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Field Type
                  </label>

                  <select
                    className="form-select"
                    value={field.type}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "type",
                        e.target.value
                      )
                    }
                  >
                    {FIELD_TYPES.map((type) => (
                      <option
                        key={type}
                        value={type}
                      >
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Required
                  </label>

                  <select
                    className="form-select"
                    value={field.required}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "required",
                        e.target.value ===
                          "true"
                      )
                    }
                  >
                    <option value={false}>
                      No
                    </option>
                    <option value={true}>
                      Yes
                    </option>
                  </select>
                </div>
              </div>

              {field.type === "select" && (
                <div className="form-group">
                  <label className="form-label">
                    Options
                  </label>

                  <input
                    className="form-input"
                    placeholder="Bug Fix, API Integration, Testing"
                    value={field.optionsText}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "optionsText",
                        e.target.value
                      )
                    }
                  />

                  <small>
                    Separate options with commas
                  </small>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="template-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={addField}
          >
            Add Field
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Template"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTemplate;
