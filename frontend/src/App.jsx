import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import HomeownerDashboard from "./pages/HomeownerDashboard";
import PostJobPage from "./pages/PostJobPage";
import JobDetailHomeowner from "./pages/JobDetailHomeowner";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderMyWork from "./pages/ProviderMyWork";
import ProviderProfilePage from "./pages/ProviderProfilePage";
import JobDetailProvider from "./pages/JobDetailProvider";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="app-shell">
              <NavBar />

              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Homeowner Routes */}
                <Route
                  path="/homeowner"
                  element={
                    <ProtectedRoute role="homeowner">
                      <HomeownerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/homeowner/post"
                  element={
                    <ProtectedRoute role="homeowner">
                      <PostJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/homeowner/jobs/:id"
                  element={
                    <ProtectedRoute role="homeowner">
                      <JobDetailHomeowner />
                    </ProtectedRoute>
                  }
                />

                {/* Provider / Artisan Routes */}
                <Route
                  path="/provider"
                  element={
                    <ProtectedRoute role="provider">
                      <ProviderDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/work"
                  element={
                    <ProtectedRoute role="provider">
                      <ProviderMyWork />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/profile"
                  element={
                    <ProtectedRoute role="provider">
                      <ProviderProfilePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/provider/jobs/:id"
                  element={
                    <ProtectedRoute role="provider">
                      <JobDetailProvider />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </div>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}