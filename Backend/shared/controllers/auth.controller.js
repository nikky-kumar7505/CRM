import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

// ─── Generate Token ───────────────────────────────────────────────────────────
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ─── Register User ────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, department, managed_by } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const count = await User.countDocuments();
    const employee_id = `EMP-${String(count + 1).padStart(4, "0")}`;

    let crm_access = ["sales"];
    if (role === "admin") {
      crm_access = ["sales", "attendance"];
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      department,
      managed_by,
      employee_id,
      crm_access,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
        crm_access: user.crm_access,
      },
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
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employee_id: user.employee_id,
        crm_access: user.crm_access,
        department: user.department,
        profile_image: user.profile_image,
      },
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

    res.status(200).json({
      success: true,
      data: user,
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

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
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
    const { name, email, role, phone, is_active, department, managed_by, crm_access } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone) user.phone = phone;
    if (is_active !== undefined) user.is_active = is_active;
    if (department) user.department = department;
    if (managed_by) user.managed_by = managed_by;
    if (crm_access) user.crm_access = crm_access;

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

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: updatedUser,
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