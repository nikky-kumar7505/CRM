import Notification from "../models/notification.model.js";

// ─── Get My Notifications ─────────────────────────────────────────────────────
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user_id: req.user._id,
    }).sort({ createdAt: -1 }).limit(50);

    const unreadCount = await Notification.countDocuments({
      user_id: req.user._id,
      is_read: false,
    });

    res.status(200).json({
      success: true,
      unread_count: unreadCount,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Mark Notification as Read ────────────────────────────────────────────────
const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { is_read: true });

    res.status(200).json({
      success: true,
      message: "Notification marked as read.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Mark All as Read ─────────────────────────────────────────────────────────
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, is_read: false },
      { is_read: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

export { getMyNotifications, markAsRead, markAllAsRead };