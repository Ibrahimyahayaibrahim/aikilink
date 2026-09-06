import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Check, Cog, Droplets, Hammer, LayoutGrid, MapPin, PaintRoller, PlugZap, Send, Wrench, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLookups } from "../api/useLookups";
import { api } from "../api/client";
import Spinner from "../components/Spinner";

/* Keep in sync with the ROUTES map in NavBar.jsx */
const ROUTES = { back: "/homeowner/jobs" };

const DESC_MAX = 600;

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

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="anim-scale mt-1.5 flex items-center gap-1.5 text-xs font-bold text-rose-600" role="alert">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {message}
    </p>
  );
}

const inputBase =
  "w-full rounded-2xl border bg-cream px-4 py-3 text-sm text-ink outline-none transition-all duration-200 placeholder:text-mist/60 focus:bg-card";
const inputOk = "border-line focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25";
const inputBad = "border-rose-400 ring-2 ring-rose-200";

export default function PostJobPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { categories, areas, loading: lookupsLoading } = useLookups();

  const [categoryId, setCategoryId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [matchInfo, setMatchInfo] = useState(null);
  const [errors, setErrors] = useState({});

  const clearError = (key) => setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));

  const validate = () => {
    const next = {};
    if (!categoryId) next.categoryId = "Choose the trade this job needs.";
    if (!areaId) next.areaId = "Pick an area so nearby providers see it.";
    if (description.trim().length < 5) next.description = "Add a little more detail — at least 5 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      /* Payload + flow identical to the original — backend untouched. */
      const { job, matchingProviderCount } = await api.post(
        "/jobs",
        { categoryId, areaId, description: description.trim(), urgency },
        token
      );
      setMatchInfo(matchingProviderCount);
      setTimeout(() => navigate(`/homeowner/jobs/${job._id}`), 900);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (lookupsLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner dark />
      </div>
    );
  }

  const selectedCat = categories.find((c) => c._id === categoryId);
  const selectedArea = areas.find((a) => a._id === areaId);

  return (
    <div className="mx-auto max-w-5xl">
      {/* header */}
      <div className="anim-up">
        <Link to={ROUTES.back} className="btn-press inline-flex items-center gap-1.5 text-sm font-bold text-mist transition-colors hover:text-pine">
          <ArrowLeft className="h-4 w-4" /> Back to my jobs
        </Link>
        <h1 className="mt-3 font-brand text-2xl font-bold tracking-tight text-ink md:text-3xl">Post a job</h1>
        <p className="mt-1 text-sm font-medium text-mist">
          Describe what you need — matching providers in your area are notified right away.
        </p>
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_330px]">
        {/* ---------- form ---------- */}
        <form onSubmit={handleSubmit} noValidate className="anim-up space-y-7 rounded-2xl border border-line bg-card p-5 shadow-sm md:p-8" style={{ animationDelay: "0.08s" }}>
          {error && (
            <div className="anim-scale flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <p className="text-sm font-bold text-rose-600">{error}</p>
            </div>
          )}
          {matchInfo !== null && (
            <div className="anim-scale flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3" role="status">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <p className="text-sm font-bold text-emerald-700">
                Job posted — {matchInfo} matching provider{matchInfo === 1 ? "" : "s"} notified. Taking you there…
              </p>
            </div>
          )}

          {/* 01 — trade */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
                <span className="mr-1.5 text-amber-600">01</span> Service category
              </span>
              {selectedCat && (
                <span className="anim-scale inline-flex items-center gap-1 rounded-full bg-pine-50 px-2.5 py-1 text-[11px] font-bold text-pine-700">
                  <TradeIcon name={selectedCat.name} className="h-3 w-3" /> {selectedCat.name}
                </span>
              )}
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((c) => {
                const active = categoryId === c._id;
                return (
                  <button
                    key={c._id}
                    type="button"
                    role="checkbox"
                    aria-checked={active}
                    tabIndex={0}
                    onClick={() => { setCategoryId(c._id); clearError("categoryId"); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCategoryId(c._id); clearError("categoryId"); }
                    }}
                    className={`btn-press group flex items-center justify-center gap-2 rounded-2xl border px-2 py-3.5 text-xs font-bold transition-all duration-200 ${
                      active
                        ? "border-pine bg-pine text-cream shadow-md"
                        : errors.categoryId
                          ? "border-rose-300 bg-rose-50/40 text-mist hover:border-rose-400"
                          : "border-line bg-cream text-mist hover:-translate-y-0.5 hover:border-pine/40 hover:text-pine"
                    }`}
                  >
                    <TradeIcon name={c.name} className={`h-4 w-4 transition-colors ${active ? "text-amber-400" : ""}`} />
                    {c.name}
                    {active && <Check className="anim-scale h-3.5 w-3.5 text-amber-400" />}
                  </button>
                );
              })}
            </div>
            <FieldError message={errors.categoryId} />
          </div>

          {/* 02 — area */}
          <div>
            <label htmlFor="area" className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
              <span className="mr-1.5 text-amber-600">02</span> Area
            </label>
            <div className="relative mt-2.5">
              <MapPin className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.areaId ? "text-rose-500" : "text-pine-600/70"}`} />
              <select
                id="area"
                value={areaId}
                onChange={(e) => { setAreaId(e.target.value); clearError("areaId"); }}
                className={`${inputBase} cursor-pointer appearance-none pl-11 pr-10 ${errors.areaId ? inputBad : inputOk} ${areaId ? "" : "text-mist/60"}`}
              >
                <option value="" disabled>Choose an area…</option>
                {areas.map((a) => (
                  <option key={a._id} value={a._id}>{a.name}, {a.city}</option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <FieldError message={errors.areaId} />
          </div>

          {/* 03 — description */}
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="description" className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
                <span className="mr-1.5 text-amber-600">03</span> What needs to be done?
              </label>
              <span className={`text-[11px] font-bold transition-colors ${description.length > DESC_MAX - 60 ? "text-amber-600" : "text-mist/60"}`}>
                {description.length}/{DESC_MAX}
              </span>
            </div>
            <textarea
              id="description"
              rows={5}
              maxLength={DESC_MAX}
              value={description}
              onChange={(e) => { setDescription(e.target.value); clearError("description"); }}
              placeholder="e.g. My dog cage hinge is broken and the lock plate is loose — need it welded and reinforced on site."
              className={`${inputBase} mt-2.5 resize-none leading-relaxed ${errors.description ? inputBad : inputOk}`}
            />
            <FieldError message={errors.description} />
          </div>

          {/* 04 — urgency */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
              <span className="mr-1.5 text-amber-600">04</span> Priority
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={urgency}
              onClick={() => setUrgency((u) => !u)}
              className={`mt-2.5 flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
                urgency ? "border-amber-400 bg-amber-50 shadow-sm" : "border-line bg-cream hover:border-pine/30"
              }`}
            >
              <span className="flex items-center gap-3 text-left">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors duration-200 ${urgency ? "bg-amber-500 text-pine-900" : "bg-line/60 text-mist"}`}>
                  <Zap className={`h-4 w-4 ${urgency ? "fill-pine-900" : ""}`} />
                </span>
                <span>
                  <span className={`block text-sm font-bold transition-colors ${urgency ? "text-amber-700" : "text-ink"}`}>Mark as emergency / urgent</span>
                  <span className="block text-xs font-medium text-mist">Shown first to providers for 48 hours</span>
                </span>
              </span>
              <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${urgency ? "bg-amber-500" : "bg-line"}`}>
                <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform duration-200 ${urgency ? "translate-x-5" : ""}`} />
              </span>
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting || matchInfo !== null}
            className="btn-press inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-sm font-bold text-pine-900 shadow-md hover:bg-amber-400 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? <Spinner /> : <Send className="h-4 w-4" />}
            {submitting ? "Posting…" : matchInfo !== null ? "Posted ✓" : "Post job — notify matching providers"}
          </button>
          <p className="text-center text-[11px] font-semibold text-mist">Free to post · You choose who to hire from the responses</p>
        </form>

        {/* ---------- live preview ---------- */}
        <aside className="anim-up space-y-4 lg:sticky lg:top-24" style={{ animationDelay: "0.16s" }}>
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            <div className="border-b border-line bg-cream px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mist">Provider preview — live</p>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center gap-2">
                {selectedCat ? (
                  <span className="anim-scale inline-flex items-center gap-1.5 rounded-full bg-pine-50 px-2.5 py-1 text-[11px] font-bold text-pine-700">
                    <TradeIcon name={selectedCat.name} className="h-3 w-3" /> {selectedCat.name}
                  </span>
                ) : (
                  <span className="rounded-full bg-line/50 px-2.5 py-1 text-[11px] font-bold text-mist/70">Trade</span>
                )}
                {urgency && (
                  <span className="anim-scale inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                    <Zap className="h-3 w-3 fill-amber-500 text-amber-500" /> Urgent
                  </span>
                )}
              </div>
              <p className={`text-sm font-bold leading-snug ${description.trim() ? "text-ink" : "text-mist/50"}`}>
                {description.trim() ? (description.length > 110 ? description.slice(0, 110) + "…" : description) : "Your description appears here…"}
              </p>
              <p className="flex items-center gap-1.5 text-xs font-medium text-mist">
                <MapPin className="h-3.5 w-3.5 text-pine-600/70" />
                {selectedArea ? `${selectedArea.name}, ${selectedArea.city}` : "Area"}
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-2xl border border-pine-100 bg-pine-50 p-4">
            <Zap className="h-5 w-5 shrink-0 text-pine-700" />
            <p className="text-xs leading-relaxed text-pine-800">
              <span className="font-bold">How matching works:</span> providers who offer the chosen trade{" "}
              <span className="font-bold">and</span> cover the chosen area are notified the moment you post.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}