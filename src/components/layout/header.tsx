"use client";

import * as React from "react";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ReactNode;
  };
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 bg-paper/80 backdrop-blur-md border-b border-outline-variant/40">
      <div className="flex items-center justify-between gap-6 h-20 px-8">
        <div className="min-w-0">
          <h1 className="text-headline-md font-heading truncate">{title}</h1>
          {subtitle && (
            <p className="text-body-sm text-on-surface-variant truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {action && (
            <Button
              size="md"
              leftIcon={action.icon ?? <Plus className="h-4 w-4" />}
              onClick={() => {
                if (action.href) router.push(action.href);
                if (action.onClick) action.onClick();
              }}
            >
              {action.label}
            </Button>
          )}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            title="Notificações"
          >
            <Bell className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
