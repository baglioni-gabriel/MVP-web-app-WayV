import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";
import type { UserProfile } from "@/lib/types/user";
import type { WayvEvent, EventLocation, OperatingHourEntry } from "@/lib/types/event";

// ═══════════════════════════════════════════
//  USER HELPERS
// ═══════════════════════════════════════════

/**
 * Fetch a user profile by UID.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
}

/**
 * Update a user profile (partial update).
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, "uid" | "createdAt">>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ═══════════════════════════════════════════
//  EVENT HELPERS
// ═══════════════════════════════════════════

/** Input shape for creating/updating events */
export interface EventInput {
  title: string;
  description: string;
  photos: string[];
  location: EventLocation;
  startDateTime: Date;
  endDateTime: Date | null;
  operatingHours: OperatingHourEntry[];
  unavailableDays: string[];
  category: string;
}

/**
 * Create a new event in Firestore.
 * Auto-computes `isPerennial` based on whether `endDateTime` is null.
 * Increments the author's `eventCount`.
 */
export async function createEvent(
  eventId: string,
  authorId: string,
  authorName: string,
  authorRole: "Traveler" | "Business",
  input: EventInput
): Promise<void> {
  const eventRef = doc(db, "events", eventId);

  await setDoc(eventRef, {
    authorId,
    authorName,
    authorRole,
    title: input.title,
    description: input.description,
    photos: input.photos,
    location: input.location,
    startDateTime: Timestamp.fromDate(input.startDateTime),
    endDateTime: input.endDateTime
      ? Timestamp.fromDate(input.endDateTime)
      : null,
    isPerennial: input.endDateTime === null,
    operatingHours: input.operatingHours,
    unavailableDays: input.unavailableDays,
    category: input.category,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    // Denormalized counters
    likeCount: 0,
    commentCount: 0,
    saveCount: 0,
    avgRating: 0,
  });

  // Increment author's event count
  const userRef = doc(db, "users", authorId);
  await updateDoc(userRef, { eventCount: increment(1) });
}

/**
 * Update an existing event.
 * Re-computes `isPerennial` based on whether `endDateTime` is null.
 */
export async function updateEvent(
  eventId: string,
  input: Partial<EventInput>
): Promise<void> {
  const eventRef = doc(db, "events", eventId);

  // Build update payload, converting dates to Timestamps
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };

  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.photos !== undefined) payload.photos = input.photos;
  if (input.location !== undefined) payload.location = input.location;
  if (input.operatingHours !== undefined)
    payload.operatingHours = input.operatingHours;
  if (input.unavailableDays !== undefined)
    payload.unavailableDays = input.unavailableDays;
  if (input.category !== undefined) payload.category = input.category;

  if (input.startDateTime !== undefined) {
    payload.startDateTime = Timestamp.fromDate(input.startDateTime);
  }

  if (input.endDateTime !== undefined) {
    payload.endDateTime = input.endDateTime
      ? Timestamp.fromDate(input.endDateTime)
      : null;
    payload.isPerennial = input.endDateTime === null;
  }

  await updateDoc(eventRef, payload);
}

/**
 * Delete an event and decrement the author's event count.
 */
export async function deleteEvent(
  eventId: string,
  authorId: string
): Promise<void> {
  const eventRef = doc(db, "events", eventId);
  await deleteDoc(eventRef);

  // Decrement author's event count
  const userRef = doc(db, "users", authorId);
  await updateDoc(userRef, { eventCount: increment(-1) });
}

/**
 * Fetch a single event by ID.
 */
export async function getEvent(eventId: string): Promise<WayvEvent | null> {
  const eventRef = doc(db, "events", eventId);
  const snap = await getDoc(eventRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as WayvEvent;
}

/**
 * Fetch events created by a specific user.
 */
export async function getEventsByAuthor(
  authorId: string,
  maxResults = 50
): Promise<WayvEvent[]> {
  const eventsRef = collection(db, "events");
  const q = query(
    eventsRef,
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WayvEvent);
}

/**
 * Fetch recent events for the feed.
 */
export async function getRecentEvents(
  maxResults = 50
): Promise<WayvEvent[]> {
  const eventsRef = collection(db, "events");
  const q = query(
    eventsRef,
    orderBy("createdAt", "desc"),
    limit(maxResults)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WayvEvent);
}
