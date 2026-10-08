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

interface BusinessProfileProps {
  profile: UserProfile;
  isOwn: boolean;
}

export default function BusinessProfile({
  profile,
  isOwn,
}: BusinessProfileProps) {
  const { user } = useAuth();
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
        "Are you sure you want to delete this event? This cannot be undone."
      )
    ) {
      return;
    }
    setDeletingId(eventId);
    try {
      await deleteEvent(eventId, profile.uid);
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch {
      alert("Failed to delete event. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Cover / Illustrative Photo */}
      <div className="relative w-full aspect-[3/1] rounded-[var(--radius-lg)] overflow-hidden bg-gradient-to-br from-navy via-navy-dark to-surface-dark">
        {profile.illustrativePhoto && (
          <Image
            src={profile.illustrativePhoto}
            alt={profile.establishmentName || profile.displayName}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Overlaid info */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
          <Avatar
            src={profile.profilePicture}
            alt={profile.displayName}
            size="xl"
            className="ring-4 ring-surface-dark"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">
              {profile.establishmentName || profile.displayName}
            </h1>
            <p className="text-sm text-white/70 truncate">
              by {profile.displayName}
            </p>
          </div>
          <Badge variant="gold">Business</Badge>
        </div>
      </div>

      {/* Bio + Stats + Edit */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {profile.bio && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {profile.bio}
              </p>
            )}
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-xl font-bold text-text-primary">
                  {profile.eventCount}
                </p>
                <p className="text-xs text-text-muted">Events</p>
              </div>
            </div>
          </div>
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
      </div>

      {/* Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            {isOwn ? "My Events" : "Events"}
          </h2>
          {isOwn && (
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
                New Event
              </Button>
            </Link>
          )}
        </div>

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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-sm text-text-muted">
              {isOwn
                ? "You haven't created any events yet."
                : "No events posted yet."}
            </p>
            {isOwn && (
              <Link href="/event/create" className="mt-3 inline-block">
                <Button variant="outline" size="sm">
                  Create Your First Event
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

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                      {event.likeCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                      </svg>
                      {event.commentCount}
                    </span>
                    {event.avgRating > 0 && (
                      <span className="flex items-center gap-1 text-gold font-medium">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="text-gold"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {event.avgRating.toFixed(1)}
                      </span>
                    )}
                    <span className="ml-auto">
                      {event.createdAt && timeAgo(event.createdAt)}
                    </span>
                  </div>

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
    </div>
  );
}
