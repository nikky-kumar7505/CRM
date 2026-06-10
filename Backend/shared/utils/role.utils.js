import Role from "../models/role.model.js";

const SYSTEM_ROLE_KEYS = [
  "admin",
];

const DEFAULT_ROLE_CONFIGS = [
  {
    key: "admin",
    label: "Admin",
    department: "Administration",
    allowedModules: ["sales", "daily", "attendance"],
    landingPath: "/crm-select",
    isManager: true,
    isActive: true,
  },
  {
    key: "sales_manager",
    label: "Sales Manager",
    department: "Sales",
    allowedModules: ["sales","daily"],
    landingPath: "/sales/dashboard",
    isManager: true,
    isActive: true,
  },
  {
    key: "lead_qualifier",
    label: "Lead Qualifier",
    department: "Sales",
    allowedModules: ["sales","daily"],
    landingPath: "/sales/dashboard",
    isManager: false,
    isActive: true,
  },
  {
    key: "sales_closer",
    label: "Lead Closer",
    department: "Sales",
    allowedModules: ["sales","daily"],
    landingPath: "/sales/dashboard",
    isManager: false,
    isActive: true,
  },
  {
    key: "social_media_manager",
    label: "Social Media Manager",
    department: "Marketing",
    allowedModules: ["daily"],
    landingPath: "/daily/dashboard",
    isManager: true,
    isActive: true,
  },
  {
    key: "video_editor",
    label: "Video Editor",
    department: "Creative",
    allowedModules: ["daily"],
    landingPath: "/daily/dashboard",
    isManager: false,
    isActive: true,
  },
];

const DEFAULT_ROLE_MAP = new Map(
  DEFAULT_ROLE_CONFIGS.map((role) => [role.key, role])
);

const normalizeModules = (modules = []) => [
  ...new Set(
    modules
      .filter(Boolean)
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean)
  ),
];

const prettifyRoleKey = (roleKey = "") =>
  roleKey
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getDefaultRoleConfig = (roleKey) =>
  DEFAULT_ROLE_MAP.get(String(roleKey || "").trim().toLowerCase()) || null;

const isSystemRole = (roleKey) =>
  SYSTEM_ROLE_KEYS.includes(
    String(roleKey || "").trim().toLowerCase()
  );

const buildRoleProfile = ({ user = null, role = null }) => {
  const roleKey = role?.key || user?.role || "";
  const fallback = getDefaultRoleConfig(roleKey);
  const allowedModules = normalizeModules(
    role?.allowedModules?.length
      ? role.allowedModules
      : user?.crm_access?.length
      ? user.crm_access
      : fallback?.allowedModules || ["daily"]
  );

  return {
    key: roleKey,
    label: role?.label || fallback?.label || prettifyRoleKey(roleKey),
    department:
      role?.department || user?.department || fallback?.department || "General",
    allowedModules,
    landingPath:
      role?.landingPath ||
      fallback?.landingPath ||
      (allowedModules.includes("sales")
        ? "/sales/dashboard"
        : "/daily/dashboard"),
    isManager:
      typeof role?.isManager === "boolean"
        ? role.isManager
        : Boolean(fallback?.isManager),
    isActive:
      typeof role?.isActive === "boolean" ? role.isActive : true,
    isSystem: isSystemRole(roleKey),
  };
};

const resolveRoleProfileByKey = async (roleKey, user = null) => {
  const normalizedKey = String(roleKey || "").trim().toLowerCase();
  const role = await Role.findOne({ key: normalizedKey }).lean();

  return buildRoleProfile({
    user,
    role: role || (user ? null : getDefaultRoleConfig(normalizedKey)),
  });
};

const resolveUserAccessProfile = async (user) => {
  const role = await Role.findOne({ key: user.role }).lean();
  return buildRoleProfile({ user, role });
};

const buildCrmAccess = (roleProfile, legacyAccess = []) => {
  const preferredModules = normalizeModules(roleProfile?.allowedModules);
  if (preferredModules.length > 0) {
    return preferredModules;
  }

  return normalizeModules(legacyAccess);
};

const ensureDefaultRoles = async () => {
  await Promise.all(
    DEFAULT_ROLE_CONFIGS.map((role) =>
      Role.updateOne(
        { key: role.key },
        {
          $setOnInsert: role,
        },
        { upsert: true }
      )
    )
  );
};

export {
  DEFAULT_ROLE_CONFIGS,
  SYSTEM_ROLE_KEYS,
  ensureDefaultRoles,
  isSystemRole,
  getDefaultRoleConfig,
  buildRoleProfile,
  resolveRoleProfileByKey,
  resolveUserAccessProfile,
  buildCrmAccess,
};
