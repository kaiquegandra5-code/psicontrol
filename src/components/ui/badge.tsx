import * as React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "neutral" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-tertiary/10 text-tertiary",
  warning: "bg-amber-100 text-amber-700",
  error: "bg-error/10 text-error",
  info: "bg-secondary/10 text-secondary",
  neutral: "bg-surface-container-high text-on-surface-variant",
  outline: "border border-outline-variant/60 text-on-surface",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-medium",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";
