"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

export interface LeaderboardEntry {
  username: string;
  score: number;
  timestamp: string;
}

interface UseLeaderboardPollingOptions {
  limit?: number;
  intervalMs?: number;
}

interface UseLeaderboardPollingReturn {
  data: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
}

export function useLeaderboardPolling(
  { limit = 10, intervalMs = 2000 }: UseLeaderboardPollingOptions = {}
): UseLeaderboardPollingReturn {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchOnce = useCallback(async () => {
    try {
      const res = await api.getTopScores(limit);
      if (mountedRef.current) {
        setData(res.topScores || []);
        setError(null);
        setLastUpdated(Date.now());
      }
    } catch (e: any) {
      if (mountedRef.current) {
        setError(e?.message || "Failed to fetch leaderboard");
      }
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    mountedRef.current = true;
    // initial fetch
    setIsLoading(true);
    fetchOnce();

    // start interval
    timerRef.current = setInterval(fetchOnce, intervalMs);

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [fetchOnce, intervalMs]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchOnce,
  };
}
