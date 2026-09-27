"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  CalendarDays,
  MessageSquareText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/demandes", label: "Demandes", icon: Inbox },
  { href: "/admin/messages", label: "Messages", icon: MessageSquareText },
  { href: "/admin/reservations", label: "Réservations", icon: CalendarDays },
];

export function AdminNav({ close }: { close?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={close}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-[#f3f0e6] font-medium text-(--ink)"
                : "text-foreground hover:bg-muted",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-[#bdac78]" />
            )}
            <Icon
              size={17}
              strokeWidth={active ? 2 : 1.8}
              className={cn(
                "transition-colors",
                active ? "text-[#9c8a54]" : "text-(--muted-foreground)",
              )}
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
