import { startTransition } from "react";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path d="M20.9999 21L16.6499 16.65" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar({
  pageTitle,
  pageDescription,
  workspaceName,
  workspaceRole,
  searchTerm,
  setSearchTerm,
  isRefreshing,
  totalLeads,
  resultCount,
  overdueReminders,
  dueTodayReminders,
  onMenuOpen,
}) {
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="border-b border-slate-200/80 px-3 py-4 sm:px-5 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onMenuOpen}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100 xl:hidden"
              aria-label="Open sidebar"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M4 6H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M4 12H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M4 18H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">{todayLabel}</p>
          </div>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            {pageTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{pageDescription}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 transition hover:border-slate-300">
              {workspaceName || "Workspace"}
            </div>
            <div className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-800 transition hover:border-cyan-300">
              {workspaceRole === "admin" ? "Admin" : "Member"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[420px] lg:flex-row lg:items-center">
          <label className="group relative flex min-w-0 flex-1 items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition focus-within:border-cyan-300 focus-within:ring-4 focus-within:ring-cyan-100">
            <span className="text-slate-400 transition group-focus-within:text-cyan-600">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => setSearchTerm(nextValue));
              }}
              placeholder="Search by name, email, source, or status"
              className="ml-3 min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {searchTerm ? "Matches" : "Lead Count"}
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {searchTerm ? `${resultCount} of ${totalLeads}` : totalLeads}
              {isRefreshing ? " - Refreshing" : ""}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Reminders
            </p>
            <p className="mt-1 font-semibold text-slate-900">
              {overdueReminders} overdue
            </p>
            <p className="text-xs text-slate-500">{dueTodayReminders} due today</p>
          </div>
        </div>
      </div>
    </header>
  );
}
