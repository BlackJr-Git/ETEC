"use client";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 border-b border-[#e7e7dd] pb-6", className)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-display text-balance text-3xl font-normal tracking-tight text-(--ink) md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm leading-relaxed text-(--muted-foreground)">
              {description}
            </p>
          )}
        </div>
        {children && <div className="flex shrink-0 gap-2">{children}</div>}
      </div>
    </div>
  );
}
