import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Bell, Briefcase, CalendarDays, FileText, Hammer, Home, LogOut, Menu,
  PlusCircle, ShieldCheck, Sparkles, Star, UserCheck, UserRound, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import Logo from "./Logo";
import Avatar from "./Avatar";

/* ================================================================
   ROUTES — single source of truth. Match against your App.jsx.
   ================================================================ */
const ROUTES = {
  login: "/login",
  register: "/register",
  homeownerJobs: "/homeowner",
  postJob: "/homeowner/post", 
  providerFeed: "/provider",
  providerWork: "/provider/work",
  providerProfile: "/provider/profile",
};

/* ================================================================
   NOTIFICATIONS — backend contract (ensure your API matches):
     GET   /notifications           → array of { _id, type, title, body, createdAt, read }
     PATCH /notifications/read      → mark ALL as read
     PATCH /notifications/:id/read  → mark ONE as read (optional)
   Field names are tolerated: type|kind, body|message|text,
   createdAt|created_at, read|isRead.
   ================================================================ */

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

function kindOf(raw) {
  const s = String(raw || "").toLowerCase();
  if (s.includes("interest") || s.includes("quote")) return "quote";
  if (s.includes("verif") || s.includes("id")) return "verify";
  if (s.includes("remind") || s.includes("schedul")) return "reminder";
  if (s.includes("rat") || s.includes("review")) return "rating";
  if (s.includes("claim") || s.includes("assign")) return "claim";
  return "promo";
}

const normalize = (n) => ({
  id: n._id || n.id,
  kind: kindOf(n.type || n.kind || n.title),
  title: n.title || "Notification",
  body: n.body || n.message || n.text || "",
  time: timeAgo(n.createdAt || n.created_at),
  unread: !(n.read ?? n.isRead ?? false),
});

/* ---------- tiny shared store: keeps badge + dropdown + mobile sheet in sync ---------- */
let cache = { list: [], loaded: false };
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

async function fetchNotifications(token) {
  try {
    // Adding the timestamp forces the browser to bypass its cache
    const data = await api.get(`/notifications?t=${Date.now()}`, token);
    cache = { list: (Array.isArray(data) ? data : data?.notifications || []).map(normalize), loaded: true };
  } catch (err) {
    cache = { ...cache, loaded: true }; 
  }
  emit();
}

async function markAllRead(token) {
  cache = { ...cache, list: cache.list.map((n) => ({ ...n, unread: false })) };
  emit();
  try {
    await api.patch("/notifications/read", {}, token);
  } catch (err) {
    /* optimistic — ignore */
  }
}

async function markOneRead(token, id) {
  cache = { ...cache, list: cache.list.map((n) => (n.id === id ? { ...n, unread: false } : n)) };
  emit();
  try {
    await api.patch(`/notifications/${id}/read`, {}, token);
  } catch (err) {
    /* optional endpoint — ignore */
  }
}

function useNotifications() {
  const { token, isAuthenticated } = useAuth();
  const [, force] = useState(0);

  useEffect(() => {
    const fn = () => force((x) => x + 1);
    listeners.add(fn);
    if (isAuthenticated && token) {
      fetchNotifications(token);
      const id = window.setInterval(() => fetchNotifications(token), 60000);
      return () => {
        listeners.delete(fn);
        window.clearInterval(id);
      };
    }
    return () => listeners.delete(fn);
  }, [token, isAuthenticated]);

  return { token, notifications: cache.list, loaded: cache.loaded };
}

/* ---------- dropdown / sheet content ---------- */
const KIND = {
  quote: { icon: FileText, cls: "bg-amber-100 text-amber-600" },
  verify: { icon: ShieldCheck, cls: "bg-pine-50 text-pine-700" },
  reminder: { icon: CalendarDays, cls: "bg-sky-100 text-sky-600" },
  rating: { icon: Star, cls: "bg-emerald-100 text-emerald-600" },
  claim: { icon: UserCheck, cls: "bg-emerald-100 text-emerald-600" },
  promo: { icon: Sparkles, cls: "bg-rose-100 text-rose-500" },
};

