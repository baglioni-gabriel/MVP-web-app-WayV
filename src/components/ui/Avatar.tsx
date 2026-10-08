"use client";

import { cn } from "@/lib/utils/cn";
import Image from "next/image";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { container: string; text: string }> = {
  xs: { container: "h-6 w-6 text-[10px]", text: "text-[10px]" },
  sm: { container: "h-8 w-8 text-xs", text: "text-xs" },
  md: { container: "h-10 w-10 text-sm", text: "text-sm" },
  lg: { container: "h-14 w-14 text-lg", text: "text-lg" },
  xl: { container: "h-20 w-20 text-2xl", text: "text-2xl" },
};

const pixelMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

export default function Avatar({
  src,
  alt,
  size = "md",
  className,
}: AvatarProps) {
  const initials = alt
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden flex-shrink-0",
        "bg-gradient-to-br from-gold to-navy flex items-center justify-center",
        "ring-2 ring-gold/20",
        sizeMap[size].container,
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={pixelMap[size]}
          height={pixelMap[size]}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className={cn("font-bold text-white", sizeMap[size].text)}>
          {initials}
        </span>
      )}
    </div>
  );
}
