import { Timestamp } from "firebase/firestore";

export type UserRole = "Traveler" | "Business" | "Admin";

export interface UserProfile {
  uid: string;
  role: UserRole;
  email: string;
  displayName: string;
  profilePicture: string;
  bio: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Business-only fields
  establishmentName?: string;
  illustrativePhoto?: string;
  // Computed
  eventCount: number;
}
