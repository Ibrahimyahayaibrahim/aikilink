import { Link } from "react-router-dom";
import { ArrowUp, Mail, MapPin, Sparkles, Zap } from "lucide-react";
import Logo from "./Logo";
import { FacebookIcon, InstagramIcon, XIcon, LinkedInIcon, WhatsAppIcon } from "./SocialIcons";

const linkCls =
  "group inline-flex items-center gap-1.5 text-sm font-medium text-cream/65 transition-all duration-200 hover:translate-x-0.5 hover:text-amber-400";

const SOCIALS = [
  { label: "Facebook", Icon: FacebookIcon },
  { label: "Instagram", Icon: InstagramIcon },
  { label: "X (Twitter)", Icon: XIcon },
  { label: "LinkedIn", Icon: LinkedInIcon },
  { label: "WhatsApp", Icon: WhatsAppIcon },
];

const PLATFORM_LINKS = [
  { to: "/register", label: "Get started" },
  { to: "/login", label: "Log in" },
  { to: "/homeowner/post", label: "Post a job" },
  { to: "/provider", label: "Find work" },
];

const TRADES = ["Electrician", "Plumber", "Mechanic", "Generator Repair", "Carpenter", "Painter"];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-pine-900 text-cream">
      {/* top accent + ambient */}
      <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" aria-hidden="true" />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border-[22px] border-amber-500/10" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-14 md:px-6 md:pt-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* ---------- brand column ---------- */}
          <div className="anim-up">
            <Link to="/" className="btn-press inline-flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream shadow-md">
                <Logo size={26} />
              </span>
              <span className="font-brand text-xl font-bold tracking-tight text-cream">
                aiki<span className="text-amber-400">link</span>
                <span className="text-amber-400">.</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/65">
              Connecting homeowners and offices with trusted local electricians, plumbers, mechanics and more — across Nigeria.
            </p>
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-cream/15 bg-cream/5 px-3 py-1.5 text-[11px] font-bold text-amber-400">
              <Sparkles className="h-3 w-3" /> Free while we grow
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map(({ label, Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-cream/15 text-cream/70 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/60 hover:bg-amber-500/10 hover:text-amber-400"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* ---------- platform ---------- */}
          <nav className="anim-up" style={{ animationDelay: "0.08s" }} aria-label="Platform">
            <h5 className="text-[11px] font-bold uppercase tracking-[0.22em] text-cream/40">Platform</h5>
            <ul className="mt-4 space-y-2.5">
              {PLATFORM_LINKS.map((l) => (
                <li key={l.to + l.label}>
                  <Link to={l.to} className={linkCls}>{l.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/provider/profile" className={linkCls}>Provider profile</Link>
              </li>
            </ul>
          </nav>

          {/* ---------- categories ---------- */}
          <nav className="anim-up" style={{ animationDelay: "0.16s" }} aria-label="Categories">
            <h5 className="text-[11px] font-bold uppercase tracking-[0.22em] text-cream/40">Categories</h5>
            <ul className="mt-4 space-y-2.5">
              {TRADES.map((t) => (
                <li key={t}>
                  <Link to="/register" className={linkCls}>{t}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---------- contact ---------- */}
          <div className="anim-up" style={{ animationDelay: "0.24s" }}>
            <h5 className="text-[11px] font-bold uppercase tracking-[0.22em] text-cream/40">Contact</h5>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="mailto:support@aikilink.ng" className={linkCls}>
                  <Mail className="h-4 w-4 text-amber-400/80" /> support@aikilink.ng
                </a>
              </li>
              <li className="inline-flex items-center gap-1.5 text-sm font-medium text-cream/65">
                <MapPin className="h-4 w-4 text-amber-400/80" /> Ibadan, Oyo State
              </li>
              <li className="inline-flex items-center gap-1.5 text-sm font-medium text-cream/65">
                <Zap className="h-4 w-4 text-amber-400/80" /> Providers reply in ~15 min
              </li>
            </ul>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="btn-press mt-6 inline-flex items-center gap-2 rounded-2xl border border-cream/20 px-4 py-2.5 text-xs font-bold text-cream/80 transition-colors hover:border-amber-400/60 hover:text-amber-400"
            >
              <ArrowUp className="h-3.5 w-3.5" /> Back to top
            </button>
          </div>
        </div>

        {/* ---------- bottom bar ---------- */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-cream/10 pt-6 text-center md:flex-row md:text-left">
          <span className="text-xs font-medium text-cream/50">© {year} aikilink. All rights reserved.</span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cream/50">
            <span className="pulse-soft h-1.5 w-1.5 rounded-full bg-amber-400" />
            Built as a final-year project — Gombe State University.
          </span>
        </div>
      </div>
    </footer>
  );
}