import { Link } from "react-router-dom";

// Brand mark: two interlocking rings, echoing "link" in aikilink — one ring for the
// homeowner side, one for the provider side, overlapping where the platform connects
// them. Rotated around each ring's own center for a clean diagonal interlock.
export default function Logo({ size = 32, mono = false, withText = true, to = "/" }) {
  const teal = mono ? "currentColor" : "var(--teal, #1d382f)";
  const amber = mono ? "currentColor" : "var(--amber, #f59e0b)";

  const content = (
    <div className="inline-flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="6"
          y="10"
          width="20"
          height="13"
          rx="6.5"
          transform="rotate(-20 16 16.5)"
          stroke={teal}
          strokeWidth="4"
        />
        <rect
          x="14"
          y="17"
          width="20"
          height="13"
          rx="6.5"
          transform="rotate(-20 24 23.5)"
          stroke={amber}
          strokeWidth="4"
        />
      </svg>

      {withText && (
        <span className="font-brand text-xl font-extrabold tracking-tight text-ink">
          aiki<span className="text-amber-500">link.</span>
        </span>
      )}
    </div>
  );

  return to ? (
    <Link to={to} className="btn-press inline-flex items-center">
      {content}
    </Link>
  ) : (
    content
  );
}