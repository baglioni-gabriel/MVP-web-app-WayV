import type { OperatingHourEntry } from "@/lib/types/event";

/** Map JS Date.getDay() (0=Sun) to our day keys */
const DAY_INDEX_MAP: Record<number, string> = {
  0: "Dom",
  1: "Seg",
  2: "Ter",
  3: "Qua",
  4: "Qui",
  5: "Sex",
  6: "Sáb",
};

/**
 * Check if an event is currently open based on operating hours and unavailable days.
 */
export function isOpenNow(
  operatingHours: OperatingHourEntry[],
  unavailableDays: string[]
): boolean {
  return isOpenOnDate(operatingHours, unavailableDays, new Date());
}

/**
 * Check if an event is open on a specific date/time.
 */
export function isOpenOnDate(
  operatingHours: OperatingHourEntry[],
  unavailableDays: string[],
  date: Date
): boolean {
  // Handle legacy string format: treat as always open
  if (!Array.isArray(operatingHours) || operatingHours.length === 0) {
    return true;
  }

  // Check unavailable days
  const dateStr = toDateString(date);
  if (unavailableDays.includes(dateStr)) {
    return false;
  }

  // Find today's entry
  const dayKey = DAY_INDEX_MAP[date.getDay()];
  const entry = operatingHours.find((e) => e.day === dayKey);

  if (!entry || !entry.enabled) {
    return false;
  }

  // Check if current time is within range
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const openMinutes = timeToMinutes(entry.open);
  const closeMinutes = timeToMinutes(entry.close);

  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

/**
 * Check if an event operates on a specific day (ignoring time).
 */
export function isOpenOnDay(
  operatingHours: OperatingHourEntry[],
  unavailableDays: string[],
  date: Date
): boolean {
  if (!Array.isArray(operatingHours) || operatingHours.length === 0) {
    return true;
  }

  const dateStr = toDateString(date);
  if (unavailableDays.includes(dateStr)) {
    return false;
  }

  const dayKey = DAY_INDEX_MAP[date.getDay()];
  const entry = operatingHours.find((e) => e.day === dayKey);

  return !!entry?.enabled;
}

/**
 * Get a user-friendly status label for the event.
 */
export function getStatusLabel(
  operatingHours: OperatingHourEntry[],
  unavailableDays: string[]
): { label: string; isOpen: boolean } {
  if (!Array.isArray(operatingHours) || operatingHours.length === 0) {
    return { label: "Horário não informado", isOpen: true };
  }

  const open = isOpenNow(operatingHours, unavailableDays);
  return {
    label: open ? "Aberto agora" : "Fechado",
    isOpen: open,
  };
}

/**
 * Format operating hours as a human-readable summary.
 */
export function formatOperatingHours(
  operatingHours: OperatingHourEntry[]
): string {
  if (!Array.isArray(operatingHours) || operatingHours.length === 0) {
    return "Horário não informado";
  }

  const enabled = operatingHours.filter((e) => e.enabled);
  if (enabled.length === 0) return "Fechado todos os dias";

  return enabled
    .map((e) => `${e.day}: ${e.open}–${e.close}`)
    .join(" | ");
}

// ── Helpers ──

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}
