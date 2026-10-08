"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import EventForm from "@/components/event/EventForm";

export default function CreateEventPage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <EventForm />
      </div>
    </AuthGuard>
  );
}
