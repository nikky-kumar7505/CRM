export const normalizeModules = (modules = []) => [
  ...new Set(
    modules
      .filter(Boolean)
      .map((moduleName) => String(moduleName).trim().toLowerCase())
      .filter(Boolean)
  ),
];

export const getUserModules = (user) => {
  if (!user) return [];

  if (user.role === "admin") {
    return normalizeModules(
      user.allowedModules?.length
        ? user.allowedModules
        : ["sales", "daily", "attendance"]
    );
  }

  return normalizeModules(
    user.allowedModules?.length ? user.allowedModules : user.crm_access || []
  );
};

export const hasModuleAccess = (user, moduleName) => {
  if (!user) return false;
  if (user.role === "admin") return true;

  return getUserModules(user).includes(moduleName);
};

export const isManagerUser = (user) =>
  Boolean(user?.role === "admin" || user?.isManager);

export const getLandingPath = (user) => {
  if (!user) return "/login";
  if (user.role === "admin") return "/crm-select";
  if (user.landingPath) return user.landingPath;
  if (hasModuleAccess(user, "sales")) return "/sales/dashboard";
  return "/daily/dashboard";
};

export const formatRoleLabel = (roleKey = "") =>
  roleKey
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getModuleFromPath = (pathname = "") =>
  pathname.split("/")[1] || "sales";
