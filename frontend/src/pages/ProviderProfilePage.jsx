import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLookups } from "../api/useLookups";
import { api } from "../api/client";
import Spinner from "../components/Spinner";

export default function ProviderProfilePage() {
  const { token } = useAuth();
  const location = useLocation();
  const { categories, areas, loading: lookupsLoading } = useLookups();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [bio, setBio] = useState("");
  const [idDocumentUrl, setIdDocumentUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState(location.state?.justRegistered ? "" : "");
  const [error, setError] = useState("");

  // Pre-fill the form with the provider's existing profile, if any — without this, the
  // form always renders blank even when the provider is revisiting to make a change.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = await api.get("/providers/me", token);
        if (!cancelled) {
          setSelectedCategories((profile.categories || []).map((c) => c._id));
          setSelectedAreas((profile.coverageAreas || []).map((a) => a._id));
          setBio(profile.bio || "");
          setIdDocumentUrl(profile.idDocumentUrl || "");
        }
      } catch (err) {
        // A brand-new provider may not have hit this before; not a real error to show.
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggle = (list, setList, id) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await api.put(
        "/providers/me",
        { categories: selectedCategories, coverageAreas: selectedAreas, bio },
        token
      );
      if (idDocumentUrl.trim()) {
        await api.post("/providers/me/id-upload", { idDocumentUrl: idDocumentUrl.trim() }, token);
      }
      setMessage("Profile saved. You'll now be matched with jobs in your selected categories and areas.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-main" style={{ maxWidth: 560 }}>
      <h2 style={{ marginBottom: 4 }}>Your provider profile</h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        Choose the service categories you offer and the areas you cover — job postings only reach you when both match.
      </p>

      {location.state?.justRegistered && (
        <div className="alert alert-success">Account created! Set up your profile below to start receiving job matches.</div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {lookupsLoading || profileLoading ? (
        <Spinner dark />
      ) : (
        <form onSubmit={handleSave} className="card stack">
          <div className="field">
            <label>Service categories</label>
            <div className="checkbox-grid">
              {categories.map((c) => (
                <span
                  key={c._id}
                  className={`chip-checkbox ${selectedCategories.includes(c._id) ? "checked" : ""}`}
                  onClick={() => toggle(selectedCategories, setSelectedCategories, c._id)}
                  role="checkbox"
                  aria-checked={selectedCategories.includes(c._id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggle(selectedCategories, setSelectedCategories, c._id);
                  }}
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Coverage areas</label>
            <div className="checkbox-grid">
              {areas.map((a) => (
                <span
                  key={a._id}
                  className={`chip-checkbox ${selectedAreas.includes(a._id) ? "checked" : ""}`}
                  onClick={() => toggle(selectedAreas, setSelectedAreas, a._id)}
                  role="checkbox"
                  aria-checked={selectedAreas.includes(a._id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggle(selectedAreas, setSelectedAreas, a._id);
                  }}
                >
                  {a.name}, {a.city}
                </span>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="bio">Bio (optional)</label>
            <textarea
              id="bio"
              className="textarea"
              placeholder="Years of experience, specialties, etc."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="idDoc">ID / certificate reference (optional)</label>
            <input
              id="idDoc"
              className="input"
              placeholder="e.g. a link to an uploaded document"
              value={idDocumentUrl}
              onChange={(e) => setIdDocumentUrl(e.target.value)}
            />
            <span className="hint">
              Self-submitted, not independently verified — this is a trust signal, not a guarantee.
            </span>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      )}
    </div>
  );
}
