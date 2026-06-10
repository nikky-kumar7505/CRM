import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { hasModuleAccess, isManagerUser } from "../../config/access.config.js";

const AccessRoute = ({
  children,
  moduleName,
  roles,
  managerOnly = false,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: "100vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (moduleName && !hasModuleAccess(user, moduleName)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  if (managerOnly && !isManagerUser(user)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
};

export default AccessRoute;
