export interface UserSession {
  userId: string;
  email: string;
  username: string;
}

// Server-side auth check - will always redirect to client-side auth
export async function getCurrentUser(): Promise<UserSession | null> {
  // Server-side auth checking is handled by client-side context
  // This ensures we redirect to client-side auth flow
  return null;
}

