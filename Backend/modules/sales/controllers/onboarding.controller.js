import Onboarding from "../models/onboarding.model.js";
import Deal from "../models/deal.model.js";
import Lead from "../models/lead.model.js";
import User from "../../../shared/models/user.model.js";
import Notification from "../../../shared/models/notification.model.js";
import crypto from "crypto";

// ─── Create Onboarding (when deal is closed_won) ──────────────────────────────
export const createOnboarding = async (req, res) => {
  try {
    const {
      deal_id,
      client_name,
      contact_number,
      alternate_contact,
      email,
      business_name,
      business_type,
      website,
      social_media_handles,
      service_type,
      service_details,
      project_scope,
      deliverables,
      timeline,
      total_amount,
      amount_paid,
      payment_status,
      payment_method,
      invoice_number,
      address,
      city,
      state,
      pincode,
      project_start_date,
      project_deadline,
      client_requirements,
      special_instructions,
      preferred_communication,
    } = req.body;

    // Validate deal exists
    const deal = await Deal.findById(deal_id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found.",
      });
    }

    // Check if onboarding already exists for this deal
    const existing = await Onboarding.findOne({ deal_ref: deal_id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Onboarding already exists for this deal.",
        data: existing,
      });
    }

    // Generate onboarding ID
    const lastOnboarding = await Onboarding.findOne({}, { onboarding_id: 1 })
      .sort({ createdAt: -1 })
      .lean();

    let newNumber = 1;
    if (lastOnboarding && lastOnboarding.onboarding_id) {
      const lastNum = parseInt(lastOnboarding.onboarding_id.replace("ONB-", ""));
      if (!isNaN(lastNum)) newNumber = lastNum + 1;
    }
    const onboarding_id = `ONB-${String(newNumber).padStart(4, "0")}`;

    // Calculate pending amount
    const pending = (total_amount || 0) - (amount_paid || 0);

    const onboarding = await Onboarding.create({
      onboarding_id,
      deal_ref: deal._id,
      lead_ref: deal.lead_ref,
      deal_id: deal.deal_id,
      lead_id: deal.lead_id,
      client_name,
      contact_number,
      alternate_contact,
      email,
      business_name,
      business_type,
      website,
      social_media_handles,
      service_type,
      service_details,
      project_scope,
      deliverables,
      timeline,
      total_amount,
      amount_paid: amount_paid || 0,
      amount_pending: pending,
      payment_status: payment_status || "partially_paid",
      payment_method,
      invoice_number,
      address,
      city,
      state,
      pincode,
      project_start_date,
      project_deadline,
      client_requirements,
      special_instructions,
      preferred_communication,
      closed_by: req.user._id,
      closed_by_name: req.user.name,
      onboarding_status: "pending_assignment",
    });

    // Notify all admins and managers
    const admins = await User.find({
      role: { $in: ["admin", "sales_manager"] },
      is_active: true,
    });

    for (const a of admins) {
      await Notification.create({
        user_id: a._id,
        title: "New Client Onboarded",
        message: `${req.user.name} onboarded "${client_name}" for ${service_type.replace(/_/g, " ")}. Please assign a team member.`,
        type: "deal_updated",
        ref_id: onboarding._id,
        ref_model: "Deal",
      });
    }

    if (deal.lead_ref) {
      await Lead.findByIdAndUpdate(deal.lead_ref, {
        current_stage: "onboard",
      });
    }

    res.status(201).json({
      success: true,
      message: "Onboarding created successfully.",
      data: onboarding,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating onboarding.",
      error: error.message,
    });
  }
};

// ─── Get All Onboardings ──────────────────────────────────────────────────────
export const getAllOnboardings = async (req, res) => {
  try {
    const { status, service_type, search } = req.query;

    let filter = {};

    // Sales closer sees only their onboardings
    if (req.user.role === "sales_closer") {
      filter.closed_by = req.user._id;
    }

    if (status) filter.onboarding_status = status;
    if (service_type) filter.service_type = service_type;

    if (search) {
      filter.$or = [
        { client_name: { $regex: search, $options: "i" } },
        { onboarding_id: { $regex: search, $options: "i" } },
        { contact_number: { $regex: search, $options: "i" } },
      ];
    }

    const onboardings = await Onboarding.find(filter)
      .populate("assigned_team_member", "name email employee_id")
      .populate("closed_by", "name email")
      .populate("deal_ref")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: onboardings.length,
      data: onboardings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Get Single Onboarding ────────────────────────────────────────────────────
export const getSingleOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id)
      .populate("assigned_team_member", "name email phone employee_id")
      .populate("closed_by", "name email")
      .populate("assigned_by", "name email")
      .populate("deal_ref")
      .populate("lead_ref");

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: "Onboarding not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: onboarding,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Update Onboarding ────────────────────────────────────────────────────────
export const updateOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: "Onboarding not found.",
      });
    }

    const updateData = { ...req.body };

    // Recalculate pending if amounts changed
    if (updateData.total_amount !== undefined || updateData.amount_paid !== undefined) {
      const total = updateData.total_amount || onboarding.total_amount;
      const paid = updateData.amount_paid || onboarding.amount_paid;
      updateData.amount_pending = total - paid;
    }

    const updated = await Onboarding.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Onboarding updated successfully.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Assign Team Member ───────────────────────────────────────────────────────
