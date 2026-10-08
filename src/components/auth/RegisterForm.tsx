"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { UserRole } from "@/lib/types/user";

export default function RegisterForm() {
  const router = useRouter();
  const { user, signUp, signInWithGoogle, profile } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("Traveler");
  const [establishmentName, setEstablishmentName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Redirect once auth + profile are both resolved ──
  useEffect(() => {
    if (user && profile) {
      switch (profile.role) {
        case "Business":
          router.push("/feed");
          break;
        default:
          router.push("/feed");
      }
    }
  }, [user, profile, router]);

  // ── Email / Password Sign Up ──
  async function handleEmailSignUp(e: FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!displayName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (role === "Business" && !establishmentName.trim()) {
      setError("Please enter your establishment name.");
      return;
    }

    setLoading(true);

    try {
      await signUp(
        email,
        password,
        displayName.trim(),
        role,
        role === "Business" ? establishmentName.trim() : undefined
      );
      // Redirect is handled by useEffect when profile loads
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      switch (firebaseError.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists. Try signing in instead.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/weak-password":
          setError("Password is too weak. Use at least 6 characters.");
          break;
        default:
          setError(firebaseError.message || "An error occurred. Please try again.");
      }
      setLoading(false);
    }
  }

  // ── Google Sign Up ──
  async function handleGoogleSignUp() {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle(role);
      // Redirect is handled by useEffect when profile loads
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code !== "auth/popup-closed-by-user") {
        setError(firebaseError.message || "Google sign-up failed. Please try again.");
      }
      setGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center lg:text-left">
        <h2 className="text-2xl font-bold text-text-primary">Create your account</h2>
        <p className="text-sm text-text-secondary">
          Join Wayv and start discovering local experiences
        </p>
      </div>

      <div className="space-y-5">
        {/* Google Auth */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[var(--radius-md)] bg-white/5 border border-white/10 text-sm font-medium text-text-primary hover:bg-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <svg className="h-5 w-5 animate-spin text-gold" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-text-muted">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] bg-danger/10 border border-danger/20 animate-fade-in">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-danger flex-shrink-0">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* Role Selector (placed before the form so Google sign-ups also use the selected role) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">
            I am a…
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("Traveler")}
              className={`flex flex-col items-center gap-2 p-4 rounded-[var(--radius-md)] border-2 transition-all duration-200 ${
                role === "Traveler"
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/10 bg-white/5 text-text-secondary hover:border-gold/30 hover:text-gold hover:bg-gold/5"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-sm font-semibold">Traveler</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("Business")}
              className={`flex flex-col items-center gap-2 p-4 rounded-[var(--radius-md)] border-2 transition-all duration-200 ${
                role === "Business"
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/10 bg-white/5 text-text-secondary hover:border-gold/30 hover:text-gold hover:bg-gold/5"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <path d="M9 22V12h6v10" />
              </svg>
              <span className="text-sm font-semibold">Business</span>
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Maria Silva"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />

          {/* Business-only: Establishment Name */}
          {role === "Business" && (
            <div className="animate-fade-in">
              <Input
                label="Establishment Name"
                type="text"
                placeholder="Café do Centro"
                value={establishmentName}
                onChange={(e) => setEstablishmentName(e.target.value)}
                required
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <path d="M9 22V12h6v10" />
                  </svg>
                }
              />
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
            }
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
          />

          <p className="text-xs text-text-muted">
            Password must be at least 6 characters.
          </p>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
            disabled={loading || googleLoading}
          >
            Create Account
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:text-gold-light font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
