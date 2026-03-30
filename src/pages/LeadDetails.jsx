import { useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { addFollowUp, addNote, deleteLead, getErrorMessage, updateFollowUp, updateLead, updateStatus } from "../services/api";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  formatFullDate,
  formatRelativeTime,
  formatSource,
  getFollowUpStatus,
  getFollowUpStatusMeta,
  getInitials,
  getLeadFollowUpCounts,
  getNextFollowUp,
  getReminderHeadline,
  getStatusMeta,
  sortFollowUps,
  statusOptions,
  toDateTimeLocalValue,
} from "../utils/leadUi";

const emptyFollowUpForm = {
  title: "",
  details: "",
  dueAt: "",
  reminderAt: "",
};

function DetailField({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function FollowUpMetric({ label, value, accent = "default" }) {
  const accentClasses = {
    default: "border-slate-200 bg-slate-50 text-slate-900",
    accent: "border-cyan-200 bg-cyan-50 text-cyan-950",
    danger: "border-rose-200 bg-rose-50 text-rose-950",
    success: "border-emerald-200 bg-emerald-50 text-emerald-950",
  };

  return (
    <div className={`rounded-2xl border px-4 py-4 ${accentClasses[accent]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">{label}</p>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function buildFollowUpPayload(formData) {
  return {
    title: formData.title,
    details: formData.details,
    dueAt: new Date(formData.dueAt).toISOString(),
    reminderAt: formData.reminderAt ? new Date(formData.reminderAt).toISOString() : null,
  };
}

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { leads, loading, error, refreshLeads, user } = useOutletContext();
  const [noteText, setNoteText] = useState("");
  const [followUpForm, setFollowUpForm] = useState(emptyFollowUpForm);
  const [followUpFeedback, setFollowUpFeedback] = useState("");
  const [editingFollowUpId, setEditingFollowUpId] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingFollowUp, setIsSavingFollowUp] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [updatingFollowUpId, setUpdatingFollowUpId] = useState("");
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [leadFeedback, setLeadFeedback] = useState("");
  const [leadForm, setLeadForm] = useState({ name: "", email: "", source: "website" });
  const [isDeletingLead, setIsDeletingLead] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const lead = leads.find((entry) => entry._id === id);
  const status = lead ? getStatusMeta(lead.status) : null;
  const notes = lead ? [...(lead.notes ?? [])].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  const followUps = lead ? sortFollowUps(lead.followUps ?? []) : [];
  const followUpCounts = lead ? getLeadFollowUpCounts(lead) : null;
  const nextFollowUp = lead ? getNextFollowUp(lead) : null;
  const isAdmin = user?.role === "admin";

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;

    try {
      setIsUpdatingStatus(true);
      await updateStatus(id, newStatus);
      await refreshLeads();
    } catch (requestError) {
      console.error("Error updating status:", requestError);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddNote = async (event) => {
    event.preventDefault();

    if (!noteText.trim()) {
      return;
    }

    try {
      setIsSavingNote(true);
      await addNote(id, noteText);
      setNoteText("");
      await refreshLeads();
    } catch (requestError) {
      console.error("Error adding note:", requestError);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleLeadFieldChange = (event) => {
    const { name, value } = event.target;
    setLeadForm((current) => ({ ...current, [name]: value }));
  };

  const startEditingLead = () => {
    if (!lead) {
      return;
    }

    setLeadForm({
      name: lead.name || "",
      email: lead.email || "",
      source: lead.source || "website",
    });
    setLeadFeedback("");
    setIsEditingLead(true);
  };

  const cancelEditingLead = () => {
    setIsEditingLead(false);
    setLeadFeedback("");
  };

  const handleLeadUpdate = async (event) => {
    event.preventDefault();

    if (!leadForm.name.trim() || !leadForm.email.trim()) {
      setLeadFeedback("Name and email are required.");
      return;
    }

    try {
      setIsSavingLead(true);
      setLeadFeedback("");
      await updateLead(id, {
        name: leadForm.name.trim(),
        email: leadForm.email.trim(),
        source: leadForm.source,
      });
      await refreshLeads();
      setIsEditingLead(false);
      setLeadFeedback("Lead updated.");
    } catch (requestError) {
      console.error("Error updating lead:", requestError);
      setLeadFeedback(getErrorMessage(requestError, "We could not update this lead right now."));
    } finally {
      setIsSavingLead(false);
    }
  };

  const handleLeadDelete = async () => {
    if (!lead) {
      return;
    }

    try {
      setIsDeletingLead(true);
      setLeadFeedback("");
      await deleteLead(id);
      await refreshLeads();
      navigate("/leads");
    } catch (requestError) {
      console.error("Error deleting lead:", requestError);
      setLeadFeedback(getErrorMessage(requestError, "We could not delete this lead right now."));
    } finally {
      setIsDeletingLead(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleFollowUpFieldChange = (event) => {
    const { name, value } = event.target;

    setFollowUpForm((currentState) => ({
      ...currentState,
      [name]: value,
    }));
  };

  const resetFollowUpForm = () => {
    setFollowUpForm(emptyFollowUpForm);
    setEditingFollowUpId("");
  };

  const handleFollowUpSubmit = async (event) => {
    event.preventDefault();
    setFollowUpFeedback("");

    if (!followUpForm.title.trim() || !followUpForm.dueAt) {
      setFollowUpFeedback("Add a title and due date for the follow-up.");
      return;
    }

    try {
      setIsSavingFollowUp(true);

      if (editingFollowUpId) {
        await updateFollowUp(id, editingFollowUpId, buildFollowUpPayload(followUpForm));
        setFollowUpFeedback("Follow-up updated.");
      } else {
        await addFollowUp(id, buildFollowUpPayload(followUpForm));
        setFollowUpFeedback("Follow-up scheduled.");
      }

      resetFollowUpForm();
      await refreshLeads();
    } catch (requestError) {
      console.error("Error saving follow-up:", requestError);
      setFollowUpFeedback(getErrorMessage(requestError, "We could not save that follow-up right now."));
    } finally {
      setIsSavingFollowUp(false);
    }
  };

  const handleEditFollowUp = (followUp) => {
    setEditingFollowUpId(followUp._id);
    setFollowUpFeedback("");
    setFollowUpForm({
      title: followUp.title || "",
      details: followUp.details || "",
      dueAt: toDateTimeLocalValue(followUp.dueAt),
      reminderAt: toDateTimeLocalValue(followUp.reminderAt),
    });
  };

  const handleFollowUpStatusChange = async (followUpId, nextStatus) => {
    try {
      setUpdatingFollowUpId(followUpId);
      await updateFollowUp(id, followUpId, { status: nextStatus });
      await refreshLeads();
    } catch (requestError) {
      console.error("Error updating follow-up:", requestError);
      setFollowUpFeedback(getErrorMessage(requestError, "We could not update that follow-up right now."));
    } finally {
      setUpdatingFollowUpId("");
    }
  };

  if (loading && !lead) {
    return <div className="h-[28rem] animate-pulse rounded-[32px] border border-slate-200 bg-white/80" />;
  }

  if (!lead) {
    return (
      <section className="rounded-[32px] border border-slate-200/70 bg-white/95 p-8 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Lead Record</p>
        <h2 className="font-display mt-3 text-3xl font-semibold text-slate-950">Lead not found</h2>
        <p className="mt-3 max-w-xl text-sm text-slate-600">
          {error || "We could not find this lead in the current pipeline snapshot."}
        </p>
        <Link
          to="/leads"
          className="mt-6 inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
        >
          Back to Leads
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-200/40 blur-3xl" />
          <Link
            to="/leads"
            className="relative inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
          >
            Back to Leads
          </Link>

          <div className="relative mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-lg font-semibold text-white shadow-lg shadow-slate-300/60">
                {getInitials(lead.name)}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
                  Lead Record
                </p>
                <h1 className="font-display mt-3 text-3xl font-semibold text-slate-950">
                  {lead.name}
                </h1>
                <p className="mt-2 text-sm text-slate-600">{lead.email}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Last activity {formatRelativeTime(lead.updatedAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <span className={status.badgeClass}>{status.label}</span>
              <label className="w-full lg:w-56">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Update Status
                </span>
                <select
                  value={lead.status}
                  onChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              {isAdmin ? (
                <div className="flex w-full flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    onClick={startEditingLead}
                    className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                  >
                    Edit Lead
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    disabled={isDeletingLead}
                    className="inline-flex items-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isDeletingLead ? "Deleting..." : "Delete Lead"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <ConfirmDialog
            open={isDeleteConfirmOpen}
            title={`Delete ${lead.name}?`}
            description="This removes the lead and all of its notes and follow-ups. This action cannot be undone."
            confirmLabel="Delete Lead"
            onConfirm={handleLeadDelete}
            onCancel={() => setIsDeleteConfirmOpen(false)}
            isConfirming={isDeletingLead}
          />

          {leadFeedback && !isEditingLead ? (
            <div className="relative mt-4 rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
              {leadFeedback}
            </div>
          ) : null}

          {isAdmin && isEditingLead ? (
            <form
              onSubmit={handleLeadUpdate}
              className="relative mt-6 rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Edit Lead
                  </p>
                  <h3 className="font-display mt-2 text-2xl font-semibold text-slate-950">
                    Update lead details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={cancelEditingLead}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Name</span>
                  <input
                    type="text"
                    name="name"
                    value={leadForm.name}
                    onChange={handleLeadFieldChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={leadForm.email}
                    onChange={handleLeadFieldChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">Source</span>
                  <select
                    name="source"
                    value={leadForm.source}
                    onChange={handleLeadFieldChange}
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

              {leadFeedback ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                  {leadFeedback}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSavingLead}
                  className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isSavingLead ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditingLead}
                  className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <DetailField label="Source" value={formatSource(lead.source)} />
            <DetailField label="Created" value={formatFullDate(lead.createdAt)} />
            <DetailField label="Last Updated" value={formatFullDate(lead.updatedAt)} />
            <DetailField label="Notes" value={`${notes.length} note${notes.length === 1 ? "" : "s"}`} />
            <DetailField label="Added By" value={lead.createdByName || "Workspace admin"} />
            <DetailField label="Workspace" value={user?.team?.name || "Shared team workspace"} />
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Follow-Ups
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-slate-950">
                Schedule next actions and reminders
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Keep every promised touchpoint visible before it slips.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <FollowUpMetric label="Open" value={followUpCounts.open} accent="accent" />
            <FollowUpMetric label="Overdue" value={followUpCounts.overdue} accent="danger" />
            <FollowUpMetric label="Due Today" value={followUpCounts.dueToday} />
            <FollowUpMetric label="Done" value={followUpCounts.done} accent="success" />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form
              onSubmit={handleFollowUpSubmit}
              className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    {editingFollowUpId ? "Edit Follow-Up" : "New Follow-Up"}
                  </p>
                  <h3 className="font-display mt-2 text-2xl font-semibold text-slate-950">
                    {editingFollowUpId ? "Reschedule or refine the task" : "Add the next planned touchpoint"}
                  </h3>
                </div>
                {editingFollowUpId ? (
                  <button
                    type="button"
                    onClick={resetFollowUpForm}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Title</span>
                  <input
                    type="text"
                    name="title"
                    value={followUpForm.title}
                    onChange={handleFollowUpFieldChange}
                    placeholder="Call to confirm budget and decision timeline"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Details</span>
                  <textarea
                    name="details"
                    value={followUpForm.details}
                    onChange={handleFollowUpFieldChange}
                    rows={4}
                    placeholder="Capture what needs to happen next, who owns it, and what success looks like."
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Due date & time</span>
                    <input
                      type="datetime-local"
                      name="dueAt"
                      value={followUpForm.dueAt}
                      onChange={handleFollowUpFieldChange}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Reminder time
                    </span>
                    <input
                      type="datetime-local"
                      name="reminderAt"
                      value={followUpForm.reminderAt}
                      onChange={handleFollowUpFieldChange}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    />
                  </label>
                </div>

                {followUpFeedback ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                    {followUpFeedback}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSavingFollowUp}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isSavingFollowUp
                    ? "Saving Follow-Up..."
                    : editingFollowUpId
                      ? "Update Follow-Up"
                      : "Schedule Follow-Up"}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {followUps.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
                  No follow-ups yet. Schedule the next action so the team knows exactly what happens next.
                </div>
              ) : (
                followUps.map((followUp) => {
                  const followUpStatus = getFollowUpStatus(followUp);
                  const followUpMeta = getFollowUpStatusMeta(followUpStatus);
                  const isUpdatingFollowUp = updatingFollowUpId === followUp._id;

                  return (
                    <article
                      key={followUp._id}
                      className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                            {getReminderHeadline(followUp)}
                          </p>
                          <h3 className="font-display mt-2 text-xl font-semibold text-slate-950">
                            {followUp.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600">
                            {followUp.details || "No extra details captured yet."}
                          </p>
                        </div>
                        <span className={followUpMeta.badgeClass}>{followUpMeta.label}</span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <DetailField label="Due" value={formatFullDate(followUp.dueAt)} />
                        <DetailField
                          label="Reminder"
                          value={followUp.reminderAt ? formatFullDate(followUp.reminderAt) : "No reminder set"}
                        />
                        <DetailField
                          label="Owner"
                          value={followUp.createdByName || "Team member"}
                        />
                        <DetailField
                          label="Completed"
                          value={followUp.completedAt ? formatFullDate(followUp.completedAt) : "Not completed"}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        {followUpStatus !== "done" ? (
                          <button
                            type="button"
                            onClick={() => handleFollowUpStatusChange(followUp._id, "done")}
                            disabled={isUpdatingFollowUp}
                            className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            {isUpdatingFollowUp ? "Saving..." : "Mark Done"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleFollowUpStatusChange(followUp._id, "pending")}
                            disabled={isUpdatingFollowUp}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            {isUpdatingFollowUp ? "Saving..." : "Reopen"}
                          </button>
                        )}

                        {followUpStatus !== "done" ? (
                          <button
                            type="button"
                            onClick={() => handleEditFollowUp(followUp)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
                          >
                            Reschedule
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
                Notes
              </p>
              <h2 className="font-display mt-2 text-2xl font-semibold text-slate-950">
                Capture important context
              </h2>
            </div>
            <p className="text-sm text-slate-500">Every note is timestamped for the team.</p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleAddNote}>
            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Add a note about your latest call, email, or conversion signal..."
              rows={4}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
            />
            <button
              type="submit"
              disabled={isSavingNote}
              className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSavingNote ? "Saving Note..." : "Add Note"}
            </button>
          </form>

          <div className="mt-8 space-y-4">
            {notes.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
                No notes yet. Add context here to make handoffs easier.
              </div>
            ) : (
              notes.map((note, index) => (
                <article
                  key={`${note.date}-${index}`}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {note.authorName || "Team note"}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                      {formatFullDate(note.date)}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-700">{note.text}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-[32px] bg-slate-900 p-6 text-white shadow-[0_30px_80px_-48px_rgba(2,6,23,0.9)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Snapshot
          </p>
          <h2 className="font-display mt-3 text-2xl font-semibold">Relationship health</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Keep momentum high by pairing every conversation with a concrete next step.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Current Status</p>
              <p className="mt-2 text-lg font-semibold text-white">{status.label}</p>
            </div>
            <div className="rounded-3xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Next Follow-Up</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {nextFollowUp ? formatRelativeTime(nextFollowUp.dueAt) : "Nothing scheduled"}
              </p>
              <p className="mt-2 text-sm text-slate-300">
                {nextFollowUp ? nextFollowUp.title : "Schedule the next touchpoint to keep momentum visible."}
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Overdue Count</p>
              <p className="mt-2 text-lg font-semibold text-white">{followUpCounts.overdue}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Suggested Next Step
          </p>
          <h2 className="font-display mt-3 text-2xl font-semibold text-slate-950">
            Keep the promise visible
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            After each touchpoint, leave a note and schedule the next follow-up with a reminder time. That
            keeps the handoff clear and the pipeline honest.
          </p>
        </section>
      </aside>
    </div>
  );
}
