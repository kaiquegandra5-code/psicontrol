import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "tertiary";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95 shadow-elevation-1",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  ghost:
    "bg-transparent text-on-surface hover:bg-surface-container-low",
  outline:
    "bg-paper border border-outline-variant/60 text-on-surface hover:bg-surface-container-low",
  danger:
    "bg-error text-error-foreground hover:bg-error/90",
  tertiary:
    "bg-tertiary text-tertiary-foreground hover:bg-tertiary/90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-label-md rounded-md gap-1.5",
  md: "h-10 px-4 text-label-md rounded-lg gap-2",
  lg: "h-12 px-6 text-label-md rounded-lg gap-2",
  icon: "h-10 w-10 rounded-lg",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      type = "button",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref as any}
        type={asChild ? undefined : type}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-150 focus-ring",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        <Slottable>{children}</Slottable>
        {!isLoading && rightIcon}
      </Comp>
    );
  }
);
Button.displayName = "Button";
