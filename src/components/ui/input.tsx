import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
            {icon}
          </div>
          <input
            ref={ref}
            className={cn(
              "flex h-9 w-full rounded-md border border-[var(--input)] bg-[var(--background)]",
              "pl-9 pr-3 py-2 text-sm text-[var(--foreground)]",
              "placeholder:text-[var(--muted-foreground)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors",
              className
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          "flex h-9 w-full rounded-md border border-[var(--input)] bg-[var(--background)]",
          "px-3 py-2 text-sm text-[var(--foreground)]",
          "placeholder:text-[var(--muted-foreground)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
