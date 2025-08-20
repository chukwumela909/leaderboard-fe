"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, X, Trophy, UserPlus, Zap, AlertCircle, RefreshCw } from "lucide-react";
import { WebSocketNotification } from "@/hooks/useWebSocket";

interface NotificationsProps {
  notifications: WebSocketNotification[];
  isConnected: boolean;
  connectedClients: number;
  connectionError: string | null;
  onClear: () => void;
  onReconnect: () => void;
}

function getNotificationIcon(type: WebSocketNotification['type']) {
  switch (type) {
    case 'HIGH_SCORE':
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    case 'NEW_PLAYER':
      return <UserPlus className="h-4 w-4 text-blue-500" />;
    case 'GAME_EVENT':
      return <Zap className="h-4 w-4 text-green-500" />;
    case 'TEST':
      return <Bell className="h-4 w-4 text-purple-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

function getNotificationStyle(type: WebSocketNotification['type']) {
  switch (type) {
    case 'HIGH_SCORE':
      return "border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
    case 'NEW_PLAYER':
      return "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20";
    case 'GAME_EVENT':
      return "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20";
    case 'TEST':
      return "border-l-4 border-l-purple-500 bg-purple-50 dark:bg-purple-950/20";
    default:
      return "border-l-4 border-l-muted bg-muted/20";
  }
}

export function Notifications({ notifications, isConnected, connectedClients, connectionError, onClear, onReconnect }: NotificationsProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Live Notifications
            {notifications.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {notifications.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              {connectedClients > 0 && (
                <span>• {connectedClients} online</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {/* Connection Error */}
          {connectionError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive font-medium">Connection Error</span>
                </div>
                <Button variant="outline" size="sm" onClick={onReconnect}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              </div>
              <p className="text-xs text-destructive mt-1">{connectionError}</p>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground">
                {isConnected 
                  ? "Live updates will appear here when players achieve high scores"
                  : "Connect to WebSocket to receive live updates"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Recent activity from the leaderboard
                </p>
                <Button variant="ghost" size="sm" onClick={onClear}>
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div
                    key={`${notification.timestamp}-${index}`}
                    className={`p-3 rounded-lg transition-all duration-200 ${getNotificationStyle(notification.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium break-words">
                          {notification.message}
                        </p>
                        {notification.score && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Score: {notification.score.toLocaleString()} points
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {notification.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}