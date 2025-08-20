"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code2, Trophy, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/context";

export function Header() {
  const { user, gameStats, isAuthenticated, logout } = useAuth();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">DevLeaderboard</span>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/leaderboard"
                className="flex items-center space-x-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </Link>
              {/* Profile nav removed */}
            </div>
          )}

          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 mr-2">
                  <span className="text-sm font-medium">{user?.username}</span>
                  {gameStats?.rank && (
                    <Badge variant="secondary" className="text-xs">
                      Rank #{gameStats.rank}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/sign-in">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}