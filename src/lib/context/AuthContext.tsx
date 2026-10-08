"use client";

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import {
  signIn,
  signUp,
  signInWithGoogle,
  signOutUser,
} from "@/lib/firebase/auth";
import type { UserProfile, UserRole } from "@/lib/types/user";

// ── Context shape ──
export interface AuthContextValue {
  /** Firebase Auth user (null if signed out) */
  user: User | null;
  /** Firestore user profile (null if no doc yet or signed out) */
  profile: UserProfile | null;
  /** User role shortcut (null if signed out) */
  role: UserRole | null;
  /** True while auth state is being resolved on first load */
  loading: boolean;
  /** Sign in with email/password */
  signIn: (email: string, password: string) => Promise<void>;
  /** Sign up with email/password + role */
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    establishmentName?: string
  ) => Promise<void>;
  /** Sign in with Google OAuth (role used for first-time only) */
  signInWithGoogle: (role?: UserRole) => Promise<{ isNewUser: boolean }>;
  /** Sign out */
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

// ── Provider component ──
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase Auth state and Firestore profile
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      // Clean up previous profile listener
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (firebaseUser) {
        // Subscribe to user profile document in Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        unsubProfile = onSnapshot(
          userRef,
          (snap) => {
            if (snap.exists()) {
              setProfile({ uid: snap.id, ...snap.data() } as UserProfile);
            } else {
              setProfile(null);
            }
            setLoading(false);
          },
          () => {
            // On error, still stop loading
            setProfile(null);
            setLoading(false);
          }
        );
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  // ── Actions ──
  const handleSignIn = useCallback(async (email: string, password: string) => {
    await signIn(email, password);
  }, []);

  const handleSignUp = useCallback(
    async (
      email: string,
      password: string,
      displayName: string,
      role: UserRole,
      establishmentName?: string
    ) => {
      await signUp(email, password, displayName, role, establishmentName);
    },
    []
  );

  const handleGoogleSignIn = useCallback(
    async (role: UserRole = "Traveler") => {
      const result = await signInWithGoogle(role);
      return { isNewUser: result.isNewUser };
    },
    []
  );

  const handleSignOut = useCallback(async () => {
    await signOutUser();
  }, []);

  const value: AuthContextValue = {
    user,
    profile,
    role: profile?.role ?? null,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
