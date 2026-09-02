import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLookups } from "../api/useLookups";
import { api } from "../api/client";
import Spinner from "../components/Spinner";

export default function PostJobPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { categories, areas, loading: lookupsLoading } = useLookups();

  const [categoryId, setCategoryId] = useState("");
  const [areaId, setAreaId] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [matchInfo, setMatchInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { job, matchingProviderCount } = await api.post(
        "/jobs",
        { categoryId, areaId, description, urgency },
        token
      );
      setMatchInfo(matchingProviderCount);
      setTimeout(() => navigate(`/homeowner/jobs/${job._id}`), 900);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (lookupsLoading) {
    return (
      <div className="app-main">
        <Spinner dark />
      </div>
    );
  }

  return (
    <div className="app-main" style={{ maxWidth: 520 }}>
      <h2 style={{ marginBottom: 4 }}>Post a job</h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        Describe what you need — matching providers in your area are notified right away.
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {matchInfo !== null && (
        <div className="alert alert-success">
          Job posted — {matchInfo} matching provider{matchInfo === 1 ? "" : "s"} notified.
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label htmlFor="category">Service category</label>
          <select
            id="category"
            className="select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="" disabled>Choose a category…</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="area">Area</label>
          <select id="area" className="select" value={areaId} onChange={(e) => setAreaId(e.target.value)} required>
            <option value="" disabled>Choose an area…</option>
            {areas.map((a) => (
              <option key={a._id} value={a._id}>{a.name}, {a.city}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="textarea"
            placeholder="What needs to be done?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={5}
            required
          />
        </div>

        <div className="field">
          <span
            className={`chip-checkbox ${urgency ? "checked" : ""}`}
            onClick={() => setUrgency((u) => !u)}
            role="checkbox"
            aria-checked={urgency}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setUrgency((u) => !u);
            }}
            style={{ display: "inline-block", width: "fit-content" }}
          >
            {urgency ? "✓ " : ""}Mark as emergency / urgent
          </span>
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
          {submitting ? "Posting…" : <>Post job <Send size={16} /></>}
        </button>
      </form>
    </div>
  );
}
