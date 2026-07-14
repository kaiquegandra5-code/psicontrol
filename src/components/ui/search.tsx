"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onSearch?: (value: string) => void;
  debounceMs?: number;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onSearch, debounceMs = 300, value, defaultValue, onChange, ...props }, ref) => {
    const [internal, setInternal] = React.useState((defaultValue as string) ?? "");

    React.useEffect(() => {
      if (value === undefined) return;
      setInternal(String(value));
    }, [value]);

    React.useEffect(() => {
      if (!onSearch) return;
      const t = setTimeout(() => onSearch(internal), debounceMs);
      return () => clearTimeout(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [internal]);

    return (
      <div
        className={cn(
          "flex items-center h-10 px-3 bg-paper border border-outline-variant/60 rounded-full transition-colors",
          "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary",
          className
        )}
      >
        <svg
          className="h-4 w-4 text-on-surface-variant shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          ref={ref}
          type="search"
          value={value ?? internal}
          onChange={(e) => {
            setInternal(e.target.value);
            onChange?.(e);
          }}
          className="flex-1 ml-2 bg-transparent outline-none text-body-sm text-on-surface placeholder:text-on-surface-variant/60"
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
