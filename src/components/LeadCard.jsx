import { Link } from "react-router-dom";
import {
  formatRelativeTime,
  formatSource,
  getInitials,
  getStatusMeta,
  statusOptions,
} from "../utils/leadUi";

export default function LeadCard({ lead, onStatusChange, isUpdating = false }) {
  const status = getStatusMeta(lead.status);

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_40px_100px_-48px_rgba(8,47,73,0.45)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-r from-cyan-100/70 via-white to-transparent opacity-90" />

      <div className="relative flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-base font-semibold text-white shadow-lg shadow-slate-300/60">
              {getInitials(lead.name)}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {formatSource(lead.source)}
              </p>
            <h3 className="font-display mt-2 text-xl font-semibold text-slate-950">
              {lead.name}
            </h3>
            <p className="mt-1 text-sm text-slate-600">{lead.email}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Added by {lead.createdByName || "Workspace admin"}
            </p>
          </div>
        </div>

          <span className={status.badgeClass}>{status.label}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
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
      </div>
    </article>
  );
}
