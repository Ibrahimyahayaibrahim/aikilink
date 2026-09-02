// Brand mark: two interlocking rings, echoing "link" in aikilink — one ring for the
// homeowner side, one for the provider side, overlapping where the platform connects
// them. Rotated around each ring's own center for a clean diagonal interlock.
export default function Logo({ size = 32, mono = false }) {
  const teal = mono ? "currentColor" : "var(--teal)";
  const amber = mono ? "currentColor" : "var(--amber)";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="6" y="10" width="20" height="13" rx="6.5" transform="rotate(-20 16 16.5)" stroke={teal} strokeWidth="4" />
      <rect x="14" y="17" width="20" height="13" rx="6.5" transform="rotate(-20 24 23.5)" stroke={amber} strokeWidth="4" />
    </svg>
  );
}
