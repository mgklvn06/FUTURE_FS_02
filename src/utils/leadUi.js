export const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
];

export const followUpStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "done", label: "Done" },
  { value: "overdue", label: "Overdue" },
];

export const statusChartColors = {
  new: "#60a5fa",
  contacted: "#f59e0b",
  converted: "#10b981",
};

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const HOUR_IN_MS = 1000 * 60 * 60;

const statusMeta = {
  new: {
    label: "New",
    badgeClass:
      "inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700",
  },
  contacted: {
    label: "Contacted",
    badgeClass:
      "inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700",
  },
  converted: {
    label: "Converted",
    badgeClass:
      "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700",
  },
};

const followUpStatusMeta = {
  pending: {
    label: "Pending",
    badgeClass:
      "inline-flex items-center rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800",
  },
  overdue: {
    label: "Overdue",
    badgeClass:
      "inline-flex items-center rounded-full border border-rose-200 bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-800",
  },
  done: {
    label: "Done",
    badgeClass:
      "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800",
  },
};

function getDateValue(value) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDayBounds(value = new Date()) {
  const start = new Date(value);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 1);

  return { start, end };
}

function isSameDay(firstValue, secondValue = new Date()) {
  const firstDate = getDateValue(firstValue);
  const secondDate = getDateValue(secondValue);

  if (!firstDate || !secondDate) {
    return false;
  }

  return firstDate.toDateString() === secondDate.toDateString();
}

function isWithinWindow(value, windowMs) {
  const targetDate = getDateValue(value);

  if (!targetDate) {
    return false;
  }

  const diff = targetDate.getTime() - Date.now();
  return diff >= 0 && diff <= windowMs;
}

function getFollowUpPriority(status) {
  if (status === "overdue") {
    return 0;
  }

  if (status === "pending") {
    return 1;
  }

  return 2;
}

export function getStatusMeta(status) {
  return statusMeta[status] ?? {
    label: status ?? "Unknown",
    badgeClass:
      "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700",
  };
}

export function getFollowUpStatus(followUp) {
  if (!followUp) {
    return "pending";
  }

  if (followUp.status === "done") {
    return "done";
  }

  const dueAt = getDateValue(followUp.dueAt);

  if (dueAt && dueAt.getTime() < Date.now()) {
    return "overdue";
  }

  return "pending";
}

export function getFollowUpStatusMeta(status) {
  return followUpStatusMeta[status] ?? {
    label: status ?? "Unknown",
    badgeClass:
      "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700",
  };
}

