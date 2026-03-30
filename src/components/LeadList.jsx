import LeadCard from "./LeadCard";

export default function LeadList({
  leads,
  loading,
  onStatusChange,
  updatingLeadId,
  isAdmin = false,
  onLeadUpdated,
  onLeadDeleted,
  emptyTitle = "No leads yet",
  emptyDescription = "Add your first lead to start building the pipeline.",
}) {
  return (
    <section className="space-y-4">
      {loading && leads.length === 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-[28px] border border-slate-200 bg-white/80 shadow-sm"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {leads.map((lead) => (
            <LeadCard
              key={lead._id}
              lead={lead}
              onStatusChange={onStatusChange}
              isUpdating={updatingLeadId === lead._id}
              isAdmin={isAdmin}
              onLeadUpdated={onLeadUpdated}
              onLeadDeleted={onLeadDeleted}
            />
          ))}
        </div>
      )}

      {!loading && leads.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center shadow-sm">
          <p className="font-display text-2xl font-semibold text-slate-900">{emptyTitle}</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">{emptyDescription}</p>
        </div>
      ) : null}
    </section>
  );
}
