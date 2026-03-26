import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SessionLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-xl rounded-[36px] border border-slate-200/80 bg-white/95 px-8 py-14 text-center shadow-[0_40px_120px_-56px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
          Secure Workspace
        </p>
        <h1 className="font-display mt-4 text-3xl font-semibold text-slate-950">
          Restoring your session
        </h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Verifying your access token and preparing the CRM dashboard.
        </p>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const location = useLocation();
  const { authLoading, isAuthenticated } = useAuth();

  if (authLoading) {
    return <SessionLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const location = useLocation();
  const { authLoading, isAuthenticated } = useAuth();
  const redirectPath = location.state?.from?.pathname || "/";

  if (authLoading) {
    return <SessionLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
}
