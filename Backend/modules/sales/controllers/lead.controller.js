import Deal from "../models/deal.model.js";
import Lead from "../models/lead.model.js";
import User from "../../../shared/models/user.model.js";
import Notification from "../../../shared/models/notification.model.js";


// ─── Create Lead ──────────────────────────────────────────────────────────────
// POST /api/sales/leads
// Admin, Sales Manager can create lead
// ─── Create Lead ──────────────────────────────────────────────────────────────
export const createLead = async (req, res) => {
  try {
    const {
      lead_name,
      contact_number,
      alternate_contact,
      email,
      business_type,
      business_name,
      website,
      social_media_handle,
      lead_source,
      lead_source_detail,
      budget,
      requirements,
      service_required,  // ✅ NEW field
      tags,
      city,
      state,
      country,
    } = req.body;

    // Generate Lead ID
    const lastLead = await Lead.findOne({}, { lead_id: 1 })
      .sort({ createdAt: -1 })
      .lean();

    let newLeadNumber = 1;
    if (lastLead && lastLead.lead_id) {
      const lastNumber = parseInt(
        lastLead.lead_id.replace("LEAD-", "").replace("SWZ-", "")
      );
      if (!isNaN(lastNumber)) {
        newLeadNumber = lastNumber + 1;
      }
    }

    const lead_id = `SWZ-${String(newLeadNumber).padStart(4, "0")}`;

    // Auto Assign
    const qualifiers = await User.find({
      role: "lead_qualifier",
      is_active: true,
    }).lean();

    let assigned_to = null;
    let assigned_to_name = null;
    let autoAssignMessage = null;

    if (qualifiers.length > 0) {
      const qualifierLeadCounts = await Promise.all(
        qualifiers.map(async (q) => {
          const count = await Lead.countDocuments({ assigned_to: q._id });
          return { ...q, leadCount: count };
        })
      );

      const leastBusy = qualifierLeadCounts.reduce((prev, curr) =>
        prev.leadCount <= curr.leadCount ? prev : curr
      );

      assigned_to = leastBusy._id;
      assigned_to_name = leastBusy.name;
      autoAssignMessage = `Lead automatically assigned to ${leastBusy.name} (${leastBusy.employee_id})`;
    }

    const lead = await Lead.create({
      lead_id,
      lead_name,
      contact_number,
      alternate_contact,
      email,
      business_type: business_type || "other",
      business_name,
      website,
      social_media_handle,
      lead_source,
      lead_source_detail,
      budget,
      requirements,
      service_required,  // ✅ Save service_required
      priority: "medium",
      tags,
      city,
      state,
      country,
      assigned_to,
      assigned_to_name,
      assignment_date: assigned_to ? new Date() : null,
      assigned_by: assigned_to ? req.user._id : null,
      assigned_by_name: assigned_to ? req.user.name : null,
      current_stage: "fresh",  // ✅ ALWAYS fresh when created by admin/manager
      created_by: req.user._id,
      created_by_name: req.user.name,
    });

    if (assigned_to) {
      await Notification.create({
        user_id: assigned_to,
        title: "New Lead Assigned",
        message: `A new lead "${lead_name}" has been assigned to you by ${req.user.name}.`,
        type: "lead_assigned",
        ref_id: lead._id,
        ref_model: "Lead",
      });
    }

    const adminsAndManagers = await User.find({
      role: { $in: ["admin", "sales_manager"] },
      is_active: true,
      _id: { $ne: req.user._id },
    });

    for (const person of adminsAndManagers) {
      await Notification.create({
        user_id: person._id,
        title: "New Lead Created",
        message: `New lead "${lead_name}" created${
          assigned_to_name ? ` and assigned to ${assigned_to_name}` : ""
        }.`,
        type: "lead_assigned",
        ref_id: lead._id,
        ref_model: "Lead",
      });
    }

    res.status(201).json({
      success: true,
      message: "Lead created successfully.",
      auto_assign_info: autoAssignMessage,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating lead.",
      error: error.message,
    });
  }
};




