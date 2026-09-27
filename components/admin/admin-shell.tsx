"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminNav } from "./admin-nav";
import { LogoutButton } from "./logout-button";

export function AdminShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null };
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="font-admin flex min-h-screen bg-(--cream)">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e7e7dd] bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-[#e7e7dd] px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#bdac78] bg-(--cream) text-[10px] font-semibold tracking-wider text-(--ink)">
              E
            </span>
            <span className="text-sm font-semibold tracking-[0.12em] text-(--ink)">
              ETEC
            </span>
          </Link>
        </div>
        <div className="flex-1 py-5">
          <AdminNav />
        </div>
        <div className="border-t border-[#e7e7dd] p-4">
          <p className="truncate text-sm font-medium text-(--ink)">
            {user.name ?? user.email}
          </p>
          <p className="truncate text-xs text-(--muted-foreground)">
            {user.email}
          </p>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#e7e7dd] bg-white px-4 lg:hidden">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#bdac78] bg-(--cream) text-[10px] font-semibold tracking-wider text-(--ink)">
              E
            </span>
            <span className="text-sm font-semibold tracking-[0.12em] text-(--ink)">
              ETEC
            </span>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <div className="flex h-16 items-center justify-between border-b border-[#e7e7dd] px-4">
                <span className="flex items-center gap-3 text-sm font-semibold tracking-[0.12em] text-(--ink)">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#bdac78] bg-(--cream) text-[10px] font-semibold tracking-wider text-(--ink)">
                    E
                  </span>
                  ETEC
                </span>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Fermer le menu"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="py-4">
                <AdminNav close={() => setOpen(false)} />
              </div>
              <div className="absolute bottom-0 w-full border-t border-[#e7e7dd] p-4">
                <p className="truncate text-sm font-medium text-(--ink)">
                  {user.name ?? user.email}
                </p>
                <p className="truncate text-xs text-(--muted-foreground)">
                  {user.email}
                </p>
                <div className="mt-3">
                  <LogoutButton />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-5 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
