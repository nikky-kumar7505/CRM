import DailyReport from "../models/dailyReport.model.js";
import User from "../../../shared/models/user.model.js";

const getDateRange = (type) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (type === "weekly") {
    const currentDay = now.getDay();
    const distanceFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    start.setDate(now.getDate() - distanceFromMonday);
    end.setDate(start.getDate() + 6);
  } else {
    start.setDate(1);
    end.setMonth(now.getMonth() + 1, 0);
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const buildPerformanceSummary = (reports = []) => {
  const totalReports = reports.length;
  const completedReports = reports.filter(
    (report) => report.status === "completed" || report.status === "reviewed"
  ).length;
  const reviewedReports = reports.filter(
    (report) => report.status === "reviewed"
  );
  const totalRatings = reviewedReports.reduce(
    (sum, report) => sum + (report.review?.rating || 0),
    0
  );

  return {
    totalReports,
    completedReports,
    reviewedReports: reviewedReports.length,
    slotOneSubmitted: reports.filter(
      (report) => report.slotOne?.submittedAt
    ).length,
    slotTwoSubmitted: reports.filter(
      (report) => report.slotTwo?.submittedAt
    ).length,
    averageRating:
      reviewedReports.length > 0
        ? Number((totalRatings / reviewedReports.length).toFixed(2))
        : 0,
  };
};

const getManagedEmployeeIds = async (managerId) => {
  const managedEmployees = await User.find({
    managed_by: managerId,
    is_active: true,
  }).select("_id");

  return managedEmployees.map((employee) => employee._id);
};

const getPerformanceForPeriod = async (req, res, type) => {
  try {
    const { start, end } = getDateRange(type);
    const reports = await DailyReport.find({
      employee: req.user._id,
      reportDate: {
        $gte: start,
        $lte: end,
      },
    }).sort({ reportDate: -1 });

    return res.status(200).json({
      success: true,
      data: {
        range: type,
        startDate: start,
        endDate: end,
        summary: buildPerformanceSummary(reports),
        reports,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch performance.",
      error: error.message,
    });
  }
};

const getMyWeeklyPerformance = async (req, res) =>
  getPerformanceForPeriod(req, res, "weekly");

const getMyMonthlyPerformance = async (req, res) =>
  getPerformanceForPeriod(req, res, "monthly");

const getTeamPerformance = async (req, res) => {
  try {
    const { start, end } = getDateRange("monthly");
    let employeeFilter = {};

    if (req.user.role !== "admin") {
      const managedEmployeeIds = await getManagedEmployeeIds(req.user._id);

      employeeFilter = {
        employee: {
          $in: managedEmployeeIds,
        },
      };
    }

    const reports = await DailyReport.find({
      ...employeeFilter,
      reportDate: {
        $gte: start,
        $lte: end,
      },
    })
      .populate("employee", "name employee_id role managed_by")
      .sort({ reportDate: -1 });

    const groupedByEmployee = reports.reduce((accumulator, report) => {
      const employeeId = String(report.employee?._id || report.employee);
      if (!accumulator[employeeId]) {
        accumulator[employeeId] = {
          employee: report.employee,
          reports: [],
        };
      }

      accumulator[employeeId].reports.push(report);
      return accumulator;
    }, {});

    const employeeSummaries = Object.values(groupedByEmployee).map((entry) => ({
      employee: entry.employee,
      summary: buildPerformanceSummary(entry.reports),
      reports: entry.reports,
    }));

    return res.status(200).json({
      success: true,
      data: {
        range: "monthly",
        startDate: start,
        endDate: end,
        summary: buildPerformanceSummary(reports),
        employees: employeeSummaries,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team performance.",
      error: error.message,
    });
  }
};

export {
  getMyWeeklyPerformance,
  getMyMonthlyPerformance,
  getTeamPerformance,
};
