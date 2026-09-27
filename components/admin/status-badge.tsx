"use client";

import { cn } from "@/lib/utils";

const config: Record<string, { surface: string; dot: string; label: string }> =
  {
    nouveau: {
      surface: "bg-amber-50 text-amber-900 ring-amber-200/60",
      dot: "bg-amber-500",
      label: "Nouveau",
    },
    en_attente: {
      surface: "bg-amber-50 text-amber-900 ring-amber-200/60",
      dot: "bg-amber-500",
      label: "En attente",
    },
    en_cours: {
      surface: "bg-sky-50 text-sky-900 ring-sky-200/60",
      dot: "bg-sky-500",
      label: "En cours",
    },
    lu: {
      surface: "bg-sky-50 text-sky-900 ring-sky-200/60",
      dot: "bg-sky-500",
      label: "Lu",
    },
    traite: {
      surface: "bg-emerald-50 text-emerald-900 ring-emerald-200/60",
      dot: "bg-emerald-500",
      label: "Traité",
    },
    repondu: {
      surface: "bg-emerald-50 text-emerald-900 ring-emerald-200/60",
      dot: "bg-emerald-500",
      label: "Répondu",
    },
    confirmee: {
      surface: "bg-emerald-50 text-emerald-900 ring-emerald-200/60",
      dot: "bg-emerald-500",
      label: "Confirmée",
    },
    archive: {
      surface: "bg-stone-50 text-stone-700 ring-stone-200/60",
      dot: "bg-stone-400",
      label: "Archivé",
    },
    annulee: {
      surface: "bg-rose-50 text-rose-900 ring-rose-200/60",
      dot: "bg-rose-500",
      label: "Annulée",
    },
  };

export function StatusBadge({ status }: { status: string }) {
  const resolved = config[status] ?? {
    surface: "bg-stone-50 text-stone-700 ring-stone-200/60",
    dot: "bg-stone-400",
    label: status,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
        resolved.surface,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", resolved.dot)} />
      {resolved.label}
    </span>
  );
}
