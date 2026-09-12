import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle, ArrowRight, BadgeCheck, Briefcase, CheckCircle2, Clock,
  Hammer, MapPin, Sparkles, Star, Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import Spinner from "../components/Spinner";

/* Keep in sync with the ROUTES map in NavBar.jsx */
const ROUTES = {
  jobDetail: (id) => `/provider/jobs/${id}`,
  profile: "/provider/profile",
};

const ngn = (n) => "₦" + Number(n).toLocaleString("en-NG");

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

function CountUp({ to, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const target = Number(to) || 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      return;
    }
    let raf;
    const start = performance.now();
    const dur = 900;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <span>
      {prefix}
      {val.toLocaleString("en-NG")}
      {suffix}
    </span>
  );
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

const TICKER = [
  "Providers with complete profiles get matched first",
  "Responding fast to new matches wins more jobs",
  "Homeowners see your star rating before they call",
  "Mark jobs complete promptly to build your track record",
  "Urgent jobs are shown first — keep notifications on",
];

// Safe location display — falls back for unmigrated jobs and null objects
function jobLocation(job) {
  if (!job) return null;
  if (job.lga && job.state) return `${job.lga}, ${job.state}`;
  return null;
}

/* ---------- available-job card (provider flavour) ---------- */
function MatchCard({ job, index, interested, busy, onInterest }) {
  const navigate = useNavigate();
  const category = job.categoryId?.name || "Job";
  const location = jobLocation(job);
  const min = job.budgetMin || job.budget_min;
  const max = job.budgetMax || job.budget_max;

  return (
    <article
      onClick={() => navigate(ROUTES.jobDetail(job._id))}
      className="anim-up group relative flex cursor-pointer flex-col rounded-2xl border border-line bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pine/25 hover:shadow-xl"
      style={{ animationDelay: `${Math.min(index, 8) * 0.07}s` }}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-50 px-2.5 py-1 text-[11px] font-bold text-pine-700">
          <Hammer className="h-3 w-3" /> {category}
        </span>
        {job.urgency && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
            <Zap className="h-3 w-3 fill-amber-500 text-amber-500" /> Urgent
          </span>
        )}
      </div>

      <div className="mt-3 block">
        <h3 className="line-clamp-2 font-brand text-[17px] font-bold leading-snug text-ink transition-colors group-hover:text-pine-700">
          {job.title || `${category} needed${location ? ` in ${location}` : ""}`}
        </h3>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-mist">{job.description}</p>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-mist">
        {location ? (
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-pine-600/70" /> {location}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-mist/60">
            <MapPin className="h-3.5 w-3.5 text-pine-600/40" /> Location pending
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-pine-600/70" /> {timeAgo(job.created_at)}
        </span>
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

        {interested ? (
          <span className="anim-scale inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Interest sent
          </span>
        ) : (
          <button
            disabled={busy}
            onClick={(e) => {
              e.stopPropagation(); // Prevents triggering the article's own onClick
              onInterest(job._id);
            }}
            className="btn-press inline-flex items-center gap-1.5 rounded-2xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-pine-900 shadow-sm hover:bg-amber-400 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Spinner /> : <Sparkles className="h-3.5 w-3.5" />}
            {busy ? "Sending…" : "I'm interested"}
          </button>
        )}
      </div>
    </article>
  );
}

export default function ProviderDashboard() {
  const { token, user } = useAuth();

  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("matches");
  const [interestedIds, setInterestedIds] = useState({});
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [prof, matchList, assignedList] = await Promise.all([
          api.get("/providers/me", token).catch(() => null),
          api.get("/jobs/matches", token),
          api.get("/jobs/assigned", token),
        ]);
        if (!cancelled) {
          setProfile(prof);
          setMatches(Array.isArray(matchList) ? matchList : matchList?.jobs || []);
          setAssigned(Array.isArray(assignedList) ? assignedList : assignedList?.jobs || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load your dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const loadAllJobs = async () => {
    if (allJobs.length > 0) return;
    try {
      const data = await api.get("/jobs", token);
      setAllJobs(Array.isArray(data) ? data : data?.jobs || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const switchTab = (next) => {
    setTab(next);
    if (next === "all") loadAllJobs();
  };

  const handleInterest = async (jobId) => {
    setBusyId(jobId);
    setError("");
    try {
      await api.post(`/jobs/${jobId}/interest`, {}, token);
      setInterestedIds((m) => ({ ...m, [jobId]: true }));
      // Immediately redirect to this job's detail screen with the contact card
      navigate(ROUTES.jobDetail(jobId));
    } catch (err) {
      setError(err.message || "Could not send interest — you may have already applied.");
      // If already expressed interest previously, still take them to view the contact
      navigate(ROUTES.jobDetail(jobId));
    } finally {
      setBusyId(null);
    }
  };

  const stats = useMemo(() => {
    const active = assigned.filter((j) => ["Claimed", "In Progress", "In progress", "in_progress"].includes(j.status));
    const done = assigned.filter((j) => String(j.status).toLowerCase() === "completed");
    const rating = profile?.averageRating ?? profile?.avgRating ?? null;
    return { active: active.length, done: done.length, rating, matches: matches.length };
  }, [assigned, matches, profile]);

  const feed = tab === "matches" ? matches : allJobs;
  const categories = profile?.categories || [];

  // Read location directly from profile state/lga strings
  const hasProfileLocation = Boolean(profile?.state && profile?.lga);
  const profileReady = categories.length > 0 && hasProfileLocation;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <Spinner dark />
        <p className="text-sm font-medium text-mist">Loading your command center…</p>
      </div>
    );
  }

  return (
    <div className="space-y-9 pb-12 md:space-y-11 md:pb-16">
      {/* ---------- header ---------- */}
      <div className="anim-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Provider command center</p>
          <h1 className="mt-1 font-brand text-2xl font-bold tracking-tight text-ink md:text-3xl">
            {greeting}, {firstName}
          </h1>
        </div>
        <Link
          to={ROUTES.profile}
          className="btn-press inline-flex items-center gap-2 rounded-2xl border border-pine/30 px-4 py-2.5 text-sm font-bold text-pine hover:bg-pine-50"
        >
          Edit my profile <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* ---------- profile strip ---------- */}
      <section className="anim-up relative overflow-hidden rounded-2xl bg-pine p-5 text-cream shadow-lg md:p-6" style={{ animationDelay: "0.06s" }}>
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <span className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full border-[18px] border-amber-500/15" />
        <div className="relative flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-brand text-lg font-bold">
              {user?.name}
              {profile?.idDocumentUrl && <BadgeCheck className="h-4 w-4 text-amber-400" aria-label="Verified" />}
            </p>
            <p className="mt-0.5 text-xs font-medium text-cream/70">
              {categories.length > 0 ? categories.map((c) => c.name).join(" · ") : "No trades set yet"}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {hasProfileLocation ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-cream/25 px-2.5 py-1 text-[10px] font-bold text-cream/90">
                <MapPin className="h-2.5 w-2.5" /> {profile.lga}, {profile.state}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 px-2.5 py-1 text-[10px] font-bold text-amber-300">
                <MapPin className="h-2.5 w-2.5" /> Location not set
              </span>
            )}
          </div>
        </div>
        {!profileReady && (
          <Link
            to={ROUTES.profile}
            className="anim-scale relative mt-4 flex items-center gap-2.5 rounded-2xl border border-amber-400/50 bg-amber-500/15 px-4 py-3 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/25"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            Your profile is incomplete — set your trades and location to start receiving matches.
          </Link>
        )}
      </section>

      {/* ---------- stat tiles ---------- */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Current rating", value: stats.rating === null ? "—" : stats.rating, icon: Star, tone: "bg-amber-100 text-amber-600", note: stats.rating === null ? "complete a job to earn one" : "from homeowners", delay: "0.12s", stars: stats.rating },
          { label: "Active jobs", value: stats.active, icon: Briefcase, tone: "bg-pine-50 text-pine-700", note: "claimed & in progress", delay: "0.2s" },
          { label: "Jobs completed", value: stats.done, icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-600", note: "your track record", delay: "0.28s" },
          { label: "New matches", value: stats.matches, icon: Sparkles, tone: "bg-sky-100 text-sky-600", note: "waiting for your interest", delay: "0.36s" },
        ].map((s) => (
          <div
            key={s.label}
            className="anim-up group rounded-2xl border border-line bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{ animationDelay: s.delay }}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone} transition-transform duration-300 group-hover:scale-110`}>
              <s.icon className="h-[18px] w-[18px]" />
            </span>
            <p className="mt-3 font-brand text-[22px] font-bold leading-none text-ink md:text-2xl">
              {s.stars ? (
                <span className="inline-flex items-center gap-1.5">
                  {Number(s.stars).toFixed(1)} <MiniStars value={s.stars} />
                </span>
              ) : (
                <CountUp to={s.value === "—" ? 0 : s.value} />
              )}
              {s.value === "—" && !s.stars && <span className="text-mist">—</span>}
            </p>
            <p className="mt-1.5 text-xs font-semibold text-mist">{s.label}</p>
            <p className="mt-0.5 text-[10px] font-bold text-emerald-600/90">{s.note}</p>
          </div>
        ))}
      </section>

      {/* ---------- active jobs ---------- */}
      <section>
        <div className="anim-up mb-4 flex items-end justify-between gap-3" style={{ animationDelay: "0.08s" }}>
          <div>
            <h2 className="font-brand text-xl font-bold tracking-tight text-ink md:text-2xl">Your active jobs</h2>
            <p className="mt-0.5 text-sm text-mist">Jobs you've claimed — keep homeowners updated.</p>
          </div>
          <Link to="/provider/my-work" className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-pine-700 transition-colors hover:text-amber-600">
            My work <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        {assigned.length === 0 ? (
          <div className="anim-up rounded-2xl border border-dashed border-line bg-card/60 px-6 py-12 text-center" style={{ animationDelay: "0.14s" }}>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-pine-50 text-pine-700">
              <Hammer className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-brand text-lg font-bold text-ink">Nothing in progress right now</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-mist">
              Express interest on a match below — once a homeowner claims you, the job shows up here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {assigned.map((job, i) => {
              const location = jobLocation(job);
              return (
                <Link
                  key={job._id}
                  to={ROUTES.jobDetail(job._id)}
                  className="anim-up group flex flex-col rounded-2xl border border-line bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pine/25 hover:shadow-xl"
                  style={{ animationDelay: `${0.14 + Math.min(i, 6) * 0.07}s` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-50 px-2.5 py-1 text-[11px] font-bold text-pine-700">
                      {job.categoryId?.name || "Job"}
                    </span>
                    <StatusBadge status={job.status} />
                  </div>
                  <h3 className="mt-3 line-clamp-2 font-brand text-[16px] font-bold leading-snug text-ink transition-colors group-hover:text-pine-700">
                    {job.title || job.description?.slice(0, 60) || "Job"}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-mist">{job.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-line/80 pt-3.5 text-xs font-medium text-mist">
                    {location ? (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-pine-600/70" /> {location}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-mist/60">
                        <MapPin className="h-3.5 w-3.5 text-pine-600/40" /> Location pending
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 font-bold text-pine-700 transition-colors group-hover:text-amber-600">
                      Open <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ---------- available jobs feed ---------- */}
      <section>
        <div className="anim-up mb-4 flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: "0.08s" }}>
          <div>
            <h2 className="font-brand text-xl font-bold tracking-tight text-ink md:text-2xl">Available jobs</h2>
            <p className="mt-0.5 text-sm text-mist">
              {tab === "matches" ? "Matched to your trades and location." : "Every open job on the platform."}
            </p>
          </div>
          <div className="flex rounded-2xl border border-line bg-card p-1">
            {[
              { key: "matches", label: `For you${matches.length ? ` (${matches.length})` : ""}` },
              { key: "all", label: "All open" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => switchTab(t.key)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
                  tab === t.key ? "bg-pine text-cream shadow-sm" : "text-mist hover:text-pine"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="anim-scale mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <p className="text-sm font-bold text-rose-600">{error}</p>
          </div>
        )}

        {feed.length === 0 ? (
          <div className="anim-up rounded-2xl border border-dashed border-line bg-card/60 px-6 py-12 text-center" style={{ animationDelay: "0.12s" }}>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-pine-50 text-pine-700">
              <Briefcase className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-brand text-lg font-bold text-ink">No jobs here yet</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-mist">
              {tab === "matches"
                ? "Make sure your categories and location are set on your profile."
                : "Try a different filter, or check back soon."}
            </p>
            {tab === "matches" && (
              <Link to={ROUTES.profile} className="btn-press mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-pine-900 shadow-sm hover:bg-amber-400 hover:shadow-lg">
                Complete my profile <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {feed.map((job, i) => (
              <MatchCard
                key={job._id}
                job={job}
                index={i}
                interested={!!interestedIds[job._id]}
                busy={busyId === job._id}
                onInterest={handleInterest}
              />
            ))}
          </div>
        )}
      </section>

    {/* ---------- live ticker ---------- */}
      <div className="anim-up ticker flex h-11 items-center overflow-hidden rounded-2xl bg-pine-800 text-cream shadow-sm mb-8" style={{ animationDelay: "0.2s" }}>
        <span className="relative z-10 flex h-full shrink-0 items-center gap-1.5 bg-pine px-4 text-[10px] font-bold tracking-[0.2em] text-amber-400">
          <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-amber-400" /> TIPS
        </span>
        <div className="ticker-track flex w-max shrink-0 items-center gap-10 pl-6">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-medium text-cream/80">
              <span className="h-1 w-1 rounded-full bg-amber-500/70" /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}