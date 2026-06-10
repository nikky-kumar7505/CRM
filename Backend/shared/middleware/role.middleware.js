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
const managerOrAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Only ${roles.join(", ")} can access this resource.`,
      });
    }

    next();
  };
};

const requireManagerOrAdmin = (req, res, next) => {
  if (req.user.role === "admin" || req.accessProfile?.isManager) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Only managers or admin can access this resource.",
  });
};

export {
  authorizeRoles,
  adminOnly,
  managerOrAdmin,
  requireManagerOrAdmin,
};
