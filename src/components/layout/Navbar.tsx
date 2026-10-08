"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { useState } from "react";

const navLinks = [
  { href: "/feed", label: "Explore" },
  { href: "/saved", label: "Saved" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full">
      <nav className="glass border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* ── Logo ── */}
            <Link
              href="/feed"
              className="flex items-center gap-2 group"
              aria-label="Wayv Home"
            >
              <Image
                src="/Logo_Wayv.svg"
                alt="Wayv Logo"
                width={100}
                height={36}
                className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-200",
                      isActive
                        ? "text-gold bg-gold/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {/* Show Admin link for admins */}
              {profile?.role === "Admin" && (
                <Link
                  href="/admin"
                  className={cn(
                    "px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-200",
                    pathname.startsWith("/admin")
                      ? "text-gold bg-gold/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  )}
                >
                  Admin
                </Link>
              )}
            </div>

            {/* ── Right Side ── */}
            <div className="hidden md:flex items-center gap-3">
              {user && profile ? (
                <div className="flex items-center gap-3">
                  <Link
                    href="/event/create"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] bg-gold text-navy-dark text-sm font-semibold hover:bg-gold-light transition-all duration-200 hover:shadow-[var(--shadow-glow-gold)]"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    New Event
                  </Link>

                  {/* User dropdown area */}
                  <div className="relative group">
                    <Link href={`/profile/${profile.uid}`} className="flex items-center gap-2">
                      <Avatar
                        src={profile.profilePicture}
                        alt={profile.displayName}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-text-primary max-w-[120px] truncate">
                        {profile.displayName}
                      </span>
                    </Link>

                    {/* Dropdown on hover */}
                    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute right-0 top-full mt-2 w-48 py-2 rounded-[var(--radius-md)] bg-surface-dark border border-white/10 shadow-[var(--shadow-elevated)]">
                      <Link
                        href={`/profile/${profile.uid}`}
                        className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/profile/edit"
                        className="block px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                      >
                        Edit Profile
                      </Link>
                      <div className="my-1 h-px bg-white/5" />
                      <button
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
                      >
                        {signingOut ? "Signing out…" : "Sign Out"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              className="md:hidden p-2 rounded-[var(--radius-md)] text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* ── Mobile Dropdown ── */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 pt-2 space-y-1 animate-fade-in">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors",
                      isActive
                        ? "text-gold bg-gold/10"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {/* Admin link for mobile */}
              {profile?.role === "Admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors",
                    pathname.startsWith("/admin")
                      ? "text-gold bg-gold/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  )}
                >
                  Admin Dashboard
                </Link>
              )}
              <div className="pt-3 border-t border-white/5 flex flex-col gap-2 px-4">
                {user && profile ? (
                  <>
                    <div className="flex items-center gap-3 py-2">
                      <Avatar
                        src={profile.profilePicture}
                        alt={profile.displayName}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {profile.displayName}
                        </p>
                        <p className="text-xs text-text-muted truncate">
                          {profile.role}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/event/create"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-[var(--radius-md)] bg-gold text-navy-dark text-sm font-semibold"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      New Event
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      disabled={signingOut}
                      className="w-full text-center px-4 py-2.5 rounded-[var(--radius-md)] text-sm font-medium text-danger bg-danger/5 border border-danger/10 hover:bg-danger/10 transition-colors disabled:opacity-50"
                    >
                      {signingOut ? "Signing out…" : "Sign Out"}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="md" className="w-full">
                        Log In
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="md" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
