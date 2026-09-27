"use client";

import { cn } from "@/lib/utils";

interface BreakdownItem {
  label: string;
  value: number;
}

interface TypeBreakdownProps {
  items: BreakdownItem[];
  title: string;
  empty?: string;
  color?: "ink" | "gold";
}

const TYPE_LABELS: Record<string, string> = {
  achat: "Achat d’espace",
  funerailles: "Funérailles",
  diaspora: "Diaspora",
  renseignement: "Renseignement",
  reclamation: "Réclamation",
};

export function TypeBreakdown({
  items,
  title,
  empty = "Aucune donnée",
  color = "gold",
}: TypeBreakdownProps) {
  const total = items.reduce((sum, i) => sum + i.value, 0);
  const sorted = [...items].sort((a, b) => b.value - a.value);

  return (
    <div className="rounded-xl border border-[#e7e7dd] bg-white p-5">
      <h3 className="font-display text-lg font-normal tracking-tight text-(--ink)">
        {title}
      </h3>

      {total === 0 ? (
        <p className="mt-6 text-sm text-(--muted-foreground)">{empty}</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {sorted.map((item) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <li key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-(--ink)">
                    {TYPE_LABELS[item.label] ?? item.label}
                  </span>
                  <span className="text-(--muted-foreground)">
                    {item.value}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-(--cream)">
                  <div
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      color === "ink" ? "bg-(--ink)" : "bg-[#bdac78]",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
