"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { AuthGuard } from "@/components/auth-guard";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  function handleInputChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.username) return;

    setIsLoading(true);
    setError("");

    try {
      await register(formData.email, formData.password, formData.username);
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
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
              <span>Check your email</span>
            </CardTitle>
            <CardDescription>
              We've sent a confirmation code to <strong>{formData.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Please check your email and click the confirmation link to activate your account.
                You'll then be able to sign in.
              </p>
              
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/auth/verify">Enter confirmation code</Link>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth/sign-in">Back to sign in</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={false}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Join the leaderboard. It only takes a minute.</CardDescription>
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
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="playerone" 
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput 
                id="password" 
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required 
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters with uppercase, lowercase, and numbers.
              </p>
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account? <Link className="underline" href="/auth/sign-in">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </AuthGuard>
  );
}