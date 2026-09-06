import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, BadgeCheck, Briefcase, Clock, Cog, Droplets, Hammer,
  MapPin, PaintRoller, PhoneCall, PlugZap, ShieldCheck, Sparkles, Star,
  UserCheck, Wrench, Zap,
} from "lucide-react";
import Avatar from "../components/Avatar";

/* ---------- brand mark ---------- */
function AppMark({ size = 38 }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-xl bg-pine shadow-md" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} fill="none" stroke="#f59e0b" strokeWidth="2.4">
        <rect x="2.5" y="8" width="11" height="8" rx="4" />
        <rect x="10.5" y="8" width="11" height="8" rx="4" />
      </svg>
    </span>
  );
}

function MiniStars({ value, className = "h-3.5 w-3.5" }) {
  const full = Math.round(Number(value) || 0);
  return (
    <span className="inline-flex items-center gap-[1px]">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${className} ${i <= full ? "fill-amber-400 text-amber-400" : "text-line"}`} strokeWidth={1.5} />
      ))}
    </span>
  );
}

function CountUp({ to, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVal(to); return; }
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 1100);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span>{val.toLocaleString("en-NG")}{suffix}</span>;
}

const TICKER = [
  "Musa A. was claimed for a duplex rewiring in Ikeja GRA",
  "New job posted: borehole pump replacement — Ikorodu",
  "Chiamaka E. earned a 5.0 rating for a 3-bed repaint in Ajah",
  "3 verified plumbers are online near Yaba right now",
  "Adewale O. responded to a quote request in 12 minutes",
  "Carpenter claimed: fitted wardrobe build in Gbagada",
];

const TRADES = [
  { name: "Electrical", icon: Zap, count: "320+ pros", span: "md:col-span-2 md:row-span-2", big: true },
  { name: "Plumbing", icon: Droplets, count: "280+ pros", span: "md:col-span-2", big: true },
  { name: "Mechanic", icon: Cog, count: "190+ pros" },
  { name: "Generator Repair", icon: PlugZap, count: "140+ pros" },
  { name: "Carpentry", icon: Hammer, count: "210+ pros" },
  { name: "Painting", icon: PaintRoller, count: "175+ pros" },
  { name: "Tiling & POP", icon: Wrench, count: "120+ pros" },
];

const HOMEOWNER_STEPS = [
  { icon: Briefcase, title: "Post your job", body: "Describe what you need and pick your area. Matching providers are notified instantly." },
  { icon: PhoneCall, title: "Take calls, choose freely", body: "Interested providers call you directly — first-come-first-served, no bidding wars." },
  { icon: Star, title: "Claim, complete, rate", body: "Claim your provider in the app, mark the job done, and rate the work for the next homeowner." },
];

const PROVIDER_STEPS = [
  { icon: UserCheck, title: "Set up your profile", body: "Pick your trades and coverage areas. Verification badge builds trust before the first call." },
  { icon: Sparkles, title: "Get matched automatically", body: "Jobs in your trade and area land on your dashboard — no chasing referrals." },
  { icon: PhoneCall, title: "Call and win the work", body: "Express interest to reveal the homeowner's number. Fastest caller usually wins." },
];

const STATS = [
  { value: 2400, suffix: "+", label: "Jobs matched" },
  { value: 850, suffix: "+", label: "Verified artisans" },
  { value: 15, suffix: " min", label: "Average first response" },
  { value: 4.8, suffix: "", label: "Average rating", fixed: true },
];

export default function HomePage() {
  return (
    <div>
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-pine text-cream">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <span className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full border border-cream/10" />
        <span className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full border-[28px] border-amber-500/15" />
        <span className="pointer-events-none absolute right-24 top-16 h-44 w-44 animate-[spin_55s_linear_infinite] rounded-full border-2 border-dashed border-cream/20" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-6 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          {/* copy */}
          <div>
            <p className="anim-up inline-flex items-center gap-2 rounded-full border border-cream/25 bg-cream/5 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.18em] text-amber-400">
              <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-amber-400" /> TRUSTED LOCAL ARTISANS · NIGERIA
            </p>
            <h1 className="anim-up mt-5 font-brand text-[38px] font-bold leading-[1.04] tracking-tight md:text-[54px]" style={{ animationDelay: "0.1s" }}>
              Find a trusted local <span className="text-amber-400">artisan</span>,
              <br className="hidden md:block" /> or find your next <span className="text-amber-400">job</span>.
            </h1>
            <p className="anim-up mt-5 max-w-lg text-[15px] leading-relaxed text-cream/75 md:text-base" style={{ animationDelay: "0.2s" }}>
              AikiLink connects homeowners and offices with electricians, plumbers, mechanics and other local service providers across Nigeria — fast, and free while we grow.
            </p>

            <ul className="anim-up mt-6 space-y-2.5" style={{ animationDelay: "0.3s" }}>
              {[
                "Post a job and get matched in minutes",
                "Talk directly to providers, first-come-first-served",
                "Free for homeowners and providers at launch",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2.5 text-sm font-medium text-cream/85">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber-500/20 text-amber-400">
                    <ShieldCheck className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <div className="anim-up mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "0.4s" }}>
              <Link
                to="/register"
                className="btn-press inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-7 py-4 text-sm font-bold text-pine-900 shadow-lg shadow-amber-500/25 hover:bg-amber-400 hover:shadow-xl"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                className="btn-press inline-flex items-center justify-center gap-2 rounded-2xl border border-cream/30 px-7 py-4 text-sm font-bold text-cream hover:border-amber-400/70 hover:bg-cream/10 hover:text-amber-300"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* signature visual — a live match in progress */}
          <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <span className="pointer-events-none absolute -inset-6 rounded-[2rem] border border-cream/10" />

            {/* floating chips */}
            <span className="anim-up absolute -left-3 top-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-pine-800 px-3 py-1.5 text-[11px] font-bold text-cream shadow-lg md:-left-8" style={{ animationDelay: "0.9s" }}>
              <BadgeCheck className="h-3.5 w-3.5 text-amber-400" /> ID verified
            </span>
            <span className="anim-up absolute -right-2 top-1/3 z-20 inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-pine-800 px-3 py-1.5 text-[11px] font-bold text-cream shadow-lg md:-right-6" style={{ animationDelay: "1.05s" }}>
              <MiniStars value={5} className="h-3 w-3" /> 4.9
            </span>
            <span className="anim-up absolute -bottom-4 left-8 z-20 inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-pine-800 px-3 py-1.5 text-[11px] font-bold text-cream shadow-lg" style={{ animationDelay: "1.2s" }}>
              <Clock className="h-3.5 w-3.5 text-amber-400" /> Responds in 12 min
            </span>

            {/* job card */}
            <div className="anim-up relative z-10 rounded-2xl border border-line bg-card p-5 text-ink shadow-2xl" style={{ animationDelay: "0.5s" }}>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-pine-50 px-2.5 py-1 text-[11px] font-bold text-pine-700">
                  <Hammer className="h-3 w-3" /> Carpenter
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                  <Zap className="h-3 w-3 fill-amber-500 text-amber-500" /> Urgent
                </span>
              </div>
              <h3 className="mt-3 font-brand text-[17px] font-bold leading-snug">I need my cage repaired</h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-mist">
                <MapPin className="h-3.5 w-3.5 text-pine-600/70" /> Bodija, Ibadan · 2 min ago
              </p>
              <div className="mt-4 border-t border-line/80 pt-3.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-mist">Matched provider</p>
                <div className="mt-2.5 flex items-center gap-3">
                  <Avatar name="Yemi Fasina" size={42} online />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">Yemi Fasina</p>
                    <MiniStars value={5} />
                  </div>
                  <span className="anim-scale inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700" style={{ animationDelay: "1.35s" }}>
                    <PhoneCall className="h-3 w-3" /> Calling…
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ticker */}
        <div className="ticker relative flex h-11 items-center overflow-hidden border-t border-cream/10 bg-pine-800">
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
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="anim-up max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">How AikiLink works</p>
          <h2 className="mt-2 font-brand text-3xl font-bold tracking-tight text-ink md:text-4xl">
            One marketplace, two sides, zero guesswork.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* homeowners */}
          <div className="anim-up rounded-2xl border border-line bg-card p-6 shadow-sm md:p-8" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between">
              <p className="inline-flex items-center gap-2 rounded-full bg-pine-50 px-3 py-1.5 text-xs font-bold text-pine-700">
                <Briefcase className="h-3.5 w-3.5" /> For homeowners
              </p>
              <span className="font-brand text-xs font-bold text-mist">3 steps</span>
            </div>
            <ol className="mt-6 space-y-6">
              {HOMEOWNER_STEPS.map((s, i) => (
                <li key={s.title} className="anim-up relative flex gap-4" style={{ animationDelay: `${0.2 + i * 0.12}s` }}>
                  {i < HOMEOWNER_STEPS.length - 1 && <span className="absolute left-[19px] top-11 h-[calc(100%-18px)] w-px bg-line" />}
                  <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500 text-pine-900 shadow-sm">
                    <s.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-brand text-[15px] font-bold text-ink">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-mist">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link to="/register" className="btn-press mt-7 inline-flex items-center gap-2 rounded-2xl bg-pine px-5 py-3 text-sm font-bold text-cream shadow-sm hover:bg-pine-700 hover:shadow-lg">
              Post your first job <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* artisans */}
          <div className="anim-up rounded-2xl border border-pine bg-pine p-6 text-cream shadow-lg md:p-8" style={{ animationDelay: "0.18s" }}>
            <div className="relative">
              <div className="dot-grid pointer-events-none absolute -inset-6 opacity-60" />
              <div className="relative flex items-center justify-between">
                <p className="inline-flex items-center gap-2 rounded-full bg-cream/10 px-3 py-1.5 text-xs font-bold text-amber-400">
                  <Hammer className="h-3.5 w-3.5" /> For artisans
                </p>
                <span className="font-brand text-xs font-bold text-cream/60">3 steps</span>
              </div>
              <ol className="relative mt-6 space-y-6">
                {PROVIDER_STEPS.map((s, i) => (
                  <li key={s.title} className="anim-up relative flex gap-4" style={{ animationDelay: `${0.28 + i * 0.12}s` }}>
                    {i < PROVIDER_STEPS.length - 1 && <span className="absolute left-[19px] top-11 h-[calc(100%-18px)] w-px bg-cream/15" />}
                    <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cream/10 text-amber-400">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-brand text-[15px] font-bold">{s.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-cream/70">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link to="/register" className="btn-press relative mt-7 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-pine-900 shadow-md hover:bg-amber-400 hover:shadow-xl">
                Start getting work <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRADES BENTO ================= */}
      <section className="border-y border-line bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
          <div className="anim-up flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Browse by trade</p>
              <h2 className="mt-2 font-brand text-3xl font-bold tracking-tight text-ink md:text-4xl">Every skill your home needs.</h2>
            </div>
            <Link to="/register" className="group inline-flex items-center gap-1 text-sm font-bold text-pine-700 transition-colors hover:text-amber-600">
              Join as an artisan <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {TRADES.map((t, i) => (
              <Link
                key={t.name}
                to="/register"
                className={`anim-up group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-pine/30 hover:shadow-xl ${t.span || ""}`}
                style={{ animationDelay: `${0.08 + i * 0.06}s` }}
              >
                <span className={`grid place-items-center rounded-2xl bg-pine-50 text-pine-700 transition-colors duration-300 group-hover:bg-pine group-hover:text-amber-400 ${t.big ? "h-14 w-14" : "h-10 w-10"}`}>
                  <t.icon className={t.big ? "h-6 w-6" : "h-4 w-4"} />
                </span>
                <span className="mt-4">
                  <span className={`block font-brand font-bold text-ink ${t.big ? "text-xl" : "text-sm"}`}>{t.name}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-mist">{t.count}</span>
                </span>
                {t.big && <t.icon className="pointer-events-none absolute -bottom-4 -right-3 h-24 w-24 rotate-12 text-pine-50 transition-transform duration-500 group-hover:scale-110" />}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TRUST / STATS ================= */}
      <section className="relative overflow-hidden bg-pine text-cream">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <span className="pointer-events-none absolute -left-20 -bottom-24 h-72 w-72 rounded-full border-[24px] border-amber-500/10" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:px-6 md:py-20 lg:grid-cols-2">
          <div>
            <p className="anim-up text-xs font-bold uppercase tracking-[0.2em] text-amber-400" style={{ animationDelay: "0.05s" }}>Built on trust</p>
            <h2 className="anim-up mt-2 font-brand text-3xl font-bold leading-tight tracking-tight md:text-4xl" style={{ animationDelay: "0.12s" }}>
              Strangers in your home?
              <br /> Only verified ones.
            </h2>
            <ul className="mt-7 space-y-4">
              {[
                { icon: ShieldCheck, t: "ID & certification checks", b: "Providers earn the verified badge before homeowners can claim them." },
                { icon: Star, t: "Ratings you can trust", b: "Reviews unlock only after a completed job — bought reviews are impossible." },
                { icon: MapPin, t: "Area-locked matching", b: "You only meet artisans who actually cover your neighbourhood." },
              ].map((x, i) => (
                <li key={x.t} className="anim-up flex gap-4" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream/10 text-amber-400">
                    <x.icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{x.t}</span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-cream/65">{x.b}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {STATS.map((s, i) => (
              <div key={s.label} className="anim-up rounded-2xl border border-cream/15 bg-cream/5 p-5 transition-colors duration-300 hover:border-amber-400/40 hover:bg-cream/10" style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
                <p className="font-brand text-3xl font-bold text-amber-400 md:text-4xl">
                  {s.fixed ? s.value : <CountUp to={s.value} suffix={s.suffix} />}
                  {s.fixed && s.suffix}
                </p>
                <p className="mt-1.5 text-xs font-semibold text-cream/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <div className="anim-up max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Word on the street</p>
          <h2 className="mt-2 font-brand text-3xl font-bold tracking-tight text-ink md:text-4xl">Both sides win.</h2>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <figure className="anim-up rounded-2xl border border-line bg-card p-7 shadow-sm transition-shadow duration-300 hover:shadow-lg md:p-8" style={{ animationDelay: "0.1s" }}>
            <MiniStars value={5} className="h-4 w-4" />
            <blockquote className="mt-4 font-brand text-lg font-bold leading-snug text-ink md:text-xl">
              “Three plumbers ignored my calls last year. On AikiLink I had two call me back within twenty minutes — and the one I hired fixed it the same day.”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <Avatar name="Mrs Adeyemi" size={44} />
              <span>
                <span className="block text-sm font-bold text-ink">Mrs. Adeyemi</span>
                <span className="block text-xs font-medium text-mist">Homeowner · Lekki Phase 1</span>
              </span>
            </figcaption>
          </figure>
          <figure className="anim-up rounded-2xl border border-pine bg-pine p-7 text-cream shadow-lg md:p-8" style={{ animationDelay: "0.2s" }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-[11px] font-bold text-pine-900">
              <Sparkles className="h-3 w-3" /> Top rated artisan
            </span>
            <blockquote className="mt-4 font-brand text-lg font-bold leading-snug md:text-xl">
              “Before, I waited for referrals. Now my phone rings with jobs in my area every week. My rating does the selling for me.”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <Avatar name="Musa Abdullahi" size={44} />
              <span>
                <span className="block text-sm font-bold">Musa Abdullahi</span>
                <span className="block text-xs font-medium text-cream/65">Electrician · Ikeja GRA</span>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="px-4 pb-20 md:px-6">
        <div className="anim-up relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-pine px-6 py-14 text-center text-cream shadow-xl md:py-16">
          <div className="dot-grid pointer-events-none absolute inset-0" />
          <span className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[20px] border-amber-500/15" />
          <span className="pointer-events-none absolute -left-10 -bottom-16 h-44 w-44 animate-[spin_50s_linear_infinite] rounded-full border-2 border-dashed border-cream/20" />
          <div className="relative">
            <span className="mx-auto flex items-center justify-center gap-2.5">
              <AppMark size={40} />
            </span>
            <h2 className="mx-auto mt-5 max-w-xl font-brand text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              Your artisan is one post away. Your next job is one profile away.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream/70">
              Join free today — AikiLink is free for homeowners and providers while we grow.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/register" className="btn-press inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-8 py-4 text-sm font-bold text-pine-900 shadow-lg shadow-amber-500/25 hover:bg-amber-400 hover:shadow-xl">
                Create free account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-press inline-flex items-center justify-center gap-2 rounded-2xl border border-cream/30 px-8 py-4 text-sm font-bold text-cream hover:border-amber-400/70 hover:bg-cream/10">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}