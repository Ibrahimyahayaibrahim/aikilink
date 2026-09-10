import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled render error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-cream px-4">
          <div className="w-full max-w-md rounded-3xl border border-line bg-card p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="text-xl font-extrabold text-ink">Something went wrong</h1>
            <p className="mt-2 text-sm text-mist">
              An unexpected error occurred while rendering this page.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <pre className="mt-4 max-h-32 overflow-auto rounded-xl bg-pine-50 p-3 text-left text-xs text-rose-700">
                {this.state.error.toString()}
              </pre>
            )}

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                onClick={() => window.location.reload()}
                className="btn-press flex flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-card py-2.5 text-sm font-bold text-pine hover:border-pine/40"
              >
                <RotateCcw className="h-4 w-4" /> Reload
              </button>
              <button
                onClick={this.handleReset}
                className="btn-press flex flex-1 items-center justify-center gap-2 rounded-2xl bg-pine py-2.5 text-sm font-bold text-cream hover:bg-pine-700"
              >
                <Home className="h-4 w-4" /> Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;