"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function SavedEventsPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Saved <span className="gradient-text">Events</span>
          </h1>
          <p className="text-sm text-text-secondary">
            Events you save will appear here for easy access.
          </p>
        </div>

        <div className="glass rounded-[var(--radius-lg)] p-12 text-center space-y-4">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="mx-auto text-text-muted"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
          </svg>
          <div className="space-y-1">
            <p className="text-base font-medium text-text-primary">
              No saved events yet
            </p>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              Browse the feed and tap the bookmark icon to save events
              you&apos;re interested in.
            </p>
          </div>
          <Link href="/feed">
            <Button variant="primary" size="md">
              Explore Events
            </Button>
          </Link>
        </div>
      </div>
    </AuthGuard>
  );
}