function NotifPanel({ notifications, loaded, onMarkAll, onOpen }) {
  const unread = notifications.filter((n) => n.unread).length;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="font-brand text-sm font-bold text-ink">
          Notifications{" "}
          {unread > 0 && (
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">{unread} new</span>
          )}
        </p>
        <button
          onClick={onMarkAll}
          disabled={unread === 0}
          className="text-[11px] font-bold text-amber-600 transition-colors hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto p-1.5">
        {!loaded ? (
          <div className="space-y-2 p-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-3 rounded-xl p-2">
                <span className="skeleton h-9 w-9 shrink-0 rounded-xl" />
                <span className="flex-1 space-y-1.5 py-1">
                  <span className="skeleton block h-3 w-2/3 rounded-full" />
                  <span className="skeleton block h-2.5 w-full rounded-full" />
                </span>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-pine-50 text-pine-700">
              <Bell className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-bold text-ink">No new notifications</p>
            <p className="mx-auto mt-1 max-w-[220px] text-xs font-medium text-mist">
              When something happens on your jobs — quotes, claims, ratings — it shows up here.
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const K = KIND[n.kind] || KIND.promo;
            const Icon = K.icon;
            return (
              <button
                key={n.id}
                onClick={() => onOpen(n.id)}
                className={`flex w-full gap-3 rounded-xl p-3 text-left transition-colors hover:bg-cream ${n.unread ? "bg-amber-50/70" : ""}`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${K.cls}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-2">
                    <span className="truncate text-[13px] font-bold text-ink">{n.title}</span>
                    {n.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />}
                  </span>
                  {n.body && <span className="mt-0.5 block text-xs leading-snug text-mist">{n.body}</span>}
                  <span className="mt-1 block text-[10px] font-semibold text-mist/70">{n.time}</span>
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="border-t border-line px-4 py-2.5 text-center">
        <p className="text-[11px] font-semibold text-mist">
          {!loaded ? "Checking…" : unread === 0 ? "You're all caught up" : `${unread} unread notification${unread > 1 ? "s" : ""}`}
        </p>
      </div>
    </div>
  );
}

/* ================================================================
   NavBar — same layout, links and mobile menu as before.
   ================================================================ */
export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { token, notifications, loaded } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate(ROUTES.login);
  };

  const links = !isAuthenticated
    ? []
    : user?.role === "provider"
      ? [
          { to: ROUTES.providerFeed, label: "Job feed", icon: Hammer },
          { to: ROUTES.providerWork, label: "My work", icon: Briefcase },
          { to: ROUTES.providerProfile, label: "My profile", icon: UserRound },
        ]
      : [{ to: ROUTES.homeownerJobs, label: "My jobs", icon: Briefcase }];

  const unread = notifications.filter((n) => n.unread).length;

  const linkCls = ({ isActive }) =>
    `flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-all duration-200 ${
      isActive ? "bg-pine text-cream shadow-sm" : "text-mist hover:bg-pine-50 hover:text-pine"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
        <Logo />

        {/* desktop links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkCls}>
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-2.5">
          {isAuthenticated && (
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className={`btn-press relative hidden rounded-2xl border p-2.5 sm:block ${
                notifOpen ? "border-amber-400 bg-amber-50 text-amber-600" : "border-line bg-card text-mist hover:text-pine"
              }`}
              title="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-pine-900">
                  {unread}
                </span>
              )}
            </button>
          )}

          {!isAuthenticated && (
            <>
              <Link to={ROUTES.login} className="btn-press hidden rounded-2xl border border-line bg-card px-4 py-2.5 text-sm font-bold text-pine hover:border-pine/40 sm:inline-flex">
                Log in
              </Link>
              <Link to={ROUTES.register} className="btn-press hidden rounded-2xl bg-pine px-4 py-2.5 text-sm font-bold text-cream shadow-sm hover:bg-pine-700 sm:inline-flex">
                Register
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === "homeowner" && (
            <Link
              to={ROUTES.postJob}
              className="btn-press hidden items-center gap-1.5 rounded-2xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-pine-900 shadow-sm hover:bg-amber-400 hover:shadow-lg sm:inline-flex"
            >
              <PlusCircle className="h-4 w-4" /> Post a job
            </Link>
          )}

          {isAuthenticated && (
            <div className="hidden items-center gap-2 rounded-2xl border border-line bg-card py-1.5 pl-1.5 pr-3 md:flex">
              <Avatar name={user?.name || "User"} size={30} online />
              <span className="leading-tight">
                <span className="block text-xs font-bold text-ink">{user?.name || "User"}</span>
                <span className="block text-[10px] font-medium capitalize text-mist">{user?.role}</span>
              </span>
            </div>
          )}

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="btn-press hidden rounded-2xl border border-line bg-card p-2.5 text-mist hover:border-rose-300 hover:text-rose-600 lg:block"
              title="Log out"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          )}

          {/* mobile hamburger */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="btn-press rounded-2xl border border-line bg-card p-2.5 text-pine lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* desktop notifications dropdown */}
        {notifOpen && (
          <>
            <button className="fixed inset-0 z-40 cursor-default" onClick={() => setNotifOpen(false)} aria-label="Close notifications" />
            <div className="anim-scale absolute right-4 top-full z-50 mt-2 hidden w-[360px] origin-top-right sm:block">
              <NotifPanel
                notifications={notifications}
                loaded={loaded}
                onMarkAll={() => markAllRead(token)}
                onOpen={(id) => {
                  markOneRead(token, id);
                  setNotifOpen(false);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* mobile menu */}
      {open && (
        <div className="anim-in border-t border-line bg-card px-4 py-4 lg:hidden">
          <div className="mb-3 flex items-center gap-2.5">
            <Avatar name={user?.name || "Guest"} size={36} online={!!isAuthenticated} />
            <span>
              <span className="block text-sm font-bold text-ink">{isAuthenticated ? user?.name : "Welcome"}</span>
              <span className="block text-[11px] font-medium capitalize text-mist">{isAuthenticated ? user?.role : "Log in to get started"}</span>
            </span>
          </div>
          <div className="grid gap-1.5">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={linkCls}>
                <l.icon className="h-4 w-4" /> {l.label}
              </NavLink>
            ))}
            {isAuthenticated && user?.role === "homeowner" && (
              <Link to={ROUTES.postJob} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2.5 text-sm font-bold text-pine-900">
                <PlusCircle className="h-4 w-4" /> Post a job
              </Link>
            )}
            {!isAuthenticated && (
              <>
                <Link to={ROUTES.login} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl border border-line bg-cream px-3.5 py-2.5 text-sm font-bold text-pine">
                  Log in
                </Link>
                <Link to={ROUTES.register} onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl bg-pine px-3.5 py-2.5 text-sm font-bold text-cream">
                  Register
                </Link>
              </>
            )}
            {isAuthenticated && (
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50">
                <LogOut className="h-4 w-4" /> Log out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ================================================================
   MobileTabBar — now driven by the same live notification store.
   ================================================================ */
function Tab({ to, icon: Icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex flex-col items-center justify-center gap-1 text-[10px] font-bold transition-colors ${
          isActive ? "text-pine" : "text-mist hover:text-pine"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute top-1.5 h-1 w-1 rounded-full bg-amber-500" />}
          <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.9} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function MobileTabBar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { token, notifications, loaded } = useNotifications();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(false);

  if (!isAuthenticated) return null;
  const isProvider = user?.role === "provider";
  const unread = notifications.filter((n) => n.unread).length;

  return (
    <>
      {alerts && (
        <>
          <button className="fixed inset-0 z-40 cursor-default bg-pine-900/40" onClick={() => setAlerts(false)} aria-label="Close alerts" />
          <div className="anim-slide-up fixed inset-x-3 bottom-24 z-50">
            <NotifPanel
              notifications={notifications}
              loaded={loaded}
              onMarkAll={() => markAllRead(token)}
              onOpen={(id) => markOneRead(token, id)}
            />
          </div>
        </>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="grid h-16 grid-cols-5">
          {isProvider ? (
            <>
              <Tab to={ROUTES.providerFeed} icon={Hammer} label="Feed" />
              <Tab to={ROUTES.providerWork} icon={Briefcase} label="My work" />
              <button onClick={() => setAlerts((a) => !a)} className="relative flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-mist">
                <span className="relative">
                  <Bell className="h-5 w-5" />
                  {unread > 0 && <span className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full border border-card bg-amber-500" />}
                </span>
                Alerts
              </button>
              <Tab to={ROUTES.providerProfile} icon={UserRound} label="Profile" />
              <button
                onClick={() => { logout(); navigate(ROUTES.login); }}
                className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-mist"
              >
                <LogOut className="h-5 w-5" /> Log out
              </button>
            </>
          ) : (
            <>
              <Tab to={ROUTES.homeownerJobs} icon={Home} label="Home" />
              <Tab to={ROUTES.homeownerJobs} icon={Briefcase} label="My jobs" />
              <button
                onClick={() => navigate(ROUTES.postJob)}
                className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-mist"
                aria-label="Post a job"
              >
                <span className="btn-press pulse-soft -mt-7 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-pine-900 shadow-lg shadow-amber-500/40">
                  <PlusCircle className="h-6 w-6" strokeWidth={2.4} />
                </span>
                Post
              </button>
              <button onClick={() => setAlerts((a) => !a)} className="relative flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-mist">
                <span className="relative">
                  <Bell className="h-5 w-5" />
                  {unread > 0 && <span className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full border border-card bg-amber-500" />}
                </span>
                Alerts
              </button>
              <button
                onClick={() => { logout(); navigate(ROUTES.login); }}
                className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold text-mist"
              >
                <LogOut className="h-5 w-5" /> Log out
              </button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}