/* Restyled drop-in replacement for your existing StatusBadge. */
/* Restyled drop-in replacement for your existing StatusBadge. */
const STYLES = {
  open: { label: "Open", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  claimed: { label: "Claimed", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  assigned: { label: "Assigned", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  in_progress: { label: "In progress", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  completed: { label: "Completed", cls: "bg-pine-50 text-pine-600", dot: "bg-pine-600" },
  closed: { label: "Closed", cls: "bg-pine-50 text-pine-600", dot: "bg-pine-600" },
};
const humanize = (s) =>
  String(s || "open")
    .split(/[_\s-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function StatusBadge({ status }) {
  const s = STYLES[status] || {
    label: humanize(status),
    cls: "bg-pine-50 text-pine-600",
    dot: "bg-pine-600",
  };
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}