export function sortFollowUps(followUps = []) {
  return [...followUps].sort((first, second) => {
    const firstStatus = getFollowUpStatus(first);
    const secondStatus = getFollowUpStatus(second);
    const statusDelta = getFollowUpPriority(firstStatus) - getFollowUpPriority(secondStatus);

    if (statusDelta !== 0) {
      return statusDelta;
    }

    const firstDue = getDateValue(first.dueAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const secondDue = getDateValue(second.dueAt)?.getTime() ?? Number.MAX_SAFE_INTEGER;

    return firstDue - secondDue;
  });
}

export function getLeadFollowUpCounts(lead) {
  const followUps = lead?.followUps ?? [];
  const counts = {
    total: followUps.length,
    open: 0,
    pending: 0,
    overdue: 0,
    dueToday: 0,
    done: 0,
  };

  for (const followUp of followUps) {
    const status = getFollowUpStatus(followUp);

    if (status === "done") {
      counts.done += 1;
      continue;
    }

    counts.open += 1;

    if (status === "overdue") {
      counts.overdue += 1;
    } else {
      counts.pending += 1;
    }

    if (isSameDay(followUp.dueAt)) {
      counts.dueToday += 1;
    }
  }

  return counts;
}

export function getNextFollowUp(lead) {
  const openFollowUps = (lead?.followUps ?? []).filter((followUp) => getFollowUpStatus(followUp) !== "done");
  return sortFollowUps(openFollowUps)[0] ?? null;
}

export function flattenFollowUps(leads = []) {
  return leads.flatMap((lead) =>
    (lead.followUps ?? []).map((followUp) => ({
      ...followUp,
      leadId: lead._id,
      leadName: lead.name,
      leadEmail: lead.email,
      leadStage: lead.status,
      status: getFollowUpStatus(followUp),
    }))
  );
}

export function getFollowUpSummary(leads = [], limit = 6) {
  const followUps = sortFollowUps(flattenFollowUps(leads));
  const { start, end } = getDayBounds();
  const openFollowUps = followUps.filter((followUp) => followUp.status !== "done");
  const overdue = openFollowUps.filter((followUp) => followUp.status === "overdue");
  const dueToday = openFollowUps.filter((followUp) => {
    const dueAt = getDateValue(followUp.dueAt);
    return dueAt && dueAt >= start && dueAt < end;
  });
  const dueSoon = openFollowUps.filter((followUp) => isWithinWindow(followUp.dueAt, DAY_IN_MS));
  const reminderQueue = sortFollowUps(
    openFollowUps.filter(
      (followUp) => followUp.status === "overdue" || isWithinWindow(followUp.reminderAt || followUp.dueAt, DAY_IN_MS)
    )
  ).slice(0, limit);

  return {
    all: followUps,
    open: openFollowUps,
    overdue,
    dueToday,
    dueSoon,
    completed: followUps.filter((followUp) => followUp.status === "done"),
    reminderQueue,
  };
}

export function getReminderHeadline(followUp) {
  const status = getFollowUpStatus(followUp);

  if (status === "overdue") {
    return "Overdue";
  }

  if (isSameDay(followUp?.dueAt)) {
    return "Due today";
  }

  if (isWithinWindow(followUp?.dueAt, HOUR_IN_MS * 4)) {
    return "Due soon";
  }

  return "Scheduled";
}

export function toDateTimeLocalValue(value) {
  const date = getDateValue(value);

  if (!date) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

export function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatSource(source = "") {
  return source
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatFullDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatRelativeTime(value) {
  if (!value) {
    return "Just now";
  }

  const diff = new Date(value).getTime() - Date.now();
  const absDiff = Math.abs(diff);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const steps = [
    { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: "week", ms: 1000 * 60 * 60 * 24 * 7 },
    { unit: "day", ms: DAY_IN_MS },
    { unit: "hour", ms: HOUR_IN_MS },
    { unit: "minute", ms: 1000 * 60 },
  ];

  for (const step of steps) {
    if (absDiff >= step.ms) {
      return formatter.format(Math.round(diff / step.ms), step.unit);
    }
  }

  return "just now";
}

export function getConversionRate(leads) {
  if (!leads.length) {
    return 0;
  }

  const convertedLeads = leads.filter((lead) => lead.status === "converted").length;
  return Math.round((convertedLeads / leads.length) * 100);
}

export function getStatusBreakdown(leads) {
  return statusOptions.map((option) => ({
    key: option.value,
    label: option.label,
    value: leads.filter((lead) => lead.status === option.value).length,
    fill: statusChartColors[option.value] ?? "#94a3b8",
  }));
}

export function getLeadTrend(leads, days = 7) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));

    return {
      key: date.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date),
      leads: 0,
      converted: 0,
    };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));

  for (const lead of leads) {
    if (lead.createdAt) {
      const createdDate = new Date(lead.createdAt);
      createdDate.setHours(0, 0, 0, 0);
      const createdBucket = bucketMap.get(createdDate.toISOString().slice(0, 10));

      if (createdBucket) {
        createdBucket.leads += 1;
      }
    }

    if (lead.status === "converted" && lead.updatedAt) {
      const updatedDate = new Date(lead.updatedAt);
      updatedDate.setHours(0, 0, 0, 0);
      const convertedBucket = bucketMap.get(updatedDate.toISOString().slice(0, 10));

      if (convertedBucket) {
        convertedBucket.converted += 1;
      }
    }
  }

  return buckets;
}

export function getRecentActivity(leads, limit = 5) {
  const activity = [];

  for (const lead of leads) {
    activity.push({
      id: `${lead._id}-created`,
      leadId: lead._id,
      title: `${lead.name} entered the pipeline`,
      description: `${lead.email} came in through ${formatSource(lead.source)}.`,
      timestamp: lead.createdAt,
    });

    for (const note of lead.notes ?? []) {
      activity.push({
        id: `${lead._id}-${note.date}-${note.text}`,
        leadId: lead._id,
        title: `Note added for ${lead.name}`,
        description: note.text,
        timestamp: note.date,
      });
    }

    for (const followUp of lead.followUps ?? []) {
      activity.push({
        id: `${lead._id}-${followUp._id}-followup-created`,
        leadId: lead._id,
        title: `Follow-up scheduled for ${lead.name}`,
        description: `${followUp.title} is ${getReminderHeadline(followUp).toLowerCase()}.`,
        timestamp: followUp.createdAt || followUp.dueAt,
      });

      if (getFollowUpStatus(followUp) === "done" && followUp.completedAt) {
        activity.push({
          id: `${lead._id}-${followUp._id}-followup-done`,
          leadId: lead._id,
          title: `Follow-up completed for ${lead.name}`,
          description: followUp.title,
          timestamp: followUp.completedAt,
        });
      }
    }

    if (lead.updatedAt && lead.createdAt && new Date(lead.updatedAt) > new Date(lead.createdAt)) {
      activity.push({
        id: `${lead._id}-updated`,
        leadId: lead._id,
        title: `${lead.name} record was updated`,
        description: `Current status is ${getStatusMeta(lead.status).label}.`,
        timestamp: lead.updatedAt,
      });
    }
  }

  return activity
    .filter((item) => item.timestamp)
    .sort((first, second) => new Date(second.timestamp) - new Date(first.timestamp))
    .slice(0, limit);
}
