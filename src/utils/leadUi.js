export const statusOptions = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "converted", label: "Converted" },
];

export const statusChartColors = {
  new: "#60a5fa",
  contacted: "#f59e0b",
  converted: "#10b981",
};

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

export function getStatusMeta(status) {
  return statusMeta[status] ?? {
    label: status ?? "Unknown",
    badgeClass:
      "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-700",
  };
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
    { unit: "day", ms: 1000 * 60 * 60 * 24 },
    { unit: "hour", ms: 1000 * 60 * 60 },
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
