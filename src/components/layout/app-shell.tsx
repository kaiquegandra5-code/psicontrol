"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  user: { full_name: string; email: string };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  // Persist collapsed state in localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar user={user} collapsed={collapsed} onToggle={toggle} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
