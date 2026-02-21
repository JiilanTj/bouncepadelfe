"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/lib/store";

// ------------------------------------------------------------------------------
// Login Form Component (uses useSearchParams)
// ------------------------------------------------------------------------------

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientError, setClientError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirect);
    }
  }, [isAuthenticated, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear previous errors
    setClientError("");
    clearError();

    // Client-side validation
    if (!email.trim()) {
      setClientError("Email is required");
      toast.error("Email is required");
      return;
    }

    if (!password.trim()) {
      setClientError("Password is required");
      toast.error("Password is required");
      return;
    }

    const success = await login({ email, password });
    
    if (success) {
      toast.success("Login successful! Welcome back.");
      router.push(redirect);
    } else {
      toast.error(error || "Login failed. Please check your credentials.");
    }
  };

  // Display error from store or client
  const displayError = error || clientError;

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-center text-xl">Welcome back</CardTitle>
        <CardDescription className="text-center">
          Sign in to manage your padel business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {displayError && (
            <Alert variant="destructive" className="border-[var(--danger-border)] bg-[var(--danger-bg)]">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="owner@padel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="h-11 w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------------------
// Loading Fallback
// ------------------------------------------------------------------------------

function LoginFormSkeleton() {
  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="space-y-1 pb-6">
        <div className="mx-auto h-6 w-32 animate-pulse rounded bg-gray-200"></div>
        <div className="mx-auto h-4 w-48 animate-pulse rounded bg-gray-200"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200"></div>
            <div className="h-11 w-full animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div className="h-11 w-full animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="h-11 w-full animate-pulse rounded bg-gray-200"></div>
        </div>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------------------
// Main Page Component
// ------------------------------------------------------------------------------

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gray-50)] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)] shadow-lg">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--gray-900)]">BouncePadel</h1>
              <p className="text-sm text-[var(--gray-500)]">Backoffice System</p>
            </div>
          </div>
        </div>

        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
