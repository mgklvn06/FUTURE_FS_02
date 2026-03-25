import { useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { addNote, updateStatus } from "../services/api";
import {
  formatFullDate,
  formatRelativeTime,
  formatSource,
  getInitials,
  getStatusMeta,
  statusOptions,
} from "../utils/leadUi";

function DetailField({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export default function LeadDetails() {
  const { id } = useParams();
  const { leads, loading, error, refreshLeads } = useOutletContext();
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const lead = leads.find((entry) => entry._id === id);
  const status = lead ? getStatusMeta(lead.status) : null;
  const notes = lead ? [...(lead.notes ?? [])].sort((a, b) => new Date(b.date) - new Date(a.date)) : [];

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
            </div>
          </div>

          <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Source" value={formatSource(lead.source)} />
            <DetailField label="Created" value={formatFullDate(lead.createdAt)} />
            <DetailField label="Last Updated" value={formatFullDate(lead.updatedAt)} />
            <DetailField label="Notes" value={`${notes.length} note${notes.length === 1 ? "" : "s"}`} />
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
                    <p className="text-sm font-semibold text-slate-900">Team note</p>
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
            Keep momentum high by updating status and preserving context after every touchpoint.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Current Status</p>
              <p className="mt-2 text-lg font-semibold text-white">{status.label}</p>
            </div>
            <div className="rounded-3xl bg-white/10 px-4 py-4 ring-1 ring-white/10">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Recent Touch</p>
              <p className="mt-2 text-lg font-semibold text-white">{formatRelativeTime(lead.updatedAt)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Suggested Next Step
          </p>
          <h2 className="font-display mt-3 text-2xl font-semibold text-slate-950">
            Keep the record alive
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            When a conversation happens, update the status immediately and log a quick note. It keeps
            the pipeline trustworthy and the follow-up clear.
          </p>
        </section>
      </aside>
    </div>
  );
}
