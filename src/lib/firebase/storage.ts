import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "./config";
import imageCompression from "browser-image-compression";

/**
 * Compress an image file before upload.
 * index 0 (hero image) is kept at higher quality.
 * All others are compressed more aggressively.
 */
async function compressImage(
  file: File,
  isHero: boolean
): Promise<File> {
  const options = isHero
    ? { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: true }
    : { maxSizeMB: 0.8, maxWidthOrHeight: 1280, useWebWorker: true };

  try {
    const compressed = await imageCompression(file, options);
    return compressed;
  } catch {
    // Fallback: return original file if compression fails
    return file;
  }
}

/**
 * Upload a profile picture to Firebase Storage.
 * Path: `users/{uid}/profile.{ext}`
 */
export async function uploadProfilePicture(
  uid: string,
  file: File
): Promise<string> {
  const compressed = await compressImage(file, true);
  const ext = file.name.split(".").pop() || "jpg";
  const storageRef = ref(storage, `users/${uid}/profile.${ext}`);
  const snapshot = await uploadBytes(storageRef, compressed);
  return getDownloadURL(snapshot.ref);
}

/**
 * Upload a business illustrative photo.
 * Path: `users/{uid}/illustrative.{ext}`
 */
export async function uploadIllustrativePhoto(
  uid: string,
  file: File
): Promise<string> {
  const compressed = await compressImage(file, true);
  const ext = file.name.split(".").pop() || "jpg";
  const storageRef = ref(storage, `users/${uid}/illustrative.${ext}`);
  const snapshot = await uploadBytes(storageRef, compressed);
  return getDownloadURL(snapshot.ref);
}

/**
 * Upload event photos to Firebase Storage.
 * Path: `events/{eventId}/photo_{index}.{ext}`
 *
 * RULE: index 0 (hero) is NOT compressed aggressively.
 *       All other indices are compressed.
 */
export async function uploadEventPhotos(
  eventId: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const isHero = i === 0;
    const compressed = await compressImage(file, isHero);
    const ext = file.name.split(".").pop() || "jpg";
    const storageRef = ref(storage, `events/${eventId}/photo_${i}.${ext}`);
    const snapshot = await uploadBytes(storageRef, compressed);
    const url = await getDownloadURL(snapshot.ref);
    urls.push(url);
  }

  return urls;
}

/**
 * Delete a file from Firebase Storage by its download URL.
 */
export async function deleteStorageFile(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // File may not exist — silently ignore
  }
}
