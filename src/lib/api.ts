const API_BASE_URL = 'https://y8f728c7m3.execute-api.eu-west-1.amazonaws.com/dev/';

// API Types based on documentation
export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface RegisterResponse {
  message: string;
  userSub: string;
}

export interface ConfirmRequest {
  email: string;
  confirmationCode: string;
}

export interface ConfirmResponse {
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  tokens: {
    accessToken: string;
    refreshToken: string;
    idToken: string;
  };
  expiresIn: number;
}

export interface VerifyResponse {
  message: string;
  user: {
    userId: string;
    email: string;
    username: string;
  };
}

export interface UserProfileResponse {
  user: {
    userId: string;
    email: string;
    username: string;
  };
  gameStats: {
    currentScore: number;
    lastPlayed: string | null;
    rank: number | null;
    totalPlayers: number;
  };
}

export interface TopScoreResponse {
  topScore: {
    username: string;
    score: number;
    timestamp: string;
  } | null;
  message?: string;
}

export interface TopScoresResponse {
  topScores: Array<{
    username: string;
    score: number;
    timestamp: string;
  }>;
  count: number;
}

export interface ApiError {
  error: string;
  statusCode?: number;
  details?: any;
}

class LeaderboardAPI {
  private getHeaders(token?: string) {
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  private async parseJsonSafe<T = any>(response: Response): Promise<T | null> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    const dataJson = await this.parseJsonSafe<RegisterResponse | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Registration failed';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from register');
    return dataJson as RegisterResponse;
  }

  async confirmEmail(data: ConfirmRequest): Promise<ConfirmResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/confirm`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    const dataJson = await this.parseJsonSafe<ConfirmResponse | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Email confirmation failed';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from confirm');
    return dataJson as ConfirmResponse;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });

    const dataJson = await this.parseJsonSafe<LoginResponse | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Login failed';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from login');
    return dataJson as LoginResponse;
  }

  async verifyToken(token: string): Promise<VerifyResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: this.getHeaders(token)
    });

    const dataJson = await this.parseJsonSafe<VerifyResponse | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Token verification failed';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from verify');
    return dataJson as VerifyResponse;
  }

  async getUserProfile(token: string): Promise<UserProfileResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      method: 'GET',
      headers: this.getHeaders(token)
    });

    const data = await this.parseJsonSafe<UserProfileResponse | ApiError>(response);
    if (!response.ok) {
      const message = (data as ApiError)?.error || `${response.status} ${response.statusText}` || 'Failed to get user profile';
      throw new Error(message);
    }
    if (!data) {
      throw new Error('Empty response from profile endpoint');
    }
    return data as UserProfileResponse;
  }

  async getTopScore(): Promise<TopScoreResponse> {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/top`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const dataJson = await this.parseJsonSafe<TopScoreResponse | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Failed to get top score';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from top score');
    return dataJson as TopScoreResponse;
  }

  async getTopScores(limit: number = 10): Promise<TopScoresResponse> {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/top/${limit}`, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const dataJson = await this.parseJsonSafe<TopScoresResponse | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Failed to get top scores';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from top scores');
    return dataJson as TopScoresResponse;
  }

  async submitScore(score: number, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/scores/submit`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ score })
    });

    const dataJson = await this.parseJsonSafe<any | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Score submission failed';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from submit score');
    return dataJson;
  }

  async canSubmit(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/scores/can-submit`, {
      method: 'GET',
      headers: this.getHeaders(token)
    });

    const dataJson = await this.parseJsonSafe<any | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Failed to check submission status';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from can-submit');
    return dataJson;
  }

  async getMyScore(token: string) {
    const response = await fetch(`${API_BASE_URL}/api/scores/my-score`, {
      method: 'GET',
      headers: this.getHeaders(token)
    });

    const dataJson = await this.parseJsonSafe<any | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Failed to get personal score';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from my-score');
    return dataJson;
  }

  // WebSocket related methods
  async getWebSocketStats() {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/ws/stats`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    const dataJson = await this.parseJsonSafe<any | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Failed to get WebSocket stats';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from ws stats');
    return dataJson;
  }

  async sendTestNotification(message: string, type: string = 'TEST') {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/ws/test-notification`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ message, type })
    });
    const dataJson = await this.parseJsonSafe<any | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Failed to send test notification';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from test notification');
    return dataJson;
  }

  async broadcastLeaderboardUpdate() {
    const response = await fetch(`${API_BASE_URL}/api/leaderboard/ws/broadcast-leaderboard`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    const dataJson = await this.parseJsonSafe<any | ApiError>(response);
    if (!response.ok) {
      const message = (dataJson as ApiError)?.error || `${response.status} ${response.statusText}` || 'Failed to broadcast leaderboard update';
      throw new Error(message);
    }
    if (!dataJson) throw new Error('Empty response from broadcast leaderboard');
    return dataJson;
  }
}

export const api = new LeaderboardAPI();