"use client";

interface StatProps {
  value: React.ReactNode;
  label: string;
  hint?: string;
}

export function Stat({ value, label, hint }: StatProps) {
  return (
    <div className="flex flex-col">
      <span className="font-display text-4xl font-normal tracking-tight text-(--ink) md:text-5xl">
        {value}
      </span>
      <span className="mt-1 text-sm font-medium text-(--ink)">{label}</span>
      {hint && (
        <span className="text-xs text-(--muted-foreground)">{hint}</span>
      )}
    </div>
  );
}
