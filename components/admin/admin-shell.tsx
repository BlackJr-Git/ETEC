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
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#dddad4] bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-[#dddad4] px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Le Chemin du Paradis"
              className="h-10 w-auto"
            />
          </Link>
        </div>
        <div className="flex-1 py-5">
          <AdminNav />
        </div>
        <div className="border-t border-[#dddad4] p-4">
          <p className="truncate text-sm font-medium text-(--ink)">
            {user.name ?? user.email}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#dddad4] bg-white px-4 lg:hidden">
          <Link href="/admin" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Le Chemin du Paradis"
              className="h-9 w-auto"
            />
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <div className="flex h-16 items-center justify-between border-b border-[#dddad4] px-4">
                <img
                  src="/logo.png"
                  alt="Le Chemin du Paradis"
                  className="h-9 w-auto"
                />
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
              <div className="absolute bottom-0 w-full border-t border-[#dddad4] p-4">
                <p className="truncate text-sm font-medium text-(--ink)">
                  {user.name ?? user.email}
                </p>
                <p className="truncate text-xs text-muted-foreground">
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
