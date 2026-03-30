import { Link, NavLink, useOutletContext } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import LeadForm from "../components/LeadForm";
import {
  formatRelativeTime,
  getConversionRate,
  getFollowUpStatusMeta,
  getLeadTrend,
  getRecentActivity,
  getReminderHeadline,
  getStatusBreakdown,
  getStatusMeta,
} from "../utils/leadUi";

function MetricCard({ label, value, hint, tone = "default" }) {
  const toneClasses = {
    default: "border-slate-200 bg-white text-slate-950",
    accent: "border-cyan-200 bg-cyan-50 text-cyan-950",
    warn: "border-amber-200 bg-amber-50 text-amber-950",
    success: "border-emerald-200 bg-emerald-50 text-emerald-950",
    dark: "border-slate-900 bg-slate-900 text-white",
  };

  return (
    <article
      className={`rounded-[28px] border p-5 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.55)] ${toneClasses[tone]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-70">{label}</p>
      <p className="font-display mt-4 text-4xl font-semibold">{value}</p>
      <p className="mt-2 text-sm opacity-80">{hint}</p>
    </article>
  );
}

function ChartCard({ eyebrow, title, description, children, footer }) {
  return (
    <section className="rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">{eyebrow}</p>
          <h2 className="font-display mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
        </div>
        <p className="max-w-xl text-sm text-slate-500">{description}</p>
      </div>

      <div className="mt-6">{children}</div>

      {footer ? <div className="mt-6">{footer}</div> : null}
    </section>
  );
}

function AnalyticsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-200/70">
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      ) : null}
      <div className="mt-2 space-y-2">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color || entry.payload?.fill || "#0f172a" }}
              />
              {entry.name}
            </div>
            <span className="font-semibold text-slate-950">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyChartState({ title, description }) {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
      <div>
        <p className="font-display text-2xl font-semibold text-slate-900">{title}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function WorkspaceAccessCard({ user, isAdmin }) {
  return (
    <section className="rounded-[30px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
        Workspace Access
      </p>
      <h2 className="font-display mt-3 text-2xl font-semibold text-slate-950">
        {isAdmin ? "You manage lead intake" : "You collaborate inside the shared pipeline"}
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {isAdmin
          ? "Admins can invite teammates and add new leads for the workspace. Members can still update stages, schedule follow-ups, and leave notes once the lead is in play."
          : "Members can update statuses, schedule follow-ups, and leave notes. Ask an admin to add new leads or share the invite code with another teammate."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Workspace</p>
          <p className="mt-3 text-lg font-semibold text-slate-950">{user?.team?.name || "Workspace"}</p>
          <p className="mt-2 text-sm text-slate-600">
            {user?.team?.memberCount ?? 0} member{user?.team?.memberCount === 1 ? "" : "s"} currently share this CRM.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Role</p>
          <p className="mt-3 text-lg font-semibold text-slate-950">
            {isAdmin ? "Admin workspace owner" : "Member collaborator"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {isAdmin
              ? `Invite teammates with code ${user?.team?.inviteCode || "unavailable"}.`
              : "You can keep the pipeline updated without owning workspace administration."}
          </p>
        </div>
      </div>
    </section>
  );
}

function ReminderCenterCard({ followUpSummary }) {
  const reminderItems = followUpSummary.reminderQueue;

  return (
    <ChartCard
      eyebrow="Reminder Center"
      title="Scheduled follow-ups"
      description="Keep the team's next touchpoints visible, especially the ones that already need attention."
      footer={
        <div className="flex flex-wrap gap-3">
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {followUpSummary.open.length} open follow-up{followUpSummary.open.length === 1 ? "" : "s"}
          </div>
          <div className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {followUpSummary.overdue.length} overdue
          </div>
          <div className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm text-cyan-800">
            {followUpSummary.dueToday.length} due today
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {reminderItems.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
            No reminders are demanding attention right now. Scheduled follow-ups will appear here automatically.
          </div>
        ) : (
          reminderItems.map((item) => {
            const statusMeta = getFollowUpStatusMeta(item.status);

            return (
              <Link
                key={`${item.leadId}-${item._id}`}
                to={`/lead/${item.leadId}`}
                className="block rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-cyan-200 hover:bg-cyan-50/40"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                      {getReminderHeadline(item)}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.leadName} | Due {formatRelativeTime(item.dueAt)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.details || "Open the lead record to add context or mark this follow-up complete."}
                    </p>
                  </div>
                  <span className={statusMeta.badgeClass}>{statusMeta.label}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </ChartCard>
  );
}

export default function Dashboard() {
  const { error, filteredLeads, followUpSummary, isAdmin, leads, refreshLeads, searchTerm, user } =
    useOutletContext();
  const analyticsLeads = searchTerm ? filteredLeads : leads;
  const totalLeads = analyticsLeads.length;
  const conversionRate = getConversionRate(analyticsLeads);
  const statusBreakdown = getStatusBreakdown(analyticsLeads);
  const trendData = getLeadTrend(analyticsLeads, 7);
  const recentActivity = getRecentActivity(analyticsLeads, 5);
  const newLeads = statusBreakdown.find((item) => item.key === "new")?.value ?? 0;
  const contactedLeads = statusBreakdown.find((item) => item.key === "contacted")?.value ?? 0;
  const convertedLeads = statusBreakdown.find((item) => item.key === "converted")?.value ?? 0;
  const hasStatusData = statusBreakdown.some((item) => item.value > 0);
  const hasTrendData = trendData.some((item) => item.leads > 0 || item.converted > 0);
  const dominantStatus = hasStatusData
    ? [...statusBreakdown].sort((first, second) => second.value - first.value)[0]
    : null;

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="relative overflow-hidden rounded-[32px] bg-slate-900 p-6 text-white shadow-[0_40px_100px_-50px_rgba(2,6,23,0.95)]">
          <div className="pointer-events-none absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute left-1/3 top-16 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Dashboard Analytics
            </p>
            <h2 className="font-display mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Snapshots, reminder visibility, and pipeline insight in one control center.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
              Read pipeline health at a glance, spot overdue follow-ups, and keep the team's next actions visible
              without leaving the dashboard.
            </p>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Workspace: {user?.team?.name || "Workspace"} | {isAdmin ? "Admin" : "Member"} access
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <NavLink
                to="/leads"
                className={({ isActive }) =>
                  `inline-flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-cyan-200 text-slate-950 shadow-lg shadow-cyan-950/20"
                      : "border-white text-slate-950 hover:bg-cyan-200 active:bg-cyan-200 active:text-slate-950"
                  }`
                }
              >
                Open Leads
              </NavLink>
              <NavLink
                to="/pipeline"
                className={({ isActive }) =>
                  `inline-flex items-center rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "border-white bg-white text-slate-950"
                      : "border-white/30 bg-transparent text-cyan-100 hover:border-white/60 hover:bg-white/10 hover:text-white active:border-white/80 active:bg-white active:text-slate-950"
                  }`
                }
              >
                Open Pipeline
              </NavLink>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                {followUpSummary.overdue.length} overdue follow-up
                {followUpSummary.overdue.length === 1 ? "" : "s"} need attention
              </div>
            </div>
          </div>
        </article>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <article className="rounded-[30px] border border-slate-200/70 bg-white/95 p-5 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Current View
            </p>
            <p className="font-display mt-3 text-4xl font-semibold text-slate-950">{totalLeads}</p>
            <p className="mt-2 text-sm text-slate-600">
              Leads currently represented in the analytics dashboard.
            </p>
          </article>

          <article className="rounded-[30px] border border-cyan-200/70 bg-cyan-50 p-5 shadow-[0_24px_70px_-48px_rgba(8,47,73,0.25)] ring-1 ring-white/70">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-800">
              Dominant Stage
            </p>
            <p className="font-display mt-3 text-3xl font-semibold text-slate-950">
              {dominantStatus?.label ?? "No Leads"}
            </p>
            <p className="mt-2 text-sm text-slate-700">
              {dominantStatus?.value ?? 0} lead{dominantStatus?.value === 1 ? "" : "s"} currently sit in the
              largest stage.
            </p>
          </article>
        </section>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-5">
        <MetricCard
          label="Total Leads"
          value={totalLeads}
          hint="Leads included in the current analytics view."
          tone="accent"
        />
        <MetricCard
          label="New Leads"
          value={newLeads}
          hint="Opportunities still awaiting first contact."
        />
        <MetricCard
          label="Contacted"
          value={contactedLeads}
          hint="Leads currently in active conversation."
          tone="warn"
        />
        <MetricCard
          label="Converted"
          value={convertedLeads}
          hint="Won opportunities already moved across the line."
          tone="success"
        />
        <MetricCard
          label="Conversion Rate"
          value={`${conversionRate}%`}
          hint={`${convertedLeads} of ${totalLeads} leads are converted in this view.`}
          tone="dark"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <MetricCard
          label="Open Follow-Ups"
          value={followUpSummary.open.length}
          hint="Planned touchpoints still waiting to happen."
          tone="accent"
        />
        <MetricCard
          label="Due Today"
          value={followUpSummary.dueToday.length}
          hint="Follow-ups that should land before the day closes."
        />
        <MetricCard
          label="Overdue"
          value={followUpSummary.overdue.length}
          hint="Work that needs attention before the relationship goes cold."
          tone="warn"
        />
      </section>

      <ReminderCenterCard followUpSummary={followUpSummary} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard
          eyebrow="Status Breakdown"
          title="Leads by status"
          description="A clear stage-by-stage look at where pipeline volume is currently sitting."
          footer={
            hasStatusData ? (
              <div className="flex flex-wrap gap-3">
                {statusBreakdown.map((item) => {
                  const status = getStatusMeta(item.key);

                  return (
                    <div
                      key={item.key}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      {status.label}
                      <span className="font-semibold text-slate-950">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            ) : null
          }
        >
          {hasStatusData ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBreakdown} barSize={46}>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#475569", fontSize: 12 }}
                  />
                  <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.08)" }} />
                  <Bar dataKey="value" name="Leads" radius={[14, 14, 0, 0]}>
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState
              title="No status data yet"
              description="Once leads enter the CRM, the status chart will map their spread across the funnel."
            />
          )}
        </ChartCard>

        <ChartCard
          eyebrow="Pipeline Mix"
          title="Stage share"
          description="A quick read on how the full pipeline is distributed between new, active, and won work."
        >
          {hasStatusData ? (
            <div className="grid items-center gap-6 lg:grid-cols-[0.95fr_0.75fr]">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={72}
                      outerRadius={108}
                      paddingAngle={3}
                      stroke="rgba(255,255,255,0.7)"
                      strokeWidth={3}
                      isAnimationActive={false}
                    >
                      {statusBreakdown.map((entry) => (
                        <Cell key={entry.key} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<AnalyticsTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Conversion Health
                  </p>
                  <p className="font-display mt-3 text-4xl font-semibold text-slate-950">
                    {conversionRate}%
                  </p>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                      style={{ width: `${conversionRate}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {convertedLeads} converted lead{convertedLeads === 1 ? "" : "s"} out of {totalLeads}.
                  </p>
                </div>

                {statusBreakdown.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm font-medium text-slate-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-950">
                      {totalLeads ? Math.round((item.value / totalLeads) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyChartState
              title="Waiting on pipeline volume"
              description="As soon as leads arrive, the stage-share chart will show how healthy the funnel mix looks."
            />
          )}
        </ChartCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <ChartCard
          eyebrow="Lead Velocity"
          title="Last 7 days"
          description="Track recent intake against conversions to see if the funnel is growing faster than it is closing."
        >
          {hasTrendData ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="leadVolume" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="conversionVolume" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#475569", fontSize: 12 }}
                  />
                  <Tooltip content={<AnalyticsTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    name="New leads"
                    stroke="#0ea5e9"
                    fill="url(#leadVolume)"
                    strokeWidth={3}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="converted"
                    name="Conversions"
                    stroke="#10b981"
                    fill="url(#conversionVolume)"
                    strokeWidth={3}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChartState
              title="Not enough activity yet"
              description="Once leads begin entering and converting, this trend chart will start drawing the pipeline story."
            />
          )}
        </ChartCard>

        {isAdmin ? <LeadForm onLeadCreated={refreshLeads} /> : <WorkspaceAccessCard isAdmin={isAdmin} user={user} />}
      </section>

      <ChartCard
        eyebrow="Recent Activity"
        title="Latest movement"
        description="A lightweight activity stream to complement the charts and make shifts in the pipeline easier to explain."
      >
        <div className="space-y-4">
          {recentActivity.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
              Activity will appear here once leads, follow-ups, and notes start coming in.
            </div>
          ) : (
            recentActivity.map((item) => (
              <Link
                key={item.id}
                to={`/lead/${item.leadId}`}
                className="block rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-cyan-200 hover:bg-cyan-50/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </ChartCard>
    </div>
  );
}
