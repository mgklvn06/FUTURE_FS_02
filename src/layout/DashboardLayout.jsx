import { useDeferredValue, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getLeads } from "../services/api";
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
    ].some((value) =>
      value?.toLowerCase().includes(normalizedSearch)
    )
  );

  const pageMeta = getPageMeta(location.pathname);

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1600px] gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar leads={leads} onLogout={logout} user={user} />

        <div className="relative min-w-0 overflow-hidden rounded-[36px] border border-slate-200/70 bg-white/90 shadow-[0_40px_120px_-50px_rgba(15,23,42,0.5)] ring-1 ring-white/70 backdrop-blur">
          <div className="pointer-events-none absolute left-0 top-48 h-64 w-64 rounded-full bg-slate-200/60 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl" />

          <div className="relative">
            <Navbar
              pageTitle={pageMeta.title}
              pageDescription={pageMeta.description}
              workspaceName={user?.team?.name}
              workspaceRole={user?.role}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              isRefreshing={isRefreshing}
              totalLeads={leads.length}
              resultCount={filteredLeads.length}
            />

            <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
              <Outlet
                context={{
                  leads,
                  filteredLeads,
                  loading,
                error,
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
