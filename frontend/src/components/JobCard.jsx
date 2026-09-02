import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

export default function JobCard({ job, linkTo }) {
  const category = job.categoryId?.name || "Category";
  const area = job.areaId ? `${job.areaId.name}, ${job.areaId.city}` : "Area";

  const content = (
    <div className={`docket ${job.urgency ? "urgent" : ""}`}>
      <div className="row-between" style={{ marginBottom: 8 }}>
        <h4>{category} — {area}</h4>
        <StatusBadge status={job.status} />
      </div>
      <p className="muted" style={{ fontSize: "0.9rem", marginBottom: 8 }}>
        {job.description?.length > 120 ? job.description.slice(0, 120) + "…" : job.description}
      </p>
      <div className="row" style={{ fontSize: "0.78rem" }}>
        {job.urgency && <span className="badge badge-urgent">Urgent</span>}
        <span className="muted">Posted {timeAgo(job.created_at)}</span>
      </div>
    </div>
  );

  return linkTo ? (
    <Link to={linkTo} style={{ textDecoration: "none", color: "inherit" }}>
      {content}
    </Link>
  ) : (
    content
  );
}
