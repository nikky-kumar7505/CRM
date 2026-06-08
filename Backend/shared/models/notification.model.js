import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "lead_assigned",
        "deal_assigned",
        "lead_passed",
        "deal_updated",
        "general",
      ],
      default: "general",
    },

    ref_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    ref_model: {
      type: String,
      enum: ["Lead", "Deal", null],
      default: null,
    },

    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;