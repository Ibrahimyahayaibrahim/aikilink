export default function SkeletonList({ count = 3 }) {
  return (
    <div className="stack">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-card" style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
  );
}
