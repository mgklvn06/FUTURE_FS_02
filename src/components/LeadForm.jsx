import { useState } from "react";
import { createLead, getErrorMessage } from "../services/api";

export default function LeadForm({ onLeadCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    source: "website",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setFeedback("");
      const createdLead = await createLead(formData);
      setFormData({ name: "", email: "", source: "website" });
      setFeedback(`${createdLead.data.name} was added to the pipeline.`);
      await onLeadCreated?.();
    } catch (error) {
      console.error("Error creating lead:", error);
      setFeedback(getErrorMessage(error, "We could not save this lead right now. Please try again."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[30px] border border-slate-200/70 bg-white/95 p-6 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.55)] ring-1 ring-white/70 backdrop-blur"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Quick Capture
          </p>
          <h2 className="font-display mt-3 text-2xl font-semibold text-slate-950">
            Add a lead in under a minute
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-600">
            Keep the form lightweight, move quickly, and let the pipeline organize the follow-up.
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-900 shadow-sm shadow-cyan-100/50">
          New submissions land with <span className="font-semibold">New</span> status automatically.
        </div>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Name
          </span>
          <input
            type="text"
            name="name"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </span>
          <input
            type="email"
            name="email"
            placeholder="jane@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Source
          </span>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
          >
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social">Social Media</option>
            <option value="email">Email Campaign</option>
            <option value="event">Event</option>
          </select>
        </label>

        {feedback ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {feedback}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSaving ? "Saving Lead..." : "Save Lead"}
        </button>
      </div>
    </form>
  );
}
