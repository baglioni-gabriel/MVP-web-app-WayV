"use client";

import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          /* Base */
          "inline-flex items-center justify-center gap-2 font-semibold",
          "rounded-[var(--radius-md)] transition-all duration-200",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.97]",

          /* Variants */
          variant === "primary" &&
            "bg-gold text-navy-dark hover:bg-gold-light shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-glow-gold)]",
          variant === "secondary" &&
            "bg-navy text-white hover:bg-navy-light",
          variant === "outline" &&
            "border-2 border-gold text-gold bg-transparent hover:bg-gold/10",
          variant === "ghost" &&
            "text-text-secondary bg-transparent hover:text-text-primary hover:bg-white/5",
          variant === "danger" &&
            "bg-danger text-white hover:bg-red-600",

          /* Sizes */
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-5 py-2.5 text-sm",
          size === "lg" && "px-7 py-3 text-base",

          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
