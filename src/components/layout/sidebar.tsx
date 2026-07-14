"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  FolderArchive,
  Settings,
  LogOut,
  ChevronLeft,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { logoutAction } from "@/app/(auth)/actions";

const navItems = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/patients", label: "Pacientes", icon: Users },
  { href: "/appointments", label: "Agenda", icon: Calendar },
  { href: "/clinical-records", label: "Prontuários", icon: FileText },
  { href: "/documents", label: "Documentos", icon: FolderArchive },
  { href: "/settings", label: "Configurações", icon: Settings },
];

interface SidebarProps {
  user: { full_name: string; email: string };
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ user, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const initials = user.full_name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 bg-surface-container-lowest border-r border-outline-variant/40 transition-all duration-200 z-40",
        collapsed ? "w-[76px]" : "w-[280px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-outline-variant/40">
        {!collapsed ? (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-label-md font-heading">Psiorganizer</p>
              <p className="text-[10px] text-on-surface-variant">Gestão clínica</p>
            </div>
          </Link>
        ) : (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low",
            collapsed && "absolute -right-3.5 top-5 bg-paper border border-outline-variant/40"
          )}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 h-11 px-3 rounded-lg text-body-sm font-medium transition-colors group",
                active
                  ? "bg-primary/8 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              )}
              title={collapsed ? item.label : undefined}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  active ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface"
                )}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-outline-variant/40">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-label-sm shrink-0">
              {initials || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-on-surface truncate">{user.full_name}</p>
              <p className="text-[11px] text-on-surface-variant truncate">{user.email}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="p-1.5 rounded-md text-on-surface-variant hover:text-error hover:bg-error/5"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : (
          <form action={logoutAction} className="flex justify-center">
            <button
              type="submit"
              className="p-2 rounded-md text-on-surface-variant hover:text-error hover:bg-error/5"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
