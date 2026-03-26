import { useDeferredValue, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLeads } from "../services/api";
import { getFollowUpStatus, getFollowUpSummary } from "../utils/leadUi";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function getPageMeta(pathname) {
  if (pathname.startsWith("/lead/")) {
    return {
      title: "Lead Record",
      description: "Review key details, update status, and keep follow-up context organized in one place.",
    };
  }

  if (pathname === "/leads") {
    return {
      title: "Lead Pipeline",
      description: "Search, segment, and move every opportunity through the funnel with confidence.",
    };
  }

  if (pathname === "/pipeline") {
    return {
      title: "Pipeline",
      description: "Drag leads between stages, rebalance the funnel, and sync every status change automatically.",
    };
  }

  return {
    title: "Dashboard Analytics",
    description: "Monitor lead volume, stage mix, conversion health, and pipeline momentum from one clean control center.",
  };
}

export default function DashboardLayout() {
  const location = useLocation();
  const { isAdmin, logout, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);

  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
      try {
        setLoading(true);
        const response = await getLeads();

        if (!isMounted) {
          return;
        }

        setLeads(response.data);
        setError("");
      } catch (requestError) {
        console.error("Error fetching leads:", requestError);

        if (isMounted) {
          setError("We could not load the lead pipeline right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadLeads();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  const refreshLeads = async () => {
    try {
      setIsRefreshing(true);
      const response = await getLeads();
      setLeads(response.data);
      setError("");
    } catch (requestError) {
      console.error("Error refreshing leads:", requestError);
      setError("We could not refresh the lead pipeline just now.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const filteredLeads = leads.filter((lead) =>
    [
      lead.name,
      lead.email,
      lead.source,
      lead.status,
      lead.createdByName,
      ...(lead.notes ?? []).map((note) => note.authorName),
      ...(lead.followUps ?? []).flatMap((followUp) => [
        followUp.title,
        followUp.details,
        getFollowUpStatus(followUp),
      ]),
    ].some((value) =>
      value?.toLowerCase().includes(normalizedSearch)
    )
  );
  const followUpSummary = getFollowUpSummary(leads);

  const pageMeta = getPageMeta(location.pathname);

  return (
    <div className="min-h-screen px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      {isSidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm xl:hidden" onClick={() => setIsSidebarOpen(false)}>
          <Sidebar
            leads={leads}
            onLogout={logout}
            onNavigate={() => setIsSidebarOpen(false)}
            showCloseButton
            user={user}
            variant="drawer"
          />
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1560px] gap-3 xl:grid-cols-[248px_minmax(0,1fr)] xl:gap-4">
        <Sidebar leads={leads} onLogout={logout} user={user} variant="desktop" />

        <div className="relative min-w-0 overflow-hidden rounded-[30px] border border-slate-200/70 bg-white/92 shadow-[0_40px_110px_-58px_rgba(15,23,42,0.4)] ring-1 ring-white/70 backdrop-blur sm:rounded-[34px]">
          <div className="pointer-events-none absolute left-0 top-48 h-64 w-64 rounded-full bg-slate-200/60 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl" />

          <div className="relative">
            <Navbar
              onMenuOpen={() => setIsSidebarOpen(true)}
              pageTitle={pageMeta.title}
              pageDescription={pageMeta.description}
              workspaceName={user?.team?.name}
              workspaceRole={user?.role}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isRefreshing={isRefreshing}
              totalLeads={leads.length}
              resultCount={filteredLeads.length}
              overdueReminders={followUpSummary.overdue.length}
              dueTodayReminders={followUpSummary.dueToday.length}
            />

            <main className="px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
              <Outlet
                context={{
                  leads,
                  filteredLeads,
                  loading,
                  error,
                  followUpSummary,
                  isAdmin,
                  refreshLeads,
                  searchTerm,
                  user,
                }}
              />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
