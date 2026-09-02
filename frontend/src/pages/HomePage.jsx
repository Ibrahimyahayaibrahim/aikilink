import { Link, Navigate } from "react-router-dom";
import { Zap, ShieldCheck, Star, ArrowRight, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import HeroVisual from "../components/HeroVisual";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user?.role === "provider" ? "/provider" : "/homeowner"} replace />;
  }

  return (
    <div className="app-main">
      <div className="hero">
        <div className="hero-layout">
          <div>
            <div style={{ marginBottom: 16 }}>
              <Logo size={40} />
            </div>
            <h1>
              Find a trusted local artisan,<br />or find your next job.
            </h1>
            <p>
              aikilink connects homeowners and offices with electricians, plumbers,
              mechanics and other local service providers across Nigeria — fast, and
              free while we grow.
            </p>
            <ul className="hero-checklist">
              <li><span className="check-dot"><Check size={13} /></span> Post a job and get matched in minutes</li>
              <li><span className="check-dot"><Check size={13} /></span> Talk directly to providers, first-come-first-served</li>
              <li><span className="check-dot"><Check size={13} /></span> Free for homeowners and providers at launch</li>
            </ul>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-amber">
                Get started <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
            </div>
          </div>

          <HeroVisual />
        </div>
      </div>

      <div className="feature-grid">
        <div className="card feature-card animate-in" style={{ animationDelay: "0.05s" }}>
          <div className="feature-icon"><Zap size={20} /></div>
          <h4>Fast, even for emergencies</h4>
          <p>Post a job and matching providers in your area are notified right away — no waiting on referrals.</p>
        </div>
        <div className="card feature-card animate-in" style={{ animationDelay: "0.15s" }}>
          <div className="feature-icon"><ShieldCheck size={20} /></div>
          <h4>First-come, first-served</h4>
          <p>Interested providers call you directly. You choose who to work with — no bidding wars.</p>
        </div>
        <div className="card feature-card animate-in" style={{ animationDelay: "0.25s" }}>
          <div className="feature-icon"><Star size={20} /></div>
          <h4>Rate after every job</h4>
          <p>Every completed job gets a rating, building a track record for reliable providers over time.</p>
        </div>
      </div>
    </div>
  );
}
