import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { PhoneCall } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import Avatar from "../components/Avatar";
import Spinner from "../components/Spinner";

export default function JobDetailProvider() {
  const { id } = useParams();
  const { token } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await api.get(`/jobs/${id}`, token);
      setJob(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExpressInterest = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await api.post(`/jobs/${id}/interest`, {}, token);
      setContact(data.contact);
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
      <Link to="/provider" className="muted" style={{ fontSize: "0.85rem" }}>&larr; Back to job feed</Link>

      <div className="card" style={{ marginTop: 12, marginBottom: 20 }}>
        <div className="row-between" style={{ marginBottom: 10 }}>
          <h2>{job.categoryId?.name} — {job.areaId?.name}, {job.areaId?.city}</h2>
          <StatusBadge status={job.status} />
        </div>
        {job.urgency && <span className="badge badge-urgent" style={{ marginBottom: 10 }}>Urgent</span>}
        <p style={{ marginTop: 10 }}>{job.description}</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {job.status !== "Open" && !contact && (
        <div className="alert alert-error">This job is no longer open.</div>
      )}

      {job.status === "Open" && !contact && (
        <button className="btn btn-primary btn-block" disabled={busy} onClick={handleExpressInterest}>
          {busy ? "…" : <><PhoneCall size={16} /> Express interest (reveals phone number)</>}
        </button>
      )}

      {contact && (
        <div className="card animate-in">
          <h3 style={{ marginBottom: 8 }}>Contact the homeowner</h3>
          <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 14 }}>
            Call now — this is first-come-first-served. The homeowner may claim any provider who calls, not necessarily you.
          </p>
          <div className="row" style={{ gap: 14 }}>
            <Avatar name={contact.name} size={48} />
            <div>
              <p style={{ fontWeight: 700, fontSize: "1.05rem" }}>{contact.name}</p>
              <p style={{ fontSize: "1.15rem", color: "var(--teal)", fontWeight: 700 }}>
                <a href={`tel:${contact.phone}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <PhoneCall size={16} /> {contact.phone}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
