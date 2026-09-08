import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, Clock, MapPin, Users, Zap } from "lucide-react";
import StatusBadge from "./StatusBadge";

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${Math.floor(hrs / 24) > 1 ? "s" : ""} ago`;
}

const ngn = (n) => "₦" + Number(n).toLocaleString("en-NG");

/* Safe location display — null-guarded so cards can't crash the list
   while the API is loading or for unmigrated jobs. */
function jobLocation(job) {
  if (!job) return null;
  if (job.lga && job.state) return `${job.lga}, ${job.state}`;
  return null;
}

export default function JobCard({ job, linkTo, index = 0 }) {
  const [saved, setSaved] = useState(false);

  const category = job.categoryId?.name || "Category";
  const area = (job?.lga && job?.state) ? `${job.lga}, ${job.state}` : "Location pending";

  const applicants = job.applicants || job.interests || [];
  const min = job.budgetMin || job.budget_min;
  const max = job.budgetMax || job.budget_max;

  const content = (
    <>
      <div className="flex items-center gap-2 pr-10">
        <span className="inline-flex items-center rounded-full bg-pine-50 px-2.5 py-1 text-[11px] font-bold text-pine-700">
          {category}
        </span>
        {job.urgency && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            <Zap className="h-3 w-3 fill-amber-500 text-amber-500" /> Urgent
          </span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          setSaved((s) => !s);
        }}
        className={`btn-press absolute right-3.5 top-3.5 rounded-full p-2 ${
          saved ? "bg-amber-100 text-amber-600" : "text-mist hover:bg-cream hover:text-amber-600"
        }`}
        title={saved ? "Unsave job" : "Save job"}
        aria-pressed={saved}
      >
        <Bookmark className={`h-[18px] w-[18px] ${saved ? "fill-amber-500 text-amber-500" : ""}`} />
      </button>

      <h3 className="mt-3 line-clamp-2 font-brand text-[17px] font-bold leading-snug text-ink transition-colors group-hover:text-pine-700">
        {job.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-mist">
        {job.description?.length > 160 ? job.description.slice(0, 160) + "…" : job.description}
      </p>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-mist">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-pine-600/70" /> {area}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-pine-600/70" /> Posted {timeAgo(job.created_at)}
        </span>
        {applicants.length > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-pine-600/70" /> {applicants.length} applicant{applicants.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line/80 pt-4">
        {min || max ? (
          <span className="font-brand text-[15px] font-bold text-pine">
            {ngn(min || max)}
            {min && max && max > min && <span className="text-mist"> – {ngn(max)}</span>}
          </span>
        ) : (
          <span className="text-xs font-semibold text-mist">Budget negotiable</span>
        )}
        <span className="flex items-center gap-3">
          <StatusBadge status={job.status} />
          <span className="inline-flex items-center gap-1 text-xs font-bold text-pine-700 transition-colors group-hover:text-amber-600">
            View <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </span>
      </div>
    </>
  );

  const cardCls =
    "anim-up group relative flex flex-col rounded-2xl border border-line bg-card p-5 shadow-sm " +
    "transition-all duration-300 hover:-translate-y-1 hover:border-pine/25 hover:shadow-xl";
  const delay = { animationDelay: `${Math.min(index, 8) * 0.07}s` };

  return linkTo ? (
    <Link to={linkTo} className={`block ${cardCls}`} style={delay}>
      {content}
    </Link>
  ) : (
    <article className={cardCls} style={delay}>
      {content}
    </article>
  );
}