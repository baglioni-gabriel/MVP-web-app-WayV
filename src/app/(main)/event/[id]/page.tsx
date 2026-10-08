"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { getEvent, deleteEvent } from "@/lib/firebase/firestore";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Avatar from "@/components/ui/Avatar";
import type { WayvEvent } from "@/lib/types/event";
import {
  getStatusLabel,
  formatOperatingHours,
} from "@/lib/utils/operatingHours";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { user } = useAuth();

  const [event, setEvent] = useState<WayvEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  const isOwner = user?.uid === event?.authorId;

  useEffect(() => {
    async function load() {
      try {
        const result = await getEvent(eventId);
        if (result) {
          setEvent(result);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  async function handleDelete() {
    if (!event) return;
    if (
      !confirm(
        "Are you sure you want to delete this event? This cannot be undone."
      )
    )
      return;

    setDeleting(true);
    try {
      await deleteEvent(event.id, event.authorId);
      router.push("/feed");
    } catch {
      alert("Failed to delete. Please try again.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound || !event) {
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
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
        <h1 className="text-xl font-bold text-text-primary">
          Event Not Found
        </h1>
        <p className="text-sm text-text-muted">
          This event doesn&apos;t exist or may have been removed.
        </p>
        <Link href="/feed">
          <Button variant="outline" size="md">
            Back to Feed
          </Button>
        </Link>
      </div>
    );
  }

  const startDate = event.startDateTime?.toDate();
  const endDate = event.endDateTime?.toDate();
  const status = getStatusLabel(
    event.operatingHours,
    event.unavailableDays
  );

  const authorRoleLabel =
    event.authorRole === "Business" ? "🏢 Estabelecimento" : "🌍 Viajante";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6">
      {/* Photo gallery */}
      {event.photos.length > 0 && (
        <div className="space-y-2">
          <div className="relative w-full aspect-[16/9] rounded-[var(--radius-lg)] overflow-hidden bg-surface-dark">
            <Image
              src={event.photos[activePhoto]}
              alt={event.title}
              fill
              className="object-cover"
            />
            {event.isPerennial && (
              <div className="absolute top-3 left-3">
                <Badge variant="gold">Perennial</Badge>
              </div>
            )}
            <div className="absolute top-3 right-3 flex gap-1.5">
              <Badge variant="navy">{event.category}</Badge>
            </div>
            {/* Operating status */}
            <div className="absolute bottom-3 left-3">
              <Badge variant={status.isOpen ? "success" : "danger"}>
                {status.label}
              </Badge>
            </div>
          </div>

          {event.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {event.photos.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActivePhoto(i)}
                  className={`relative h-16 w-16 rounded-[var(--radius-sm)] overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    activePhoto === i
                      ? "border-gold"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Thumbnail ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Title + Author */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-text-primary">{event.title}</h1>

        <div className="flex items-center gap-3">
          <Link
            href={`/profile/${event.authorId}`}
            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Avatar src={null} alt={event.authorName} size="sm" />
            <div>
              <p className="text-sm font-medium text-text-primary">
                {event.authorName}
              </p>
            </div>
          </Link>
          <Badge
            variant={
              event.authorRole === "Business" ? "gold" : "navy"
            }
          >
            {authorRoleLabel}
          </Badge>
        </div>
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div className="flex items-center gap-2">
          <Link href={`/event/${event.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
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
              Edit Event
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={deleting}
          >
            Delete
          </Button>
        </div>
      )}

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Location */}
        <div className="glass rounded-[var(--radius-md)] p-4 space-y-1">
          <div className="flex items-center gap-2 text-gold">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider">
              Location
            </span>
          </div>
          <p className="text-sm text-text-primary">
            {event.location.address}
          </p>
          {event.location.lat !== 0 && (
            <p className="text-xs text-text-muted">
              {event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}
            </p>
          )}
        </div>

        {/* Date/Time */}
        <div className="glass rounded-[var(--radius-md)] p-4 space-y-1">
          <div className="flex items-center gap-2 text-gold">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider">
              Date &amp; Time
            </span>
          </div>
          {startDate && (
            <p className="text-sm text-text-primary">
              Starts:{" "}
              {startDate.toLocaleDateString("pt-BR", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          {endDate ? (
            <p className="text-sm text-text-primary">
              Ends:{" "}
              {endDate.toLocaleDateString("pt-BR", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          ) : (
            <p className="text-sm text-gold font-medium">
              Ongoing (Perennial)
            </p>
          )}
        </div>
      </div>

      {/* Operating Hours (structured display) */}
      {Array.isArray(event.operatingHours) &&
        event.operatingHours.length > 0 && (
          <div className="glass rounded-[var(--radius-md)] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gold">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span className="text-xs font-medium uppercase tracking-wider">
                  Operating Hours
                </span>
              </div>
              <Badge variant={status.isOpen ? "success" : "danger"}>
                {status.label}
              </Badge>
            </div>
            <div className="space-y-1">
              {event.operatingHours.map((entry) => (
                <div
                  key={entry.day}
                  className={`flex items-center justify-between py-1 ${
                    !entry.enabled ? "opacity-40" : ""
                  }`}
                >
                  <span className="text-sm font-medium text-text-primary w-10">
                    {entry.day}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {entry.enabled
                      ? `${entry.open} – ${entry.close}`
                      : "Fechado"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Legacy operating hours (string format) */}
      {typeof event.operatingHours === "string" &&
        event.operatingHours && (
          <div className="glass rounded-[var(--radius-md)] p-4 space-y-1">
            <div className="flex items-center gap-2 text-gold">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className="text-xs font-medium uppercase tracking-wider">
                Operating Hours
              </span>
            </div>
            <p className="text-sm text-text-primary">
              {event.operatingHours as unknown as string}
            </p>
          </div>
        )}

      {/* Unavailable Days */}
      {event.unavailableDays.length > 0 && (
        <div className="glass rounded-[var(--radius-md)] p-4 space-y-2">
          <div className="flex items-center gap-2 text-danger">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <span className="text-xs font-medium uppercase tracking-wider">
              Unavailable Days
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {event.unavailableDays.map((day) => (
              <span
                key={day}
                className="px-2 py-1 bg-danger/10 text-danger text-xs rounded-full font-medium"
              >
                {day}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {event.description && (
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-text-primary">
            About this experience
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
        <span className="flex items-center gap-1.5 text-sm text-text-muted">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
          {event.likeCount} likes
        </span>
        <span className="flex items-center gap-1.5 text-sm text-text-muted">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {event.commentCount} comments
        </span>
        <span className="flex items-center gap-1.5 text-sm text-gold font-medium">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-gold"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {event.avgRating > 0 ? event.avgRating.toFixed(1) : "—"}
        </span>
      </div>

      {/* Placeholder: Comments & Reviews sections (Phase 5) */}
      <div className="glass rounded-[var(--radius-lg)] p-8 text-center">
        <p className="text-sm text-text-muted">
          Comments and reviews will be available in a future update.
        </p>
      </div>
    </div>
  );
}
