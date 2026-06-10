import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { FiMenu, FiBell } from "react-icons/fi";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllReadApi,
} from "../../api/notificationApi.js";
import "./Layout.css";

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationsApi();
      setNotifications(res.data.data);
      setUnreadCount(res.data.unread_count);
    } catch (error) {
      console.log("Notification fetch failed");
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsReadApi(id);
      fetchNotifications();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadApi();
      fetchNotifications();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FiMenu />
        </button>
        <h3 className="header-welcome">
          Welcome, <span>{user?.name}</span>
        </h3>
      </div>

      <div className="header-right">
        {/* ─── Notification Bell ─────────────────────── */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            className="header-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className="notif-badge">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications ({unreadCount} unread)</h4>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="mark-all-read-btn">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`notification-item ${!notif.is_read ? "unread" : ""}`}
                      onClick={() => !notif.is_read && handleMarkRead(notif._id)}
                    >
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-message">{notif.message}</div>
                      <div className="notification-time">
                        {new Date(notif.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true,
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="header-avatar">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Header;