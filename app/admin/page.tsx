"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  MessageSquareText,
  CalendarDays,
  Users,
  Calendar,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ActivityChart } from "@/components/admin/activity-chart";
import { TypeBreakdown } from "@/components/admin/type-breakdown";
import { UpcomingReservations } from "@/components/admin/upcoming-reservations";
import { RecentList } from "@/components/admin/recent-list";

interface Counts {
  demandes: {
    total: number;
    byStatus: Record<string, number>;
  };
  messages: {
    total: number;
    byStatus: Record<string, number>;
  };
  reservations: {
    total: number;
    byStatus: Record<string, number>;
  };
}

interface BreakdownItem {
  label: string;
  value: number;
}

interface ActivityItem {
  label: string;
  demandes: number;
  messages: number;
}

interface DashboardData {
  counts: Counts;
  breakdown: {
    demandesByType: BreakdownItem[];
    demandesByVille: BreakdownItem[];
  };
  activity: ActivityItem[];
  upcomingReservations: Array<{
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
  }>;
  recentDemandes: Array<{
    id: string;
    type?: string;
    nom: string;
    ville?: string;
    status: string;
    createdAt: number;
  }>;
  recentMessages: Array<{
    id: string;
    nom: string;
    sujet?: string;
    status: string;
    createdAt: number;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Erreur de chargement.");
        const json = (await res.json()) as DashboardData;
        setData(json);
      } catch {
        setError("Impossible de charger le tableau de bord.");
      }
    }
    load();
  }, []);

  const demandesNonTraitees =
    (data?.counts.demandes.byStatus.nouveau ?? 0) +
    (data?.counts.demandes.byStatus.en_cours ?? 0);

  const messagesATraiter =
    (data?.counts.messages.byStatus.nouveau ?? 0) +
    (data?.counts.messages.byStatus.lu ?? 0);

  const reservationsAVenir = data?.upcomingReservations.length ?? 0;

  const contactsCeMois =
    data?.activity.reduce((sum, d) => sum + d.demandes + d.messages, 0) ?? 0;

  async function handleSeed() {
    if (!confirm("Charger un jeu de données de démonstration ?")) return;
    const res = await fetch("/api/admin/seed", { method: "POST" });
    if (res.ok) {
      window.location.reload();
    } else {
      alert("Erreur lors du chargement des données de démo.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description={`Aperçu de l’activité du ${today}.`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleSeed}>
            <Database size={14} className="mr-1.5" />
            Données de démo
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/reservations?action=new">
              Nouvelle réservation
            </Link>
          </Button>
        </div>
      </PageHeader>

      {error && (
        <p className="mb-6 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Demandes à traiter"
          value={data ? demandesNonTraitees : "—"}
          subLabel={`sur ${data?.counts.demandes.total ?? 0}`}
          hint={`${data?.counts.demandes.byStatus.traite ?? 0} traitées`}
          icon={Inbox}
          href="/admin/demandes"
        />
        <StatCard
          label="Messages en attente"
          value={data ? messagesATraiter : "—"}
          subLabel={`${data?.counts.messages.byStatus.nouveau ?? 0} nouveaux`}
          hint={`${data?.counts.messages.byStatus.repondu ?? 0} répondus`}
          icon={MessageSquareText}
          href="/admin/messages"
        />
        <StatCard
          label="Réservations à venir"
          value={data ? reservationsAVenir : "—"}
          subLabel={`sur ${data?.counts.reservations.total ?? 0}`}
          hint={`${data?.counts.reservations.byStatus.confirmee ?? 0} confirmées`}
          icon={CalendarDays}
          href="/admin/reservations"
        />
        <StatCard
          label="Contacts cette semaine"
          value={data ? contactsCeMois : "—"}
          subLabel="demandes + messages"
          icon={Users}
        />
      </section>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <ActivityChart data={data?.activity ?? []} />
        <UpcomingReservations items={data?.upcomingReservations ?? []} />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <RecentList
          demandes={data?.recentDemandes ?? []}
          messages={data?.recentMessages ?? []}
        />
        <TypeBreakdown
          title="Demandes par type"
          items={data?.breakdown.demandesByType ?? []}
          empty="Aucune demande enregistrée"
        />
      </div>

      <div className="rounded-xl border border-[#e7e7dd] bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-normal tracking-tight text-(--ink)">
              Accès rapides
            </h3>
            <p className="text-xs text-(--muted-foreground)">
              Naviguez vers les listes principales.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link
                href="/admin/demandes"
                className="inline-flex items-center gap-2"
              >
                <Inbox size={14} />
                Demandes
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href="/admin/messages"
                className="inline-flex items-center gap-2"
              >
                <MessageSquareText size={14} />
                Messages
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link
                href="/admin/reservations"
                className="inline-flex items-center gap-2"
              >
                <Calendar size={14} />
                Réservations
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
