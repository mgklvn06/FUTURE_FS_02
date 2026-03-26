import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";

const authModes = {
  login: {
    eyebrow: "Team Sign In",
    title: "Welcome back to the pipeline",
    description: "Sign in to rejoin your workspace, restore your secure session, and keep the team pipeline moving.",
    action: "Sign In",
    alternateLabel: "Need an account?",
    alternateAction: "Create one",
  },
  register: {
    eyebrow: "Create Account",
    title: "Launch or join a shared workspace",
    description: "Create a new CRM workspace as the first admin or join an existing team with an invite code.",
    action: "Create Account",
    alternateLabel: "Already have an account?",
    alternateAction: "Sign in",
  },
};

const featureHighlights = [
  "Workspace creation for the first admin or invite-code signup for teammates.",
  "JWT-backed sessions with team-aware auth restore across refreshes.",
  "Admin and member roles so capture permissions and collaboration can stay separated.",
];

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [workspaceMode, setWorkspaceMode] = useState("create");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    teamName: "",
    inviteCode: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = authModes[mode];
  const redirectTo = location.state?.from?.pathname || "/";

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === "inviteCode" ? value.toUpperCase().replace(/\s+/g, "") : value;

    setFormData((currentState) => ({
      ...currentState,
      [name]: nextValue,
    }));
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setErrorMessage("");
  };

  const handleWorkspaceModeChange = (nextMode) => {
    setWorkspaceMode(nextMode);
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (mode === "register") {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          teamName: workspaceMode === "create" ? formData.teamName : "",
          inviteCode: workspaceMode === "join" ? formData.inviteCode : "",
        });
      } else {
        await login({
          email: formData.email,
          password: formData.password,
        });
      }

      navigate(redirectTo, { replace: true });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          mode === "register"
            ? "We could not create your account right now."
            : "We could not sign you in right now."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-2rem] h-96 w-96 rounded-full bg-slate-900/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-8 text-white shadow-[0_40px_120px_-56px_rgba(2,6,23,0.92)] sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-linear-to-r from-cyan-400/30 via-sky-300/10 to-transparent" />
          <div className="pointer-events-none absolute right-0 top-12 h-56 w-56 rounded-full bg-cyan-400/18 blur-3xl" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">Northstar</p>
              <h1 className="font-display mt-6 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                Secure access for your sales workspace.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                This release pushes the CRM beyond a solo tool: shared workspaces, invite-based onboarding,
                role-aware access, and protected team data across the API and dashboard.
              </p>
            </div>

            <div className="grid gap-4">
              {featureHighlights.map((feature) => (
                <div
                  key={feature}
                  className="rounded-[28px] border border-white/10 bg-white/6 px-5 py-4 ring-1 ring-white/10"
                >
                  <p className="text-sm leading-6 text-slate-100">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[36px] border border-slate-200/80 bg-white/95 px-6 py-8 shadow-[0_40px_120px_-56px_rgba(15,23,42,0.45)] ring-1 ring-white/70 backdrop-blur sm:px-8 sm:py-10">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleModeChange("login")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-300/60"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("register")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === "register"
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-300/60"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
              }`}
            >
              Register
            </button>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
              {copy.eyebrow}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-slate-950">{copy.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{copy.description}</p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jane Doe"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  />
                </label>

                <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleWorkspaceModeChange("create")}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        workspaceMode === "create"
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-300/60"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
                      }`}
                    >
                      Create Workspace
                    </button>
                    <button
                      type="button"
                      onClick={() => handleWorkspaceModeChange("join")}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        workspaceMode === "join"
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-300/60"
                          : "border border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:text-cyan-700"
                      }`}
                    >
                      Join Team
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                      Workspace Setup
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {workspaceMode === "create"
                        ? "Create a new shared workspace and become its first admin."
                        : "Use the invite code from your admin to join an existing workspace as a member."}
                    </p>
                  </div>

                  {workspaceMode === "create" ? (
                    <label className="mt-4 block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">
                        Workspace name
                      </span>
                      <input
                        type="text"
                        name="teamName"
                        value={formData.teamName}
                        onChange={handleChange}
                        placeholder="Acme Revenue Team"
                        required={workspaceMode === "create"}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      />
                    </label>
                  ) : (
                    <label className="mt-4 block">
                      <span className="mb-2 block text-sm font-medium text-slate-700">Invite code</span>
                      <input
                        type="text"
                        name="inviteCode"
                        value={formData.inviteCode}
                        onChange={handleChange}
                        placeholder="ABCD2345"
                        required={workspaceMode === "join"}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-medium tracking-[0.18em] text-slate-900 uppercase outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                      />
                    </label>
                  )}
                </div>
              </>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                minLength={6}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? "Please wait..." : copy.action}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            <span>{copy.alternateLabel}</span>
            <button
              type="button"
              onClick={() => handleModeChange(mode === "login" ? "register" : "login")}
              className="font-semibold text-cyan-700 transition hover:text-cyan-800"
            >
              {copy.alternateAction}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
