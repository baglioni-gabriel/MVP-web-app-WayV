"use client";

import { useState, useRef, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  createEvent,
  updateEvent,
  type EventInput,
} from "@/lib/firebase/firestore";
import { uploadEventPhotos } from "@/lib/firebase/storage";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { WayvEvent, OperatingHourEntry } from "@/lib/types/event";
import {
  DEFAULT_OPERATING_HOURS,
  TRAVELER_CATEGORIES,
  BUSINESS_CATEGORIES,
} from "@/lib/types/event";

// Generate a Firestore-compatible ID
function generateId(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

interface EventFormProps {
  /** If provided, the form is in edit mode */
  existingEvent?: WayvEvent;
}

export default function EventForm({ existingEvent }: EventFormProps) {
  const router = useRouter();
  const { profile } = useAuth();
  const isEdit = !!existingEvent;
  const isTraveler = profile?.role === "Traveler";

  // ── Determine categories based on role ──
  const categories = isTraveler
    ? [...TRAVELER_CATEGORIES]
    : [...BUSINESS_CATEGORIES];

  const defaultCategory = isTraveler
    ? TRAVELER_CATEGORIES[0]
    : BUSINESS_CATEGORIES[0];

  // ── Form state ──
  const [title, setTitle] = useState(existingEvent?.title || "");
  const [description, setDescription] = useState(
    existingEvent?.description || ""
  );
  const [category, setCategory] = useState(
    existingEvent?.category || defaultCategory
  );
  const [address, setAddress] = useState(
    existingEvent?.location.address || ""
  );
  const [lat, setLat] = useState(
    existingEvent?.location.lat?.toString() || ""
  );
  const [lng, setLng] = useState(
    existingEvent?.location.lng?.toString() || ""
  );
  const [startDateTime, setStartDateTime] = useState(() => {
    if (existingEvent?.startDateTime) {
      const d = existingEvent.startDateTime.toDate();
      return toLocalDatetimeString(d);
    }
    return "";
  });
  const [endDateTime, setEndDateTime] = useState(() => {
    if (existingEvent?.endDateTime) {
      const d = existingEvent.endDateTime.toDate();
      return toLocalDatetimeString(d);
    }
    return "";
  });

  // ── Structured Operating Hours ──
  const [operatingHours, setOperatingHours] = useState<OperatingHourEntry[]>(
    () => {
      if (
        existingEvent?.operatingHours &&
        Array.isArray(existingEvent.operatingHours)
      ) {
        return existingEvent.operatingHours;
      }
      return DEFAULT_OPERATING_HOURS.map((d) => ({ ...d }));
    }
  );

  // ── Unavailable Days (structured) ──
  const [unavailableDays, setUnavailableDays] = useState<string[]>(
    existingEvent?.unavailableDays || []
  );
  const [newUnavailableDate, setNewUnavailableDate] = useState("");

  // Photos
  const [existingPhotos, setExistingPhotos] = useState<string[]>(
    existingEvent?.photos || []
  );
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!profile) return null;

  // ── Operating Hours handlers ──
  function toggleDay(index: number) {
    setOperatingHours((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, enabled: !entry.enabled } : entry
      )
    );
  }

  function updateTime(
    index: number,
    field: "open" | "close",
    value: string
  ) {
    setOperatingHours((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  }

  // ── Unavailable Days handlers ──
  function addUnavailableDay() {
    if (!newUnavailableDate) return;
    if (unavailableDays.includes(newUnavailableDate)) return;
    setUnavailableDays((prev) => [...prev, newUnavailableDate].sort());
    setNewUnavailableDate("");
  }

  function removeUnavailableDay(date: string) {
    setUnavailableDays((prev) => prev.filter((d) => d !== date));
  }

  // ── Photo handling ──
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const totalPhotos =
      existingPhotos.length + newPhotoFiles.length + files.length;

    if (totalPhotos > 5) {
      setError("Maximum 5 photos allowed.");
      return;
    }

    const previews = files.map((f) => URL.createObjectURL(f));
    setNewPhotoFiles((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [...prev, ...previews]);
    setError("");
  }

  function removeExistingPhoto(index: number) {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewPhoto(index: number) {
    setNewPhotoFiles((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // ── Submit ──
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError("");

    // Validation
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!address.trim()) {
      setError("Address is required.");
      return;
    }
    if (!startDateTime) {
      setError("Start date/time is required.");
      return;
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (lat && isNaN(parsedLat)) {
      setError("Invalid latitude value.");
      return;
    }
    if (lng && isNaN(parsedLng)) {
      setError("Invalid longitude value.");
      return;
    }

    setSaving(true);

    try {
      const eventId = isEdit ? existingEvent!.id : generateId();

      // Upload new photos with compression (index 0 = hero, rest compressed)
      let allPhotoUrls = [...existingPhotos];
      if (newPhotoFiles.length > 0) {
        const uploadedUrls = await uploadEventPhotos(eventId, newPhotoFiles);
        allPhotoUrls = [...allPhotoUrls, ...uploadedUrls];
      }

      // Parse end date — if empty, event is perennial
      const parsedEndDate = endDateTime ? new Date(endDateTime) : null;

      const input: EventInput = {
        title: title.trim(),
        description: description.trim(),
        photos: allPhotoUrls.slice(0, 5), // enforce max 5
        location: {
          address: address.trim(),
          lat: lat ? parsedLat : 0,
          lng: lng ? parsedLng : 0,
        },
        startDateTime: new Date(startDateTime),
        endDateTime: parsedEndDate,
        operatingHours,
        unavailableDays,
        category,
      };

      if (isEdit) {
        await updateEvent(eventId, input);
      } else {
        await createEvent(
          eventId,
          profile.uid,
          profile.displayName,
          profile.role as "Traveler" | "Business",
          input
        );
      }

      // Navigate to the event detail page
      router.push(`/event/${eventId}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to save event. Please try again.";
      setError(msg);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-text-primary">
          {isEdit ? "Edit Event" : "Create Event"}
        </h1>
        <p className="text-sm text-text-secondary">
          {isEdit
            ? "Update your event details below."
            : "Share a new experience with the community."}
        </p>
      </div>

      {/* ── Traveler Info Banner ── */}
      {isTraveler && !isEdit && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-[var(--radius-md)] bg-navy/20 border border-navy-light/20">
          <span className="text-xl mt-0.5">🌍</span>
          <div>
            <p className="text-sm font-medium text-text-primary">
              Postando como Viajante
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              Como Viajante, compartilhe pontos gratuitos, públicos, naturais ou
              históricos! Suas categorias disponíveis são limitadas a{" "}
              <strong>Natureza</strong> e <strong>Histórico/Cultura</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── Photos ── */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          Photos{" "}
          <span className="text-text-muted">
            (max 5 — first photo is the hero)
          </span>
        </label>

        {/* Photo grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {/* Existing photos */}
          {existingPhotos.map((url, i) => (
            <div
              key={`existing-${i}`}
              className="relative aspect-square rounded-[var(--radius-md)] overflow-hidden border border-white/10 group"
            >
              <Image
                src={url}
                alt={`Photo ${i + 1}`}
                fill
                className="object-cover"
              />
              {i === 0 && (
                <div className="absolute top-1 left-1">
                  <span className="px-1.5 py-0.5 bg-gold text-navy-dark text-[10px] font-bold rounded">
                    HERO
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeExistingPhoto(i)}
                className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-danger text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}

          {/* New photo previews */}
          {photoPreviews.map((url, i) => (
            <div
              key={`new-${i}`}
              className="relative aspect-square rounded-[var(--radius-md)] overflow-hidden border border-gold/20 group"
            >
              <Image
                src={url}
                alt={`New photo ${i + 1}`}
                fill
                className="object-cover"
              />
              {existingPhotos.length === 0 && i === 0 && (
                <div className="absolute top-1 left-1">
                  <span className="px-1.5 py-0.5 bg-gold text-navy-dark text-[10px] font-bold rounded">
                    HERO
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeNewPhoto(i)}
                className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center rounded-full bg-danger text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}

          {/* Add photo button */}
          {existingPhotos.length + newPhotoFiles.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-[var(--radius-md)] border-2 border-dashed border-white/10 hover:border-gold/30 flex flex-col items-center justify-center gap-1 text-text-muted hover:text-gold transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[10px] font-medium">Add</span>
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoSelect}
        />
        <p className="text-xs text-text-muted">
          Hero image (1st) is kept at full quality. Other photos are
          automatically compressed.
        </p>
      </div>

      {/* ── Title ── */}
      <Input
        label="Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        placeholder="e.g., Sunset Winery Tour"
        maxLength={120}
      />

      {/* ── Description ── */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-text-secondary">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Describe the experience, what to expect, what to bring…"
          className="w-full rounded-[var(--radius-md)] bg-surface-dark border border-white/10 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 hover:border-white/20 resize-none"
        />
      </div>

      {/* ── Category (role-aware) ── */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-text-secondary">
          Category
          {isTraveler && (
            <span className="text-xs text-text-muted ml-1">
              (limited for Travelers)
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                category === cat
                  ? "bg-gold text-navy-dark"
                  : "bg-white/5 text-text-secondary border border-white/10 hover:border-gold/30 hover:text-gold"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Location ── */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-secondary">
          Location
        </label>
        <Input
          label="Address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          placeholder="e.g., Rua das Flores 123, Porto Alegre, RS"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Latitude"
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="-29.1752"
          />
          <Input
            label="Longitude"
            type="text"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="-51.1797"
          />
        </div>
        <p className="text-xs text-text-muted">
          Enter coordinates manually or they will be auto-filled in a future
          update (Places Autocomplete).
        </p>
      </div>

      {/* ── Date & Time ── */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-secondary">
          Date &amp; Time
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Start Date/Time"
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <Input
              label="End Date/Time (optional)"
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-gold/5 border border-gold/10">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-gold flex-shrink-0"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="text-xs text-gold/80">
            {endDateTime
              ? "This event has a fixed end date."
              : "No end date → this event will be marked as Perennial (ongoing)."}
          </p>
        </div>
      </div>

      {/* ── Structured Operating Hours ── */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-secondary">
          Operating Hours
        </label>
        <div className="space-y-2">
          {operatingHours.map((entry, index) => (
            <div
              key={entry.day}
              className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] border transition-colors ${
                entry.enabled
                  ? "bg-surface-dark border-white/10"
                  : "bg-white/[0.02] border-white/5 opacity-50"
              }`}
            >
              {/* Day toggle */}
              <button
                type="button"
                onClick={() => toggleDay(index)}
                className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${
                  entry.enabled ? "bg-gold" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    entry.enabled ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>

              {/* Day label */}
              <span className="text-sm font-medium text-text-primary w-10">
                {entry.day}
              </span>

              {/* Time pickers */}
              {entry.enabled ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={entry.open}
                    onChange={(e) =>
                      updateTime(index, "open", e.target.value)
                    }
                    className="flex-1 rounded-[var(--radius-sm)] bg-bg-dark border border-white/10 px-2 py-1 text-xs text-text-primary outline-none focus:border-gold"
                  />
                  <span className="text-xs text-text-muted">to</span>
                  <input
                    type="time"
                    value={entry.close}
                    onChange={(e) =>
                      updateTime(index, "close", e.target.value)
                    }
                    className="flex-1 rounded-[var(--radius-sm)] bg-bg-dark border border-white/10 px-2 py-1 text-xs text-text-primary outline-none focus:border-gold"
                  />
                </div>
              ) : (
                <span className="text-xs text-text-muted italic">
                  Closed
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Unavailable Days (Date Picker) ── */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-secondary">
          Unavailable Days
        </label>
        <div className="flex gap-2">
          <input
            type="date"
            value={newUnavailableDate}
            onChange={(e) => setNewUnavailableDate(e.target.value)}
            className="flex-1 rounded-[var(--radius-md)] bg-surface-dark border border-white/10 px-4 py-2 text-sm text-text-primary outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addUnavailableDay}
            disabled={!newUnavailableDate}
          >
            Add
          </Button>
        </div>
        {unavailableDays.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {unavailableDays.map((day) => (
              <span
                key={day}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-danger/10 text-danger text-xs rounded-full font-medium"
              >
                {day}
                <button
                  type="button"
                  onClick={() => removeUnavailableDay(day)}
                  className="hover:text-white transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-xs text-text-muted">
          Select specific dates when this event/place is closed or unavailable.
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] bg-danger/10 border border-danger/20 animate-fade-in">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-danger flex-shrink-0"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* ── Submit ── */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="flex-1"
          isLoading={saving}
        >
          {isEdit ? "Save Changes" : "Publish Event"}
        </Button>
      </div>
    </form>
  );
}

/** Convert a Date to `YYYY-MM-DDThh:mm` for datetime-local input */
function toLocalDatetimeString(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
