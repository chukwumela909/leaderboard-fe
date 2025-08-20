"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trophy, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { api, type TopScoreResponse } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [topScore, setTopScore] = useState<TopScoreResponse["topScore"]>(null);
  const [loadingTopScore, setLoadingTopScore] = useState(true);
  
  const { login } = useAuth();
  const router = useRouter();

  // Load top score on component mount
  useEffect(() => {
    async function fetchTopScore() {
      try {
        const response = await api.getTopScore();
        setTopScore(response.topScore);
      } catch (error) {
        console.error("Failed to fetch top score:", error);
        // Don't show error for top score, it's not critical
      } finally {
        setLoadingTopScore(false);
      }
    }

    fetchTopScore();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError("");

    try {
      await login(email, password);
      router.push("/leaderboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthGuard requireAuth={false}>
      <div className="space-y-6">
        {/* Top Score Display */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <div className="text-sm font-medium text-muted-foreground">Current Leader</div>
                {loadingTopScore ? (
                  <div className="h-6 w-32 bg-muted animate-pulse rounded"></div>
                ) : topScore ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">{topScore.username}</span>
                    <Badge variant="secondary" className="text-xs">
                      {topScore.score.toLocaleString()} points
                    </Badge>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No scores yet - be the first!</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign In Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Welcome back. Enter your details to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-destructive">{error}</span>
              </div>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
            
            <p className="mt-4 text-sm text-muted-foreground">
              Don&apos;t have an account? <Link className="underline" href="/auth/sign-up">Sign up</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}