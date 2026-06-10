import { useEffect, useMemo, useState } from "react";
import { useTemplate } from "../../hooks/useTemplate";
import { getRolesApi } from "../../api/rolesApi.js";
import "./DailyTask.css";
import "./TemplatesPage.css";

const TemplatesPage = () => {
  const {
    getTemplates,
    deleteTemplate,
    updateTemplate,
    loading,
  } = useTemplate();

  const [templates, setTemplates] = useState([]);
  const [roles, setRoles] = useState([]);

  const [selectedTemplate, setSelectedTemplate] =
    useState(null);

  const [viewModal, setViewModal] =
    useState(false);

  const [editModal, setEditModal] =
    useState(false);

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    const loadRoles = async () => {
      try {
        const response = await getRolesApi();
        setRoles(response.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadRoles();
  }, []);

  const roleMap = useMemo(
    () =>
      roles.reduce((accumulator, role) => {
        accumulator[role.key] = role;
        return accumulator;
      }, {}),
    [roles]
  );

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this template?"
    );

    if (!confirmDelete) return;

    try {
      await deleteTemplate(id);

      setTemplates((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.error(err);
    }
  };

  // const openView = (template) => {
  //   setSelectedTemplate(template);
  //   setViewModal(true);
  // };

  // const openEdit = (template) => {
  //   setSelectedTemplate(
  //     JSON.parse(JSON.stringify(template))
  //   );
  //   setEditModal(true);
  // };

  const toCamelCase = (text = "") => {
  return text
    .trim()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
    )
    .join("");
};

  const handleFieldChange = (
  index,
  field,
  value
) => {
  const updatedFields = [
    ...selectedTemplate.fields,
  ];

  updatedFields[index][field] = value;

  if (field === "optionsText") {
    updatedFields[index].options = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  setSelectedTemplate({
    ...selectedTemplate,
    fields: updatedFields,
  });
};

  const handleUpdate = async () => {
    try {
      await updateTemplate(
        selectedTemplate._id,
        {
          role: selectedTemplate.role,
          fields: selectedTemplate.fields,
        }
      );

      setEditModal(false);

      fetchTemplates();
    } catch (error) {
      console.error(error);
    }
  };

  const addField = () => {
  setSelectedTemplate({
    ...selectedTemplate,
    fields: [
      ...selectedTemplate.fields,
      {
        key: "",
        label: "",
        type: "text",
        required: false,
        options: [],
      },
    ],
  });
};

const removeField = (index) => {
  setSelectedTemplate({
    ...selectedTemplate,
    fields: selectedTemplate.fields.filter(
      (_, i) => i !== index
    ),
  });
};

const openEdit = (template) => {
  const cloned = JSON.parse(
    JSON.stringify(template)
  );

  cloned.fields = cloned.fields.map((field) => ({
    ...field,
    options: field.options || [],
    optionsText: (field.options || []).join(", "),
  }));

  setSelectedTemplate(cloned);
  setEditModal(true);
};

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          Report Templates
        </h1>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="empty-state">
          <h3>No Templates Found</h3>
        </div>
      ) : (
        <div className="templates-grid">
          {templates.map((template) => (
            <div
              className="card template-card"
              key={template._id}
            >
              <div className="template-card-header">
                <div>
                  <h3>{template.role}</h3>
                  <p>{roleMap[template.role]?.label || template.role}</p>
                  <p>
                    {template.fields.length} Fields
                  </p>
                </div>

                <span className="badge badge-primary">
                  Active
                </span>
              </div>

              <div className="template-fields-list">
                {template.fields
                  .slice(0, 3)
                  .map((field) => (
                    <div
                      key={field.key}
                      className="template-field-item"
                    >
                      <div>
                        <strong>
                          {field.label}
                        </strong>
                        <p>
                          Key: {field.key}
                        </p>
                      </div>

                      <span className="badge badge-info">
                        {field.type}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="template-footer">
                <small>
                  Created:{" "}
                  {new Date(
                    template.createdAt
                  ).toLocaleDateString()}
                </small>

                <div className="template-actions">
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() =>
                      openView(template)
                    }
                  >
                    View
                  </button>

                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() =>
                      openEdit(template)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      handleDelete(
                        template._id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      {viewModal && selectedTemplate && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>
              {selectedTemplate.role}
            </h2>

            {selectedTemplate.fields.map(
              (field) => (
                <div
                  key={field.key}
                  className="field-row"
                >
                  <strong>
                    {field.label}
                  </strong>

                  <p>
                    Key: {field.key}
                  </p>

                  <p>
                    Type: {field.type}
                  </p>

                  <p>
                    Required:{" "}
                    {field.required
                      ? "Yes"
                      : "No"}
                  </p>
                </div>
              )
            )}

            <button
              className="btn"
              onClick={() =>
                setViewModal(false)
              }
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && selectedTemplate && (
  <div className="modal-overlay">
    <div className="modal large">
      <h2>Edit Template</h2>

      <div
        className="daily-meta"
        style={{ marginBottom: "12px" }}
      >
        Role:{" "}
        {roleMap[selectedTemplate.role]?.label ||
          selectedTemplate.role}
      </div>

      <div className="template-fields">
        {selectedTemplate.fields.map(
          (field, index) => (
            <div
              key={index}
              className="template-field-card"
            >
              <div className="template-field-header">
                <h3>
                  Field #{index + 1}
                </h3>

                {selectedTemplate.fields.length >
                  1 && (
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
                    disabled={true}  
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
                    <option value="text">
                      Text
                    </option>
                    <option value="textarea">
                      Textarea
                    </option>
                    <option value="number">
                      Number
                    </option>
                    <option value="select">
                      Select
                    </option>
                    <option value="date">
                      Date
                    </option>
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
                    placeholder="Option1, Option2, Option3"
                    value={field.optionsText || ""}
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
          )
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "16px",
        }}
      >
        <button
          type="button"
          className="btn btn-outline"
          onClick={addField}
        >
          Add Field
        </button>
      </div>

      <div className="modal-actions">
        <button
          className="btn btn-success"
          onClick={handleUpdate}
        >
          Save Changes
        </button>

        <button
          className="btn"
          onClick={() =>
            setEditModal(false)
          }
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default TemplatesPage;
