import { Timestamp } from "firebase/firestore";

export interface Like {
  userId: string;
  createdAt: Timestamp;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: Timestamp;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  text: string;
  createdAt: Timestamp;
}

export interface SavedEvent {
  eventId: string;
  savedAt: Timestamp;
}
