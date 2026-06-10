import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import {
  buildCrmAccess,
  buildRoleProfile,
  getDefaultRoleConfig,
  resolveRoleProfileByKey,
  resolveUserAccessProfile,
} from "../utils/role.utils.js";

// ─── Generate Token ───────────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const buildUserResponse = async (userDoc) => {
  const roleProfile = await resolveUserAccessProfile(userDoc);

  return {
    _id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    employee_id: userDoc.employee_id,
    crm_access: buildCrmAccess(roleProfile, userDoc.crm_access),
    department: userDoc.department || roleProfile.department,
    profile_image: userDoc.profile_image,
    phone: userDoc.phone,
    managed_by: userDoc.managed_by,
    role_label: roleProfile.label,
    allowedModules: roleProfile.allowedModules,
    landingPath:
      userDoc.role === "admin" ? "/crm-select" : roleProfile.landingPath,
    isManager: roleProfile.isManager,
  };
};

const resolveRoleForMutation = async (roleKey, fallbackUser = null) => {
  const normalizedRole = String(roleKey || fallbackUser?.role || "")
    .trim()
    .toLowerCase();

  const role = await Role.findOne({ key: normalizedRole });
  const roleProfile = await resolveRoleProfileByKey(normalizedRole, fallbackUser);

  if (!role && !getDefaultRoleConfig(normalizedRole)) {
    return null;
  }

  return {
    role,
    roleProfile,
  };
};

// ─── Register User ────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      department,
      managed_by,
      crm_access,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const count = await User.countDocuments();
    const employee_id = `SW-SAL${String(count + 1).padStart(4, "0")}`;

    const resolvedRole = await resolveRoleForMutation(role);
    if (!resolvedRole) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const resolvedDepartment =
      department || resolvedRole.roleProfile.department;
    const resolvedCrmAccess =
      Array.isArray(crm_access) && crm_access.length > 0
        ? crm_access
        : buildCrmAccess(resolvedRole.roleProfile);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: resolvedRole.roleProfile.key,
      phone,
      department: resolvedDepartment,
      managed_by: managed_by || null,
      employee_id,
      crm_access: resolvedCrmAccess,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: await buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while creating user.",
      error: error.message,
    });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: "Your account is deactivated. Contact admin.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    await User.findByIdAndUpdate(user._id, { last_login: new Date() });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      data: await buildUserResponse(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login.",
      error: error.message,
    });
  }
};

// ─── Get My Profile ───────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "managed_by",
      "name email role"
    );

    const serializedUser = user.toObject();
    const userResponse = await buildUserResponse(serializedUser);

    res.status(200).json({
      success: true,
      data: {
        ...serializedUser,
        ...userResponse,
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

// ─── Change Own Password ──────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(old_password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Admin Changes Any User Password ─────────────────────────────────────────
const changeUserPassword = async (req, res) => {
  try {
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(new_password, salt);

    await User.findByIdAndUpdate(req.params.id, {
      password: hashedPassword,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Get All Users ────────────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, is_active } = req.query;

    let filter = {};
    if (role) filter.role = role;
    if (is_active !== undefined) filter.is_active = is_active === "true";

    const users = await User.find(filter)
      .populate("managed_by", "name email")
      .sort({ createdAt: -1 });

    const hydratedUsers = await Promise.all(
      users.map(async (user) => {
        const plainUser = user.toObject();
        const userResponse = await buildUserResponse(plainUser);
        return {
          ...plainUser,
          ...userResponse,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: hydratedUsers.length,
      data: hydratedUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Update User ──────────────────────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      role,
      phone,
      is_active,
      department,
      managed_by,
      crm_access,
    } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const hasRoleUpdate = Object.prototype.hasOwnProperty.call(req.body, "role");
    const resolvedRole = hasRoleUpdate
      ? await resolveRoleForMutation(role, user)
      : await resolveRoleForMutation(user.role, user);

    if (hasRoleUpdate && !resolvedRole) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected.",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (hasRoleUpdate) user.role = resolvedRole.roleProfile.key;
    if (phone !== undefined) user.phone = phone;
    if (is_active !== undefined) user.is_active = is_active;
    if (department !== undefined && department !== "") {
      user.department = department;
    } else if (hasRoleUpdate) {
      user.department = resolvedRole.roleProfile.department;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "managed_by")) {
      user.managed_by = managed_by || null;
    }

    if (Array.isArray(crm_access)) {
      user.crm_access = crm_access;
    } else if (hasRoleUpdate) {
      user.crm_access = buildCrmAccess(resolvedRole.roleProfile);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        is_active: user.is_active,
        department: user.department,
        managed_by: user.managed_by,
        crm_access: user.crm_access,
      },
      { new: true }
    );

    const plainUpdatedUser = updatedUser.toObject();
    const userResponse = await buildUserResponse(plainUpdatedUser);

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: {
        ...plainUpdatedUser,
        ...userResponse,
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

// ─── Delete User ──────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete admin user.",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// ─── Exports ──────────────────────────────────────────────────────────────────
export {
  registerUser,
  loginUser,
  getMe,
  changePassword,
  changeUserPassword,
  getAllUsers,
  updateUser,
  deleteUser,
};
