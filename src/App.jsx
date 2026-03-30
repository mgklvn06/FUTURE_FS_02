import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute, ProtectedRoute } from "./components/RouteGuards";
import DashboardLayout from "./layout/DashboardLayout";

const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Leads = lazy(() => import("./pages/Leads"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const LeadDetails = lazy(() => import("./pages/LeadDetails"));
const Settings = lazy(() => import("./pages/Settings"));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-[32px] border border-slate-200 bg-white/90 px-6 py-16 text-center shadow-[0_30px_80px_-48px_rgba(15,23,42,0.25)]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Loading</p>
        <p className="font-display mt-3 text-2xl font-semibold text-slate-950">
          Preparing the workspace
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/auth" element={<Auth />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="pipeline" element={<Pipeline />} />
              <Route path="lead/:id" element={<LeadDetails />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
