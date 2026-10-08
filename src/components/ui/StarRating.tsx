"use client";

import { cn } from "@/lib/utils/cn";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  className?: string;
}

export default function StarRating({
  value,
  onChange,
  max = 5,
  size = "md",
  readonly = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value;

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      role="group"
      aria-label={`Rating: ${value} out of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayValue;

        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            className={cn(
              "transition-all duration-150",
              !readonly && "cursor-pointer hover:scale-125 active:scale-95",
              readonly && "cursor-default",
              size === "sm" && "text-sm",
              size === "md" && "text-lg",
              size === "lg" && "text-2xl"
            )}
            aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
          >
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill={isFilled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              className={cn(
                "transition-colors duration-200",
                isFilled ? "text-gold" : "text-text-muted"
              )}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
