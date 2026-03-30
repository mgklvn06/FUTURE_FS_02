import { useState } from "react";
import { useOutletContext } from "react-router-dom";

function SettingsCard({ kicker, title, description, children }) {
  return (
    <section className="rounded-[32px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">{kicker}</p>
          <h2 className="font-display mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Editable
        </div>
      </div>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-1 block text-sm text-slate-600">{description}</span>
      </span>
      <span className="flex items-center gap-2">
        <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${checked ? "text-emerald-600" : "text-slate-400"}`}>
          {checked ? "On" : "Off"}
        </span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="h-5 w-10 cursor-pointer appearance-none rounded-full border border-slate-200 bg-white shadow-inner transition checked:border-emerald-300 checked:bg-emerald-200 focus:outline-none focus:ring-4 focus:ring-emerald-100"
        />
      </span>
    </label>
  );
}

export default function Settings() {
  const { user } = useOutletContext();
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [timezone, setTimezone] = useState("Africa/Nairobi");
  const [digest, setDigest] = useState(true);
  const [mentions, setMentions] = useState(true);
  const [autoAssign, setAutoAssign] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [idleLock, setIdleLock] = useState(true);

  return (
    <div className="space-y-6">
      <section className="rounded-[34px] border border-slate-200/70 bg-slate-950 px-6 py-6 text-white shadow-[0_40px_100px_-58px_rgba(2,6,23,0.85)]">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Settings Hub</p>
        <h1 className="font-display mt-3 text-3xl font-semibold">Shape the way your CRM runs</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          Update personal details, tune notifications, and control how the system behaves across the workspace.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Account</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Preferences</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">System</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Team</span>
        </div>
      </section>

      <SettingsCard
        kicker="Account"
        title="Profile details"
        description="Keep your identity consistent across every lead touchpoint."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jane@workspace.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Timezone</span>
            <select
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New York (ET)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Save Profile
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-200 hover:text-cyan-700"
          >
            Reset
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        kicker="Preferences"
        title="Notifications & view"
        description="Decide what deserves your attention and how compact the workspace feels."
      >
        <ToggleRow
          label="Daily pipeline digest"
          description="Receive a summary of overdue follow-ups and conversion shifts."
          checked={digest}
          onChange={setDigest}
        />
        <ToggleRow
          label="Mention alerts"
          description="Get notified when a teammate tags you on a lead or follow-up."
          checked={mentions}
          onChange={setMentions}
        />
        <ToggleRow
          label="Compact density"
          description="Tighten padding and card spacing across the workspace."
          checked={compactMode}
          onChange={setCompactMode}
        />
        <ToggleRow
          label="Auto-assign new leads"
          description="Assign new leads to you by default when you create them."
          checked={autoAssign}
          onChange={setAutoAssign}
        />
      </SettingsCard>

      <SettingsCard
        kicker="System"
        title="Behavior & security"
        description="Control refresh cadence and secure idle sessions."
      >
        <ToggleRow
          label="Auto-refresh dashboard"
          description="Refresh dashboard data every few minutes."
          checked={autoRefresh}
          onChange={setAutoRefresh}
        />
        <ToggleRow
          label="Idle session lock"
          description="Require re-authentication after inactivity."
          checked={idleLock}
          onChange={setIdleLock}
        />
        <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4">
          <p className="text-sm font-semibold text-rose-900">Danger zone</p>
          <p className="mt-1 text-sm text-rose-700">
            Log out of all devices and reset sessions if you suspect unusual access.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center rounded-2xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800"
          >
            Log out everywhere
          </button>
        </div>
      </SettingsCard>

      <SettingsCard
        kicker="Team"
        title="Workspace controls"
        description="These will expand to cover roles, invites, and organization defaults."
      >
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600">
          Team settings are coming soon. For now, manage invites and roles from the admin tools.
        </div>
      </SettingsCard>
    </div>
  );
}
