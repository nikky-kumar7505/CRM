import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    submittedAt: Date,

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    remarks: String,

    reviewedAt: Date,
  },
  { _id: false }
);

const dailyReportSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    reportDate: {
      type: Date,
      required: true,
    },

    slotOne: {
      type: slotSchema,
      default: () => ({}),
    },

    slotTwo: {
      type: slotSchema,
      default: () => ({}),
    },

    review: {
      type: reviewSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: [
        "draft",
        "slot_one_submitted",
        "completed",
        "reviewed",
      ],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const DailyReport = mongoose.model("DailyReport", dailyReportSchema);

export default DailyReport;