"use client";

import Link from "next/link";
import { Inbox, MessageSquareText } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { EmptyState } from "./empty-state";

interface RecentDemande {
  id: string;
  type?: string;
  nom: string;
  ville?: string;
  status: string;
  createdAt: number;
}

interface RecentMessage {
  id: string;
  nom: string;
  sujet?: string;
  status: string;
  createdAt: number;
}

interface RecentListProps {
  demandes: RecentDemande[];
  messages: RecentMessage[];
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

const TYPE_LABELS: Record<string, string> = {
  achat: "Achat d’espace",
  funerailles: "Funérailles",
  diaspora: "Diaspora",
  renseignement: "Renseignement",
  reclamation: "Réclamation",
};

export function RecentList({ demandes, messages }: RecentListProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="rounded-xl border border-[#e7e7dd] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox size={16} className="text-(--muted-foreground)" />
            <h3 className="font-display text-lg font-normal tracking-tight text-(--ink)">
              Dernières demandes
            </h3>
          </div>
          <Link
            href="/admin/demandes"
            className="text-xs font-medium text-(--ink) hover:text-[#9c8a54]"
          >
            Voir tout
          </Link>
        </div>

        {demandes.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Aucune demande"
            description="Les demandes envoyées depuis le site apparaîtront ici."
          />
        ) : (
          <ul className="divide-y divide-[#f0ede5]">
            {demandes.map((d) => (
              <li
                key={d.id}
                className="group flex items-center justify-between gap-4 py-3 transition-colors first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-(--ink)">
                    {d.nom}
                  </p>
                  <p className="text-xs text-(--muted-foreground)">
                    {d.type ? `${TYPE_LABELS[d.type] ?? d.type} · ` : ""}
                    {d.ville ? `${d.ville} · ` : ""}
                    {formatDate(d.createdAt)}
                  </p>
                </div>
                <StatusBadge status={d.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-[#e7e7dd] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareText
              size={16}
              className="text-(--muted-foreground)"
            />
            <h3 className="font-display text-lg font-normal tracking-tight text-(--ink)">
              Derniers messages
            </h3>
          </div>
          <Link
            href="/admin/messages"
            className="text-xs font-medium text-(--ink) hover:text-[#9c8a54]"
          >
            Voir tout
          </Link>
        </div>

        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquareText}
            title="Aucun message"
            description="Les messages envoyés via le formulaire de contact apparaîtront ici."
          />
        ) : (
          <ul className="divide-y divide-[#f0ede5]">
            {messages.map((m) => (
              <li
                key={m.id}
                className="group flex items-center justify-between gap-4 py-3 transition-colors first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-(--ink)">
                    {m.sujet ?? m.nom}
                  </p>
                  <p className="text-xs text-(--muted-foreground)">
                    {m.nom} · {formatDate(m.createdAt)}
                  </p>
                </div>
                <StatusBadge status={m.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
