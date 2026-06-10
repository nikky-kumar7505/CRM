import mongoose from "mongoose";

const callHistorySchema = new mongoose.Schema(
  {
    // Every time someone calls, we save this
    called_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    called_by_name: String,
    call_date: {
      type: Date,
      default: Date.now,
    },
    calling_status: {
      type: String,
      enum: [
        "switched_off",
        "busy",
        "contacted",
        "not_interested",
        "interested",
        "cut_call",
        "wrong_number",
        "no_answer",
        "callback_requested",
      ],
    },
    call_duration: String, // example "5 mins 30 sec"
    call_recording: String, // file path or URL
    comment: String,
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    // ─── Lead Basic Info ──────────────────────────────────────
    lead_id: {
      type: String,
      unique: true,
      // We will auto generate this like LEAD-0001
    },

    lead_date: {
      type: Date,
      default: Date.now,
    },

    lead_name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },

    contact_number: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
    },

    alternate_contact: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    // ─── Business Info ────────────────────────────────────────
    business_type: {
      type: String,
      enum: ["creator", "coach", "brand", "agency", "consultant", "other"],
      required: [true, "Business type is required"],
    },

    business_name: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    social_media_handle: {
      type: String,
      trim: true,
    },

    // ─── Lead Source ──────────────────────────────────────────
    lead_source: {
      type: String,
      enum: [
        "instagram",
        "facebook",
        "youtube",
        "referral",
        "website",
        "cold_call",
        "whatsapp",
        "other",
      ],
      default: "other",
    },

    lead_source_detail: {
      type: String, // extra detail like which campaign
    },

    // ─── Assignment Info ──────────────────────────────────────
    // Sales Manager assigns this lead to Lead Qualifier
    assigned_to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assigned_to_name: {
      type: String,
      default: null,
    },

    assigned_by: {
      // Sales Manager who assigned
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assigned_by_name: {
      type: String,
      default: null,
    },
    
    assigned_closer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assigned_closer_name: {
      type: String,
      default: null,
    },

    assignment_date: {
      type: Date,
      default: null,
    },

    // ─── Current Stage ────────────────────────────────────────
    current_stage: {
    type: String,
    enum: [
      "fresh",
      "lead_qualifier",
      "sales_closer",
      "closed_won",
      "closed_lost",
      "onboard",
    ],
    default: "fresh",
  },

    // ─── Calling Info ─────────────────────────────────────────
    first_calling_date: {
      type: Date,
      default: null,
    },

    last_calling_date: {
      type: Date,
      default: null,
    },

    calling_status: {
    type: String,
      enum: [
        "pending",
        "interested",
        "not_interested",
        "callback_requested",
        "no_answer",
      ],
      default: "pending",
    },

   
    next_follow_up_date: {
      type: Date,
      default: null,
    },

    expected_closing_date: {
      type: Date,
      default: null,
    },

    total_calls: {
      type: Number,
      default: 0,
    },

    // ─── Call History ─────────────────────────────────────────
    // Every call is stored here as array
    call_history: [callHistorySchema],

    // ─── Lead Qualifier Comments ──────────────────────────────
    comment: {
      type: String,
      default: "",
    },

    // ─── Call Recording (latest) ─────────────────────────────
    call_recording: {
      type: String,
      default: null,
    },

    // ─── Budget Info ──────────────────────────────────────────
    budget: {
      type: String,
      default: null,
    },

    requirements: {
      type: String,
      default: null,
    },

    // ─── Passed to Sales Closer ───────────────────────────────
    is_passed_to_closer: {
      type: Boolean,
      default: false,
    },

    passed_to_closer_date: {
      type: Date,
      default: null,
    },

    passed_to_closer_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ─── Priority ─────────────────────────────────────────────
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent", "hot"],  // ✅ added "hot"
      default: "medium",
    },

    // ─── Tags ─────────────────────────────────────────────────
    tags: {
      type: [String],
      default: [],
    },

    // ─── Location ─────────────────────────────────────────────
    city: String,
    state: String,
    country: {
      type: String,
      default: "India",
    },

    // ─── Service & Requirements ──────────────────────────────
    service_required: {
    type: String,
    enum: [
      "video_shoot",
      "video_editing",
      "web_development",
      "social_media_management",
      "other",
    ],
    default: null,
    },

    // requirements field already exists, keep it - this stores DETAILED requirements
    requirements: {
      type: String,
      default: null,
    },

    budget: {
      type: String,
      default: null,
    },

    // ─── Created By ───────────────────────────────────────────
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    created_by_name: String,
  },
  {
    timestamps: true,
  }
);

// ─── Auto Generate Lead ID ────────────────────────────────────────────────────
// leadSchema.pre("save", async function (next) {
//   if (!this.lead_id) {
//     try {
//       const count = await mongoose.model("Lead").countDocuments();
//       this.lead_id = `LEAD-${String(count + 1).padStart(4, "0")}`;
//       return next();
//     } catch (error) {
//       return next(error);
//     }
//   }
//   return next();
// });

// ─── Indexes for fast search ──────────────────────────────────────────────────
leadSchema.index({ assigned_to: 1 });
leadSchema.index({ current_stage: 1 });
leadSchema.index({ calling_status: 1 });
leadSchema.index({ is_passed_to_closer: 1 });
leadSchema.index({ contact_number: 1 });

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;