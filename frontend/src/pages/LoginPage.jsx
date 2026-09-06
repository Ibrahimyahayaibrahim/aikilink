import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle, ArrowRight, BadgeCheck, Eye, EyeOff, Hammer, Home,
  Lock, MapPin, Phone, ShieldCheck, Star, User, Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/* ---------- brand mark (same as NavBar) ---------- */
function AppMark({ size = 44 }) {
  return (
    <span className="grid shrink-0 place-items-center rounded-2xl bg-pine shadow-md" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} fill="none" stroke="#f59e0b" strokeWidth="2.4">
        <rect x="2.5" y="8" width="11" height="8" rx="4" />
        <rect x="10.5" y="8" width="11" height="8" rx="4" />
      </svg>
    </span>
  );
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
  "w-full rounded-2xl border bg-cream py-3 pl-11 pr-4 text-sm text-ink outline-none transition-all duration-200 placeholder:text-mist/60 focus:bg-card";
const inputOk = "border-line focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25";
const inputBad = "border-rose-400 ring-2 ring-rose-200";

const TRUST = [
  { icon: ShieldCheck, title: "ID-verified artisans", body: "Every provider passes checks before they can be claimed." },
  { icon: Star, title: "Real homeowner ratings", body: "Reviews only open after a completed job — no fakes." },
  { icon: MapPin, title: "Truly local", body: "Matches by trade and area, so help is always nearby." },
];

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const clearError = (key) => setErrors((e) => (e[key] ? { ...e, [key]: "" } : e));

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setErrors({});
  };

  const validate = () => {
    const next = {};
    const digits = phone.replace(/\D/g, "");
    if (mode === "register" && name.trim().length < 2) next.name = "Tell us your name.";
    if (digits.length < 7) next.phone = "Enter a valid phone number.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    if (mode === "register" && !role) next.role = "Choose how you'll use AikiLink.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === "login") {
        /* Identical to the original. */
        const { user } = await login({ phone, password });
        navigate(user.role === "provider" ? "/provider" : "/homeowner");
      } else {
        /* AuthContext.register posts to /auth/register — adjust fields if your model differs. */
        const { user } = await register({ name: name.trim(), phone, password, role });
        if (user?.role === "provider") {
          navigate("/provider/profile", { state: { justRegistered: true } });
        } else {
          navigate("/homeowner", { state: { justRegistered: true } });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ---------- brand panel ---------- */}
      <aside className="relative hidden overflow-hidden bg-pine text-cream lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <span className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[26px] border-amber-500/15" />
        <span className="pointer-events-none absolute -right-6 top-10 h-40 w-40 animate-[spin_50s_linear_infinite] rounded-full border-2 border-dashed border-cream/20" />
        <span className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full border border-cream/10" />

        <div className="relative flex items-center gap-3">
          <AppMark />
          <span className="font-brand text-2xl font-bold tracking-tight">
            aiki<span className="text-amber-400">link</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="anim-up text-xs font-bold uppercase tracking-[0.24em] text-amber-400" style={{ animationDelay: "0.1s" }}>
            Nigeria's artisan marketplace
          </p>
          <h1 className="anim-up mt-3 font-brand text-[40px] font-bold leading-[1.05] tracking-tight" style={{ animationDelay: "0.18s" }}>
            Skilled hands,
            <br />
            one call away.
          </h1>
          <p className="anim-up mt-4 text-[15px] leading-relaxed text-cream/70" style={{ animationDelay: "0.26s" }}>
            Post a job, get matched with verified local providers, and hire with confidence.
          </p>

          <ul className="mt-9 space-y-5">
            {TRUST.map((t, i) => (
              <li key={t.title} className="anim-up flex gap-4" style={{ animationDelay: `${0.34 + i * 0.1}s` }}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream/10 text-amber-400">
                  <t.icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-bold">{t.title}</span>
                  <span className="mt-0.5 block text-[13px] leading-relaxed text-cream/65">{t.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="anim-up relative flex items-center gap-3 rounded-2xl border border-cream/15 bg-cream/5 px-4 py-3" style={{ animationDelay: "0.7s" }}>
          <span className="pulse-soft h-2 w-2 shrink-0 rounded-full bg-amber-400" />
          <p className="text-xs font-semibold text-cream/80">
            Providers across Lagos, Ibadan & Abuja are online right now.
          </p>
        </div>
      </aside>

      {/* ---------- form panel ---------- */}
      <main className="flex items-center justify-center bg-cream px-4 py-10 md:px-8">
        <div className="w-full max-w-md">
          {/* mobile brand */}
          <div className="anim-up mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <AppMark size={38} />
            <span className="font-brand text-xl font-bold tracking-tight text-pine">
              aiki<span className="text-amber-500">link</span>
            </span>
          </div>

          <div className="anim-up rounded-2xl border border-line bg-card p-6 shadow-lg md:p-8" style={{ animationDelay: "0.08s" }}>
            <div className="mb-6 text-center lg:text-left">
              <h2 className="font-brand text-2xl font-bold tracking-tight text-ink">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-sm font-medium text-mist">
                {isLogin ? "Log in to your AikiLink account." : "Join free — homeowners and artisans welcome."}
              </p>
            </div>

            {/* segmented toggle */}
            <div className="relative mb-6 grid grid-cols-2 rounded-2xl border border-line bg-cream p-1.5">
              <span
                className={`absolute inset-y-1.5 w-[calc(50%-6px)] rounded-xl bg-pine shadow-sm transition-transform duration-300 ease-out ${
                  !isLogin ? "translate-x-[calc(100%+6px)]" : "translate-x-0"
                }`}
                style={{ left: 6 }}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`relative z-10 rounded-xl py-2.5 text-sm font-bold transition-colors duration-200 ${isLogin ? "text-cream" : "text-mist hover:text-pine"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`relative z-10 rounded-xl py-2.5 text-sm font-bold transition-colors duration-200 ${!isLogin ? "text-cream" : "text-mist hover:text-pine"}`}
              >
                Create account
              </button>
            </div>

            {error && (
              <div className="anim-scale mb-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                <p className="text-sm font-bold text-rose-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* name — register only */}
              {!isLogin && (
                <div className="anim-in">
                  <label htmlFor="name" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
                    Full name
                  </label>
                  <div className="relative">
                    <User className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.name ? "text-rose-500" : "text-pine-600/70"}`} />
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="e.g. Musa Abdullahi"
                      value={name}
                      onChange={(e) => { setName(e.target.value); clearError("name"); }}
                      className={`${inputBase} ${errors.name ? inputBad : inputOk}`}
                    />
                  </div>
                  <FieldError message={errors.name} />
                </div>
              )}

              {/* phone */}
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
                  Phone number
                </label>
                <div className="relative">
                  <Phone className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.phone ? "text-rose-500" : "text-pine-600/70"}`} />
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="08031234567"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
                    className={`${inputBase} ${errors.phone ? inputBad : inputOk}`}
                  />
                </div>
                <FieldError message={errors.phone} />
              </div>

              {/* password */}
              <div>
                <label htmlFor="password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${errors.password ? "text-rose-500" : "text-pine-600/70"}`} />
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    placeholder={isLogin ? "Your password" : "At least 6 characters"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                    className={`${inputBase} pr-11 ${errors.password ? inputBad : inputOk}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-mist transition-colors hover:text-pine"
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError message={errors.password} />
              </div>

              {/* role — register only */}
              {!isLogin && (
                <div className="anim-in">
                  <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-mist">I'm joining as</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { key: "homeowner", icon: Home, title: "Homeowner", body: "I need work done" },
                      { key: "provider", icon: Hammer, title: "Artisan", body: "I offer services" },
                    ].map((r) => {
                      const active = role === r.key;
                      return (
                        <button
                          key={r.key}
                          type="button"
                          onClick={() => { setRole(r.key); clearError("role"); }}
                          aria-pressed={active}
                          className={`btn-press rounded-2xl border p-3.5 text-left transition-all duration-200 ${
                            active
                              ? "border-pine bg-pine shadow-md"
                              : errors.role
                                ? "border-rose-300 bg-rose-50/40 hover:border-rose-400"
                                : "border-line bg-cream hover:-translate-y-0.5 hover:border-pine/40"
                          }`}
                        >
                          <r.icon className={`h-5 w-5 ${active ? "text-amber-400" : "text-pine-700"}`} />
                          <span className={`mt-2 block text-sm font-bold ${active ? "text-cream" : "text-ink"}`}>{r.title}</span>
                          <span className={`block text-[11px] font-medium ${active ? "text-cream/70" : "text-mist"}`}>{r.body}</span>
                        </button>
                      );
                    })}
                  </div>
                  <FieldError message={errors.role} />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-press inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-pine-900 shadow-md hover:bg-amber-400 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLogin ? (
                  loading ? "Signing in…" : (<>Sign in <ArrowRight className="h-4 w-4" /></>)
                ) : loading ? (
                  "Creating your account…"
                ) : (
                  <>Create account <Zap className="h-4 w-4" /></>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[13px] font-medium text-mist">
              {isLogin ? "New to AikiLink?" : "Already have an account?"}{" "}
              <button onClick={() => switchMode(isLogin ? "register" : "login")} className="font-bold text-pine-700 transition-colors hover:text-amber-600">
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>

          <p className="anim-up mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] font-medium text-mist" style={{ animationDelay: "0.2s" }}>
            <BadgeCheck className="h-3.5 w-3.5 text-pine-600" />
            Your details stay private — providers only see your number after you express interest.
          </p>
          <p className="mt-3 text-center text-[11px] font-medium text-mist lg:hidden">
            <Link to="/" className="font-bold text-pine-700 hover:text-amber-600">← Back to home</Link>
          </p>
        </div>
      </main>
    </div>
  );
}