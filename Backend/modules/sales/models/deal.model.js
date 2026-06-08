import mongoose from "mongoose";

// Meeting Schema - for sales closer meetings with client
const meetingSchema = new mongoose.Schema(
  {
    meeting_title: {
      type: String,
      required: true,
    },
    meeting_date: {
      type: Date,
      required: true,
    },
    meeting_time: String,
    meeting_type: {
      type: String,
      enum: ["video_call", "phone_call", "in_person", "whatsapp"],
      default: "video_call",
    },
    meeting_link: String, // zoom/meet link
    meeting_notes: String,
    meeting_outcome: {
      type: String,
      enum: [
        "positive",
        "negative",
        "neutral",
        "rescheduled",
        "no_show",
        "pending",
      ],
      default: "pending",
    },
    conducted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    conducted_by_name: String,
  },
  { timestamps: true }
);

const dealSchema = new mongoose.Schema(
  {
    // ─── Deal ID ──────────────────────────────────────────────
    deal_id: {
      type: String,
      unique: true,
      // Auto generated like DEAL-0001
    },

    // ─── Reference to original Lead ───────────────────────────
    // This connects Deal to Lead
    lead_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },

    lead_id: {
      type: String, // readable lead id like LEAD-0001
    },

    // ─── Client Info (copied from lead for quick access) ──────
    client_name: {
      type: String,
      required: true,
    },

    contact_number: String,
    email: String,
    business_type: String,
    business_name: String,

    // ─── Deal Assignment ──────────────────────────────────────
    // Which Sales Closer is handling this deal
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assigned_to_name: String,

    assigned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    assigned_by_name: String,
    assignment_date: {
      type: Date,
      default: Date.now,
    },

    // ─── Deal Stage / Pipeline ────────────────────────────────
    deal_stage: {
      type: String,
      enum: [
        "meeting_scheduled",
        "meeting_done",
        "proposal_sent",
        "negotiation",
        "verbal_confirmation",
        "payment_pending",
        "closed_won",
        "closed_lost",
        "on_hold",
      ],
      default: "meeting_scheduled",
    },

    // ─── Meeting History ──────────────────────────────────────
    meetings: [meetingSchema],

    // ─── Deal Value ───────────────────────────────────────────
    deal_value: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    // ─── Proposal ─────────────────────────────────────────────
    proposal_sent: {
      type: Boolean,
      default: false,
    },

    proposal_sent_date: Date,
    proposal_document: String, // file path

    // ─── Closure Info ─────────────────────────────────────────
    expected_closure_date: Date,

    actual_closure_date: Date,

    closure_reason: String, // why won or lost

    // ─── Payment ──────────────────────────────────────────────
    payment_status: {
      type: String,
      enum: ["not_paid", "partially_paid", "fully_paid", "refunded"],
      default: "not_paid",
    },

    payment_amount: {
      type: Number,
      default: 0,
    },

    payment_date: Date,

    // ─── Notes ────────────────────────────────────────────────
    notes: {
      type: String,
      default: "",
    },

    closer_comment: {
      type: String,
      default: "",
    },

    // ─── Visible to Lead Qualifier ────────────────────────────
    // Sales closer updates this, lead qualifier can read
    qualifier_visible_notes: {
      type: String,
      default: "",
    },

    // ─── Created By ───────────────────────────────────────────
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// ─── Auto Generate Deal ID ────────────────────────────────────────────────────
// dealSchema.pre("save", async function (next) {
//   if (!this.deal_id) {
//     try {
//       const count = await mongoose.model("Deal").countDocuments();
//       this.deal_id = `DEAL-${String(count + 1).padStart(4, "0")}`;
//       return next();
//     } catch (error) {
//       return next(error);
//     }
//   }
//   return next();
// });

// ─── Indexes ──────────────────────────────────────────────────────────────────
dealSchema.index({ lead_ref: 1 });
dealSchema.index({ assigned_to: 1 });
dealSchema.index({ deal_stage: 1 });

const Deal = mongoose.model("Deal", dealSchema);

export default Deal;