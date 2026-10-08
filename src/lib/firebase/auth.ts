import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type UserCredential,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./config";
import type { UserRole } from "@/lib/types/user";

// ── Google OAuth provider (singleton) ──
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// ── Helper: create user document in Firestore ──
async function createUserDocument(
  uid: string,
  data: {
    email: string;
    displayName: string;
    role: UserRole;
    profilePicture?: string;
    establishmentName?: string;
  }
) {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, {
    uid,
    email: data.email,
    displayName: data.displayName,
    role: data.role,
    profilePicture: data.profilePicture || "",
    bio: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    eventCount: 0,
    // Business-only fields
    ...(data.role === "Business" && {
      establishmentName: data.establishmentName || data.displayName,
      illustrativePhoto: "",
    }),
  });
}

// ── Sign Up with Email/Password ──
export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  establishmentName?: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  // Set the displayName on the Firebase Auth profile
  await updateProfile(credential.user, { displayName });

  // Create the Firestore user document
  await createUserDocument(credential.user.uid, {
    email,
    displayName,
    role,
    establishmentName,
  });

  return credential;
}

// ── Sign In with Email/Password ──
export async function signIn(
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

// ── Sign In with Google ──
// On first sign-in, a Firestore doc is created with the given role.
// On subsequent sign-ins, the existing doc is used and role param is ignored.
export async function signInWithGoogle(
  role: UserRole = "Traveler"
): Promise<{ credential: UserCredential; isNewUser: boolean }> {
  const credential = await signInWithPopup(auth, googleProvider);
  const user = credential.user;

  // Check if user document already exists
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    // First-time Google sign-in → create user document
    await createUserDocument(user.uid, {
      email: user.email || "",
      displayName: user.displayName || "Traveler",
      role,
      profilePicture: user.photoURL || "",
    });
    return { credential, isNewUser: true };
  }

  return { credential, isNewUser: false };
}

// ── Sign Out ──
export async function signOutUser(): Promise<void> {
  return firebaseSignOut(auth);
}
