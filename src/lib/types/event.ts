import { Timestamp } from "firebase/firestore";

/** Structured operating hours for a single day of the week */
export interface OperatingHourEntry {
  day: "Seg" | "Ter" | "Qua" | "Qui" | "Sex" | "Sáb" | "Dom";
  open: string;  // "08:00" (HH:mm)
  close: string; // "18:00" (HH:mm)
  enabled: boolean;
}

/** All 7 days, used as default for new events */
export const DEFAULT_OPERATING_HOURS: OperatingHourEntry[] = [
  { day: "Seg", open: "08:00", close: "18:00", enabled: true },
  { day: "Ter", open: "08:00", close: "18:00", enabled: true },
  { day: "Qua", open: "08:00", close: "18:00", enabled: true },
  { day: "Qui", open: "08:00", close: "18:00", enabled: true },
  { day: "Sex", open: "08:00", close: "18:00", enabled: true },
  { day: "Sáb", open: "09:00", close: "14:00", enabled: false },
  { day: "Dom", open: "09:00", close: "14:00", enabled: false },
];

export interface EventLocation {
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface WayvEvent {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: "Traveler" | "Business";
  title: string;
  description: string;
  photos: string[];
  location: EventLocation;
  startDateTime: Timestamp;
  endDateTime: Timestamp | null;
  isPerennial: boolean;
  operatingHours: OperatingHourEntry[];
  unavailableDays: string[];
  category: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Denormalized counters
  likeCount: number;
  commentCount: number;
  saveCount: number;
  avgRating: number;
}

/** Category lists by role */
export const TRAVELER_CATEGORIES = ["Natureza", "Histórico/Cultura"] as const;

export const BUSINESS_CATEGORIES = [
  "Gastronomia",
  "Aventura",
  "Vida Noturna",
  "Esportes",
  "Música",
  "Arte",
  "Feiras",
  "Passeios",
  "Outro",
] as const;

export const ALL_CATEGORIES = [
  ...TRAVELER_CATEGORIES,
  ...BUSINESS_CATEGORIES,
] as const;
