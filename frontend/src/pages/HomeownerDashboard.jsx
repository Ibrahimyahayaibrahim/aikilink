import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, Briefcase, Clock3, Cog, Droplets, FileText,
  Hammer, LayoutGrid, PaintRoller, PlugZap, Search, Wallet, Wrench, X, Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { useLookups } from "../api/useLookups";
import JobCard from "../components/JobCard";
import Spinner from "../components/Spinner";

const ROUTES = {
  postJob: "/homeowner/post",
  jobDetail: (id) => `/homeowner/jobs/${id}`,
};

const ngn = (n) => "₦" + Number(n || 0).toLocaleString("en-NG");

const titleCase = (s) =>
  String(s || "")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/* Safe location display — null-guarded. */
function jobLocation(job) {
  if (!job) return null;
  if (job.lga && job.state) return `${job.lga}, ${job.state}`;
  return null;
}

function TradeIcon({ name, className }) {
  const n = String(name || "").toLowerCase();
  if (n.includes("electric")) return <Zap className={className} />;
  if (n.includes("plumb")) return <Droplets className={className} />;
  if (n.includes("mechanic")) return <Cog className={className} />;
  if (n.includes("carpent")) return <Hammer className={className} />;
  if (n.includes("generator") || n.includes("gen ")) return <PlugZap className={className} />;
  if (n.includes("paint")) return <PaintRoller className={className} />;
  if (n.includes("tile")) return <LayoutGrid className={className} />;
  return <Wrench className={className} />;
}

