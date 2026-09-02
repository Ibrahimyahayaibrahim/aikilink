export default function RatingStars({ value = 0, size = 16, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = typeof onChange === "function";

  return (
    <span className="row" style={{ gap: 2 }} role={interactive ? "radiogroup" : undefined} aria-label="Rating">
      {stars.map((n) => (
        <span
          key={n}
          onClick={interactive ? () => onChange(n) : undefined}
          role={interactive ? "radio" : undefined}
          aria-checked={interactive ? n <= value : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={
            interactive
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") onChange(n);
                }
              : undefined
          }
          style={{
            cursor: interactive ? "pointer" : "default",
            color: n <= Math.round(value) ? "var(--amber)" : "var(--line)",
            fontSize: size,
            lineHeight: 1,
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
