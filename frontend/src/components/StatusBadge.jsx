const LABELS = {
  Open: "Open",
  Claimed: "In Progress",
  Completed: "Completed",
};

const CLASSES = {
  Open: "badge-open",
  Claimed: "badge-claimed",
  Completed: "badge-completed",
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${CLASSES[status] || ""}`}>{LABELS[status] || status}</span>;
}
