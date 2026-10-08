"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ProfileForm from "@/components/profile/ProfileForm";

export default function EditProfilePage() {
  return (
    <AuthGuard>
      <div className="mx-auto max-w-lg px-4 sm:px-6 py-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Edit <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-sm text-text-secondary">
            Update your personal information and photos.
          </p>
        </div>

        <ProfileForm />
      </div>
    </AuthGuard>
  );
}
