"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#d9d6ce] bg-white px-6 py-14 text-center">
      <div className="mb-4 rounded-full bg-(--cream) p-3 text-(--ink)">
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <p className="text-base font-medium text-(--ink)">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-(--muted-foreground)">
          {description}
        </p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
