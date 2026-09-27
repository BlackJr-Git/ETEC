"use client";

import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { EmptyState } from "./empty-state";

interface Reservation {
  id: string;
  nom: string;
  telephone: string;
  email: string | null;
  ville: string;
  site: string | null;
  dateReservation: number;
  type: string;
  statut: string;
  notes: string | null;
}

interface UpcomingReservationsProps {
  items: Reservation[];
}

const TYPE_LABELS: Record<string, string> = {
  visite: "Visite",
  concession: "Concession",
  obseques: "Obsèques",
};

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelative(ts: number) {
  const diff = ts - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Aujourd’hui";
  if (days === 1) return "Demain";
  if (days < 7) return `Dans ${days} jours`;
  return null;
}

export function UpcomingReservations({ items }: UpcomingReservationsProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[#e7e7dd] bg-white p-5">
        <h3 className="font-display text-lg font-normal tracking-tight text-(--ink)">
          Prochaines réservations
        </h3>
        <div className="mt-4">
          <EmptyState
            icon={CalendarDays}
            title="Aucune réservation à venir"
            description="Les réservations programmées apparaîtront ici."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e7e7dd] bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-normal tracking-tight text-(--ink)">
          Prochaines réservations
        </h3>
        <Link
          href="/admin/reservations"
          className="text-xs font-medium text-(--ink) hover:text-[#9c8a54]"
        >
          Voir tout
        </Link>
      </div>

      <ul className="space-y-3">
        {items.map((r) => {
          const relative = formatRelative(r.dateReservation);
          return (
            <li
              key={r.id}
              className="rounded-lg border border-[#efece2] bg-(--cream) p-3 transition-colors hover:border-[#e7e7dd] hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-(--ink)">
                    {r.nom}
                  </p>
                  <p className="mt-0.5 text-xs text-(--muted-foreground)">
                    {TYPE_LABELS[r.type] ?? r.type} · {r.ville}
                    {r.site ? ` · ${r.site}` : ""}
                  </p>
                </div>
                <StatusBadge status={r.statut} />
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-(--muted-foreground)">
                <Clock size={12} />
                <span>{formatDateTime(r.dateReservation)}</span>
                {relative && (
                  <span className="ml-auto font-medium text-(--ink)">
                    {relative}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
