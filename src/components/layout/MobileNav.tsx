"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/useAuth";

const tabs = [
  {
    href: "/feed",
    label: "Explore",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    href: "/saved",
    label: "Saved",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    ),
    authRequired: true,
  },
  {
    href: "/event/create",
    label: "Create",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    isAction: true,
    authRequired: true,
  },
  {
    href: "/profile/me",
    label: "Profile",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    authRequired: true,
  },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user, profile } = useAuth();

  // Resolve profile link → if logged in, link to actual profile uid
  function resolveHref(tab: (typeof tabs)[number]): string {
    if (tab.href === "/profile/me" && profile) {
      return `/profile/${profile.uid}`;
    }
    // If auth required but not logged in, redirect to login
    if (tab.authRequired && !user) {
      return "/login";
    }
    return tab.href;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="glass border-t border-white/5">
        <div className="mx-auto max-w-lg px-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const href = resolveHref(tab);
              const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/");

              if (tab.isAction) {
                return (
                  <Link
                    key={tab.href}
                    href={href}
                    className="flex flex-col items-center justify-center -mt-5"
                    aria-label={tab.label}
                  >
                    <span className="flex items-center justify-center h-12 w-12 rounded-full bg-gold text-navy-dark shadow-[var(--shadow-glow-gold)] transition-transform duration-200 active:scale-90">
                      {tab.icon}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={tab.href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2 px-3 transition-colors duration-200",
                    isActive
                      ? "text-gold"
                      : "text-text-muted hover:text-text-secondary"
                  )}
                  aria-label={tab.label}
                >
                  <span className="relative">
                    {tab.icon}
                    {isActive && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-gold" />
                    )}
                  </span>
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {/* Safe area spacing for notched phones */}
      <div className="h-[env(safe-area-inset-bottom)] bg-surface-dark/80" />
    </nav>
  );
}
