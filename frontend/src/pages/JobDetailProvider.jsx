import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, Briefcase, Check, CheckCircle2, Clock, Copy,
  Hammer, MapPin, Phone, PhoneCall, UserCheck, Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import Avatar from "../components/Avatar";
import Spinner from "../components/Spinner";

/* Keep in sync with the ROUTES map in NavBar.jsx */
const ROUTES = { back: "/provider" };

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

/* ---------- status timeline (same stages as the homeowner view) ---------- */
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
                <span
                  className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ${
                    done
                      ? "border-pine bg-pine text-cream"
                      : active
                        ? "pulse-soft border-amber-500 bg-amber-500 text-pine-900"
                        : "border-line bg-cream text-mist"
                  }`}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-[18px] w-[18px]" />}
                </span>
                <span className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i === STEPS.length - 1 ? "opacity-0" : done ? "bg-pine" : "bg-line"}`} />
              </div>
              <span className={`mt-2 text-center text-[10px] font-bold leading-tight md:text-[11px] ${active ? "text-amber-600" : done ? "text-pine" : "text-mist/70"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const HOW_IT_WORKS = [
  { icon: PhoneCall, title: "Express interest", body: "Reveals the homeowner's phone number instantly." },
  { icon: Phone, title: "Call the homeowner", body: "First-come-first-served — the fastest caller usually wins." },
  { icon: UserCheck, title: "Get claimed", body: "The homeowner claims you in the app and the job moves to My work." },
];

export default function JobDetailProvider() {
  const { id } = useParams();
  const { token } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await api.get(`/jobs/${id}`, token);
      setJob(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  /* Identical to the original: interest response carries the contact. */
  const handleExpressInterest = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await api.post(`/jobs/${id}/interest`, {}, token);
      setContact(data.contact);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const copyPhone = async () => {
    if (!contact?.phone) return;
    try {
      await navigator.clipboard.writeText(contact.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      /* clipboard blocked — the tel: link still works */
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <Spinner dark />
        <p className="text-sm font-medium text-mist">Loading job…</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="anim-up mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-rose-600" />
        <p className="mt-2 text-sm font-bold text-rose-600">{error || "Job not found."}</p>
        <Link to={ROUTES.back} className="btn-press mt-4 inline-flex items-center gap-1.5 rounded-2xl border border-rose-300 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to job feed
        </Link>
      </div>
    );
  }

  const isOpen = job.status === "Open";
  const claimedName = job.claimedBy?.userId?.name || job.claimedBy?.name;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* back link */}
      <div className="anim-up">
        <Link to={ROUTES.back} className="btn-press inline-flex items-center gap-1.5 text-sm font-bold text-mist transition-colors hover:text-pine">
          <ArrowLeft className="h-4 w-4" /> Back to job feed
        </Link>
      </div>

      {/* header card */}
      <section className="anim-up overflow-hidden rounded-2xl border border-line bg-card shadow-sm" style={{ animationDelay: "0.06s" }}>
        <div className="dot-grid relative bg-pine px-5 py-4 md:px-6">
          <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full border-[12px] border-amber-500/15" />
          <div className="relative flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/15 px-2.5 py-1 text-[11px] font-bold text-cream">
              <Hammer className="h-3 w-3" /> {job.categoryId?.name || "Job"}
            </span>
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
            {job.categoryId?.name} — {job.areaId?.name}, {job.areaId?.city}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-mist">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-pine-600/70" /> {job.areaId?.name}, {job.areaId?.city}
            </span>
            {job.created_at && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-pine-600/70" /> Posted {timeAgo(job.created_at)}
              </span>
            )}
            {isOpen && (
              <span className="inline-flex items-center gap-1.5 font-bold text-amber-600">
                <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-amber-500" /> Accepting interest now
              </span>
            )}
          </div>
          <div className="mt-4 rounded-2xl bg-cream p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">Job brief</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink/90">{job.description}</p>
          </div>
        </div>
      </section>

      {/* timeline */}
      <StatusTimeline status={job.status} />

      {error && (
        <div className="anim-scale flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <p className="text-sm font-bold text-rose-600">{error}</p>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          {/* ---------- OPEN + no contact: the primary action ---------- */}
          {isOpen && !contact && (
            <section className="anim-up rounded-2xl border border-line bg-card p-6 text-center shadow-sm" style={{ animationDelay: "0.16s" }}>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-600">
                <PhoneCall className="h-5 w-5" />
              </span>
              <h2 className="mt-3 font-brand text-lg font-bold tracking-tight text-ink">Interested in this job?</h2>
              <p className="mx-auto mt-1 max-w-sm text-[13px] font-medium leading-relaxed text-mist">
                Express interest to reveal the homeowner's phone number and call them directly.
              </p>
              <button
                disabled={busy}
                onClick={handleExpressInterest}
                className="btn-press mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-sm font-bold text-pine-900 shadow-md hover:bg-amber-400 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
              >
                {busy ? <Spinner /> : <PhoneCall className="h-4 w-4" />}
                {busy ? "Revealing contact…" : "Express interest — reveal phone number"}
              </button>
            </section>
          )}

          {/* ---------- contact revealed ---------- */}
          {contact && (
            <section className="anim-scale overflow-hidden rounded-2xl border border-emerald-200 bg-card shadow-lg" role="status">
              <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-5 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Contact revealed — call now</p>
              </div>
              <div className="p-5 md:p-6">
                <div className="flex items-center gap-4">
                  <Avatar name={contact.name} size={56} online />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-brand text-lg font-bold text-ink">{contact.name}</p>
                    <p className="text-xs font-medium text-mist">Homeowner · first-come-first-served</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                  <a
                    href={`tel:${contact.phone}`}
                    className="btn-press inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-pine py-3.5 text-sm font-bold text-cream shadow-md hover:bg-pine-700 hover:shadow-xl"
                  >
                    <PhoneCall className="h-4 w-4 text-amber-400" /> {contact.phone}
                  </a>
                  <button
                    onClick={copyPhone}
                    className={`btn-press inline-flex items-center justify-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-bold transition-colors ${
                      copied ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-line text-pine hover:border-pine/40 hover:bg-pine-50"
                    }`}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-4 flex items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-xs font-medium leading-relaxed text-amber-800">
                  <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  Call quickly — the homeowner may claim any provider who calls, not necessarily the first to express interest.
                </p>
              </div>
            </section>
          )}

          {/* ---------- no longer open ---------- */}
          {!isOpen && !contact && (
            <section className="anim-up rounded-2xl border border-line bg-card p-6 text-center shadow-sm" style={{ animationDelay: "0.16s" }}>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-pine-50 text-pine-700">
                {claimedName ? <UserCheck className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </span>
              <h2 className="mt-3 font-brand text-lg font-bold tracking-tight text-ink">This job is no longer open</h2>
              <p className="mx-auto mt-1 max-w-sm text-[13px] font-medium leading-relaxed text-mist">
                {claimedName
                  ? `It was claimed by ${claimedName}. Keep an eye on your matches — new jobs post every day.`
                  : "The homeowner has moved on. Keep an eye on your matches — new jobs post every day."}
              </p>
              <Link to={ROUTES.back} className="btn-press mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-3 text-sm font-bold text-pine-900 shadow-sm hover:bg-amber-400 hover:shadow-lg">
                Browse more jobs <ArrowLeft className="h-4 w-4 rotate-180" />
              </Link>
            </section>
          )}
        </div>

        {/* ---------- right rail: how it works ---------- */}
        <aside className="anim-up space-y-4 lg:sticky lg:top-24" style={{ animationDelay: "0.22s" }}>
          <div className="rounded-2xl border border-line bg-card p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mist">How winning works</p>
            <ol className="mt-4 space-y-4">
              {HOW_IT_WORKS.map((s, i) => (
                <li key={s.title} className="relative flex gap-3">
                  {i < HOW_IT_WORKS.length - 1 && (
                    <span className="absolute left-[15px] top-9 h-[calc(100%-14px)] w-px bg-line" />
                  )}
                  <span className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full ${i === 0 && isOpen && !contact ? "pulse-soft bg-amber-500 text-pine-900" : "bg-pine-50 text-pine-700"}`}>
                    <s.icon className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-[13px] font-bold text-ink">{s.title}</p>
                    <p className="mt-0.5 text-xs font-medium leading-relaxed text-mist">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-pine-100 bg-pine-50 p-4">
            <p className="text-xs leading-relaxed text-pine-800">
              <span className="font-bold">Pro tip:</span> mention your star rating on the call — homeowners trust providers with a track record.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}