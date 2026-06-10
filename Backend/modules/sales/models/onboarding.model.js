import mongoose from "mongoose";

// ─── Onboarding Schema ────────────────────────────────────────────────────────
const onboardingSchema = new mongoose.Schema(
  {
    // ─── References ──────────────────────────────────────────
    onboarding_id: {
      type: String,
      unique: true,
      // Format: ONB-0001
    },

    deal_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      required: true,
    },

    lead_ref: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
    },

    deal_id: String,
    lead_id: String,

    // ─── Client Information ──────────────────────────────────
    client_name: {
      type: String,
      required: true,
    },

    contact_number: {
      type: String,
      required: true,
    },

    alternate_contact: String,

    email: String,

    business_name: String,

    business_type: String,

    website: String,

    social_media_handles: {
      instagram: String,
      facebook: String,
      youtube: String,
      linkedin: String,
      twitter: String,
    },

    // ─── Service Information ─────────────────────────────────
    service_type: {
      type: String,
      enum: ["video_shoot", "video_editing", "web_development"],
      required: true,
    },

    service_details: {
      type: String,
      required: true,
    },

    project_scope: String,

    deliverables: String, // What client will get

    timeline: String, // Project timeline

    // ─── Payment Information ─────────────────────────────────
    total_amount: {
      type: Number,
      required: true,
    },

    amount_paid: {
      type: Number,
      default: 0,
    },

    amount_pending: {
      type: Number,
      default: 0,
    },

    payment_status: {
      type: String,
      enum: ["partially_paid", "fully_paid"],
      default: "partially_paid",
    },

    payment_method: {
      type: String,
      enum: ["upi", "bank_transfer", "cash", "cheque", "card", "other"],
      default: "upi",
    },

    invoice_number: String,

    // ─── Address ──────────────────────────────────────────────
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },

    // ─── Assignment (Who will work on it) ─────────────────────
    assigned_team_member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assigned_team_member_name: String,

    team_member_role: {
      type: String,
      enum: [
        "video_editor",
        "web_developer",
        "video_shooter",
        "social_media_manager",
        "designer",
        "other",
      ],
      default: null,
    },

    assigned_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    assigned_by_name: String,

    assignment_date: Date,

    assignment_notes: String, // Notes from admin to team member

    project_start_date: Date,
    project_deadline: Date,

    // ─── Status ───────────────────────────────────────────────
    onboarding_status: {
      type: String,
      enum: [
        "pending_assignment",   // Just created, not assigned yet
        "assigned",              // Assigned to team member
        "in_progress",           // Work started
        "review",                // Under review
        "completed",             // Work done
        "delivered",             // Delivered to client
        "on_hold",
      ],
      default: "pending_assignment",
    },

    // ─── Closer Information (who closed the deal) ────────────
    closed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    closed_by_name: String,

    closed_date: {
      type: Date,
      default: Date.now,
    },

    // ─── Additional Notes ─────────────────────────────────────
    client_requirements: String,
    special_instructions: String,
    internal_notes: String,

    // ─── Files/Documents ──────────────────────────────────────
    documents: [
      {
        document_name: String,
        document_url: String,
        uploaded_at: { type: Date, default: Date.now },
      },
    ],

    // ─── Communication ────────────────────────────────────────
    preferred_communication: {
      type: String,
      enum: ["whatsapp", "email", "phone", "other"],
      default: "whatsapp",
    },

    // ─── Social Media Manager (only for video_editing service) ───
    social_media_manager_name: {
      type: String,
      default: null,
    },

    // ─── Credential Collection Token ──────────────────────────
    credential_token: {
      type: String,
      default: null,
    },
    credential_token_used: {
      type: Boolean,
      default: false,
    },

    // ─── Collected Credentials from Client ────────────────────
    collected_credentials: {
      instagram_username: String,
      instagram_password: String,
      facebook_email: String,
      facebook_password: String,
      youtube_email: String,
      youtube_password: String,
      linkedin_email: String,
      linkedin_password: String,
      twitter_username: String,
      twitter_password: String,
      other_handle_name: String,
      other_handle_username: String,
      other_handle_password: String,
      notes_from_client: String,
      submitted_at: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Onboarding = mongoose.model("Onboarding", onboardingSchema);

export default Onboarding;