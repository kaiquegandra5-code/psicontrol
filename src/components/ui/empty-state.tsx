import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl border border-dashed border-outline-variant/60 bg-paper/50",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
          {icon}
        </div>
      )}
      <h3 className="text-headline-sm text-on-surface font-medium">{title}</h3>
      {description && (
        <p className="mt-2 text-body-md text-on-surface-variant max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
