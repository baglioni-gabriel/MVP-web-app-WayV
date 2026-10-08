"use client";

import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "gold" | "navy" | "success" | "danger" | "outline";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export default function Badge({
  children,
  variant = "default",
  className,
  icon,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        "text-xs font-semibold whitespace-nowrap transition-colors",

        variant === "default" && "bg-white/10 text-text-secondary",
        variant === "gold" &&
          "bg-gold/15 text-gold border border-gold/20",
        variant === "navy" &&
          "bg-navy/30 text-blue-300 border border-navy-light/30",
        variant === "success" &&
          "bg-success/15 text-success border border-success/20",
        variant === "danger" &&
          "bg-danger/15 text-danger border border-danger/20",
        variant === "outline" &&
          "bg-transparent text-text-secondary border border-white/15",

        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}
