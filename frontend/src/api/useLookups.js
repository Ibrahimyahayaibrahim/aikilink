import { useEffect, useState } from "react";
import { api } from "./client";

// Fetches the fixed Category lookup list once and shares it across forms.
// Locations are now handled client-side via nigerianLocations.js.
export function useLookups() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const cats = await api.get("/categories");
        if (!cancelled) {
          setCategories(cats || []);
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

  return { 
    categories, 
    areas: [], // Empty fallback for backward compatibility
    loading, 
    error 
  };
}