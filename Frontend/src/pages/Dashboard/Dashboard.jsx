import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getLeadStatsApi } from "../../api/leadApi.js";
import { getDealStatsApi } from "../../api/dealApi.js";
import {
  FiUsers,
  FiPhoneCall,
  FiBriefcase,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiStar,
} from "react-icons/fi";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [leadStats, setLeadStats] = useState(null);
  const [dealStats, setDealStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [leadRes, dealRes] = await Promise.all([
        getLeadStatsApi(),
        getDealStatsApi(),
      ]);
      setLeadStats(leadRes.data.data);
      setDealStats(dealRes.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="page-title">Dashboard</h1>
        <span className="dashboard-date">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* ─── Lead Stats ──────────────────────────────────────── */}
      <h3 className="section-title">Lead Overview</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e8f5e9" }}>
            <FiPhoneCall style={{ color: "#2e7d32" }} />
          </div>
          <div className="stat-info">
            <h3>{leadStats?.total || 0}</h3>
            <p>Total Leads</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e3f2fd" }}>
            <FiUsers style={{ color: "#1565c0" }} />
          </div>
          <div className="stat-info">
            <h3>{leadStats?.new || 0}</h3>
            <p>New Leads</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fff3e0" }}>
            <FiStar style={{ color: "#e65100" }} />
          </div>
          <div className="stat-info">
            <h3>{leadStats?.hot_leads || 0}</h3>
            <p>Hot Leads</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#fce4ec" }}>
            <FiTrendingUp style={{ color: "#c62828" }} />
          </div>
          <div className="stat-info">
            <h3>{leadStats?.interested || 0}</h3>
            <p>Interested</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e8f5e9" }}>
            <FiCheckCircle style={{ color: "#2e7d32" }} />
          </div>
          <div className="stat-info">
            <h3>{leadStats?.closed_won || 0}</h3>
            <p>Closed Won</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#ffebee" }}>
            <FiXCircle style={{ color: "#c62828" }} />
          </div>
          <div className="stat-info">
            <h3>{leadStats?.closed_lost || 0}</h3>
            <p>Closed Lost</p>
          </div>
        </div>
      </div>

      {/* ─── Deal Stats ──────────────────────────────────────── */}
      <h3 className="section-title">Deal Overview</h3>
      <div className="stats-grid">
        <div className="stat-card">
        <div className="stat-icon" style={{ background: "#f7e7ce" }}>            <FiBriefcase style={{ color: "#8b6914" }} />
          </div>
          <div className="stat-info">
            <h3>{dealStats?.total_deals || 0}</h3>
            <p>Total Deals</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e8f5e9" }}>
            <FiCheckCircle style={{ color: "#2e7d32" }} />
          </div>
          <div className="stat-info">
            <h3>{dealStats?.closed_won || 0}</h3>
            <p>Deals Won</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e3f2fd" }}>
            <FiTrendingUp style={{ color: "#1565c0" }} />
          </div>
          <div className="stat-info">
            <h3>₹{(dealStats?.total_value || 0).toLocaleString()}</h3>
            <p>Total Pipeline</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#e8f5e9" }}>
            <FiTrendingUp style={{ color: "#2e7d32" }} />
          </div>
          <div className="stat-info">
            <h3>₹{(dealStats?.total_revenue || 0).toLocaleString()}</h3>
            <p>Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;