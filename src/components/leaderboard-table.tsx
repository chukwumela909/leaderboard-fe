"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";

// UI display row scaffold (not API type)
interface UIEntry {
  id: string;
  rank: number;
  displayName: string;
  avatarUrl?: string;
  score: number;
  change: number; // Position change from last period
  country?: string;
  isOnline?: boolean;
}

interface LeaderboardEntry {
  username: string;
  score: number;
  timestamp: string;
}

interface LeaderboardTableProps {
  currentUsername: string;
  leaderboardData: LeaderboardEntry[];
  isRealTime?: boolean;
}

type DisplayRow = UIEntry & { timestamp: string };

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
}

function getChangeIcon(change: number) {
  if (change > 0) {
    return <TrendingUp className="h-3 w-3 text-green-500" />;
  } else if (change < 0) {
    return <TrendingDown className="h-3 w-3 text-red-500" />;
  }
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

function getChangeText(change: number) {
  if (change > 0) return `+${change}`;
  if (change < 0) return change.toString();
  return "—";
}

export function LeaderboardTable({ currentUsername, leaderboardData, isRealTime = false }: LeaderboardTableProps) {
  // Convert API data to display format
  const displayData: DisplayRow[] = leaderboardData.map((entry, index) => ({
    id: entry.username, // Use username as ID since we don't have user IDs in API response
    rank: index + 1,
    displayName: entry.username,
    score: entry.score,
    timestamp: entry.timestamp,
    change: 0, // Placeholder until we track deltas
    isOnline: isRealTime, // Treat polling/live as online indicator
  }));

  return (
    <div className="space-y-4">
      {displayData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No leaderboard data available</p>
        </div>
      ) : (
        displayData.map((entry) => {
          const isCurrentUser = entry.displayName === currentUsername; // Compare by username

        return (
          <div
            key={entry.id}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              isCurrentUser 
                ? "border-primary bg-primary/5" 
                : "border-border hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Rank */}
              <div className="w-8 flex justify-center">
                {getRankIcon(entry.rank)}
              </div>

              {/* Avatar & Name */}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.avatarUrl} alt={entry.displayName} />
                    <AvatarFallback>
                      {entry.displayName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {entry.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${isCurrentUser ? "text-primary" : ""}`}>
                      {entry.displayName}
                    </span>
                    {entry.country && (
                      <span className="text-sm">{entry.country}</span>
                    )}
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs px-2 py-0">You</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Score & Change */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-bold">
                  {entry.score.toLocaleString()}
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {getChangeIcon(entry.change)}
                  <span>{getChangeText(entry.change)}</span>
                </div>
              </div>
            </div>
            </div>
          );
        })
      )}
    </div>
  );
}