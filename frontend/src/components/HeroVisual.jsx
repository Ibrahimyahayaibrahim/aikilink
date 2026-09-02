import { useRef, useState } from "react";
import { Zap, Star, PhoneCall } from "lucide-react";

// A CSS-3D "stack of app screens" with pointer-reactive tilt, plus floating status
// badges. Built entirely from our own design tokens (no external images), so it's
// guaranteed to render correctly and stays on-brand rather than using generic stock art.
export default function HeroVisual() {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -14, y: px * 18 });
  };

  return (
    <div className="hero-visual" ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => { setHovering(false); setTilt({ x: 0, y: 0 }); }}
    >
      <div className="hero-visual-blob hero-visual-blob-teal" />
      <div className="hero-visual-blob hero-visual-blob-amber" />

      <div
        className={`hero-stack ${hovering ? "" : "hero-stack-idle"}`}
        style={hovering ? { transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` } : undefined}
      >
        <div className="mock-card mock-card-back">
          <div className="mock-line" style={{ width: "60%" }} />
          <div className="mock-line" style={{ width: "85%" }} />
          <div className="mock-line" style={{ width: "40%" }} />
        </div>

        <div className="mock-card mock-card-front">
          <div className="mock-card-header">
            <span className="mock-dot" style={{ background: "var(--amber)" }} />
            <span className="mock-line" style={{ width: "50%", height: 8 }} />
          </div>
          <div className="mock-line" style={{ width: "90%" }} />
          <div className="mock-line" style={{ width: "70%" }} />
          <div className="row" style={{ marginTop: 10, gap: 6 }}>
            <span className="badge badge-open">Open</span>
            <span className="badge badge-urgent">Urgent</span>
          </div>
        </div>
      </div>

      <div className="floating-badge fb-1">
        <Zap size={14} /> Electrician matched in 4 min
      </div>
      <div className="floating-badge fb-2">
        <Star size={14} style={{ color: "var(--amber)" }} /> 4.9 average rating
      </div>
      <div className="floating-badge fb-3">
        <PhoneCall size={14} /> Direct call, no middleman
      </div>
    </div>
  );
}
