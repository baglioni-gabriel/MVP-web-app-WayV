"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import Spinner from "@/components/ui/Spinner";

interface AuthGuardProps {
  children: React.ReactNode;
  /** If specified, only users with one of these roles can access the route */
  allowedRoles?: ("Traveler" | "Business" | "Admin")[];
  /** Where to redirect unauthenticated users (default: /login) */
  fallbackUrl?: string;
}

/**
 * Wraps content that requires authentication.
 * Redirects to /login if the user is not signed in.
 * Optionally restricts access to specific roles.
 */
export default function AuthGuard({
  children,
  allowedRoles,
  fallbackUrl = "/login",
}: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Still resolving auth state

    if (!user) {
      router.replace(fallbackUrl);
      return;
    }

    // If role restriction is specified and profile is loaded
    if (allowedRoles && profile) {
      if (!allowedRoles.includes(profile.role)) {
        // Redirect non-authorized roles to feed
        router.replace("/feed");
      }
    }
  }, [user, profile, loading, allowedRoles, fallbackUrl, router]);

  // Show loading spinner while auth state is being resolved
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-text-muted animate-pulse">Loading…</p>
        </div>
      </div>
    );
  }

  // Not signed in → show nothing (redirect is happening)
  if (!user) {
    return null;
  }

  // Role check: still waiting for profile
  if (allowedRoles && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Role check: unauthorized role → show nothing (redirect is happening)
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return null;
  }

  return <>{children}</>;
}
