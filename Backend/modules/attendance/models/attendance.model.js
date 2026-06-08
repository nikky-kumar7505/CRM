import mongoose from "mongoose";

// ─── PLACEHOLDER - Will be built later ───────────────────────────────────────
// This schema is ready for future development
// Just basic structure to make it compatible now

const attendanceSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    employee_name: String,

    date: {
      type: Date,
      required: true,
    },

    check_in: {
      type: Date,
      default: null,
    },

    check_out: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["present", "absent", "half_day", "late", "on_leave", "holiday"],
      default: "absent",
    },

    working_hours: {
      type: Number,
      default: 0,
    },

    notes: String,
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;