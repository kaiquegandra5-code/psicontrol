import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div
          className={cn(
            "flex items-center gap-2 h-11 px-3 bg-paper border rounded-lg transition-colors",
            "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
            error
              ? "border-error focus-within:border-error focus-within:ring-error/20"
              : "border-outline-variant/60",
            className
          )}
        >
          {leftIcon && <span className="text-on-surface-variant shrink-0">{leftIcon}</span>}
          <input
            ref={ref}
            type={type}
            className="flex-1 bg-transparent outline-none text-body-md text-on-surface placeholder:text-on-surface-variant/60 disabled:opacity-50"
            {...props}
          />
          {rightIcon && <span className="text-on-surface-variant shrink-0">{rightIcon}</span>}
        </div>
        {error && <p className="mt-1.5 text-body-sm text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "w-full min-h-[120px] px-3 py-2.5 bg-paper border rounded-lg outline-none transition-colors resize-y",
            "focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "text-body-md text-on-surface placeholder:text-on-surface-variant/60",
            "border-outline-variant/60 disabled:opacity-50",
            error && "border-error focus:border-error focus:ring-error/20",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-body-sm text-error">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
