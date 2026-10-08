"use client";

import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import type { WayvEvent } from "@/lib/types/event";
import { getStatusLabel } from "@/lib/utils/operatingHours";

interface EventCardProps {
  event: WayvEvent;
  /** Travel time in minutes (from Google Routes API), if available */
  travelTimeMinutes?: number;
  /** Stagger animation delay in ms */
  animationDelay?: number;
}

export default function EventCard({
  event,
  travelTimeMinutes,
  animationDelay = 0,
}: EventCardProps) {
  const status = getStatusLabel(
    event.operatingHours,
    event.unavailableDays
  );

  const authorRoleLabel =
    event.authorRole === "Business" ? "🏢 Estabelecimento" : "🌍 Viajante";

  const travelLabel = travelTimeMinutes
    ? travelTimeMinutes >= 60
      ? `${Math.floor(travelTimeMinutes / 60)}h ${travelTimeMinutes % 60}min`
      : `${travelTimeMinutes} min`
    : null;

  return (
    <Link
      href={`/event/${event.id}`}
      className="block rounded-[var(--radius-lg)] bg-surface-dark border border-white/5 overflow-hidden shadow-[var(--shadow-card)] transition-all duration-300 hover:border-gold/20 hover:shadow-[var(--shadow-glow-gold)] hover:-translate-y-1 animate-fade-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Photo */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-navy via-navy-dark to-surface-dark overflow-hidden">
        {event.photos[0] ? (
          <Image
            src={event.photos[0]}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              width="48"
              height="48"
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

        {/* Top-left: Category */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <Badge variant="navy">{event.category}</Badge>
          {event.isPerennial && <Badge variant="gold">Perennial</Badge>}
        </div>

        {/* Top-right: Travel time (if available) */}
        {travelLabel && (
          <div className="absolute top-3 right-3">
            <Badge
              variant="gold"
              icon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              }
            >
              🚗 {travelLabel}
            </Badge>
          </div>
        )}

        {/* Bottom-left: Operating status */}
        <div className="absolute bottom-3 left-3">
          <Badge variant={status.isOpen ? "success" : "danger"}>
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Title */}
        <h3 className="text-base font-bold text-text-primary line-clamp-1">
          {event.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-text-muted">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-xs truncate">{event.location.address}</span>
        </div>

        {/* Author badge + Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-3">
            {/* Author role */}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-text-secondary">
              {authorRoleLabel}
            </span>
            {/* Likes */}
            <span className="flex items-center gap-1 text-xs text-text-muted">
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
            {/* Comments */}
            <span className="flex items-center gap-1 text-xs text-text-muted">
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
          </div>

          {/* Rating */}
          <span className="flex items-center gap-1 text-xs text-gold font-semibold">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-gold"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {event.avgRating > 0 ? event.avgRating.toFixed(1) : "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}