// ─── Close Lead by Lead Qualifier (Follow Up Section) ─────────────────────────
export const closeLeadByQualifier = async (req, res) => {
  try {
    const { closure_reason } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    if (
      req.user.role === "lead_qualifier" &&
      lead.assigned_to?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only close leads assigned to you.",
      });
    }

    await Lead.findByIdAndUpdate(lead._id, {
      current_stage: "closed_lost",
      comment: closure_reason || "Client not interested after follow up.",
    });

    // Notify admin and manager
    const adminsAndManagers = await User.find({
      role: { $in: ["admin", "sales_manager"] },
      is_active: true,
    });

    for (const person of adminsAndManagers) {
      await Notification.create({
        user_id: person._id,
        title: "Lead Closed by Qualifier",
        message: `Lead "${lead.lead_name}" closed by ${req.user.name}. Reason: ${closure_reason || "Not interested"}`,
        type: "general",
        ref_id: lead._id,
        ref_model: "Lead",
      });
    }

    res.status(200).json({
      success: true,
      message: "Lead closed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};





// ─── Get Follow Up Leads ──────────────────────────────────────────────────────
export const getFollowUpLeads = async (req, res) => {
  try {
    let filter = {
      next_follow_up_date: { $ne: null },
      current_stage: { $nin: ["closed_won", "closed_lost"] },
    };

    if (req.user.role === "lead_qualifier") {
      filter.assigned_to = req.user._id;
    }

    const leads = await Lead.find(filter)
      .sort({ next_follow_up_date: 1 }) // closest date first
      .populate("assigned_to", "name email employee_id");

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Get Hot Leads ────────────────────────────────────────────────────────────
export const getHotLeads = async (req, res) => {
  try {
    let filter = {
      priority: "hot",
      current_stage: { $nin: ["closed_won", "closed_lost"] },
    };

    if (req.user.role === "lead_qualifier") {
      filter.assigned_to = req.user._id;
    }

    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .populate("assigned_to", "name email employee_id");

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};


// ─── Get All Leads ────────────────────────────────────────────────────────────
// GET /api/sales/leads
// Admin sees all leads
// Sales Manager sees all leads
// Lead Qualifier sees only their assigned leads
// Sales Closer sees only leads passed to them
export const getAllLeads = async (req, res) => {
  try {
    const {
      current_stage,
      calling_status,
      business_type,
      is_passed_to_closer,
      assigned_to,
      priority,
      page = 1,
      limit = 10,
      search,
    } = req.query;

    // ─── Build Filter Based on Role ───────────────────────────
    let filter = {};

    if (req.user.role === "lead_qualifier") {
      // Lead qualifier sees only their assigned leads
      filter.assigned_to = req.user._id;
    } else if (req.user.role === "sales_closer") {
      // Sales closer sees only leads passed to them
      filter.is_passed_to_closer = true;
    }
    // Admin and Sales Manager see all leads

    // ─── Additional Filters from Query ───────────────────────
    if (current_stage) filter.current_stage = current_stage;
    if (calling_status) filter.calling_status = calling_status;
    if (business_type) filter.business_type = business_type;
    if (is_passed_to_closer !== undefined)
      filter.is_passed_to_closer = is_passed_to_closer === "true";
    if (priority) filter.priority = priority;

    // Admin/Manager can filter by assigned_to
    if (
      assigned_to &&
      ["admin", "sales_manager"].includes(req.user.role)
    ) {
      filter.assigned_to = assigned_to;
    }

    // ─── Search ───────────────────────────────────────────────
    if (search) {
      filter.$or = [
        { lead_name: { $regex: search, $options: "i" } },
        { contact_number: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { lead_id: { $regex: search, $options: "i" } },
        { business_name: { $regex: search, $options: "i" } },
      ];
    }

    // ─── Pagination ───────────────────────────────────────────
    const skip = (Number(page) - 1) * Number(limit);

    const leads = await Lead.find(filter)
      .populate("assigned_to", "name email employee_id")
      .populate("assigned_by", "name email")
      .populate("created_by", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Lead.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: leads.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: leads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching leads.",
      error: error.message,
    });
  }
};

// ─── Get Single Lead ──────────────────────────────────────────────────────────
// GET /api/sales/leads/:id
export const getSingleLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assigned_to", "name email phone employee_id")
      .populate("assigned_by", "name email")
      .populate("created_by", "name email")
      .populate("passed_to_closer_by", "name email")
      .populate("call_history.called_by", "name email");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    // Lead qualifier can only see their own leads
    if (
      req.user.role === "lead_qualifier" &&
      lead.assigned_to?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this lead.",
      });
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Update Lead ──────────────────────────────────────────────────────────────
// PUT /api/sales/leads/:id
export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    if (
      req.user.role === "lead_qualifier" &&
      lead.assigned_to?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update leads assigned to you.",
      });
    }

    const allowedFields = [
      "lead_name",
      "contact_number",
      "alternate_contact",
      "email",
      "business_type",
      "business_name",
      "website",
      "social_media_handle",
      "lead_source",
      "current_stage",
      "calling_status",
      "next_follow_up_date",
      "comment",
      "budget",
      "requirements",
      "service_required",  // ✅ NEW
      "priority",
      "tags",
      "city",
      "state",
      "country",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    // ✅ Auto change stage if was fresh and any update happens
    if (lead.current_stage === "fresh") {
      lead.current_stage = "contacted";
    }

    // ✅ Auto change stage to hot_lead if priority set to hot
    if (req.body.priority === "hot") {
      lead.current_stage = "hot_lead";
    }

    await lead.save();

    res.status(200).json({
      success: true,
      message: "Lead updated successfully.",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};


// ─── Delete Lead (Admin and Sales Manager) ────────────────────────────────────
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Assign Lead to Lead Qualifier ───────────────────────────────────────────
// PUT /api/sales/leads/:id/assign
// Sales Manager or Admin can assign leads
// ─── Assign Lead to Lead Qualifier ───────────────────────────────────────────
export const assignLead = async (req, res) => {
  try {
    const { qualifier_id } = req.body;

    if (!qualifier_id) {
      return res.status(400).json({
        success: false,
        message: "Please provide qualifier_id to assign.",
      });
    }

    const qualifier = await User.findById(qualifier_id);
    if (!qualifier) {
      return res.status(404).json({
        success: false,
        message: "Lead qualifier not found.",
      });
    }

    if (qualifier.role !== "lead_qualifier") {
      return res.status(400).json({
        success: false,
        message: "You can only assign leads to a Lead Qualifier.",
      });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    lead.assigned_to = qualifier._id;
    lead.assigned_to_name = qualifier.name;
    lead.assigned_by = req.user._id;
    lead.assigned_by_name = req.user.name;
    lead.assignment_date = new Date();
    lead.current_stage = "fresh";  // ✅ Changed from "contacted" to "fresh"

    await lead.save();

    // Send notification
    await Notification.create({
      user_id: qualifier._id,
      title: "Lead Assigned to You",
      message: `Lead "${lead.lead_name}" has been assigned to you by ${req.user.name}.`,
      type: "lead_assigned",
      ref_id: lead._id,
      ref_model: "Lead",
    });

    res.status(200).json({
      success: true,
      message: `Lead assigned to ${qualifier.name} successfully.`,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Add Call Log ─────────────────────────────────────────────────────────────
// POST /api/sales/leads/:id/call-log
// ─── Add Call Log ─────────────────────────────────────────────────────────────
export const addCallLog = async (req, res) => {
  try {
    const { calling_status, comment, call_recording } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    if (
      req.user.role === "lead_qualifier" &&
      lead.assigned_to?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only log calls for leads assigned to you.",
      });
    }

    const callEntry = {
      called_by: req.user._id,
      called_by_name: req.user.name,
      call_date: new Date(),
      calling_status,
      comment,
      call_recording,
    };

    lead.call_history.push(callEntry);
    lead.calling_status = calling_status;
    lead.last_calling_date = new Date();
    lead.total_calls = lead.total_calls + 1;
    lead.comment = comment || lead.comment;

    if (!lead.first_calling_date) {
      lead.first_calling_date = new Date();
    }

    if (call_recording) {
      lead.call_recording = call_recording;
    }

    // ✅ AUTO change stage based on calling_status
    if (lead.current_stage === "fresh" || lead.current_stage === "new") {
      // First contact - move from fresh to contacted
      lead.current_stage = "contacted";
    }

    // ✅ Map calling status to lead stage
    if (calling_status === "interested") {
      lead.current_stage = "interested";
    } else if (calling_status === "not_interested") {
      lead.current_stage = "not_interested";
    } else if (calling_status === "callback_requested") {
      lead.current_stage = "follow_up";
    }

    await lead.save();

    // Notify admin and manager
    const adminsAndManagers = await User.find({
      role: { $in: ["admin", "sales_manager"] },
      is_active: true,
    });

    for (const person of adminsAndManagers) {
      await Notification.create({
        user_id: person._id,
        title: "Lead Status Updated",
        message: `${req.user.name} updated "${lead.lead_name}" to "${calling_status}".`,
        type: "general",
        ref_id: lead._id,
        ref_model: "Lead",
      });
    }

    res.status(200).json({
      success: true,
      message: "Call log added successfully.",
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};


// ─── Pass Lead to Sales Closer ────────────────────────────────────────────────
// PUT /api/sales/leads/:id/pass-to-closer
// Lead Qualifier passes lead to Sales Closer when meeting is arranged
// ─── Pass Lead to Sales Closer (Auto Assign) ─────────────────────────────────
export const passLeadToCloser = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found.",
      });
    }

    if (
      req.user.role === "lead_qualifier" &&
      lead.assigned_to?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only pass leads assigned to you.",
      });
    }

    if (lead.is_passed_to_closer) {
      return res.status(400).json({
        success: false,
        message: "Lead is already passed to Sales Closer.",
      });
    }

    await Lead.findByIdAndUpdate(lead._id, {
      is_passed_to_closer: true,
      passed_to_closer_date: new Date(),
      passed_to_closer_by: req.user._id,
      current_stage: "meeting_scheduled",
    });

    // ─── Notify all sales closers ─────────────────────────────
    const salesClosers = await User.find({
      role: "sales_closer",
      is_active: true,
    });

    if (salesClosers.length > 0) {
      const notifs = salesClosers.map((closer) => ({
        user_id: closer._id,
        title: "New Lead Ready for Closing",
        message: `Lead "${lead.lead_name}" is ready for meeting. Passed by ${req.user.name}.`,
        type: "lead_passed",
        ref_id: lead._id,
        ref_model: "Lead",
      }));
      await Notification.insertMany(notifs);
    }

    res.status(200).json({
      success: true,
      message: "Lead passed to Sales Closer successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Get Lead Statistics ──────────────────────────────────────────────────────
// GET /api/sales/leads/stats
export const getLeadStats = async (req, res) => {
  try {
    // Build filter based on role
    let filter = {};
    if (req.user.role === "lead_qualifier") {
      filter.assigned_to = req.user._id;
    }

    const stats = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ["$current_stage", "new"] }, 1, 0] } },
          interested: {
            $sum: {
              $cond: [{ $eq: ["$current_stage", "interested"] }, 1, 0],
            },
          },
          hot_leads: {
            $sum: { $cond: [{ $eq: ["$current_stage", "hot_lead"] }, 1, 0] },
          },
          closed_won: {
            $sum: { $cond: [{ $eq: ["$current_stage", "closed_won"] }, 1, 0] },
          },
          closed_lost: {
            $sum: {
              $cond: [{ $eq: ["$current_stage", "closed_lost"] }, 1, 0],
            },
          },
          passed_to_closer: {
            $sum: { $cond: ["$is_passed_to_closer", 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        total: 0,
        new: 0,
        interested: 0,
        hot_leads: 0,
        closed_won: 0,
        closed_lost: 0,
        passed_to_closer: 0,
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




// ─── Upload CSV Leads ─────────────────────────────────────────────────────────
// ─── Upload CSV Leads ─────────────────────────────────────────────────────────
export const uploadCSVLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV file.",
      });
    }

    // Parse CSV from buffer
    const csvContent = req.file.buffer.toString("utf8");
    const lines = csvContent
      .split(/\r?\n/)
      .filter((line) => line.trim() !== "");

    if (lines.length < 2) {
      return res.status(400).json({
        success: false,
        message: "CSV file is empty or has no data rows.",
      });
    }

    // Get headers from first row
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));

    const createdLeads = [];
    const errors = [];

    // Find qualifiers for auto assignment
    const qualifiers = await User.find({
      role: "lead_qualifier",
      is_active: true,
    }).lean();

    // ─── Get starting lead number ONCE before loop ───────────
    const lastLead = await Lead.findOne({}, { lead_id: 1 })
      .sort({ createdAt: -1 })
      .lean();

    let leadNumber = 1;
    if (lastLead && lastLead.lead_id) {
      // ✅ NEW
        const lastNum = parseInt(
          lastLead.lead_id.replace("LEAD-", "").replace("SWZ-", "")
        )
      if (!isNaN(lastNum)) {
        leadNumber = lastNum + 1;
      }
    }

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(",").map((v) => v.trim());
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || "";
        });

        // Skip empty rows
        if (!rowData.lead_name && !rowData.name && !rowData.contact_number) {
          continue;
        }

        // ─── Generate UNIQUE lead ID for each iteration ─────
        // ✅ NEW
        const lead_id = `SWZ-${String(leadNumber).padStart(4, "0")}`;
        leadNumber++; // increment for next lead

        // ─── Convert contact number (handles scientific notation) ──
        let contactNumber =
          rowData.contact_number || rowData.phone || rowData.mobile || "";

        // If number is in scientific notation like 9.88E+09
        if (contactNumber.includes("E") || contactNumber.includes("e")) {
          contactNumber = Number(contactNumber).toFixed(0);
        }
        contactNumber = String(contactNumber).replace(/[^\d]/g, "");

        // ─── Auto assign to least busy qualifier ────────────
        let assigned_to = null;
        let assigned_to_name = null;

        if (qualifiers.length > 0) {
          const qualifierLeadCounts = await Promise.all(
            qualifiers.map(async (q) => {
              const dbCount = await Lead.countDocuments({
                assigned_to: q._id,
              });
              const newCount = createdLeads.filter(
                (l) =>
                  l.assigned_to &&
                  l.assigned_to.toString() === q._id.toString()
              ).length;
              return { ...q, leadCount: dbCount + newCount };
            })
          );

          const leastBusy = qualifierLeadCounts.reduce((prev, curr) =>
            prev.leadCount <= curr.leadCount ? prev : curr
          );

          assigned_to = leastBusy._id;
          assigned_to_name = leastBusy.name;
        }

        // ─── Create lead ────────────────────────────────────
        const lead = await Lead.create({
          lead_id,
          lead_name: rowData.lead_name || rowData.name || "Unknown",
          contact_number: contactNumber,
          email: rowData.email || "",
          business_type: "other",
          business_name: rowData.business_name || rowData.company || "",
          lead_source: rowData.lead_source || rowData.source || "other",
          city: rowData.city || "",
          state: rowData.state || "",
          requirements:
            rowData.requirements || rowData.service || "",  // ✅ Detailed requirements
          service_required:
            rowData.service_type || rowData.service_required || null,  // ✅ NEW
          priority: rowData.priority || "medium",
          assigned_to,
          assigned_to_name,
          assignment_date: assigned_to ? new Date() : null,
          assigned_by: assigned_to ? req.user._id : null,
          assigned_by_name: assigned_to ? req.user.name : null,
          current_stage: "fresh",  // ✅ Always fresh
          created_by: req.user._id,
          created_by_name: req.user.name,
        });

        createdLeads.push(lead);

        // Notify qualifier
        if (assigned_to) {
          await Notification.create({
            user_id: assigned_to,
            title: "New Lead Assigned",
            message: `Lead "${lead.lead_name}" assigned to you via CSV import by ${req.user.name}.`,
            type: "lead_assigned",
            ref_id: lead._id,
            ref_model: "Lead",
          });
        }
      } catch (rowError) {
        errors.push(`Row ${i + 1}: ${rowError.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `${createdLeads.length} leads created successfully from CSV.`,
      created: createdLeads.length,
      errors: errors.length > 0 ? errors : undefined,
      data: createdLeads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while processing CSV.",
      error: error.message,
    });
  }
};


// ─── Bulk Update Leads Status ─────────────────────────────────────────────────
export const bulkUpdateLeads = async (req, res) => {
  try {
    const { lead_ids, calling_status, current_stage, comment } = req.body;

    if (!lead_ids || lead_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide lead_ids array.",
      });
    }

    // Build update object
    const updateData = {};
    if (calling_status) updateData.calling_status = calling_status;
    if (current_stage) updateData.current_stage = current_stage;
    if (comment) updateData.comment = comment;
    updateData.last_calling_date = new Date();

    // For lead qualifier, only allow updating their own leads
    let filter = { _id: { $in: lead_ids } };
    if (req.user.role === "lead_qualifier") {
      filter.assigned_to = req.user._id;
    }

    await Lead.updateMany(filter, { $set: updateData });

    // Add call log to each lead if status provided
    if (calling_status) {
      await Lead.updateMany(filter, {
        $push: {
          call_history: {
            called_by: req.user._id,
            called_by_name: req.user.name,
            call_date: new Date(),
            calling_status,
            comment: comment || `Bulk update: ${calling_status}`,
          },
        },
        $inc: { total_calls: 1 },
      });
    }

    res.status(200).json({
      success: true,
      message: `${lead_ids.length} leads updated successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during bulk update.",
      error: error.message,
    });
  }
};