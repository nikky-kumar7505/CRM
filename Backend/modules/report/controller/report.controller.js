import DailyReport from "../models/dailyReport.model.js";
import reportTemplateModel from "../models/reportTemplate.model.js";
import User from "../../../shared/models/user.model.js";

const getManagedEmployeeIds = async (managerId) => {
  const employees = await User.find({
    managed_by: managerId,
    is_active: true,
  }).select("_id");

  return employees.map((employee) => employee._id);
};

const canAccessReport = async (req, report) => {
  if (!report) return false;

  if (req.user.role === "admin") {
    return true;
  }

  if (String(report.employee?._id || report.employee) === String(req.user._id)) {
    return true;
  }

  if (!req.accessProfile?.isManager) {
    return false;
  }

  const managedEmployeeIds = await getManagedEmployeeIds(req.user._id);

  return managedEmployeeIds.some(
    (employeeId) => String(employeeId) === String(report.employee?._id || report.employee)
  );
};


export const getMyTemplate = async (req, res) => {
  try {
    const template = await reportTemplateModel.findOne({
      role: req.user.role,
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Report template not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: template,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createOrUpdateSlotOne = async (req, res) => {
  try {
    const reportDate = new Date();

    reportDate.setHours(0, 0, 0, 0);

    let report = await DailyReport.findOne({
      employee: req.user._id,
      reportDate,
    });

    if (!report) {
      report = await DailyReport.create({
        employee: req.user._id,
        role: req.user.role,
        reportDate,
      });
    }

    report.slotOne = {
      submittedAt: new Date(),
      data: req.body,
    };

    report.status = "slot_one_submitted";

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Slot one submitted successfully",
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createOrUpdateSlotTwo = async (req, res) => {
  try {
    const reportDate = new Date();

    reportDate.setHours(0, 0, 0, 0);

    const report = await DailyReport.findOne({
      employee: req.user._id,
      reportDate,
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message:
          "Submit slot one before submitting slot two",
      });
    }

    report.slotTwo = {
      submittedAt: new Date(),
      data: req.body,
    };

    report.status = "completed";

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Slot two submitted successfully",
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const reports = await DailyReport.find({
      employee: req.user._id,
    }).sort({
      reportDate: -1,
    });

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeamReports = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role !== "admin") {
      const managedEmployeeIds = await getManagedEmployeeIds(req.user._id);
      filter = {
        employee: {
          $in: managedEmployeeIds,
        },
      };
    }

    const reports = await DailyReport.find(filter)
      .populate(
        "employee",
        "name email employee_id role managed_by"
      )
      .sort({
        reportDate: -1,
      });

    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reviewReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const { rating, remarks } = req.body;

    const report = await DailyReport.findById(reportId).populate(
      "employee",
      "managed_by"
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const hasAccess = await canAccessReport(req, report);
    if (!hasAccess || String(report.employee?._id || report.employee) === String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to review this report.",
      });
    }

    report.review = {
      rating,
      remarks,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
    };

    report.status = "reviewed";

    await report.save();

    return res.status(200).json({
      success: true,
      message: "Report reviewed successfully",
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyReportByDate = async (req, res) => {
  try {
    const { date } = req.params;

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const report = await DailyReport.findOne({
      employee: req.user._id,
      reportDate: {
        $gte: start,
        $lte: end,
      },
    });

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await DailyReport.findById(reportId)
      .populate(
        "employee",
        "name email employee_id role managed_by department"
      )
      .populate(
        "review.reviewedBy",
        "name employee_id"
      );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const hasAccess = await canAccessReport(req, report);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this report.",
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
