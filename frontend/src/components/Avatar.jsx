// No real photo-upload pipeline exists yet (see backend README — deliberately out of
// MVP scope), so this renders an initials avatar instead, in the style of Slack/Gmail —
// a deterministic colour per name so the same person always gets the same colour.
const PALETTE = ["#0E5C56", "#B9750F", "#3E7D52", "#8B4A9C", "#B23A34", "#2C6A9B"];

function colourFor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFor(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ name, size = 36, online = false }) {
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      <span
        className="avatar-circle"
        style={{ background: colourFor(name), fontSize: size * 0.4 }}
      >
        {initialsFor(name)}
      </span>
      {online && <span className="avatar-dot" />}
    </span>
  );
}
