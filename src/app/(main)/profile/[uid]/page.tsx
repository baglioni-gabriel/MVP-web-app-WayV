"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUserProfile } from "@/lib/firebase/firestore";
import TravelerProfile from "@/components/profile/TravelerProfile";
import BusinessProfile from "@/components/profile/BusinessProfile";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { UserProfile } from "@/lib/types/user";

export default function ProfilePage() {
  const params = useParams();
  const uid = params.uid as string;
  const { user, profile: ownProfile, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const isOwn = user?.uid === uid;

  const fetchProfile = useCallback(async () => {
    try {
      const result = await getUserProfile(uid);
      if (result) {
        setProfile(result);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  // Wait for auth to resolve, then ALWAYS fetch from Firestore
  useEffect(() => {
    if (authLoading) return; // Don't fetch until we know auth state

    fetchProfile();
  }, [uid, authLoading, fetchProfile]);

  // Keep own profile in sync with live AuthContext updates (onSnapshot)
  useEffect(() => {
    if (isOwn && ownProfile) {
      setProfile(ownProfile);
    }
  }, [isOwn, ownProfile]);

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-sm text-text-muted animate-pulse">
            Loading profile…
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mx-auto text-text-muted"
        >
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
        <h1 className="text-xl font-bold text-text-primary">
          User Not Found
        </h1>
        <p className="text-sm text-text-muted">
          This profile doesn&apos;t exist or may have been removed.
        </p>
        <Link href="/feed">
          <Button variant="outline" size="md">
            Back to Feed
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
      {/* Render the appropriate profile view */}
      {profile.role === "Business" ? (
        <BusinessProfile profile={profile} isOwn={isOwn} />
      ) : (
        <TravelerProfile profile={profile} isOwn={isOwn} />
      )}
    </div>
  );
}
