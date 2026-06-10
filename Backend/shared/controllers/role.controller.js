import Role from "../models/role.model.js";
import {
  buildRoleProfile,
  buildCrmAccess,
  isSystemRole,
} from "../utils/role.utils.js";

const sanitizeRoleKey = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const listRoles = async (req, res) => {
  try {
    const includeInactive = req.query.include_inactive === "true";
    const filter = includeInactive ? {} : { isActive: true };
    const roles = await Role.find(filter).sort({
      key: 1,
    });

    return res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles.",
      error: error.message,
    });
  }
};

const createRole = async (req, res) => {
  try {
    const rawKey = req.body.key || req.body.label;
    const key = sanitizeRoleKey(rawKey);

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Role key or label is required.",
      });
    }

    const existingRole = await Role.findOne({ key });
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: "Role already exists.",
      });
    }

    const label = req.body.label || buildRoleProfile({ role: { key } }).label;
    const roleProfile = buildRoleProfile({
      role: {
        key,
        label,
        department: req.body.department,
        allowedModules: req.body.allowedModules,
        landingPath: req.body.landingPath,
        isManager: req.body.isManager,
        isActive: req.body.isActive,
      },
    });

    const role = await Role.create({
      key,
      label: roleProfile.label,
      department: roleProfile.department,
      allowedModules: buildCrmAccess(roleProfile),
      landingPath: roleProfile.landingPath,
      isManager: Boolean(req.body.isManager),
      isActive:
        typeof req.body.isActive === "boolean" ? req.body.isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully.",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create role.",
      error: error.message,
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    const isProtectedRole = isSystemRole(role.key);
    const requestedModules = Array.isArray(req.body.allowedModules)
      ? req.body.allowedModules
      : role.allowedModules;

    if (req.body.label) role.label = req.body.label;
    if (req.body.department) role.department = req.body.department;

    if (!isProtectedRole) {
      role.allowedModules = buildCrmAccess(
        buildRoleProfile({
          role: {
            key: role.key,
            label: role.label,
            department: role.department,
            allowedModules: requestedModules,
            landingPath: req.body.landingPath || role.landingPath,
            isManager:
              typeof req.body.isManager === "boolean"
                ? req.body.isManager
                : role.isManager,
            isActive:
              typeof req.body.isActive === "boolean"
                ? req.body.isActive
                : role.isActive,
          },
        })
      );

      if (req.body.landingPath) role.landingPath = req.body.landingPath;
      if (typeof req.body.isManager === "boolean") {
        role.isManager = req.body.isManager;
      }
      if (typeof req.body.isActive === "boolean") {
        role.isActive = req.body.isActive;
      }
    }

    await role.save();

    return res.status(200).json({
      success: true,
      message: "Role updated successfully.",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update role.",
      error: error.message,
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    const role = await Role.findById(roleId);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    if (isSystemRole(role.key)) {
      return res.status(400).json({
        success: false,
        message: "System roles cannot be deleted.",
      });
    }

    await Role.findByIdAndDelete(roleId);

    return res.status(200).json({
      success: true,
      message: "Role deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete role.",
      error: error.message,
    });
  }
};

export { listRoles, createRole, updateRole, deleteRole };
