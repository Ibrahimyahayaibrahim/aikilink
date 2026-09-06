import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle, ArrowRight, Briefcase, CheckCircle2, Clock, Hammer,
  History, MapPin, Star, UserRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

/* Keep in sync with the ROUTES map in NavBar.jsx */
const ROUTES = {
  feed: "/provider",
  jobDetail: (id) => `/provider/jobs/${id}`,
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function MiniStars({ value }) {
  const full = Math.round(Number(value) || 0);
  return (
    <span className="inline-flex items-center gap-[1px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= full ? "fill-amber-400 text-amber-400" : "text-line"}`} strokeWidth={1.5} />
      ))}
    </span>
  );
}

const CURRENT_STATUSES = ["Claimed", "In Progress", "In progress", "in_progress", "assigned"];
const HISTORY_STATUSES = ["Completed", "completed", "Closed", "closed"];

const jobRating = (j) => j.rating?.score ?? j.rating?.stars ?? j.score ?? null;
const homeownerName = (j) => j.postedBy?.name || j.homeownerId?.name || null;

/* ---------- job card ---------- */
function WorkCard({ job, index, variant }) {
  const rating = jobRating(job);
  const owner = homeownerName(job);
  const isCurrent = variant === "current";

  return (
    <Link
      to={ROUTES.jobDetail(job._id)}
      className="anim-up group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pine/25 hover:shadow-xl"
      style={{ animationDelay: `${Math.min(index, 8) * 0.07}s` }}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${isCurrent ? "bg-amber-500" : "bg-emerald-500"}`} />
      <div className="flex items-center justify-between gap-2 pl-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-50 px-2.5 py-1 text-[11px] font-bold text-pine-700">
          <Hammer className="h-3 w-3" /> {job.categoryId?.name || "Job"}
        </span>
        <StatusBadge status={job.status} />
      </div>

      <h3 className="mt-3 line-clamp-2 pl-2 font-brand text-[16px] font-bold leading-snug text-ink transition-colors group-hover:text-pine-700">
        {job.title || job.description?.slice(0, 70) || "Job"}
      </h3>
      <p className="mt-1.5 line-clamp-2 pl-2 text-sm leading-relaxed text-mist">{job.description}</p>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 pl-2 text-xs font-medium text-mist">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-pine-600/70" />
          {job.areaId ? `${job.areaId.name}, ${job.areaId.city}` : "Area"}
        </span>
        {isCurrent && job.created_at && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-pine-600/70" /> Started {timeAgo(job.created_at)}
          </span>
        )}
        {owner && (
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="h-3.5 w-3.5 text-pine-600/70" /> {owner}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line/80 pt-3.5 pl-2">
        {isCurrent ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600">
            <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-amber-500" /> In your hands
          </span>
        ) : rating ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist">
            <MiniStars value={rating} /> Homeowner rating
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> Wrapped up
          </span>
        )}
        <span className="inline-flex items-center gap-1 text-xs font-bold text-pine-700 transition-colors group-hover:text-amber-600">
          Open <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export default function ProviderMyWork() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("current");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        /* Same single call as the original — split happens client-side. */
        const data = await api.get("/jobs/assigned", token);
        if (!cancelled) setJobs(Array.isArray(data) ? data : data?.jobs || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load your work.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const { current, history } = useMemo(() => {
    const cur = jobs.filter((j) => CURRENT_STATUSES.includes(j.status));
    const past = jobs.filter((j) => HISTORY_STATUSES.includes(j.status));
    return { current: cur, history: past };
  }, [jobs]);

  const stats = useMemo(() => {
    const rated = history.map(jobRating).filter((r) => r !== null);
    const avg = rated.length ? rated.reduce((a, b) => a + b, 0) / rated.length : null;
    return { current: current.length, history: history.length, avg };
  }, [current, history]);

  const list = tab === "current" ? current : history;

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <Spinner dark />
        <p className="text-sm font-medium text-mist">Loading your work…</p>
      </div>
    );
  }

  return (
    <div className="space-y-7 md:space-y-9">
      {/* header */}
      <div className="anim-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">My work</p>
          <h1 className="mt-1 font-brand text-2xl font-bold tracking-tight text-ink md:text-3xl">Your jobs, organized</h1>
        </div>
        <Link
          to={ROUTES.feed}
          className="btn-press inline-flex items-center gap-2 rounded-2xl border border-pine/30 px-4 py-2.5 text-sm font-bold text-pine hover:bg-pine-50"
        >
          Find more work <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* stat chips */}
      <section className="grid grid-cols-3 gap-3">
        {[
          { label: "In progress", value: stats.current, tone: "bg-amber-100 text-amber-600", icon: Briefcase, delay: "0.08s" },
          { label: "Completed", value: stats.history, tone: "bg-emerald-100 text-emerald-600", icon: CheckCircle2, delay: "0.16s" },
          { label: "Avg rating", value: stats.avg === null ? "—" : stats.avg.toFixed(1), tone: "bg-pine-50 text-pine-700", icon: Star, delay: "0.24s" },
        ].map((s) => (
          <div key={s.label} className="anim-up group rounded-2xl border border-line bg-card p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md md:p-4" style={{ animationDelay: s.delay }}>
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${s.tone} transition-transform duration-300 group-hover:scale-110`}>
              <s.icon className="h-4 w-4" />
            </span>
            <p className="mt-2.5 font-brand text-lg font-bold leading-none text-ink md:text-xl">{s.value}</p>
            <p className="mt-1 text-[11px] font-semibold text-mist">{s.label}</p>
          </div>
        ))}
      </section>

      {error && (
        <div className="anim-scale flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <p className="text-sm font-bold text-rose-600">{error}</p>
        </div>
      )}

      {/* animated tab switcher */}
      <div className="anim-up" style={{ animationDelay: "0.1s" }}>
        <div className="relative grid grid-cols-2 rounded-2xl border border-line bg-card p-1.5 shadow-sm">
          <span
            className={`absolute inset-y-1.5 w-[calc(50%-6px)] rounded-xl bg-pine shadow-sm transition-transform duration-300 ease-out ${
              tab === "history" ? "translate-x-[calc(100%+6px)]" : "translate-x-0"
            }`}
            style={{ left: 6 }}
            aria-hidden="true"
          />
          <button
            onClick={() => setTab("current")}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors duration-200 ${
              tab === "current" ? "text-cream" : "text-mist hover:text-pine"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Current work
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === "current" ? "bg-cream/20 text-cream" : "bg-line/60 text-mist"}`}>
              {current.length}
            </span>
          </button>
          <button
            onClick={() => setTab("history")}
            className={`relative z-10 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors duration-200 ${
              tab === "history" ? "text-cream" : "text-mist hover:text-pine"
            }`}
          >
            <History className="h-4 w-4" />
            History
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === "history" ? "bg-cream/20 text-cream" : "bg-line/60 text-mist"}`}>
              {history.length}
            </span>
          </button>
        </div>
      </div>

      {/* tab content — keyed so cards re-stagger on switch */}
      <div key={tab}>
        {list.length === 0 ? (
          tab === "current" ? (
            <div className="anim-up rounded-2xl border border-dashed border-line bg-card/60 px-6 py-14 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-pine-50 text-pine-700">
                <Hammer className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-brand text-lg font-bold text-ink">Nothing in progress right now</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-mist">
                When a homeowner claims you on a job, it lands here so you can track it to completion.
              </p>
              <Link
                to={ROUTES.feed}
                className="btn-press mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-pine-900 shadow-sm hover:bg-amber-400 hover:shadow-lg"
              >
                Browse available jobs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="anim-up rounded-2xl border border-dashed border-line bg-card/60 px-6 py-14 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                <History className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-brand text-lg font-bold text-ink">You haven't completed any jobs yet</h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-mist">
                Your finished jobs build your public track record — complete your first one and it will appear here with the homeowner's rating.
              </p>
              <Link
                to={ROUTES.feed}
                className="btn-press mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-pine-900 shadow-sm hover:bg-amber-400 hover:shadow-lg"
              >
                Find your first job <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((job, i) => (
              <WorkCard key={job._id} job={job} index={i} variant={tab} />
            ))}
          </div>
        )}
      </div>

      {/* footer tip */}
      {history.length > 0 && (
        <div className="anim-up flex gap-3 rounded-2xl border border-pine-100 bg-pine-50 p-4" style={{ animationDelay: "0.15s" }}>
          <Star className="h-5 w-5 shrink-0 fill-amber-400 text-amber-400" />
          <p className="text-xs leading-relaxed text-pine-800">
            <span className="font-bold">Your ratings are your storefront.</span> Homeowners see your average before they call — keep it high by finishing what you start.
          </p>
        </div>
      )}
    </div>
  );
}