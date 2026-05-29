// ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token, loading } = useSelector((state) => state.auth);
  const isAuthenticated = !!token;

  // Debug logs to trace auth states
  console.log("🔐 [ProtectedRoute Render] User Role:", user?.role, "Token:", !!token, "Allowed Roles:", allowedRoles);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.warn("🔐 [ProtectedRoute] User not authenticated, redirecting to login");
    return <Navigate to="/" replace />;
  }

  // Check if user role is allowed
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.warn(`🔐 [ProtectedRoute] Role '${user?.role}' not allowed. Allowed:`, allowedRoles);
    
    const redirectPath = 
      user?.role === "ADMIN" ? "/admin/dashboard" :
      user?.role === "MANAGER" ? "/manager/dashboard" :
      user?.role === "STORE_KEEPER" ? "/storekeeper/dashboard" :
      "/cuttingmaster/works";
    
    console.log("🔐 [ProtectedRoute] Redirecting unauthorized user to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log("🔐 [ProtectedRoute] Access granted, rendering route!");
  return children ? children : <Outlet />;
}