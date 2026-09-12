import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, Briefcase, CheckCircle2, Clock, Hammer,
  MapPin, Phone, RotateCcw, Star, UserCheck, Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import Avatar from "../components/Avatar";
import Spinner from "../components/Spinner";

const ROUTES = { back: "/homeowner" };

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

/* Safe location — null-guarded so the page can't white-screen while loading. */
function jobLocation(job) {
  if (!job) return null;
  if (job.lga && job.state) return `${job.lga}, ${job.state}`;
  return null;
}

const STEPS = [
  { key: "open", label: "Open", icon: Briefcase },
  { key: "claimed", label: "Claimed", icon: UserCheck },
  { key: "in_progress", label: "In progress", icon: Hammer },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

function StatusTimeline({ status }) {
  const norm = String(status || "open").toLowerCase().replace(/\s+/g, "_");
  let current = STEPS.findIndex((s) => s.key === norm);
  if (current === -1) current = 0;
  return (
    <div className="anim-up rounded-2xl border border-line bg-card p-5 shadow-sm" style={{ animationDelay: "0.12s" }}>
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-mist">Job progress</p>
      <div className="flex items-start">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <span className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i === 0 ? "opacity-0" : done || active ? "bg-pine" : "bg-line"}`} />
                <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ${done ? "border-pine bg-pine text-cream" : active ? "pulse-soft border-amber-500 bg-amber-500 text-pine-900" : "border-line bg-cream text-mist"}`}>
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-[18px] w-[18px]" />}
                </span>
                <span className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i === STEPS.length - 1 ? "opacity-0" : done ? "bg-pine" : "bg-line"}`} />
              </div>
              <span className={`mt-2 text-center text-[10px] font-bold leading-tight md:text-[11px] ${active ? "text-amber-600" : done ? "text-pine" : "text-mist/70"}`}>{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

function RatingInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(0)} onClick={() => onChange(i)} className="btn-press rounded-full p-1 transition-transform duration-150 hover:scale-125 active:scale-90">
            <Star className={`h-9 w-9 transition-all duration-200 md:h-10 md:w-10 ${i <= shown ? "fill-amber-400 text-amber-400 drop-shadow-sm" : "text-line hover:text-amber-300"}`} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <span className={`h-5 text-sm font-bold transition-colors ${shown ? "text-amber-600" : "text-mist/60"}`}>{shown ? RATING_LABELS[shown] : "Tap a star to rate"}</span>
    </div>
  );
}

function MiniStars({ value }) {
  const full = Math.round(Number(value) || 0);
  return (
    <span className="inline-flex items-center gap-[1px]" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i <= full ? "fill-amber-400 text-amber-400" : "text-line"}`} strokeWidth={1.5} />
      ))}
      {value ? <span className="ml-1 text-[11px] font-bold text-ink">{Number(value).toFixed(1)}</span> : null}
    </span>
  );
}

