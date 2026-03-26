import { NavLink } from "react-router-dom";
import { getFollowUpSummary, getInitials } from "../utils/leadUi";

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8H16V11H8V8Z" fill="currentColor" />
      <path d="M8 13H11V16H8V13Z" fill="currentColor" />
      <path d="M13 13H16V16H13V13Z" fill="currentColor" />
    </svg>
  );
}

function LeadsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 12C14.485 12 16.5 9.985 16.5 7.5C16.5 5.015 14.485 3 12 3C9.515 3 7.5 5.015 7.5 7.5C7.5 9.985 9.515 12 12 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M4 20.25C4 16.798 7.134 14 11 14H13C16.866 14 20 16.798 20 20.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PipelineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="3" y="5" width="5" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9.5" y="8" width="5" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="16" y="11" width="5" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const navigation = [
  { to: "/", label: "Dashboard", icon: DashboardIcon, end: true },
  { to: "/leads", label: "Leads", icon: LeadsIcon, end: false },
  { to: "/pipeline", label: "Pipeline", icon: PipelineIcon, end: false },
];

export default function Sidebar({ leads, onLogout, user }) {
  const convertedLeads = leads.filter((lead) => lead.status === "converted").length;
  const conversionRate = leads.length ? Math.round((convertedLeads / leads.length) * 100) : 0;
  const followUpSummary = getFollowUpSummary(leads, 3);
  const team = user?.team;
  const roleLabel = user?.role === "admin" ? "Admin" : "Member";

  return (
    <aside className="self-start xl:sticky xl:top-4">
      <div className="flex flex-col rounded-[32px] border border-white/10 bg-slate-950/95 p-5 text-slate-100 shadow-[0_30px_90px_-50px_rgba(2,6,23,0.95)] ring-1 ring-white/10 backdrop-blur sm:p-6 xl:max-h-[calc(100vh-2rem)] xl:overflow-y-auto">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">Northstar</p>
          <h1 className="font-display mt-4 text-3xl font-semibold text-white">CRM HQ</h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
            Clean pipeline visibility for teams that need speed, clarity, and a stronger first impression.
          </p>
        </div>

        <nav className="mt-8 flex gap-3 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group inline-flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-cyan-100 text-slate-950 shadow-lg shadow-cyan-950/20"
                      : "border border-white/5 bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <span className="text-current">
                  <Icon />
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-8 rounded-[28px] bg-white/8 p-5 ring-1 ring-white/10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Pipeline Health</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl bg-white/8 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total Leads</p>
              <p className="mt-2 text-3xl font-semibold text-white">{leads.length}</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Converted</p>
              <p className="mt-2 text-3xl font-semibold text-white">{convertedLeads}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Conversion Pulse</p>
            <p className="mt-2 text-2xl font-semibold text-white">{conversionRate}%</p>
            <p className="mt-2 text-sm text-cyan-100/80">
              A quick view of how effectively new leads are becoming customers.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-rose-100">Reminder Queue</p>
            <p className="mt-2 text-2xl font-semibold text-white">{followUpSummary.overdue.length}</p>
            <p className="mt-2 text-sm text-rose-100/80">
              Overdue follow-up{followUpSummary.overdue.length === 1 ? "" : "s"} with {followUpSummary.dueToday.length} due today.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/6 p-5 ring-1 ring-white/10 xl:mt-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Secure Session</p>
          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-300/15 text-sm font-semibold text-cyan-100 ring-1 ring-cyan-200/20">
              {getInitials(user?.name || user?.email || "User")}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name || "Team Member"}</p>
              <p className="truncate text-sm text-slate-400">{user?.email || "No email available"}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Workspace
            </p>
            <p className="mt-2 text-sm font-semibold text-white">{team?.name || "Not assigned"}</p>
            <p className="mt-2 text-sm text-slate-400">
              {team?.memberCount ?? 0} member{team?.memberCount === 1 ? "" : "s"} in this shared pipeline.
            </p>
            {team?.inviteCode ? (
              <div className="mt-4 rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Invite Code
                </p>
                <p className="mt-1 text-base font-semibold tracking-[0.18em] text-white">
                  {team.inviteCode}
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Access Level
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-2xl border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/30 hover:bg-white/12"
            >
              Log Out
            </button>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-400">
            Search, filter, and update the funnel without leaving the dashboard shell.
          </p>
        </div>
      </div>
    </aside>
  );
}
