"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { getEvent } from "@/lib/firebase/firestore";
import AuthGuard from "@/components/auth/AuthGuard";
import EventForm from "@/components/event/EventForm";
import Spinner from "@/components/ui/Spinner";
import type { WayvEvent } from "@/lib/types/event";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const { user } = useAuth();

  const [event, setEvent] = useState<WayvEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getEvent(eventId);
        if (!result) {
          router.replace("/feed");
          return;
        }
        // Only the author can edit
        if (user && result.authorId !== user.uid) {
          router.replace(`/event/${eventId}`);
          return;
        }
        setEvent(result);
      } catch {
        router.replace("/feed");
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      load();
    }
  }, [eventId, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        {event && <EventForm existingEvent={event} />}
      </div>
    </AuthGuard>
  );
}
