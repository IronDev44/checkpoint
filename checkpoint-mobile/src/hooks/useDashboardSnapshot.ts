import { useEffect, useState } from "react";

import { getDashboardSnapshot } from "../services/firestore/dashboardService";
import type { DashboardSnapshot } from "../types/checkpoint";

export function useDashboardSnapshot() {
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        const snapshot = await getDashboardSnapshot();
        if (mounted) {
          setData(snapshot);
          setError(null);
        }
      } catch {
        if (mounted) {
          setError("Impossible de charger Firestore pour le moment.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
