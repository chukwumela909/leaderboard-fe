"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, type VerifyResponse, type UserProfileResponse } from '@/lib/api';

interface User {
  userId: string;
  email: string;
  username: string;
}

interface GameStats {
  currentScore: number;
  lastPlayed: string | null;
  rank: number | null;
  totalPlayers: number;
}

interface AuthContextType {
  user: User | null;
  gameStats: GameStats | null;
  idToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, username: string) => Promise<void>;
  confirmEmail: (email: string, confirmationCode: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEY = 'leaderboard_id_token';
const USER_STORAGE_KEY = 'leaderboard_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!idToken;

  // Load token and user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setIdToken(storedToken);
        setUser(parsedUser);
        
        // Verify token is still valid
        verifyAndRefreshAuth(storedToken);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        clearAuth();
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyAndRefreshAuth = async (token: string) => {
    try {
      // Verify token is still valid
      await api.verifyToken(token);
      
      // Get fresh user profile and game stats
      const profileData = await api.getUserProfile(token);
      setUser(profileData.user);
      setGameStats(profileData.gameStats);
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
    setGameStats(null);
    setIdToken(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.login({ email, password });
      
      // Store the idToken (as per requirement)
      const token = response.tokens.idToken;
      setIdToken(token);
      localStorage.setItem(TOKEN_STORAGE_KEY, token);

      // Get user profile with game stats
      const profileData = await api.getUserProfile(token);
      setUser(profileData.user);
      setGameStats(profileData.gameStats);
      
      // Store user data
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profileData.user));
    } catch (error) {
      clearAuth();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    await api.register({ email, password, username });
    // Note: After registration, user needs to confirm email before login
  };

  const confirmEmail = async (email: string, confirmationCode: string) => {
    await api.confirmEmail({ email, confirmationCode });
  };

  const logout = () => {
    clearAuth();
  };

  const refreshProfile = async () => {
    if (!idToken) return;
    
    try {
      const profileData = await api.getUserProfile(idToken);
      setUser(profileData.user);
      setGameStats(profileData.gameStats);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profileData.user));
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      // If refresh fails, token might be expired
      clearAuth();
    }
  };

  const value: AuthContextType = {
    user,
    gameStats,
    idToken,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    confirmEmail,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Server-side auth helper (updated to use token from localStorage)
export async function getCurrentUser() {
  // This is a client-side only check now
  // Server-side auth will be handled differently
  if (typeof window === 'undefined') {
    return null;
  }
  
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return null;
  
  try {
    const response = await api.verifyToken(token);
    return response.user;
  } catch {
    return null;
  }
}