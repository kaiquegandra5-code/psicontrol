"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

type ToastVariant = "default" | "success" | "error" | "info";
type Toast = {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type Listener = (toasts: Toast[]) => void;

class ToastManager {
  private toasts: Toast[] = [];
  private listeners = new Set<Listener>();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    fn(this.toasts);
    return () => {
      this.listeners.delete(fn);
    };
  }

  push(t: Omit<Toast, "id">) {
    const id = Math.random().toString(36).slice(2);
    this.toasts = [...this.toasts, { id, ...t }];
    this.notify();
    setTimeout(() => this.dismiss(id), 4000);
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  private notify() {
    for (const l of this.listeners) l(this.toasts);
  }
}

const manager = new ToastManager();

export const toast = {
  success: (title: string, description?: string) =>
    manager.push({ title, description, variant: "success" }),
  error: (title: string, description?: string) =>
    manager.push({ title, description, variant: "error" }),
  info: (title: string, description?: string) =>
    manager.push({ title, description, variant: "info" }),
};

const variantStyles: Record<ToastVariant, { border: string; icon: React.ReactNode; iconClass: string }> = {
  default: {
    border: "border-outline-variant/60",
    icon: <Info className="h-5 w-5" />,
    iconClass: "text-primary",
  },
  success: {
    border: "border-tertiary/40",
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconClass: "text-tertiary",
  },
  error: {
    border: "border-error/40",
    icon: <XCircle className="h-5 w-5" />,
    iconClass: "text-error",
  },
  info: {
    border: "border-primary/40",
    icon: <AlertCircle className="h-5 w-5" />,
    iconClass: "text-primary",
  },
};

export function Toaster() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    return manager.subscribe(setToasts);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const v = variantStyles[t.variant ?? "default"];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 w-80 p-4 rounded-lg border shadow-elevation-3",
              "bg-paper animate-fade-in",
              v.border
            )}
          >
            <span className={v.iconClass}>{v.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-on-surface">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-body-sm text-on-surface-variant">{t.description}</p>
              )}
            </div>
            <button
              onClick={() => manager.dismiss(t.id)}
              className="text-on-surface-variant hover:text-on-surface shrink-0"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
