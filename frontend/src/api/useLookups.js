import { useEffect, useState } from "react";
import { api } from "./client";

// Fetches the fixed Category/Area lookup lists once (Section 1.5 — these are
// predefined, not user-entered) and shares them across whichever form needs them.
export function useLookups() {
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, ars] = await Promise.all([api.get("/categories"), api.get("/areas")]);
        if (!cancelled) {
          setCategories(cats);
          setAreas(ars);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { categories, areas, loading, error };
}
