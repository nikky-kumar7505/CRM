import Deal from "../models/deal.model.js";
import Lead from "../models/lead.model.js";
import User from "../../../shared/models/user.model.js";
import Notification from "../../../shared/models/notification.model.js";

// ─── Create Deal (from Lead) ──────────────────────────────────────────────────
// POST /api/sales/deals
// Admin or Sales Manager creates deal from a lead
export const createDeal = async (req, res) => {
  try {
    const {
      lead_id,
      sales_closer_id,
      deal_value,
      expected_closure_date,
      notes,
    } = req.body;

    // Verify lead exists
    const lead = await Lead.findById(lead_id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    // Verify sales closer exists
    const closer = await User.findById(sales_closer_id);
    if (!closer || closer.role !== "sales_closer") {
      return res.status(400).json({
        success: false,
        message: "Invalid sales closer.",
      });
    }

    // ─── Generate Deal ID manually here ──────────────────────
    const count = await Deal.countDocuments();
    const deal_id = `DEAL-${String(count + 1).padStart(4, "0")}`;

    // Create deal
    const deal = await Deal.create({
      deal_id,
      lead_ref: lead._id,
      lead_id: lead.lead_id,
      client_name: lead.lead_name,
      contact_number: lead.contact_number,
      email: lead.email,
      business_type: lead.business_type,
      business_name: lead.business_name,
      assigned_to: closer._id,
      assigned_to_name: closer.name,
      assigned_by: req.user._id,
      assigned_by_name: req.user.name,
      qualifier_id: lead.assigned_to,            // ✅ ADDED
      qualifier_name: lead.assigned_to_name,     // ✅ ADDED
      payment_status: "not_received",            // ✅ ADDED (default)
      deal_value,
      expected_closure_date,
      notes,
      created_by: req.user._id,
    });

    // Mark lead as passed to closer
    lead.is_passed_to_closer = true;
    lead.passed_to_closer_date = new Date();
    lead.passed_to_closer_by = req.user._id;
    lead.current_stage = "meeting_scheduled";

    // ─── Save lead without triggering pre save hook ───────────
    await Lead.findByIdAndUpdate(lead._id, {
      is_passed_to_closer: true,
      passed_to_closer_date: new Date(),
      passed_to_closer_by: req.user._id,
      current_stage: "meeting_scheduled",
    });

    res.status(201).json({
      success: true,
      message: "Deal created successfully.",
      data: deal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating deal.",
      error: error.message,
    });
  }
};
// ─── Get All Deals ────────────────────────────────────────────────────────────
// GET /api/sales/deals
// Admin/Manager sees all deals
// Sales Closer sees only their deals
// Lead Qualifier can see deals from their leads
export const getAllDeals = async (req, res) => {
  try {
    const { deal_stage, payment_status, page = 1, limit = 10, search } =
      req.query;

    let filter = {};

    // Role-based filter
    if (req.user.role === "sales_closer") {
      filter.assigned_to = req.user._id;
    } else if (req.user.role === "lead_qualifier") {
      // Lead qualifier sees deals from their passed leads
      const myLeads = await Lead.find(
        { assigned_to: req.user._id },
        "_id"
      );
      const myLeadIds = myLeads.map((l) => l._id);
      filter.lead_ref = { $in: myLeadIds };
    }

    // Stage filter
    if (deal_stage) filter.deal_stage = deal_stage;
    if (payment_status) filter.payment_status = payment_status;

    // Search
    if (search) {
      filter.$or = [
        { client_name: { $regex: search, $options: "i" } },
        { deal_id: { $regex: search, $options: "i" } },
        { contact_number: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const deals = await Deal.find(filter)
      .populate("lead_ref", "lead_id lead_name current_stage calling_status")
      .populate("assigned_to", "name email employee_id")
      .populate("assigned_by", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Deal.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: deals.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: deals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Get Single Deal ──────────────────────────────────────────────────────────
// GET /api/sales/deals/:id
export const getSingleDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate("lead_ref")
      .populate("assigned_to", "name email phone employee_id")
      .populate("assigned_by", "name email")
      .populate("meetings.conducted_by", "name email");

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: deal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Update Deal ──────────────────────────────────────────────────────────────
// PUT /api/sales/deals/:id
// Sales Closer updates their deal
export const updateDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found.",
      });
    }

    // Sales Closer can only update their own deals
    if (
      req.user.role === "sales_closer" &&
      deal.assigned_to.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update deals assigned to you.",
      });
    }

    const allowedFields = [
      "deal_stage",
      "deal_value",
      "proposal_sent",
      "proposal_sent_date",
      "expected_closure_date",
      "actual_closure_date",
      "closure_reason",
      "payment_status",
      "payment_amount",
      "payment_date",
      "notes",
      "closer_comment",
      "qualifier_visible_notes", // this is visible to lead qualifier
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        deal[field] = req.body[field];
      }
    });

    await deal.save();

    // If deal is closed, update the lead stage too
   if (req.body.deal_stage === "closed_won") {
  // ✅ AUTO CREATE ONBOARDING ENTRY
      const Onboarding = (await import("../models/onboarding.model.js")).default;
      const NotificationModel = (await import("../../../shared/models/notification.model.js")).default;
      const UserModel = (await import("../../../shared/models/user.model.js")).default;

      // Check if onboarding already exists for this deal
      const existingOnboarding = await Onboarding.findOne({ deal_ref: deal._id });

      if (!existingOnboarding) {
        // Get full lead data
        const fullLead = await Lead.findById(deal.lead_ref).lean();

        // Generate onboarding ID
        const lastOnboarding = await Onboarding.findOne({}, { onboarding_id: 1 })
          .sort({ createdAt: -1 })
          .lean();

        let newNumber = 1;
        if (lastOnboarding && lastOnboarding.onboarding_id) {
          const lastNum = parseInt(
            lastOnboarding.onboarding_id.replace("ONB-", "")
          );
          if (!isNaN(lastNum)) newNumber = lastNum + 1;
        }
        const onboarding_id = `ONB-${String(newNumber).padStart(4, "0")}`;

        // Map service from lead's service_required
        const serviceMap = {
          video_shoot: "video_shoot",
          video_editing: "video_editing",
          web_development: "web_development",
        };
        const service_type =
          serviceMap[fullLead?.service_required] || "video_editing";

        // Auto create onboarding with available data
        const newOnboarding = await Onboarding.create({
          onboarding_id,
          deal_ref: deal._id,
          lead_ref: deal.lead_ref,
          deal_id: deal.deal_id,
          lead_id: deal.lead_id,
          client_name: deal.client_name,
          contact_number: deal.contact_number,
          alternate_contact: fullLead?.alternate_contact || "",
          email: deal.email || "",
          business_name: deal.business_name || "",
          business_type: deal.business_type || "",
          website: fullLead?.website || "",
          service_type,
          service_details:
            deal.notes || fullLead?.requirements || "Pending - to be filled",
          client_requirements: fullLead?.requirements || "",
          total_amount: req.body.deal_value || deal.deal_value || 0,
          amount_paid: req.body.payment_amount || deal.payment_amount || 0,
          amount_pending:
            (req.body.deal_value || deal.deal_value || 0) -
            (req.body.payment_amount || deal.payment_amount || 0),
          payment_status: req.body.payment_status || "not_received",
          payment_method: "upi",
          city: fullLead?.city || "",
          state: fullLead?.state || "",
          country: fullLead?.country || "India",
          closed_by: req.user._id,
          closed_by_name: req.user.name,
          closed_date: new Date(),
          preferred_communication: "whatsapp",
          onboarding_status: "pending_assignment",
        });

        // ✅ Update lead stage to "onboard"
        await Lead.findByIdAndUpdate(deal.lead_ref, {
          current_stage: "onboard",
        });

        // ✅ Notify admins and managers
        const admins = await UserModel.find({
          role: { $in: ["admin", "sales_manager"] },
          is_active: true,
        });

        for (const a of admins) {
          await NotificationModel.create({
            user_id: a._id,
            title: "🎉 New Client Onboarded",
            message: `${req.user.name} closed deal for "${deal.client_name}". Onboarding entry created. Please assign team member.`,
            type: "deal_updated",
            ref_id: newOnboarding._id,
            ref_model: "Deal",
          });
        }
      } else {
        // If onboarding already exists, just update lead stage
        await Lead.findByIdAndUpdate(deal.lead_ref, {
          current_stage: "onboard",
        });
      }
    } else if (req.body.deal_stage === "closed_lost") {
      await Lead.findByIdAndUpdate(deal.lead_ref, {
        current_stage: "closed_lost",
      });
    }

    res.status(200).json({
      success: true,
      message: "Deal updated successfully.",
      data: deal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Add Meeting to Deal ──────────────────────────────────────────────────────
// POST /api/sales/deals/:id/meetings
// Sales Closer adds meeting
export const addMeeting = async (req, res) => {
  try {
    const {
      meeting_title,
      meeting_date,
      meeting_time,
      meeting_type,
      meeting_link,
      meeting_notes,
    } = req.body;

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found.",
      });
    }

    // Sales closer can only add to their deals
    if (
      req.user.role === "sales_closer" &&
      deal.assigned_to.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only add meetings to your own deals.",
      });
    }

    const meeting = {
      meeting_title,
      meeting_date,
      meeting_time,
      meeting_type,
      meeting_link,
      meeting_notes,
      conducted_by: req.user._id,
      conducted_by_name: req.user.name,
    };

    deal.meetings.push(meeting);
    deal.deal_stage = "meeting_scheduled";

    await deal.save();

    res.status(200).json({
      success: true,
      message: "Meeting added successfully.",
      data: deal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Update Meeting Outcome ───────────────────────────────────────────────────
// PUT /api/sales/deals/:dealId/meetings/:meetingId
export const updateMeetingOutcome = async (req, res) => {
  try {
    const { meeting_outcome, meeting_notes } = req.body;

    const deal = await Deal.findById(req.params.dealId);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found.",
      });
    }

    // Find the specific meeting
    const meeting = deal.meetings.id(req.params.meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found.",
      });
    }

    meeting.meeting_outcome = meeting_outcome;
    if (meeting_notes) meeting.meeting_notes = meeting_notes;

    // Update deal stage if meeting is done
    if (meeting_outcome === "positive") {
      deal.deal_stage = "meeting_done";
    }

    await deal.save();

    res.status(200).json({
      success: true,
      message: "Meeting outcome updated successfully.",
      data: deal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Delete Deal (Admin Only) ─────────────────────────────────────────────────
// DELETE /api/sales/deals/:id
export const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found.",
      });
    }

    await Deal.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Deal deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Get Deal Stats ───────────────────────────────────────────────────────────
// GET /api/sales/deals/stats
export const getDealStats = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "sales_closer") {
      filter.assigned_to = req.user._id;
    }

    const stats = await Deal.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total_deals: { $sum: 1 },
          total_value: { $sum: "$deal_value" },
          closed_won: {
            $sum: {
              $cond: [{ $eq: ["$deal_stage", "closed_won"] }, 1, 0],
            },
          },
          closed_lost: {
            $sum: {
              $cond: [{ $eq: ["$deal_stage", "closed_lost"] }, 1, 0],
            },
          },
          total_revenue: {
            $sum: {
              $cond: [
                { $eq: ["$deal_stage", "closed_won"] },
                "$deal_value",
                0,
              ],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        total_deals: 0,
        total_value: 0,
        closed_won: 0,
        closed_lost: 0,
        total_revenue: 0,
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