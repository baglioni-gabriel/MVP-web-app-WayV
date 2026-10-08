"use client";

import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["Admin"]} fallbackUrl="/feed">
      <div className="flex min-h-dvh flex-col bg-bg-dark">
        {/* Admin top bar */}
        <header className="sticky top-0 z-40 glass border-b border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center gap-4">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                  <path d="M12 15l-2 5L9 9l11 4-5 2z" />
                  <path d="M22 22l-5-10" />
                </svg>
                <span className="text-sm font-bold text-text-primary">
                  Wayv <span className="text-gold">Admin</span>
                </span>
              </div>
              <div className="flex-1" />
              <a
                href="/feed"
                className="text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                ← Back to App
              </a>
            </div>
          </div>
        </header>

        {/* Admin content */}
        <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
