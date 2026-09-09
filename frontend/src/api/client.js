const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Thin fetch wrapper: attaches the JWT (if present), always sends/expects JSON, and
// throws a single consistent Error shape so every caller can handle failures the same
// way rather than re-checking res.ok everywhere.
async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error("Could not reach the server. Is the backend running?");
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // non-JSON response body; leave data null
    }
  }

  if (!res.ok) {
    // NEW: Global 401 Interceptor
    // If the token is missing, expired, or invalid, log the user out instantly
    if (res.status === 401) {
      console.warn("Session expired. Redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login"; 
    }

    const message = data?.message || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  get: (path, token) => request(path, { method: "GET", token }),
  post: (path, body, token) => request(path, { method: "POST", body, token }),
  put: (path, body, token) => request(path, { method: "PUT", body, token }),
  patch: (path, body, token) => request(path, { method: "PATCH", body, token }),
};