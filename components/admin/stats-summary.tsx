"use client";

import { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: number | string;
  subLabel?: string;
  icon?: LucideIcon;
}

interface StatsSummaryProps {
  items: StatItem[];
}

export function StatsSummary({ items }: StatsSummaryProps) {
  if (items.length === 0) return null;

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="rounded-xl border border-[#e7e7dd] bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-(--muted-foreground)">
                  {item.label}
                </p>
                <p className="mt-1 font-display text-2xl font-normal tracking-tight text-(--ink)">
                  {item.value}
                </p>
                {item.subLabel && (
                  <p className="mt-0.5 text-xs text-(--muted-foreground)">
                    {item.subLabel}
                  </p>
                )}
              </div>
              {Icon && (
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--cream) text-(--ink)">
                  <Icon size={16} strokeWidth={1.6} />
                </span>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
