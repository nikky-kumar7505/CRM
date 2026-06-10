import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getOnboardingByTokenApi,
  submitCredentialsApi,
} from "../../api/onboardingApi.js";

const CredentialForm = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  const [form, setForm] = useState({
    instagram_username: "",
    instagram_password: "",
    facebook_email: "",
    facebook_password: "",
    youtube_email: "",
    youtube_password: "",
    linkedin_email: "",
    linkedin_password: "",
    twitter_username: "",
    twitter_password: "",
    other_handle_name: "",
    other_handle_username: "",
    other_handle_password: "",
    notes_from_client: "",
  });

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = async () => {
    try {
      const res = await getOnboardingByTokenApi(token);
      setClientInfo(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid link.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitCredentialsApi(token, form);
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const passwordField = (label, name) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={showPasswords[name] ? "text" : "password"}
          name={name}
          className="form-input"
          value={form[name]}
          onChange={handleChange}
          style={{ paddingRight: "60px" }}
        />
        <button
          type="button"
          onClick={() => togglePassword(name)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#10443e",
            fontSize: "12px",
          }}
        >
          {showPasswords[name] ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f8f8",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>❌</div>
          <h2 style={{ color: "#dc3545" }}>Error</h2>
          <p style={{ color: "#797e88" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f0f7f6 0%, #faf8f3 100%)",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            textAlign: "center",
            maxWidth: "440px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: "60px", marginBottom: "16px" }}>✅</div>
          <h2 style={{ color: "#10443e", marginBottom: "12px" }}>Thank You!</h2>
          <p style={{ color: "#797e88" }}>
            Your credentials have been submitted successfully. Our team will get
            in touch with you shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f7f6 0%, #faf8f3 100%)",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          background: "white",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "#10443e",
              color: "#d4af37",
              fontSize: "28px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            S
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: "#10443e",
              fontSize: "24px",
            }}
          >
            Social Media Credentials
          </h1>
          <p style={{ color: "#797e88", marginTop: "8px" }}>
            Hi <strong>{clientInfo?.client_name}</strong>! Please share your
            social media credentials so we can manage them for you.
          </p>
        </div>

        <div
          style={{
            background: "#fff3cd",
            color: "#856404",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          🔒 Your data is securely encrypted. Fill only the platforms you want
          us to manage.
        </div>

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: "15px", color: "#10443e", marginBottom: "12px" }}>
            📷 Instagram
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="instagram_username"
                className="form-input"
                value={form.instagram_username}
                onChange={handleChange}
              />
            </div>
            {passwordField("Password", "instagram_password")}
          </div>

          <h3 style={{ fontSize: "15px", color: "#10443e", marginTop: "20px", marginBottom: "12px" }}>
            📘 Facebook
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="text"
                name="facebook_email"
                className="form-input"
                value={form.facebook_email}
                onChange={handleChange}
              />
            </div>
            {passwordField("Password", "facebook_password")}
          </div>

          <h3 style={{ fontSize: "15px", color: "#10443e", marginTop: "20px", marginBottom: "12px" }}>
            ▶️ YouTube
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="text"
                name="youtube_email"
                className="form-input"
                value={form.youtube_email}
                onChange={handleChange}
              />
            </div>
            {passwordField("Password", "youtube_password")}
          </div>

          <h3 style={{ fontSize: "15px", color: "#10443e", marginTop: "20px", marginBottom: "12px" }}>
            💼 LinkedIn
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="text"
                name="linkedin_email"
                className="form-input"
                value={form.linkedin_email}
                onChange={handleChange}
              />
            </div>
            {passwordField("Password", "linkedin_password")}
          </div>

          <h3 style={{ fontSize: "15px", color: "#10443e", marginTop: "20px", marginBottom: "12px" }}>
            🐦 Twitter (X)
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="twitter_username"
                className="form-input"
                value={form.twitter_username}
                onChange={handleChange}
              />
            </div>
            {passwordField("Password", "twitter_password")}
          </div>

          <h3 style={{ fontSize: "15px", color: "#10443e", marginTop: "20px", marginBottom: "12px" }}>
            ➕ Other Platform
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Platform Name</label>
              <input
                type="text"
                name="other_handle_name"
                className="form-input"
                placeholder="e.g. Pinterest"
                value={form.other_handle_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username/Email</label>
              <input
                type="text"
                name="other_handle_username"
                className="form-input"
                value={form.other_handle_username}
                onChange={handleChange}
              />
            </div>
          </div>
          {passwordField("Other Password", "other_handle_password")}

          <div className="form-group" style={{ marginTop: "20px" }}>
            <label className="form-label">Additional Notes (Optional)</label>
            <textarea
              name="notes_from_client"
              className="form-input"
              rows="3"
              placeholder="Any specific instructions or 2FA notes..."
              value={form.notes_from_client}
              onChange={handleChange}
            ></textarea>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "#10443e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Submit Credentials Securely
          </button>
        </form>
      </div>
    </div>
  );
};

export default CredentialForm;