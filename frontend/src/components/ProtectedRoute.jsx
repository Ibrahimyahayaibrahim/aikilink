import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Guards a route behind authentication, and optionally a specific role. Keeps the
// redirect logic in one place rather than repeating it in every page component.
export default function ProtectedRoute({ role, children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;

  return children;
}
