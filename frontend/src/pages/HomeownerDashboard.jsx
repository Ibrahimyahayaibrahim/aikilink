import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import JobCard from "../components/JobCard";
import SkeletonList from "../components/Skeleton";

export default function HomeownerDashboard() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.get("/jobs/mine", token);
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

  return (
    <div className="app-main">
      <h2 style={{ marginBottom: 20 }}>My jobs</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <SkeletonList count={3} />
      ) : jobs.length === 0 ? (
        <div className="empty-state card">
          <Inbox size={30} className="muted" style={{ marginBottom: 10 }} />
          <h3>No jobs posted yet</h3>
          <p style={{ marginBottom: 16 }}>When you need a local artisan, post a job and matching providers will see it right away.</p>
          <Link to="/homeowner/post" className="btn btn-primary">Post your first job</Link>
        </div>
      ) : (
        <div className="stack">
          {jobs.map((job, i) => (
            <div key={job._id} className="animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <JobCard job={job} linkTo={`/homeowner/jobs/${job._id}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