export const assignTeamMember = async (req, res) => {
  try {
    const {
      team_member_id,
      team_member_role,
      assignment_notes,
      project_start_date,
      project_deadline,
    } = req.body;

    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: "Onboarding not found.",
      });
    }

    let assignedMember = null;
    let assignedMemberName = null;

    if (team_member_id) {
      assignedMember = await User.findById(team_member_id);
      if (!assignedMember) {
        return res.status(404).json({
          success: false,
          message: "Team member not found.",
        });
      }
      assignedMemberName = assignedMember.name;
    }

    const updated = await Onboarding.findByIdAndUpdate(
      req.params.id,
      {
        assigned_team_member: team_member_id || null,
        assigned_team_member_name: assignedMemberName,
        team_member_role,
        assigned_by: req.user._id,
        assigned_by_name: req.user.name,
        assignment_date: new Date(),
        assignment_notes,
        project_start_date,
        project_deadline,
        onboarding_status: team_member_id ? "assigned" : "pending_assignment",
      },
      { new: true }
    );

    // Notify the assigned team member
    if (team_member_id) {
      await Notification.create({
        user_id: team_member_id,
        title: "New Project Assigned",
        message: `You have been assigned to "${onboarding.client_name}" for ${onboarding.service_type.replace(/_/g, " ")} by ${req.user.name}.`,
        type: "deal_assigned",
        ref_id: onboarding._id,
        ref_model: "Deal",
      });
    }

    res.status(200).json({
      success: true,
      message: team_member_id
        ? `Successfully assigned to ${assignedMemberName}`
        : "Assignment updated",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Delete Onboarding (Admin only) ───────────────────────────────────────────
export const deleteOnboarding = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: "Onboarding not found.",
      });
    }

    await Onboarding.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Onboarding deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};




// ─── Generate Credential Collection Link ──────────────────────────────────────
export const generateCredentialLink = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: "Onboarding not found.",
      });
    }

    if (onboarding.service_type !== "video_editing") {
      return res.status(400).json({
        success: false,
        message: "Credentials can only be collected for Video Editing service.",
      });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");

    await Onboarding.findByIdAndUpdate(req.params.id, {
      credential_token: token,
      credential_token_used: false,
    });

    const link = `${req.protocol}://${req.get("host").replace("5001", "5173")}/credentials/${token}`;

    res.status(200).json({
      success: true,
      message: "Credential link generated.",
      link,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Get Onboarding by Token (Public - for client) ────────────────────────────
export const getOnboardingByToken = async (req, res) => {
  try {
    const onboarding = await Onboarding.findOne({
      credential_token: req.params.token,
    }).select("client_name business_name service_type credential_token_used");

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired link.",
      });
    }

    if (onboarding.credential_token_used) {
      return res.status(400).json({
        success: false,
        message: "This form has already been submitted.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        client_name: onboarding.client_name,
        business_name: onboarding.business_name,
        service_type: onboarding.service_type,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Submit Credentials (Public - by client) ──────────────────────────────────
export const submitCredentials = async (req, res) => {
  try {
    const onboarding = await Onboarding.findOne({
      credential_token: req.params.token,
    });

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: "Invalid link.",
      });
    }

    if (onboarding.credential_token_used) {
      return res.status(400).json({
        success: false,
        message: "Already submitted.",
      });
    }

    await Onboarding.findByIdAndUpdate(onboarding._id, {
      collected_credentials: {
        ...req.body,
        submitted_at: new Date(),
      },
      credential_token_used: true,
    });

    res.status(200).json({
      success: true,
      message: "Thank you! Your credentials have been submitted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};


