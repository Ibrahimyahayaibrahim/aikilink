import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, BadgeCheck, Check, Cog, Droplets, Flame, Hammer,
  KeyRound, LayoutGrid, MapPin, PaintRoller, PlugZap, Save, ShieldCheck,
  Snowflake, Sparkles, SprayCan, UserRound, Wrench, Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLookups } from "../api/useLookups";
import { api } from "../api/client";
import Avatar from "../components/Avatar";
import Spinner from "../components/Spinner";

const ROUTES = { feed: "/provider" };

/* Trade icon matched by name — falls back to a wrench. */
function TradeIcon({ name, className }) {
  const n = String(name || "").toLowerCase();
  if (n.includes("electric")) return <Zap className={className} />;
  if (n.includes("plumb")) return <Droplets className={className} />;
  if (n.includes("mechanic")) return <Cog className={className} />;
  if (n.includes("carpent")) return <Hammer className={className} />;
  if (n.includes("generator") || n.includes("gen ")) return <PlugZap className={className} />;
  if (n.includes("paint")) return <PaintRoller className={className} />;
  if (n.includes("tile") || n.includes("mason")) return <LayoutGrid className={className} />;
  if (n.includes("ac") || n.includes("refrig")) return <Snowflake className={className} />;
  if (n.includes("clean") || n.includes("fumig")) return <SprayCan className={className} />;
  if (n.includes("lock")) return <KeyRound className={className} />;
  if (n.includes("weld")) return <Flame className={className} />;
  return <Wrench className={className} />;
}

const BIO_MAX = 400;

