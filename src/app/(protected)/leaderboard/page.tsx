"use client";

import { useEffect, useRef, useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth/context";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Pusher from "pusher-js";

type TopScoresResponse = {
  topScores: Array<{ username: string; score: number; timestamp: string }>;
  count: number;
};

export default function LeaderboardPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/dev";
  const url = `${API_BASE_URL}/api/leaderboard/top/90`;

  const [data, setData] = useState<TopScoresResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Score submission state
  const { idToken } = useAuth();
  const [scoreInput, setScoreInput] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState<boolean>(true);

  // Simple toast notifications
  const [toasts, setToasts] = useState<Array<{ id: number; message: string }>>([]);
  const toastIdRef = useRef(0);
  const addToast = (message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message }].slice(-4));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const fetchOnce = async () => {
    try {
      setError(null);
      const res = await fetch(url, { method: "GET" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || `${res.status} ${res.statusText}`);
      }
      setData(json as TopScoresResponse);
      setLastUpdated(Date.now());
    } catch (e: any) {
      setError(e?.message || "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchOnce();
    timerRef.current = setInterval(fetchOnce, 2000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [url]);

  // Pusher realtime updates: subscribe to 'leaderboard' channel for events
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) {
      console.warn("Pusher env not set: NEXT_PUBLIC_PUSHER_KEY / NEXT_PUBLIC_PUSHER_CLUSTER");
      return;
    }

    const pusher = new Pusher(key, { cluster });
    const channel = pusher.subscribe("leaderboard");

    // When any score is submitted, backend sends updated leaderboard in payload.response
    const onScoreSubmitted = (payload: any) => {
      const resp = payload?.response;
      if (resp?.topScores) {
        setData(resp);
        setLastUpdated(Date.now());
        addToast("Leaderboard updated");
      }
    };

    // When someone posts >= 1000
    const onThousandPosted = (payload: any) => {
      const u = payload?.username ?? "Someone";
      const s = payload?.score ?? 1000;
      addToast(`🎉 ${u} hit ${s.toLocaleString()}!`);
    };

    channel.bind("score-submitted", onScoreSubmitted);
    channel.bind("1000 posted", onThousandPosted);

    return () => {
      channel.unbind("score-submitted", onScoreSubmitted);
      channel.unbind("1000 posted", onThousandPosted);
      pusher.unsubscribe("leaderboard");
      pusher.disconnect();
    };
  }, []);

  // Check can-submit status when authenticated
  useEffect(() => {
    let active = true;
    const check = async () => {
      if (!idToken) return;
      try {
        const res = await api.canSubmit(idToken);
        if (active) setCanSubmit(!!res?.canSubmit);
      } catch (_) {
        if (active) setCanSubmit(true);
      }
    };
    check();
    return () => { active = false; };
  }, [idToken]);

  const handleSubmit = async () => {
    if (!idToken) {
      setSubmitError("You must be signed in to submit a score.");
      return;
    }
    const parsed = parseInt(scoreInput, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setSubmitError("Enter a valid positive number.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      await api.submitScore(parsed, idToken);
      setSubmitSuccess("Score submitted successfully.");
      setScoreInput("");
      // Update can-submit state after submission
      try {
        const res = await api.canSubmit(idToken);
        setCanSubmit(!!res?.canSubmit);
      } catch (_) {}
      // Refresh leaderboard immediately
      await fetchOnce();
    } catch (e: any) {
      setSubmitError(e?.message || "Failed to submit score");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
  <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Leaderboard</h1>
        {/* Minimal score submission form */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-end gap-3">
          <div className="w-full sm:w-64">
            <label className="block text-sm mb-1">Score</label>
            <Input
              type="number"
              placeholder="Enter score"
              value={scoreInput}
              onChange={(e) => setScoreInput(e.target.value)}
              min={1}
            />
          </div>
          <Button onClick={handleSubmit} disabled={submitting || !canSubmit}>
            {submitting ? "Submitting..." : canSubmit ? "Submit Score" : "Already Submitted"}
          </Button>
          {submitError && <span className="text-sm text-destructive">{submitError}</span>}
          {submitSuccess && <span className="text-sm text-green-600">{submitSuccess}</span>}
        </div>
        {error && (
          <p className="text-sm text-destructive mb-3">{error}</p>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-4">#</th>
                <th className="py-2 pr-4">Username</th>
                <th className="py-2 pr-4">Score</th>
                <th className="py-2 pr-4">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data && data.topScores && data.topScores.length > 0 ? (
                data.topScores.map((row, idx) => (
                  <tr key={`${row.username}-${row.timestamp}`} className="border-b last:border-0">
                    <td className="py-2 pr-4">{idx + 1}</td>
                    <td className="py-2 pr-4">{row.username}</td>
                    <td className="py-2 pr-4">{row.score.toLocaleString()}</td>
                    <td className="py-2 pr-4">{new Date(row.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-muted-foreground">{loading ? "Loading..." : "No scores yet"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Lightweight toast notifications */}
        {toasts.length > 0 && (
          <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded px-3 py-2 shadow">
                <span className="text-sm">{t.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
