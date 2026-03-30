import { useState } from "react";
import { Link } from "react-router-dom";
import { deleteLead, getErrorMessage, updateLead } from "../services/api";
import ConfirmDialog from "./ConfirmDialog";
import {
  formatRelativeTime,
  formatSource,
  getFollowUpStatus,
  getFollowUpStatusMeta,
  getInitials,
  getLeadFollowUpCounts,
  getNextFollowUp,
  getReminderHeadline,
  getStatusMeta,
  statusOptions,
} from "../utils/leadUi";

export default function LeadCard({
  lead,
  onStatusChange,
  isUpdating = false,
  isAdmin = false,
  onLeadUpdated,
  onLeadDeleted,
}) {
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
  const status = getStatusMeta(lead.status);
  const nextFollowUp = getNextFollowUp(lead);
  const followUpCounts = getLeadFollowUpCounts(lead);
  const nextFollowUpStatus = nextFollowUp ? getFollowUpStatus(nextFollowUp) : "";
  const nextFollowUpMeta = getFollowUpStatusMeta(nextFollowUpStatus);

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
    <article className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_40px_100px_-48px_rgba(8,47,73,0.45)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-r from-cyan-100/70 via-white to-transparent opacity-90" />

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-base font-semibold text-white shadow-lg shadow-slate-300/60">
              {getInitials(lead.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {formatSource(lead.source)}
              </p>
              <h3 className="font-display mt-2 text-xl font-semibold text-slate-950">{lead.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{lead.email}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Added by {lead.createdByName || "Workspace admin"}
              </p>
            </div>
          </div>

          <span className={`${status.badgeClass} shrink-0`}>{status.label}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Follow-Ups
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {followUpCounts.open} open / {followUpCounts.overdue} overdue
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Notes
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {(lead.notes ?? []).length} note{(lead.notes ?? []).length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Created
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatRelativeTime(lead.createdAt)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Updated
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {formatRelativeTime(lead.updatedAt)}
            </p>
          </div>
        </div>

        <div
          className={`rounded-[24px] border px-4 py-4 ${
            nextFollowUp
              ? nextFollowUpStatus === "overdue"
                ? "border-rose-200 bg-rose-50"
                : "border-cyan-200 bg-cyan-50/60"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Next Follow-Up
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {nextFollowUp ? nextFollowUp.title : "No follow-up scheduled yet"}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {nextFollowUp
                  ? `${getReminderHeadline(nextFollowUp)} - ${formatRelativeTime(nextFollowUp.dueAt)}`
                  : "Open the record to schedule the next touchpoint and reminder."}
              </p>
            </div>
            {nextFollowUp ? <span className={nextFollowUpMeta.badgeClass}>{nextFollowUpMeta.label}</span> : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-end sm:justify-between">
          <label className="block sm:min-w-56">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Move Lead To
            </span>
            <select
              value={lead.status}
              onChange={(event) => onStatusChange(lead._id, event.target.value)}
              disabled={isUpdating}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Link
            to={`/lead/${lead._id}`}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-cyan-200 hover:text-cyan-700"
          >
            Open Record
          </Link>
        </div>

        {isAdmin ? (
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={beginEdit}
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
            >
              Edit Lead
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={isDeleting}
              className="inline-flex items-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDeleting ? "Deleting..." : "Delete Lead"}
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
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {feedback}
          </div>
        ) : null}

        {isAdmin && isEditing ? (
          <form
            onSubmit={handleSave}
            className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Edit Lead</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">Update the lead details</p>
              </div>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Name</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFieldChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFieldChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Source</span>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleFieldChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
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
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                {feedback}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </article>
  );
}
