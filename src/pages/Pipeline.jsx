import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { deleteLead, getErrorMessage, updateLead, updateStatus } from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  formatRelativeTime,
  formatSource,
  getInitials,
  getStatusMeta,
  statusOptions,
} from "../utils/leadUi";

const columnDescriptions = {
  new: "Fresh leads waiting for first outreach.",
  contacted: "Active conversations in progress.",
  converted: "Won opportunities that became customers.",
};

const columnAccents = {
  new: "from-blue-100 via-blue-50 to-white",
  contacted: "from-amber-100 via-amber-50 to-white",
  converted: "from-emerald-100 via-emerald-50 to-white",
};

function removeOptimisticStatus(previousState, leadId) {
  const nextState = { ...previousState };
  delete nextState[leadId];
  return nextState;
}

function PipelineLeadCard({
  lead,
  isDragging,
  isUpdating,
  isAdmin,
  onLeadUpdated,
  onLeadDeleted,
  onDragStart,
  onDragEnd,
  onStatusSelect,
}) {
  const status = getStatusMeta(lead.status);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: lead.name || "",
    email: lead.email || "",
    source: lead.source || "website",
  });
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const beginEdit = () => {
    setFormData({
      name: lead.name || "",
      email: lead.email || "",
      source: lead.source || "website",
    });
    setFeedback("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFeedback("");
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      setFeedback("Name and email are required.");
      return;
    }

    try {
      setIsSaving(true);
      setFeedback("");
      await updateLead(lead._id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        source: formData.source,
      });
      await onLeadUpdated?.();
      setIsEditing(false);
      setFeedback("Lead updated.");
    } catch (requestError) {
      console.error("Error updating lead:", requestError);
      setFeedback(getErrorMessage(requestError, "We could not update this lead right now."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setFeedback("");
      await deleteLead(lead._id);
      await onLeadDeleted?.();
    } catch (requestError) {
      console.error("Error deleting lead:", requestError);
      setFeedback(getErrorMessage(requestError, "We could not delete this lead right now."));
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <article
      draggable={!isUpdating}
      onDragStart={(event) => onDragStart(event, lead._id)}
      onDragEnd={onDragEnd}
      className={`overflow-hidden rounded-[26px] border border-slate-200/80 bg-white p-4 shadow-[0_25px_60px_-45px_rgba(15,23,42,0.5)] ring-1 ring-white/70 transition ${
        isDragging ? "rotate-1 scale-[1.01] opacity-70 shadow-xl" : "hover:-translate-y-0.5"
      } ${isUpdating ? "cursor-wait opacity-75" : "cursor-grab active:cursor-grabbing"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-900 text-sm font-semibold text-white shadow-lg shadow-slate-300/60">
            {getInitials(lead.name)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {formatSource(lead.source)}
            </p>
            <h3 className="font-display mt-2 truncate text-lg font-semibold text-slate-950">
              {lead.name}
            </h3>
            <p className="truncate text-sm text-slate-600">{lead.email}</p>
            <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Added by {lead.createdByName || "Workspace admin"}
            </p>
          </div>
        </div>

        <span className={`${status.badgeClass} shrink-0`}>{status.label}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Updated
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{formatRelativeTime(lead.updatedAt)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Notes
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {(lead.notes ?? []).length} note{(lead.notes ?? []).length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Move Lead
        </span>
        <select
          value={lead.status}
          onChange={(event) => onStatusSelect(lead._id, event.target.value)}
          disabled={isUpdating}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
          Drag into another column
        </p>
        <Link
          to={`/lead/${lead._id}`}
          className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:border-cyan-200 hover:text-cyan-700"
        >
          Open
        </Link>
      </div>

      {isAdmin ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={beginEdit}
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            disabled={isDeleting}
            className="inline-flex items-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      ) : null}

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        title={`Delete ${lead.name}?`}
        description="This removes the lead and all of its notes and follow-ups. This action cannot be undone."
        confirmLabel="Delete Lead"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        isConfirming={isDeleting}
      />

      {feedback && !isEditing ? (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
          {feedback}
        </div>
      ) : null}

      {isAdmin && isEditing ? (
        <form onSubmit={handleSave} className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50/80 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Edit Lead</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">Update details</p>
            </div>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
            >
              Cancel
            </button>
          </div>

          <div className="mt-3 grid gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFieldChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFieldChange}
                required
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">Source</span>
              <select
                name="source"
                value={formData.source}
                onChange={handleFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              >
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social">Social Media</option>
                <option value="email">Email Campaign</option>
                <option value="event">Event</option>
              </select>
            </label>
          </div>

          {feedback ? (
            <div className="mt-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              {feedback}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </article>
  );
}

function PipelineColumn({
  status,
  label,
  leads,
  isActive,
  isDragging,
  draggingLeadId,
  updatingLeadId,
  isAdmin,
  onLeadUpdated,
  onLeadDeleted,
  onDragOver,
  onDrop,
  onDragStart,
  onDragEnd,
  onStatusSelect,
}) {
  const statusMeta = getStatusMeta(status);

  return (
    <section
      onDragOver={(event) => onDragOver(event, status)}
      onDrop={(event) => onDrop(event, status)}
      className={`relative flex min-h-[30rem] flex-col rounded-[30px] border bg-white/85 p-3 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.45)] ring-1 ring-white/70 backdrop-blur transition sm:p-4 ${
        isActive
          ? "border-cyan-300 bg-cyan-50/70 shadow-[0_30px_100px_-52px_rgba(8,47,73,0.35)]"
          : "border-slate-200/80"
      }`}
    >
      <div className={`rounded-[24px] bg-gradient-to-r ${columnAccents[status]} p-3 sm:p-4`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-600">Stage</p>
            <h2 className="font-display mt-2 text-2xl font-semibold text-slate-950">{label}</h2>
            <p className="mt-2 max-w-xs text-sm text-slate-600">{columnDescriptions[status]}</p>
          </div>
          <span className={`${statusMeta.badgeClass} shrink-0`}>{leads.length}</span>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-4">
        {leads.length === 0 ? (
          <div
            className={`flex h-full min-h-[18rem] items-center justify-center rounded-[24px] border border-dashed px-5 text-center text-sm transition ${
              isDragging ? "border-cyan-300 bg-cyan-50 text-cyan-900" : "border-slate-300 bg-slate-50 text-slate-500"
            }`}
          >
            {isActive
              ? `Drop here to move the lead into ${label}.`
              : `No leads in ${label} right now.`}
          </div>
        ) : (
          leads.map((lead) => (
            <PipelineLeadCard
              key={lead._id}
              lead={lead}
              isDragging={draggingLeadId === lead._id}
              isUpdating={updatingLeadId === lead._id}
              isAdmin={isAdmin}
              onLeadUpdated={onLeadUpdated}
              onLeadDeleted={onLeadDeleted}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onStatusSelect={onStatusSelect}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default function Pipeline() {
  const { leads, loading, error, refreshLeads, searchTerm, user } = useOutletContext();
  const [draggingLeadId, setDraggingLeadId] = useState("");
  const [activeColumn, setActiveColumn] = useState("");
  const [updatingLeadId, setUpdatingLeadId] = useState("");
  const [optimisticStatuses, setOptimisticStatuses] = useState({});
  const [localError, setLocalError] = useState("");
  const isAdmin = user?.role === "admin";

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const leadSnapshot = leads.map((lead) =>
    optimisticStatuses[lead._id] ? { ...lead, status: optimisticStatuses[lead._id] } : lead
  );
  const visibleLeads = leadSnapshot.filter((lead) =>
    [lead.name, lead.email, lead.source, lead.status].some((value) =>
      value?.toLowerCase().includes(normalizedSearch)
    )
  );

  const leadsByStatus = statusOptions.reduce((columns, option) => {
    columns[option.value] = visibleLeads.filter((lead) => lead.status === option.value);
    return columns;
  }, {});

  const moveLead = async (leadId, nextStatus) => {
    const currentLead = leadSnapshot.find((lead) => lead._id === leadId);

    setActiveColumn("");
    setDraggingLeadId("");

    if (!currentLead || currentLead.status === nextStatus) {
      return;
    }

    setLocalError("");
    setUpdatingLeadId(leadId);
    setOptimisticStatuses((previousState) => ({ ...previousState, [leadId]: nextStatus }));

    try {
      await updateStatus(leadId, nextStatus);
      await refreshLeads();
      setOptimisticStatuses((previousState) => removeOptimisticStatus(previousState, leadId));
    } catch (requestError) {
      console.error("Error updating status:", requestError);
      setOptimisticStatuses((previousState) => removeOptimisticStatus(previousState, leadId));
      setLocalError("We could not update that lead just now. Please try dropping it again.");
    } finally {
      setUpdatingLeadId("");
    }
  };

  const handleDragStart = (event, leadId) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", leadId);
    setDraggingLeadId(leadId);
    setLocalError("");
  };

  const handleDragEnd = () => {
    setDraggingLeadId("");
    setActiveColumn("");
  };

  const handleDragOver = (event, status) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (draggingLeadId) {
      setActiveColumn(status);
    }
  };

  const handleDrop = async (event, status) => {
    event.preventDefault();
    const leadId = event.dataTransfer.getData("text/plain") || draggingLeadId;
    await moveLead(leadId, status);
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      {localError ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900">
          {localError}
        </div>
      ) : null}

      <section className="rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Drag And Drop
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold text-slate-950">
              Pipeline board
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Drag leads between columns to update their stage instantly. Every drop writes the new
              status back to the backend, and the shared dashboard data refreshes automatically.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {statusOptions.map((option) => (
              <div
                key={option.value}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {option.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {leadsByStatus[option.value].length}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
            {searchTerm
              ? `${visibleLeads.length} leads match "${searchTerm}"`
              : `${visibleLeads.length} leads visible on the board`}
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
            {draggingLeadId ? "Drop a card into a stage to save the new status." : "Pick up any card to move it."}
          </div>
        </div>
      </section>

      {loading && !visibleLeads.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[34rem] animate-pulse rounded-[30px] border border-slate-200 bg-white/80"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {statusOptions.map((option) => (
            <PipelineColumn
              key={option.value}
              status={option.value}
              label={option.label}
              leads={leadsByStatus[option.value]}
              isActive={activeColumn === option.value}
              isDragging={Boolean(draggingLeadId)}
              draggingLeadId={draggingLeadId}
              updatingLeadId={updatingLeadId}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onStatusSelect={moveLead}
              isAdmin={isAdmin}
              onLeadUpdated={refreshLeads}
              onLeadDeleted={refreshLeads}
            />
          ))}
        </div>
      )}
    </div>
  );
}
