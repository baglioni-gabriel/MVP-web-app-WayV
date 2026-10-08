"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { UserProfile } from "@/lib/types/user";
import type { WayvEvent } from "@/lib/types/event";
import { getEventsByAuthor, deleteEvent } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/hooks/useAuth";
import { timeAgo } from "@/lib/utils/formatDate";

interface TravelerProfileProps {
  profile: UserProfile;
  isOwn: boolean;
}

type Tab = "posts" | "saved";

export default function TravelerProfile({
  profile,
  isOwn,
}: TravelerProfileProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [events, setEvents] = useState<WayvEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await getEventsByAuthor(profile.uid);
        setEvents(result);
      } catch {
        // silently fail — events list just stays empty
      } finally {
        setLoadingEvents(false);
      }
    }
    load();
  }, [profile.uid]);

  async function handleDelete(eventId: string) {
    if (
      !confirm(
        "Are you sure you want to delete this post? This cannot be undone."
      )
    ) {
      return;
    }
    setDeletingId(eventId);
    try {
      await deleteEvent(eventId, profile.uid);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch {
      alert("Failed to delete post. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <Avatar
          src={profile.profilePicture}
          alt={profile.displayName}
          size="xl"
        />
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary">
            {profile.displayName}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="gold">Traveler</Badge>
            {isOwn && <Badge variant="default">You</Badge>}
          </div>
        </div>
        {profile.bio && (
          <p className="text-sm text-text-secondary max-w-md leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Edit profile button (own profile) */}
        {isOwn && (
          <Link href="/profile/edit">
            <Button variant="outline" size="sm">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Profile
            </Button>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8">
        <div className="text-center">
          <p className="text-xl font-bold text-text-primary">
            {profile.eventCount}
          </p>
          <p className="text-xs text-text-muted">Posts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === "posts"
              ? "border-gold text-gold"
              : "border-transparent text-text-muted hover:text-text-primary"
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            {isOwn ? "My Posts" : "Posts"}
          </span>
        </button>
        {isOwn && (
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
              activeTab === "saved"
                ? "border-gold text-gold"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
              Saved
            </span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {isOwn && (
            <div className="flex justify-end">
              <Link href="/event/create">
                <Button variant="primary" size="sm">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  New Post
                </Button>
              </Link>
            </div>
          )}

          {loadingEvents ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : events.length === 0 ? (
            <div className="glass rounded-[var(--radius-lg)] p-8 text-center">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto text-text-muted mb-3"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <p className="text-sm text-text-muted">
                {isOwn
                  ? "You haven't posted anything yet."
                  : "No posts yet."}
              </p>
              {isOwn && (
                <Link href="/event/create" className="mt-3 inline-block">
                  <Button variant="outline" size="sm">
                    Share Your First Experience
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-[var(--radius-lg)] bg-surface-dark border border-white/5 overflow-hidden shadow-[var(--shadow-card)] transition-all duration-300 hover:border-gold/20 hover:-translate-y-0.5"
                >
                  {/* Photo */}
                  <Link href={`/event/${event.id}`}>
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-navy via-navy-dark to-surface-dark">
                      {event.photos[0] ? (
                        <Image
                          src={event.photos[0]}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-white/10"
                          >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                      {event.isPerennial && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="gold">Perennial</Badge>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="navy">{event.category}</Badge>
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-4 space-y-2">
                    <Link href={`/event/${event.id}`}>
                      <h3 className="text-sm font-bold text-text-primary line-clamp-1 hover:text-gold transition-colors">
                        {event.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-text-muted line-clamp-1">
                      {event.location.address}
                    </p>
                    {event.createdAt && (
                      <p className="text-xs text-text-muted">
                        {timeAgo(event.createdAt)}
                      </p>
                    )}

                    {/* Actions (own profile only) */}
                    {isOwn && user?.uid === event.authorId && (
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <Link
                          href={`/event/${event.id}/edit`}
                          className="flex-1"
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs"
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleDelete(event.id)}
                          isLoading={deletingId === event.id}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "saved" && isOwn && (
        <div className="glass rounded-[var(--radius-lg)] p-8 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto text-text-muted mb-3"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          <p className="text-sm text-text-muted">
            Events you save will appear here.
          </p>
          <p className="text-xs text-text-muted mt-1">
            This feature will be fully functional in a future update.
          </p>
        </div>
      )}
    </div>
  );
}
