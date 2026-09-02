import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await login({ phone, password });
      navigate(user.role === "provider" ? "/provider" : "/homeowner");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-main" style={{ maxWidth: 420 }}>
      <div className="card">
        <h2 style={{ marginBottom: 4 }}>Welcome back</h2>
        <p className="muted" style={{ marginBottom: 20 }}>Log in to your aikilink account.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              className="input"
              type="tel"
              placeholder="08031234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 16, fontSize: "0.88rem" }}>
          New here? <Link to="/register" style={{ color: "var(--teal)", fontWeight: 600 }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
