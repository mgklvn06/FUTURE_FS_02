import { NavLink } from "react-router-dom";
import { getInitials } from "../utils/leadUi";

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

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 7.25C9.376 7.25 7.25 9.376 7.25 12C7.25 14.624 9.376 16.75 12 16.75C14.624 16.75 16.75 14.624 16.75 12C16.75 9.376 14.624 7.25 12 7.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M19.5 12C19.5 12.516 19.463 13.02 19.39 13.512L21 14.75L19.75 17L17.82 16.4C17.058 17.15 16.14 17.736 15.12 18.12L14.75 20H11.25L10.88 18.12C9.86 17.736 8.942 17.15 8.18 16.4L6.25 17L5 14.75L6.61 13.512C6.537 13.02 6.5 12.516 6.5 12C6.5 11.484 6.537 10.98 6.61 10.488L5 9.25L6.25 7L8.18 7.6C8.942 6.85 9.86 6.264 10.88 5.88L11.25 4H14.75L15.12 5.88C16.14 6.264 17.058 6.85 17.82 7.6L19.75 7L21 9.25L19.39 10.488C19.463 10.98 19.5 11.484 19.5 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navigation = [
  { to: "/", label: "Dashboard", icon: DashboardIcon, end: true },
  { to: "/leads", label: "Leads", icon: LeadsIcon, end: false },
  { to: "/pipeline", label: "Pipeline", icon: PipelineIcon, end: false },
  { to: "/settings", label: "Settings", icon: SettingsIcon, end: false },
];

export default function Sidebar({ leads, onLogout, user, onNavigate, showCloseButton, variant = "desktop" }) {
  const team = user?.team;
  const roleLabel = user?.role === "admin" ? "Admin" : "Member";
  const isDrawer = variant === "drawer";

  return (
    <aside
      className={`self-start ${isDrawer ? "h-full w-[min(92vw,360px)]" : ""} xl:sticky xl:top-4`}
    >
      <div
        className={`flex h-full flex-col rounded-[28px] border border-white/10 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 p-4 text-slate-100 shadow-[0_30px_90px_-50px_rgba(2,6,23,0.95)] ring-1 ring-white/10 backdrop-blur sm:p-5 ${
          isDrawer ? "max-h-screen overflow-y-auto" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Northstar</p>
          </div>
          {showCloseButton ? (
            <button
              type="button"
              onClick={onNavigate}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-white transition hover:border-cyan-200/40 hover:bg-white/15"
              aria-label="Close sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </div>

        <div className="mt-4">
          <h1 className="font-display text-2xl font-semibold text-white">CRM HQ</h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
            Clean pipeline visibility for teams that need speed, clarity, and a stronger first impression.
          </p>
        </div>

        <nav className="mt-6 flex gap-3 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group inline-flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-cyan-100 text-slate-950 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-200/80"
                      : "border border-white/5 bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-cyan-950/10"
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

        <div className="mt-6 rounded-[26px] border border-white/10 bg-white/6 p-4 ring-1 ring-white/10 xl:mt-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Secure Session</p>
          <div className="mt-4 flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-cyan-300/15 text-sm font-semibold text-cyan-100 ring-1 ring-cyan-200/20">
              {getInitials(user?.name || user?.email || "User")}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name || "Team Member"}</p>
              <p className="truncate text-sm text-slate-400">{user?.email || "No email available"}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
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
