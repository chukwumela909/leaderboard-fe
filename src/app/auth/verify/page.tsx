"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { AuthGuard } from "@/components/auth-guard";

export default function VerifyPage() {
  const [email, setEmail] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { confirmEmail } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !confirmationCode) return;

    setIsLoading(true);
    setError("");

    try {
      await confirmEmail(email, confirmationCode);
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <AuthGuard requireAuth={false}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Email verified</span>
            </CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/auth/sign-in")} className="w-full">
              Continue to sign in
            </Button>
          </CardContent>
        </Card>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={false}>
      <Card>
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Enter the confirmation code sent to your email address.
          </CardDescription>
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
              <Label htmlFor="confirmationCode">Confirmation Code</Label>
              <Input 
                id="confirmationCode" 
                type="text" 
                placeholder="123456" 
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                required 
              />
              <p className="text-xs text-muted-foreground">
                Check your email for the 6-digit confirmation code.
              </p>
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify email"}
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            <Button variant="outline" className="w-full" onClick={() => router.push("/auth/sign-up")}>
              Back to sign up
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push("/auth/sign-in")}>
              Already verified? Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </AuthGuard>
  );
}