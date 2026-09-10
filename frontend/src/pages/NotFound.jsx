import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  const { isAuthenticated, user } = useAuth();

  const homeLink = !isAuthenticated
    ? "/"
    : user?.role === "provider"
      ? "/provider"
      : "/homeowner";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-pine-50 text-pine">
          <Compass className="h-8 w-8 animate-pulse" />
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          404 Error
        </span>
        <h1 className="mt-3 text-2xl font-extrabold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-mist">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            to={homeLink}
            className="btn-press inline-flex items-center gap-2 rounded-2xl bg-pine px-5 py-2.5 text-sm font-bold text-cream shadow-sm hover:bg-pine-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {isAuthenticated ? "Back to Dashboard" : "Return to Home"}
          </Link>
        </div>
      </div>
    </main>
  );
}