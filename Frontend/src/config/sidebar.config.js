import {
  FiHome,
  FiUsers,
  FiPhoneCall,
  FiBriefcase,
  FiClipboard,
  FiFileText,
  FiBarChart2,
  FiLayers,
  FiCheckCircle,
  FiUserCheck,
  FiUserX,
  FiZap,
  FiClock,
} from "react-icons/fi";
import { hasModuleAccess, isManagerUser } from "./access.config.js";

export const SIDEBAR_CONFIG = {
  sales: {
    title: "Sales CRM",
    icon: "S",
    sections: [
      {
        title: "Main",
        items: [
          {
            label: "Dashboard",
            path: "/sales/dashboard",
            icon: FiHome,
          },
        ],
      },
      {
        title: "Sales CRM",
        items: [
          {
            label: "Leads",
            path: "/sales/leads",
            icon: FiPhoneCall,
            roles: ["admin", "sales_manager", "lead_qualifier"],
          },
          {
            label: "Hot Leads",
            path: "/sales/hot-leads",
            icon: FiZap,
            roles: ["lead_qualifier"],
          },
          {
            label: "Follow Up",
            path: "/sales/follow-up",
            icon: FiClock,
            roles: ["lead_qualifier"],
          },
          {
            label: "Deals",
            path: "/sales/deals",
            icon: FiBriefcase,
            roles: ["admin", "sales_manager", "sales_closer"],
          },
          {
            label: "Onboarding Clients",
            path: "/sales/onboarding",
            icon: FiCheckCircle,
            roles: ["admin", "sales_manager", "sales_closer"],
          },
          {
            label: "Retainable Clients",
            path: "/sales/retainable",
            icon: FiUserCheck,
            roles: ["admin", "sales_manager"],
          },
          {
            label: "Non-Retainable Clients",
            path: "/sales/non-retainable",
            icon: FiUserX,
            roles: ["admin", "sales_manager"],
          },
        ],
      },
      {
        title: "Overview",
        items: [
          {
            label: "Dashboard",
            path: "/sales/dashboard",
            icon: FiHome,
          },
          {
            label: "Submit Report",
            path: "/sales/report",
            icon: FiClipboard,
          },
          {
            label: "My Reports",
            path: "/sales/history",
            icon: FiFileText,
          },
        ],
      },
      {
        title: "Management",
        roles: ["admin", "sales_manager"],
        items: [
          {
            label: "Users",
            path: "/sales/users",
            icon: FiUsers,
          },
        ],
      },
    ],
  },
  daily: {
    title: "Daily Workspace",
    icon: "D",
    sections: [
      {
        title: "Overview",
        items: [
          {
            label: "Dashboard",
            path: "/daily/dashboard",
            icon: FiHome,
          },
          {
            label: "Submit Report",
            path: "/daily/report",
            icon: FiClipboard,
          },
          {
            label: "My Reports",
            path: "/daily/history",
            icon: FiFileText,
          },
        ],
      },
      {
        title: "Performance",
        items: [
          {
            label: "Weekly Performance",
            path: "/daily/weekly-performance",
            icon: FiBarChart2,
          },
          {
            label: "Monthly Performance",
            path: "/daily/monthly-performance",
            icon: FiBarChart2,
          },
        ],
      },
      {
        title: "Team",
        managerOnly: true,
        items: [
          {
            label: "Team Reports",
            path: "/daily/team-reports",
            icon: FiUsers,
          },
          {
            label: "Team Performance",
            path: "/daily/team-performance",
            icon: FiBarChart2,
          },
        ],
      },
      {
        title: "Admin",
        roles: ["admin"],
        items: [
          {
            label: "Create Template",
            path: "/daily/create-template",
            icon: FiLayers,
          },
          {
            label: "All Templates",
            path: "/daily/all-templates",
            icon: FiFileText,
          },
        ],
      },
    ],
  },
};

export const getSidebarConfig = (moduleName, user) => {
  const baseConfig = SIDEBAR_CONFIG[moduleName] || SIDEBAR_CONFIG.sales;

  const sections = baseConfig.sections
    .filter((section) => {
      if (section.moduleName && !hasModuleAccess(user, section.moduleName)) {
        return false;
      }

      if (section.roles?.length && !section.roles.includes(user?.role)) {
        return false;
      }

      if (section.managerOnly && !isManagerUser(user)) {
        return false;
      }

      return true;
    })
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.roles?.length && !item.roles.includes(user?.role)) {
          return false;
        }

        if (item.managerOnly && !isManagerUser(user)) {
          return false;
        }

        if (item.moduleName && !hasModuleAccess(user, item.moduleName)) {
          return false;
        }

        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);

  return {
    ...baseConfig,
    sections,
  };
};
