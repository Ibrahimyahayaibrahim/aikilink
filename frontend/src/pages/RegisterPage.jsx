import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Matches the wireframe from Chapter 3 (Figure 3.12): shared minimal fields, with the
// role toggle deciding what happens next — provider-specific fields (categories,
// coverage areas, ID upload) are deliberately NOT collected here, to keep registration
// itself fast; they're set up afterwards on the provider's profile page.
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", role: "homeowner" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await register(form);
      if (user.role === "provider") navigate("/provider/profile", { state: { justRegistered: true } });
      else navigate("/homeowner");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-main" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2 style={{ marginBottom: 4 }}>Create your account</h2>
        <p className="muted" style={{ marginBottom: 20 }}>Takes under two minutes.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" className="input" value={form.name} onChange={update("name")} required />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              className="input"
              type="tel"
              placeholder="08031234567"
              value={form.phone}
              onChange={update("phone")}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Email (optional)</label>
            <input id="email" className="input" type="email" value={form.email} onChange={update("email")} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={form.password}
              onChange={update("password")}
              required
            />
            <span className="hint">At least 8 characters, including a number.</span>
          </div>

          <div className="field">
            <label>I am a</label>
            <div className="row" style={{ gap: 10 }}>
              {["homeowner", "provider"].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setForm((f) => ({ ...f, role: r }))}
                  className={form.role === r ? "btn btn-primary" : "btn btn-ghost"}
                  style={{ flex: 1 }}
                >
                  {r === "homeowner" ? "Homeowner" : "Service Provider"}
                </button>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 16, fontSize: "0.88rem" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--teal)", fontWeight: 600 }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