export default function JobDetailHomeowner() {
  const { id } = useParams();
  const { token } = useAuth();
  const [job, setJob] = useState(null);
  const [interested, setInterested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const jobData = await api.get(`/jobs/${id}`, token);
      setJob(jobData);
      if (jobData.status === "Open") {
        const list = await api.get(`/jobs/${id}/interested`, token);
        setInterested(list);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { load(); }, [load]);

  const handleClaim = async (providerId) => {
    setBusy(true); setError("");
    try {
      await api.patch(`/jobs/${id}/claim`, { providerId }, token);
      setActionMsg("Job claimed. The other interested providers have been notified it's taken.");
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const handleReopen = async () => {
    setBusy(true); setError("");
    try {
      await api.patch(`/jobs/${id}/reopen`, {}, token);
      setActionMsg("Job reopened — matching providers have been notified again.");
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const handleComplete = async () => {
    setBusy(true); setError("");
    try {
      await api.patch(`/jobs/${id}/complete`, {}, token);
      setActionMsg("Job marked completed. Please rate your provider below.");
      await load();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await api.post(`/jobs/${id}/rating`, { score: ratingScore, comment: ratingComment }, token);
      setRatingSubmitted(true);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  if (loading) return (<div className="flex justify-center py-24"><Spinner dark /></div>);

  if (!job) {
    return (
      <div className="anim-up mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-rose-600" />
        <p className="mt-2 text-sm font-bold text-rose-600">{error || "Job not found."}</p>
        <Link to={ROUTES.back} className="btn-press mt-4 inline-flex items-center gap-1.5 rounded-2xl border border-rose-300 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to my jobs
        </Link>
      </div>
    );
  }

 const claimedUser = job?.claimedBy?.userId;
const claimedName = claimedUser?.name || job?.claimedBy?.name || "Assigned Artisan";
const claimedPhone = claimedUser?.phone || job?.claimedBy?.phone;
const status = String(job?.status || "Open");
const locationLabel = (job?.lga && job?.state) ? `${job.lga}, ${job.state}` : "Location pending";

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="anim-up">
        <Link to={ROUTES.back} className="btn-press inline-flex items-center gap-1.5 text-sm font-bold text-mist transition-colors hover:text-pine">
          <ArrowLeft className="h-4 w-4" /> Back to my jobs
        </Link>
      </div>

      <section className="anim-up overflow-hidden rounded-2xl border border-line bg-card shadow-sm" style={{ animationDelay: "0.06s" }}>
        <div className="dot-grid relative bg-pine px-5 py-4 md:px-6">
          <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full border-[12px] border-amber-500/15" />
          <div className="relative flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-cream/15 px-2.5 py-1 text-[11px] font-bold text-cream">{job.categoryId?.name || "Job"}</span>
            {job.urgency && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-pine-900">
                <Zap className="h-3 w-3 fill-pine-900" /> Urgent
              </span>
            )}
            <span className="ml-auto"><StatusBadge status={job.status} /></span>
          </div>
        </div>
        <div className="p-5 md:p-6">
          <h1 className="font-brand text-xl font-bold leading-snug tracking-tight text-ink md:text-2xl">
            {job.categoryId?.name} — {locationLabel}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-mist">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-pine-600/70" /> {locationLabel}
            </span>
            {job.created_at && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-pine-600/70" /> Posted {timeAgo(job.created_at)}
              </span>
            )}
          </div>
          <div className="mt-4 rounded-2xl bg-cream p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">Job brief</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/90">{job.description}</p>
          </div>
        </div>
      </section>

      <StatusTimeline status={status} />

      {error && (
        <div className="anim-scale flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <p className="text-sm font-bold text-rose-600">{error}</p>
        </div>
      )}
      {actionMsg && (
        <div className="anim-scale flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm font-bold text-emerald-700">{actionMsg}</p>
        </div>
      )}

      {status === "Open" && (
        <section className="anim-up rounded-2xl border border-line bg-card p-5 shadow-sm md:p-6" style={{ animationDelay: "0.18s" }}>
          <h2 className="font-brand text-lg font-bold tracking-tight text-ink">Interested providers</h2>
          <p className="mt-1 text-[13px] font-medium leading-relaxed text-mist">
            Providers call you directly (first-come-first-served). Match the caller to a name below, then claim.
          </p>
          {interested.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-line bg-cream/60 px-5 py-10 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-pine-50 text-pine-700"><UserCheck className="h-5 w-5" /></span>
              <p className="mt-3 text-sm font-bold text-ink">No one has expressed interest yet</p>
              <p className="mx-auto mt-1 max-w-xs text-xs font-medium text-mist">Matching providers in your area were notified — responses usually arrive within the hour.</p>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {interested.map((p, i) => (
                <div key={p.providerId} className="anim-up group flex flex-col gap-3 rounded-2xl border border-line bg-cream/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-pine/25 hover:shadow-lg sm:flex-row sm:items-center sm:justify-between" style={{ animationDelay: `${0.22 + i * 0.07}s` }}>
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} size={44} online />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{p.name}</p>
                      {p.phone && (
                        <a href={`tel:${p.phone}`} className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-pine-700 transition-colors hover:text-amber-600">
                          <Phone className="h-3 w-3" /> {p.phone}
                        </a>
                      )}
                      <div className="mt-1"><MiniStars value={p.averageRating} /></div>
                    </div>
                  </div>
                  <button disabled={busy} onClick={() => handleClaim(p.providerId)} className="btn-press inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-pine-900 shadow-sm hover:bg-amber-400 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60">
                    <UserCheck className="h-4 w-4" /> Claim
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(status === "Claimed" || status === "In Progress" || status === "In progress") && (
        <section className="anim-up rounded-2xl border border-line bg-card p-5 shadow-sm md:p-6" style={{ animationDelay: "0.18s" }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mist">Assigned artisan</p>
          <div className="mt-3 flex items-center gap-4">
            <Avatar name={claimedName} size={56} online />
            <div className="min-w-0 flex-1">
              <p className="truncate font-brand text-lg font-bold text-ink">{claimedName}</p>
              <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <UserCheck className="h-3.5 w-3.5" /> Claimed this job
              </p>
            </div>
            {claimedPhone && (
              <a href={`tel:${claimedPhone}`} className="btn-press inline-flex items-center gap-1.5 rounded-2xl border border-pine/30 px-4 py-2.5 text-sm font-bold text-pine hover:bg-pine-50">
                <Phone className="h-4 w-4" /> Call
              </a>
            )}
          </div>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button disabled={busy} onClick={handleComplete} className="btn-press inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-pine-900 shadow-md hover:bg-amber-400 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
              <CheckCircle2 className="h-4 w-4" /> Mark completed
            </button>
            <button disabled={busy} onClick={handleReopen} className="btn-press inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300 px-5 py-3.5 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60">
              <RotateCcw className="h-4 w-4" /> Reopen job
            </button>
          </div>
        </section>
      )}

      {status === "Completed" && !ratingSubmitted && (
        <form onSubmit={handleSubmitRating} className="anim-up rounded-2xl border border-line bg-card p-6 text-center shadow-sm md:p-8" style={{ animationDelay: "0.18s" }}>
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-600">
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
          </span>
          <h2 className="mt-3 font-brand text-xl font-bold tracking-tight text-ink">Rate your provider</h2>
          <p className="mx-auto mt-1 max-w-sm text-[13px] font-medium text-mist">Your review helps other homeowners hire with confidence.</p>
          <div className="mt-5"><RatingInput value={ratingScore} onChange={setRatingScore} /></div>
          <textarea value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} placeholder="Optional comment…" rows={3} className="mt-5 w-full resize-none rounded-2xl border border-line bg-cream px-4 py-3 text-sm text-ink outline-none transition-all duration-200 placeholder:text-mist/60 focus:border-amber-500 focus:bg-card focus:ring-2 focus:ring-amber-500/25" />
          <button type="submit" disabled={busy || ratingScore === 0} className="btn-press mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-pine-900 shadow-md hover:bg-amber-400 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? <Spinner /> : <CheckCircle2 className="h-4 w-4" />}
            {busy ? "Submitting…" : "Submit rating"}
          </button>
        </form>
      )}

      {status === "Completed" && ratingSubmitted && (
        <div className="anim-scale rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center" role="status">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-cream"><CheckCircle2 className="h-6 w-6" /></span>
          <h2 className="mt-3 font-brand text-lg font-bold text-emerald-800">Thanks — your rating has been recorded</h2>
          <div className="mt-2 flex justify-center"><MiniStars value={ratingScore} /></div>
          {ratingComment.trim() && <p className="mx-auto mt-2 max-w-sm text-sm italic text-emerald-700">“{ratingComment}”</p>}
        </div>
      )}
    </div>
  );
}