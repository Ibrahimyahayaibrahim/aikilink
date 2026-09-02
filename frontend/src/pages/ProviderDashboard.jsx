import { useEffect, useState, useCallback } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLookups } from "../api/useLookups";
import { api } from "../api/client";
import JobCard from "../components/JobCard";
import SkeletonList from "../components/Skeleton";

export default function ProviderDashboard() {
  const { token } = useAuth();
  const { categories, areas } = useLookups();

  const [tab, setTab] = useState("matches"); // "matches" | "browse"
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterArea, setFilterArea] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (tab === "matches") {
        const data = await api.get("/jobs/matches", token);
        setJobs(data);
      } else {
        const params = new URLSearchParams();
        if (filterCategory) params.set("category", filterCategory);
        if (filterArea) params.set("area", filterArea);
        const qs = params.toString() ? `?${params.toString()}` : "";
        const data = await api.get(`/jobs${qs}`, token);
        setJobs(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, filterCategory, filterArea, token]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="app-main">
      <h2 style={{ marginBottom: 4 }}>Job feed</h2>
      <p className="muted" style={{ marginBottom: 16 }}>
        "Matched for you" is filtered automatically from your profile. "Browse all" lets you search everything.
      </p>

      <div className="row" style={{ marginBottom: 18 }}>
        <button
          className={tab === "matches" ? "btn btn-primary" : "btn btn-ghost"}
          onClick={() => setTab("matches")}
        >
          Matched for you
        </button>
        <button className={tab === "browse" ? "btn btn-primary" : "btn btn-ghost"} onClick={() => setTab("browse")}>
          Browse all
        </button>
      </div>

      {tab === "browse" && (
        <div className="row" style={{ marginBottom: 18, flexWrap: "wrap" }}>
          <select className="select" style={{ width: "auto" }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          <select className="select" style={{ width: "auto" }} value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
            <option value="">All areas</option>
            {areas.map((a) => (
              <option key={a._id} value={a._id}>{a.name}, {a.city}</option>
            ))}
          </select>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <SkeletonList count={3} />
      ) : jobs.length === 0 ? (
        <div className="empty-state card">
          <SearchIcon size={30} className="muted" style={{ marginBottom: 10 }} />
          <h3>No jobs here yet</h3>
          <p>
            {tab === "matches"
              ? "Make sure your categories and coverage areas are set on your profile."
              : "Try a different filter, or check back soon."}
          </p>
        </div>
      ) : (
        <div className="stack">
          {jobs.map((job, i) => (
            <div key={job._id} className="animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <JobCard job={job} linkTo={`/provider/jobs/${job._id}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
