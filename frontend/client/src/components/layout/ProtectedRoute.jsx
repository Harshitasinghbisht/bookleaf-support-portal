import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute({ allowedRoles }) {
 const { user, isAuthenticated, sessionStatus } = useSelector(
  (state) => state.auth
);

  const location = useLocation();

  if (sessionStatus === "idle" || sessionStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F0E5] text-[#34271F]">
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role?.toUpperCase())
  ) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;