export default function ProviderProfilePage() {
  const { token, user } = useAuth();
  const location = useLocation();
  const { categories, areas, loading: lookupsLoading } = useLookups();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [bio, setBio] = useState("");
  const [idDocumentUrl, setIdDocumentUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState(null); // for dirty-state detection

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await api.get("/providers/me", token);
        if (!cancelled) {
          const cats = (profile.categories || []).map((c) => c._id);
          const cov = (profile.coverageAreas || []).map((a) => a._id);
          const b = profile.bio || "";
          const doc = profile.idDocumentUrl || "";
          setSelectedCategories(cats);
          setSelectedAreas(cov);
          setBio(b);
          setIdDocumentUrl(doc);
          setSnapshot({ cats: [...cats].sort().join(","), cov: [...cov].sort().join(","), b, doc });
        }
      } catch (err) {
        /* brand-new provider — nothing to prefill */
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggle = (list, setList, id) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const dirty = useMemo(() => {
    if (!snapshot) return false;
    return (
      [...selectedCategories].sort().join(",") !== snapshot.cats ||
      [...selectedAreas].sort().join(",") !== snapshot.cov ||
      bio !== snapshot.b ||
      idDocumentUrl !== snapshot.doc
    );
  }, [selectedCategories, selectedAreas, bio, idDocumentUrl, snapshot]);

  const completeness = useMemo(() => {
    let score = 0;
    if (selectedCategories.length > 0) score += 35;
    if (selectedAreas.length > 0) score += 35;
    if (bio.trim().length >= 20) score += 15;
    if (idDocumentUrl.trim()) score += 15;
    return score;
  }, [selectedCategories, selectedAreas, bio, idDocumentUrl]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.put("/providers/me", { categories: selectedCategories, coverageAreas: selectedAreas, bio }, token);
      if (idDocumentUrl.trim()) {
        await api.post("/providers/me/id-upload", { idDocumentUrl: idDocumentUrl.trim() }, token);
      }
      setSnapshot({
        cats: [...selectedCategories].sort().join(","),
        cov: [...selectedAreas].sort().join(","),
        b: bio,
        doc: idDocumentUrl,
      });
      setMessage("Profile saved. You'll now be matched with jobs in your selected categories and areas.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (lookupsLoading || profileLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24">
        <Spinner dark />
        <p className="text-sm font-medium text-mist">Loading your profile…</p>
      </div>
    );
  }

  const verified = !!idDocumentUrl.trim();

  return (
    <div className="mx-auto max-w-5xl pb-24 lg:pb-0">
      {/* back link */}
      <div className="anim-up">
        <Link to={ROUTES.feed} className="btn-press inline-flex items-center gap-1.5 text-sm font-bold text-mist transition-colors hover:text-pine">
          <ArrowLeft className="h-4 w-4" /> Back to job feed
        </Link>
      </div>

      {/* ---------- premium header ---------- */}
      <section className="anim-up mt-4 overflow-hidden rounded-2xl border border-line bg-card shadow-sm" style={{ animationDelay: "0.06s" }}>
        <div className="dot-grid relative h-28 bg-pine md:h-32">
          <span className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border-[16px] border-amber-500/15" />
          <span className="pointer-events-none absolute right-20 top-6 h-16 w-16 animate-[spin_45s_linear_infinite] rounded-full border border-dashed border-cream/25" />
        </div>
        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="-mt-14 flex items-end gap-4 md:-mt-16">
              <span className="relative">
                <Avatar name={user?.name} size={88} online className="rounded-full ring-4 ring-card" />
                <span className={`absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-card ${verified ? "bg-emerald-500" : "bg-amber-500"}`}>
                  {verified ? <BadgeCheck className="h-4 w-4 text-cream" /> : <Sparkles className="h-3.5 w-3.5 text-pine-900" />}
                </span>
              </span>
              <div className="pb-1">
                <h1 className="font-brand text-2xl font-bold tracking-tight text-ink md:text-[28px]">{user?.name}</h1>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-mist">
                  <span className="inline-flex items-center gap-1 rounded-full bg-pine-50 px-2.5 py-1 text-pine-700">
                    <UserRound className="h-3 w-3" /> Artisan
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    <ShieldCheck className="h-3 w-3" /> {verified ? "ID submitted" : "Not verified yet"}
                  </span>
                </p>
              </div>
            </div>

            {/* completeness meter */}
            <div className="w-full md:w-64">
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mist">Profile strength</p>
                <p className={`font-brand text-sm font-bold ${completeness === 100 ? "text-emerald-600" : "text-amber-600"}`}>{completeness}%</p>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-line">
                <span
                  className={`block h-full rounded-full transition-all duration-700 ${completeness === 100 ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] font-medium text-mist">
                {completeness === 100
                  ? "Complete — you're fully matchable."
                  : "Add trades, areas, a bio and ID to reach 100%."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* alerts */}
      {location.state?.justRegistered && (
        <div className="anim-scale mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3" role="status">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm font-bold text-emerald-700">Account created! Set up your profile below to start receiving job matches.</p>
        </div>
      )}
      {error && (
        <div className="anim-scale mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          <p className="text-sm font-bold text-rose-600">{error}</p>
        </div>
      )}
      {message && (
        <div className="anim-scale mt-4 flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3" role="status">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-sm font-bold text-emerald-700">{message}</p>
        </div>
      )}

      <form id="profile-form" onSubmit={handleSave} className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_300px]">
        {/* ---------- main form ---------- */}
        <div className="anim-up space-y-6 rounded-2xl border border-line bg-card p-5 shadow-sm md:p-7" style={{ animationDelay: "0.12s" }}>
          {/* categories */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
                <span className="mr-1.5 text-amber-600">01</span> Service categories
              </span>
              <span className="text-[11px] font-bold text-mist/70">{selectedCategories.length} selected</span>
            </div>
            <p className="mt-1 text-xs font-medium text-mist">Job postings only reach you when the trade matches.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categories.map((c) => {
                const active = selectedCategories.includes(c._id);
                return (
                  <button
                    key={c._id}
                    type="button"
                    role="checkbox"
                    aria-checked={active}
                    tabIndex={0}
                    onClick={() => toggle(selectedCategories, setSelectedCategories, c._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(selectedCategories, setSelectedCategories, c._id);
                      }
                    }}
                    className={`btn-press flex items-center justify-center gap-2 rounded-2xl border px-2 py-3.5 text-xs font-bold transition-all duration-200 ${
                      active
                        ? "border-pine bg-pine text-cream shadow-md"
                        : "border-line bg-cream text-mist hover:-translate-y-0.5 hover:border-pine/40 hover:text-pine"
                    }`}
                  >
                    <TradeIcon name={c.name} className={`h-4 w-4 shrink-0 ${active ? "text-amber-400" : ""}`} />
                    <span className="truncate">{c.name}</span>
                    {active && <Check className="anim-scale h-3.5 w-3.5 shrink-0 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* coverage areas */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
                <span className="mr-1.5 text-amber-600">02</span> Coverage areas
              </span>
              <span className="text-[11px] font-bold text-mist/70">{selectedAreas.length} selected</span>
            </div>
            <p className="mt-1 text-xs font-medium text-mist">…and when the job is in an area you cover.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {areas.map((a) => {
                const active = selectedAreas.includes(a._id);
                return (
                  <button
                    key={a._id}
                    type="button"
                    role="checkbox"
                    aria-checked={active}
                    tabIndex={0}
                    onClick={() => toggle(selectedAreas, setSelectedAreas, a._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggle(selectedAreas, setSelectedAreas, a._id);
                      }
                    }}
                    className={`btn-press flex items-center justify-center gap-2 rounded-2xl border px-2 py-3.5 text-xs font-bold transition-all duration-200 ${
                      active
                        ? "border-pine bg-pine text-cream shadow-md"
                        : "border-line bg-cream text-mist hover:-translate-y-0.5 hover:border-pine/40 hover:text-pine"
                    }`}
                  >
                    <MapPin className={`h-4 w-4 shrink-0 ${active ? "text-amber-400" : ""}`} />
                    <span className="truncate">{a.name}, {a.city}</span>
                    {active && <Check className="anim-scale h-3.5 w-3.5 shrink-0 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* bio — floating label */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
              <span className="mr-1.5 text-amber-600">03</span> Bio
            </span>
            <div className="relative mt-3">
              <textarea
                id="bio"
                rows={4}
                maxLength={BIO_MAX}
                placeholder=" "
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="peer w-full resize-none rounded-2xl border border-line bg-cream px-4 pb-2.5 pt-6 text-sm leading-relaxed text-ink outline-none transition-all duration-200 focus:border-amber-500 focus:bg-card focus:ring-2 focus:ring-amber-500/25"
              />
              <label
                htmlFor="bio"
                className="pointer-events-none absolute left-4 top-4 text-sm text-mist/70 transition-all duration-200 peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-[0.14em] peer-focus:text-amber-600 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.14em]"
              >
                Years of experience, specialties…
              </label>
              <span className={`absolute bottom-3 right-4 text-[10px] font-bold ${bio.length > BIO_MAX - 50 ? "text-amber-600" : "text-mist/50"}`}>
                {bio.length}/{BIO_MAX}
              </span>
            </div>
          </div>

          {/* id document — floating label */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
              <span className="mr-1.5 text-amber-600">04</span> ID / certificate reference
            </span>
            <div className="relative mt-3">
              <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-pine-600/70" />
              <input
                id="idDoc"
                type="url"
                placeholder=" "
                value={idDocumentUrl}
                onChange={(e) => setIdDocumentUrl(e.target.value)}
                className="peer w-full rounded-2xl border border-line bg-cream py-3 pl-11 pr-4 text-sm text-ink outline-none transition-all duration-200 focus:border-amber-500 focus:bg-card focus:ring-2 focus:ring-amber-500/25"
              />
              <label
                htmlFor="idDoc"
                className="pointer-events-none absolute left-11 top-3.5 text-sm text-mist/70 transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-[0.14em] peer-focus:text-amber-600 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.14em]"
              >
                Link to an uploaded document
              </label>
            </div>
            <p className="mt-1.5 flex items-start gap-1.5 text-[11px] font-medium text-mist">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pine-600" />
              Self-submitted, not independently verified — a trust signal that earns you the verified badge on your public profile.
            </p>
          </div>

          {/* desktop save */}
          <div className="flex items-center justify-between gap-3 border-t border-line/80 pt-5">
            <p className="text-xs font-semibold text-mist">
              {dirty ? (
                <span className="inline-flex items-center gap-1.5 text-amber-600">
                  <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-amber-500" /> Unsaved changes
                </span>
              ) : (
                "All changes saved"
              )}
            </p>
            <button
              type="submit"
              disabled={saving || !dirty}
              className="btn-press hidden items-center gap-2 rounded-2xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-pine-900 shadow-md hover:bg-amber-400 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 lg:inline-flex"
            >
              {saving ? "Saving…" : (<><Save className="h-4 w-4" /> Save changes</>)}
            </button>
          </div>
        </div>

        {/* ---------- sticky rail ---------- */}
        <aside className="anim-up space-y-4 lg:sticky lg:top-24" style={{ animationDelay: "0.2s" }}>
          {/* live preview */}
          <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            <div className="border-b border-line bg-cream px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mist">How homeowners see you</p>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <Avatar name={user?.name} size={44} online />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-bold text-ink">
                    {user?.name}
                    {verified && <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-600" />}
                  </p>
                  <p className="truncate text-[11px] font-medium text-mist">
                    {selectedCategories.length
                      ? categories.filter((c) => selectedCategories.includes(c._id)).slice(0, 2).map((c) => c.name).join(" · ")
                      : "No trades set"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {areas.filter((a) => selectedAreas.includes(a._id)).slice(0, 3).map((a) => (
                  <span key={a._id} className="anim-scale inline-flex items-center gap-1 rounded-full bg-pine-50 px-2 py-1 text-[10px] font-bold text-pine-700">
                    <MapPin className="h-2.5 w-2.5" /> {a.name}
                  </span>
                ))}
                {selectedAreas.length === 0 && <span className="text-[11px] font-medium text-mist/70">No coverage areas yet</span>}
              </div>
              {bio.trim() && <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-ink/80">{bio}</p>}
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl border border-pine-100 bg-pine-50 p-4">
            <Sparkles className="h-5 w-5 shrink-0 text-pine-700" />
            <p className="text-xs leading-relaxed text-pine-800">
              <span className="font-bold">Matching rule:</span> a job reaches you only when <span className="font-bold">both</span> its trade and area match your selections.
            </p>
          </div>
        </aside>
      </form>

      {/* ---------- mobile sticky save bar ---------- */}
      <div className="fixed inset-x-3 bottom-20 z-40 lg:hidden">
        <button
          type="submit"
          form="profile-form"
          disabled={saving || !dirty}
          className="btn-press flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 text-sm font-bold text-pine-900 shadow-xl shadow-amber-500/30 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving…" : dirty ? (<><Save className="h-4 w-4" /> Save changes</>) : "All changes saved"}
        </button>
      </div>
    </div>
  );
}