"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { updateUserProfile } from "@/lib/firebase/firestore";
import { uploadProfilePicture, uploadIllustrativePhoto } from "@/lib/firebase/storage";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";

export default function ProfileForm() {
  const { profile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [establishmentName, setEstablishmentName] = useState(
    profile?.establishmentName || ""
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Preview states for profile pic & illustrative photo
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [illustrativePreview, setIllustrativePreview] = useState<string | null>(null);
  const profilePicRef = useRef<HTMLInputElement>(null);
  const illustrativeRef = useRef<HTMLInputElement>(null);

  // Files to upload
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [illustrativeFile, setIllustrativeFile] = useState<File | null>(null);

  // Sync form state when profile context updates (e.g. after save)
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
      setEstablishmentName(profile.establishmentName || "");
    }
  }, [profile]);

  if (!profile) return null;

  function handleProfilePicChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
  }

  function handleIllustrativeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIllustrativeFile(file);
    setIllustrativePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const updates: Record<string, unknown> = {
        displayName: displayName.trim(),
        bio: bio.trim().slice(0, 280),
      };

      // Upload profile picture if changed
      if (profilePicFile) {
        const url = await uploadProfilePicture(profile.uid, profilePicFile);
        updates.profilePicture = url;
      }

      // Business-only fields
      if (profile.role === "Business") {
        updates.establishmentName = establishmentName.trim();

        if (illustrativeFile) {
          const url = await uploadIllustrativePhoto(
            profile.uid,
            illustrativeFile
          );
          updates.illustrativePhoto = url;
        }
      }

      await updateUserProfile(profile.uid, updates);
      setSuccess(true);
      setProfilePicFile(null);
      setIllustrativeFile(null);

      // Clear success after 3s
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          {profilePicPreview ? (
            <div className="h-24 w-24 rounded-full overflow-hidden ring-2 ring-gold/30">
              <Image
                src={profilePicPreview}
                alt="Preview"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <Avatar
              src={profile.profilePicture}
              alt={profile.displayName}
              size="xl"
            />
          )}
          <button
            type="button"
            onClick={() => profilePicRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        </div>
        <input
          ref={profilePicRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleProfilePicChange}
        />
        <p className="text-xs text-text-muted">Click avatar to change photo</p>
      </div>

      {/* Display Name */}
      <Input
        label="Display Name"
        type="text"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
        placeholder="Your name"
      />

      {/* Bio */}
      <div className="flex flex-col gap-1.5 w-full">
        <label className="text-sm font-medium text-text-secondary">
          Bio
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder="Tell the world about yourself…"
          className="w-full rounded-[var(--radius-md)] bg-surface-dark border border-white/10 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-all duration-200 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 hover:border-white/20 resize-none"
        />
        <p className="text-xs text-text-muted text-right">
          {bio.length}/280
        </p>
      </div>

      {/* Business-only: Establishment Name & Illustrative Photo */}
      {profile.role === "Business" && (
        <>
          <Input
            label="Establishment Name"
            type="text"
            value={establishmentName}
            onChange={(e) => setEstablishmentName(e.target.value)}
            required
            placeholder="Your business name"
          />

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-medium text-text-secondary">
              Illustrative Photo
            </label>
            <div
              onClick={() => illustrativeRef.current?.click()}
              className="relative w-full aspect-[16/9] rounded-[var(--radius-md)] border-2 border-dashed border-white/10 hover:border-gold/30 bg-surface-dark overflow-hidden cursor-pointer transition-colors group"
            >
              {illustrativePreview || profile.illustrativePhoto ? (
                <Image
                  src={illustrativePreview || profile.illustrativePhoto || ""}
                  alt="Illustrative"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-muted group-hover:text-gold transition-colors">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  <span className="text-xs font-medium">
                    Click to upload cover photo
                  </span>
                </div>
              )}
              {(illustrativePreview || profile.illustrativePhoto) && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-xs text-white font-medium">
                    Change photo
                  </span>
                </div>
              )}
            </div>
            <input
              ref={illustrativeRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleIllustrativeChange}
            />
          </div>
        </>
      )}

      {/* Error */}
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

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-[var(--radius-md)] bg-success/10 border border-success/20 animate-fade-in">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-success flex-shrink-0"
          >
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
          <p className="text-sm text-success">Profile updated successfully!</p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={saving}
      >
        Save Changes
      </Button>
    </form>
  );
}
