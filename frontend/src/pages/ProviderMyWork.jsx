import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HardHat } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import RatingStars from "../components/RatingStars";
import SkeletonList from "../components/Skeleton";

function WorkCard({ job }) {
  const homeownerName = job.homeownerId?.userId?.name || "Homeowner";
  return (
    <Link to={`/provider/jobs/${job._id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div className="docket">
        <div className="row-between" style={{ marginBottom: 6 }}>
          <h4>{job.categoryId?.name} — {job.areaId?.name}, {job.areaId?.city}</h4>
          <StatusBadge status={job.status} />
        </div>
        <p className="muted" style={{ fontSize: "0.88rem" }}>For {homeownerName}</p>
      </div>
    </Link>
  );
}

// A provider's own job history — split into current work (Claimed) and past work
// (Completed). Nothing in the original job feed shows this once a job leaves the
// "matches" list, so this page fills that gap (see backend README).
export default function ProviderMyWork() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get("/jobs/assigned", token);
        if (!cancelled) setJobs(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const current = jobs.filter((j) => j.status === "Claimed");
  const past = jobs.filter((j) => j.status === "Completed");

  return (
    <div className="app-main">
      <h2 style={{ marginBottom: 20 }}>My work</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <SkeletonList count={2} />
      ) : jobs.length === 0 ? (
        <div className="empty-state card">
          <HardHat size={30} className="muted" style={{ marginBottom: 10 }} />
          <h3>No work yet</h3>
          <p>Once you claim a job from the feed, it'll show up here as current work, and move to past work once completed.</p>
        </div>
      ) : (
        <div className="stack" style={{ gap: 28 }}>
          <div>
            <h3 style={{ marginBottom: 10, fontSize: "1.05rem" }}>Current work ({current.length})</h3>
            {current.length === 0 ? (
              <p className="muted">Nothing in progress right now.</p>
            ) : (
              <div className="stack">
                {current.map((j, i) => (
                  <div key={j._id} className="animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <WorkCard job={j} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ marginBottom: 10, fontSize: "1.05rem" }}>Past work ({past.length})</h3>
            {past.length === 0 ? (
              <p className="muted">No completed jobs yet.</p>
            ) : (
              <div className="stack">
                {past.map((j, i) => (
                  <div key={j._id} className="animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <WorkCard job={j} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
