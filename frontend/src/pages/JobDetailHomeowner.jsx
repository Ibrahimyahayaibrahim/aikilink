import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle2, RotateCcw, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import RatingStars from "../components/RatingStars";
import Avatar from "../components/Avatar";
import Spinner from "../components/Spinner";

export default function JobDetailHomeowner() {
  const { id } = useParams();
  const { token } = useAuth();

  const [job, setJob] = useState(null);
  const [interested, setInterested] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [ratingScore, setRatingScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const jobData = await api.get(`/jobs/${id}`, token);
      setJob(jobData);
      if (jobData.status === "Open") {
        const list = await api.get(`/jobs/${id}/interested`, token);
        setInterested(list);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleClaim = async (providerId) => {
    setBusy(true);
    setError("");
    try {
      await api.patch(`/jobs/${id}/claim`, { providerId }, token);
      setActionMsg("Job claimed. The other interested providers have been notified it's taken.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleReopen = async () => {
    setBusy(true);
    setError("");
    try {
      await api.patch(`/jobs/${id}/reopen`, {}, token);
      setActionMsg("Job reopened — matching providers have been notified again.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleComplete = async () => {
    setBusy(true);
    setError("");
    try {
      await api.patch(`/jobs/${id}/complete`, {}, token);
      setActionMsg("Job marked completed. Please rate your provider below.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post(`/jobs/${id}/rating`, { score: ratingScore, comment: ratingComment }, token);
      setRatingSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="app-main">
        <Spinner dark />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="app-main">
        <div className="alert alert-error">{error || "Job not found."}</div>
      </div>
    );
  }

  return (
    <div className="app-main" style={{ maxWidth: 560 }}>
      <Link to="/homeowner" className="muted" style={{ fontSize: "0.85rem" }}>&larr; Back to my jobs</Link>

      <div className="card" style={{ marginTop: 12, marginBottom: 20 }}>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <h2>{job.categoryId?.name} — {job.areaId?.name}, {job.areaId?.city}</h2>
          <StatusBadge status={job.status} />
        </div>
        {job.urgency && <span className="badge badge-urgent" style={{ marginBottom: 10 }}>Urgent</span>}
        <p style={{ marginTop: 10 }}>{job.description}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {actionMsg && <div className="alert alert-success">{actionMsg}</div>}

      {job.status === "Open" && (
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>Interested providers</h3>
          <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 14 }}>
            Providers call you directly (first-come-first-served). Match the caller to a name below, then claim.
          </p>
          {interested.length === 0 ? (
            <p className="muted">No one has expressed interest yet.</p>
          ) : (
            <div className="stack">
              {interested.map((p, i) => (
                <div
                  key={p.providerId}
                  className="row-between animate-in"
                  style={{ borderBottom: "1px solid var(--line)", paddingBottom: 10, animationDelay: `${i * 0.06}s` }}
                >
                  <div className="row" style={{ gap: 12 }}>
                    <Avatar name={p.name} size={40} />
                    <div>
                      <p style={{ fontWeight: 600 }}>{p.name}</p>
                      <p className="muted" style={{ fontSize: "0.85rem" }}>{p.phone}</p>
                      <RatingStars value={p.averageRating} size={13} />
                    </div>
                  </div>
                  <button className="btn btn-amber" disabled={busy} onClick={() => handleClaim(p.providerId)}>
                    <UserCheck size={16} /> Claim
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {job.status === "Claimed" && (
        <div className="card stack">
          <p>
            Claimed by <strong>{job.claimedBy?.userId ? job.claimedBy.userId.name : "a provider"}</strong>.
          </p>
          <div className="row">
            <button className="btn btn-primary" disabled={busy} onClick={handleComplete}>
              <CheckCircle2 size={16} /> Mark completed
            </button>
            <button className="btn btn-danger-ghost" disabled={busy} onClick={handleReopen}>
              <RotateCcw size={16} /> Reopen job
            </button>
          </div>
        </div>
      )}

      {job.status === "Completed" && !ratingSubmitted && (
        <form onSubmit={handleSubmitRating} className="card stack">
          <h3>Rate your provider</h3>
          <RatingStars value={ratingScore} onChange={setRatingScore} size={26} />
          <textarea
            className="textarea"
            placeholder="Optional comment…"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={busy || ratingScore === 0}>
            Submit rating
          </button>
        </form>
      )}

      {job.status === "Completed" && ratingSubmitted && (
        <div className="alert alert-success">Thanks — your rating has been recorded.</div>
      )}
    </div>
  );
}
