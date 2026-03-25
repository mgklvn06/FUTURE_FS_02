import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import LeadList from "../components/LeadList";
import { updateStatus } from "../services/api";
import { statusOptions } from "../utils/leadUi";

const filterOptions = [
  { value: "all", label: "All Leads" },
  ...statusOptions,
];

export default function Leads() {
  const { leads, filteredLeads, loading, error, refreshLeads, searchTerm } = useOutletContext();
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingLeadId, setUpdatingLeadId] = useState("");

  const visibleLeads = filteredLeads.filter((lead) =>
    statusFilter === "all" ? true : lead.status === statusFilter
  );

  const counts = {
    all: leads.length,
    new: leads.filter((lead) => lead.status === "new").length,
    contacted: leads.filter((lead) => lead.status === "contacted").length,
    converted: leads.filter((lead) => lead.status === "converted").length,
  };

  const handleStatusChange = async (leadId, nextStatus) => {
    try {
      setUpdatingLeadId(leadId);
      await updateStatus(leadId, nextStatus);
      await refreshLeads();
    } catch (requestError) {
      console.error("Error updating status:", requestError);
    } finally {
      setUpdatingLeadId("");
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      <section className="rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Pipeline View</p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-slate-950">
              Searchable lead management
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Use the top search bar for names, emails, sources, or statuses, then narrow the board with
              quick filters below.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {searchTerm
              ? `${visibleLeads.length} filtered result${visibleLeads.length === 1 ? "" : "s"} for "${searchTerm}"`
              : `${visibleLeads.length} lead${visibleLeads.length === 1 ? "" : "s"} in the current view`}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {filterOptions.map((option) => {
            const isActive = statusFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-300/50"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:text-cyan-700"
                }`}
              >
                {option.label}
                <span className="ml-2 text-xs opacity-75">{counts[option.value]}</span>
              </button>
            );
          })}
        </div>
      </section>

      <LeadList
        leads={visibleLeads}
        loading={loading}
        onStatusChange={handleStatusChange}
        updatingLeadId={updatingLeadId}
        emptyTitle={searchTerm ? "No leads match this search" : "No leads in this filter"}
        emptyDescription={
          searchTerm
            ? "Try a different name, email, source, or status in the search bar."
            : "Leads will appear here as soon as they enter this stage of the funnel."
        }
      />
    </div>
  );
}
