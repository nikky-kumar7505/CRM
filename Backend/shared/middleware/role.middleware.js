// ─── Allow Only Specific Roles ────────────────────────────────────────────────
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not allowed to access this resource.`,
      });
    }
    next();
  };
};

// ─── Admin Only ───────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only Admin can access this resource.",
    });
  }
  next();
};

// ─── Sales Manager or Admin ───────────────────────────────────────────────────
const managerOrAdmin = (req, res, next) => {
  if (!["admin", "sales_manager"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Only Sales Manager or Admin can access this resource.",
    });
  }
  next();
};

export { authorizeRoles, adminOnly, managerOrAdmin };