"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
}

const variantClasses = {
  default: "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90",
  secondary: "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--accent)]",
  outline: "border border-[var(--border)] bg-transparent hover:bg-[var(--accent)] text-[var(--foreground)]",
  ghost: "bg-transparent hover:bg-[var(--accent)] text-[var(--foreground)]",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  link: "bg-transparent underline-offset-4 hover:underline text-[var(--foreground)] p-0 h-auto",
};

const sizeClasses = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-6 text-sm",
  icon: "h-9 w-9",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150",
          "disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