function CountUp({ to, prefix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    let raf;
    const start = performance.now();
    const dur = 900;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return (
    <span>
      {prefix}
      {val.toLocaleString("en-NG")}
    </span>
  );
}

const TICKER = [
  "Providers respond to quotes in under 15 minutes on average",
  "Jobs with a budget range receive more quotes",
  "Always pay through AikiLink to keep your workmanship guarantee",
  "Urgent jobs are shown first to providers for 48 hours",
  "Rate your artisan after the job — it keeps the marketplace honest",
];

function EmptyIllustration() {
  return (
    <svg viewBox="0 0 220 150" className="mx-auto h-36 w-auto" fill="none" aria-hidden="true">
      <rect x="30" y="22" width="160" height="106" rx="10" fill="#fffefa" stroke="#1a3636" strokeWidth="2" />
      <rect x="30" y="22" width="160" height="26" rx="10" fill="#1a3636" />
      <circle cx="46" cy="35" r="3" fill="#f59e0b" />
      <circle cx="57" cy="35" r="3" fill="#f8f7f2" opacity="0.5" />
      <circle cx="68" cy="35" r="3" fill="#f8f7f2" opacity="0.5" />
      <rect x="44" y="60" width="90" height="8" rx="4" fill="#dbe7e2" />
      <rect x="44" y="76" width="132" height="6" rx="3" fill="#edf3f0" />
      <rect x="44" y="88" width="110" height="6" rx="3" fill="#edf3f0" />
      <rect x="44" y="104" width="64" height="12" rx="6" fill="#f59e0b" />
      <circle cx="176" cy="108" r="26" fill="#1a3636" />
      <path
        d="M168 108a8 8 0 0 1 11.3-7.3l-2.5 2.5a3 3 0 0 0 4 4l2.5-2.5A8 8 0 0 1 176 116v-5h-3v5a8 8 0 0 1-5-8Z"
        fill="#f8f7f2"
        transform="rotate(45 176 108)"
      />
      <path d="M196 34l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="#f59e0b" />
      <path d="M24 58l1.6 3.6 3.6 1.6-3.6 1.6L24 68.4l-1.6-3.6-3.6-1.6 3.6-1.6z" fill="#2a5350" />
    </svg>
  );
}

export default function HomeownerDashboard() {
  const { token, user } = useAuth();
  const { categories } = useLookups();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get("/jobs/mine", token);
        if (!cancelled) setJobs(Array.isArray(data) ? data : data?.jobs || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load your jobs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return jobs.filter((j) => {
      const okCat = !activeCat || j.categoryId?._id === activeCat;
      const okQ =
        !ql ||
        [j.title, j.description, j.categoryId?.name, j.state, j.lga]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(ql);
      return okCat && okQ;
    });
  }, [jobs, q, activeCat]);

  const stats = useMemo(() => {
    const active = jobs.filter((j) => {
      const s = (j.status || "").toLowerCase();
      return ["open", "claimed", "assigned", "in_progress"].includes(s);
    });

    const quotes = jobs.reduce(
      (sum, j) => sum + (j.applicantCount || j.interests?.length || 0),
      0
    );

    const done = jobs.filter((j) => (j.status || "").toLowerCase() === "completed");

    return { active: active.length, quotes, done: done.length };
  }, [jobs]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = titleCase(user?.name?.split(" ")[0]) || "there";

  const filtering = q.trim() !== "" || activeCat !== null;

  return (
    <div className="space-y-9 md:space-y-11">
      {/* ---------- page header ---------- */}
      <div className="anim-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Homeowner dashboard</p>
          <h1 className="mt-1 font-brand text-2xl font-bold tracking-tight text-ink md:text-3xl">
            {greeting}, {firstName}
          </h1>
        </div>
        <Link
          to={ROUTES.postJob}
          className="btn-press inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-pine-900 shadow-md hover:bg-amber-400 hover:shadow-xl"
        >
          <Briefcase className="h-4 w-4" /> Post a job
        </Link>
      </div>

      {/* ---------- search hero ---------- */}
      <section className="anim-up relative overflow-hidden rounded-2xl bg-pine p-6 text-cream shadow-lg md:p-9" style={{ animationDelay: "0.08s" }}>
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[22px] border-amber-500/15" />
        <span className="pointer-events-none absolute -right-2 -top-5 h-24 w-24 animate-[spinSlow_45s_linear_infinite] rounded-full border-2 border-dashed border-cream/20" />

        <div className="relative max-w-2xl">
          <h2 className="font-brand text-[24px] font-bold leading-tight tracking-tight md:text-[32px]">
            What needs fixing today?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-cream/70 md:text-[15px]">
            You have{" "}
            <span className="font-bold text-amber-400">
              {stats.active} active job{stats.active === 1 ? "" : "s"}
            </span>{" "}
            running and{" "}
            <span className="font-bold text-amber-400">{stats.quotes}</span> quote{stats.quotes === 1 ? "" : "s"} waiting for you.
          </p>

          <label className="relative mt-5 block">
            <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-mist" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your jobs — try “cage”, “sink” or “wiring”"
              className="w-full rounded-2xl border-2 border-transparent bg-cream py-3.5 pl-11 pr-11 text-sm text-ink shadow-inner outline-none transition-all placeholder:text-mist/80 focus:border-amber-500 focus:shadow-md"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-mist transition-colors hover:bg-line/60 hover:text-ink"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          {categories?.length > 0 && (
            <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
              {categories.slice(0, 8).map((c) => {
                const active = activeCat === c._id;
                const count = jobs.filter((j) => j.categoryId?._id === c._id).length;
                return (
                  <button
                    key={c._id}
                    onClick={() => setActiveCat(active ? null : c._id)}
                    className={`btn-press flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold transition-all ${
                      active
                        ? "border-amber-400 bg-amber-500 text-pine-900 shadow-md"
                        : "border-cream/25 text-cream/90 hover:border-amber-400/70 hover:bg-cream/10 hover:text-amber-300"
                    }`}
                  >
                    <TradeIcon name={c.name} className="h-3.5 w-3.5" />
                    {c.name}
                    {count > 0 && (
                      <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-pine-900/15" : "bg-cream/15"}`}>{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ---------- stat tiles ---------- */}
      {/* ---------- stat tiles ---------- */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Active jobs",
            value: stats.active,
            icon: Briefcase,
            tone: "bg-amber-100 text-amber-600",
            note: "open right now",
            delay: "0.12s",
          },
          {
            label: "Quotes & applicants",
            value: stats.quotes,
            icon: FileText,
            tone: "bg-pine-50 text-pine-700",
            note: "across all jobs",
            delay: "0.2s",
          },
          {
            label: "Jobs completed",
            value: stats.done,
            icon: BadgeCheck,
            tone: "bg-emerald-100 text-emerald-600",
            note: "all-time",
            delay: "0.28s",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="anim-up group rounded-2xl border border-line bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{ animationDelay: s.delay }}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone} transition-transform duration-300 group-hover:scale-110`}>
              <s.icon className="h-[18px] w-[18px]" />
            </span>
            <p className="mt-3 font-brand text-[22px] font-bold leading-none text-ink md:text-2xl">
              <CountUp to={s.value} />
            </p>
            <p className="mt-1.5 text-xs font-semibold text-mist">{s.label}</p>
            <p className="mt-0.5 text-[10px] font-bold text-emerald-600/90">{s.note}</p>
          </div>
        ))}
      </section>

      {/* ---------- jobs list ---------- */}
      <section>
        <div className="anim-up mb-4 flex flex-wrap items-end justify-between gap-2" style={{ animationDelay: "0.1s" }}>
          <div>
            <h2 className="font-brand text-xl font-bold tracking-tight text-ink md:text-2xl">Your jobs</h2>
            <p className="mt-0.5 text-sm font-medium text-mist">
              {loading
                ? "Loading your jobs…"
                : `${filtered.length} job${filtered.length === 1 ? "" : "s"}${filtering ? " match your filters" : " total"}`}
            </p>
          </div>
          {filtering && (
            <button
              onClick={() => {
                setQ("");
                setActiveCat(null);
              }}
              className="btn-press inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-2 text-xs font-bold text-mist hover:border-pine/40 hover:text-pine"
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-card py-20">
            <Spinner dark />
            <p className="text-sm font-medium text-mist">Fetching your jobs…</p>
          </div>
        ) : error ? (
          <div className="anim-up rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <p className="text-sm font-bold text-rose-600">{error}</p>
            <p className="mt-1 text-xs font-medium text-rose-500">Check that your backend is running, then refresh.</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="anim-up relative overflow-hidden rounded-2xl border border-dashed border-pine/30 bg-card px-6 py-14 text-center" style={{ animationDelay: "0.15s" }}>
            <span className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-pine-50" />
            <span className="pointer-events-none absolute -bottom-12 -right-8 h-36 w-36 rounded-full bg-amber-50" />
            <div className="relative">
              <EmptyIllustration />
              <h3 className="mt-5 font-brand text-xl font-bold tracking-tight text-ink">No jobs posted yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mist">
                When you need a local artisan, post a job and matching providers will see it right away. Quotes usually start arriving within the hour.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to={ROUTES.postJob}
                  className="btn-press inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-pine-900 shadow-md hover:bg-amber-400 hover:shadow-xl"
                >
                  Post your first job <ArrowRight className="h-4 w-4" />
                </Link>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-mist">
                  <Clock3 className="h-3.5 w-3.5 text-pine-600" /> Takes under 2 minutes
                </span>
              </div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="anim-up rounded-2xl border border-line bg-card px-6 py-12 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-pine-50 text-pine-700">
              <Search className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-brand text-lg font-bold text-ink">No jobs match</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-mist">
              Nothing matches {q ? `“${q}”` : "this trade"} right now. Try a different search or clear the filters.
            </p>
            <button
              onClick={() => {
                setQ("");
                setActiveCat(null);
              }}
              className="btn-press mt-5 inline-flex items-center gap-2 rounded-2xl border border-pine/30 px-5 py-2.5 text-sm font-bold text-pine hover:bg-pine-50"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((job, i) => (
              <JobCard key={job._id} job={job} linkTo={ROUTES.jobDetail(job._id)} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- live ticker ---------- */}
      <div className="anim-up ticker flex h-11 items-center overflow-hidden rounded-2xl bg-pine-800 text-cream shadow-sm" style={{ animationDelay: "0.2s" }}>
        <span className="relative z-10 flex h-full shrink-0 items-center gap-1.5 bg-pine px-4 text-[10px] font-bold tracking-[0.2em] text-amber-400">
          <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-amber-400" /> LIVE
        </span>
        <div className="ticker-track items-center gap-10 pl-6">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap text-xs font-medium text-cream/80">
              <span className="h-1 w-1 rounded-full bg-amber-500/70" /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}