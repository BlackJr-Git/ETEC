"use client";

import Link from "next/link";
import { ArrowUpRight, LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  subLabel?: string;
  hint?: string;
  icon: LucideIcon;
  href?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({
  label,
  value,
  subLabel,
  hint,
  icon: Icon,
  href,
  trend,
  className,
}: StatCardProps) {
  const Wrapper = href ? Link : "div";

  return (
    <Wrapper
      href={href ?? "#"}
      className={cn(
        "group relative flex flex-col rounded-xl border border-[#e7e7dd] bg-white p-5 transition-colors",
        href && "hover:border-[#d6d3c8] hover:bg-[#faf9f5]",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-(--muted-foreground)">
          {label}
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--cream) text-(--ink) transition-colors group-hover:bg-[#efece2]">
          <Icon size={18} strokeWidth={1.6} />
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-normal tracking-tight text-(--ink) md:text-4xl">
          {value}
        </span>
        {subLabel && (
          <span className="text-sm font-medium text-(--muted-foreground)">
            {subLabel}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {hint ? (
          <span className="text-xs text-(--muted-foreground)">{hint}</span>
        ) : (
          <span />
        )}

        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              trend.value >= 0 ? "text-emerald-700" : "text-rose-700",
            )}
          >
            {trend.value >= 0 ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>

      {href && (
        <span className="absolute right-4 top-4 text-(--muted-foreground) opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowUpRight size={14} />
        </span>
      )}
    </Wrapper>
  );
}
