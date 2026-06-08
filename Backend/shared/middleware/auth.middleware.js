import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// ─── Protect Route - Check if user is logged in ───────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token is in header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please login first.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please login again.",
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated. Contact admin.",
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token. Please login again.",
    });
  }
};

// ─── Check CRM Access ─────────────────────────────────────────────────────────
const checkCRMAccess = (crmName) => {
  return (req, res, next) => {
    // Admin always has access to everything
    if (req.user.role === "admin") return next();

    // Check if user has access to this crm
    if (!req.user.crm_access.includes(crmName)) {
      return res.status(403).json({
        success: false,
        message: `You do not have access to the ${crmName} module.`,
      });
    }

    next();
  };
};

export { protect, checkCRMAccess };