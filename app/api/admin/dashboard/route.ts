import { desc, sql, gte, count } from "drizzle-orm";
import { demandes, messages, reservations } from "@/db/schema";
import { getDatabase } from "@/lib/db";
import { requireSession, jsonResponse, errorResponse } from "@/lib/admin";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatDay(ts: number) {
  return new Date(ts).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
  });
}

export async function GET(request: Request) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const db = getDatabase();
  const now = Date.now();
  const todayStart = startOfDay(now);
  const sevenDaysAgo = todayStart - 6 * DAY_MS;

  const [
    demandesTotal,
    demandesByStatus,
    demandesByType,
    demandesByVille,
    messagesTotal,
    messagesByStatus,
    reservationsTotal,
    reservationsByStatus,
    demandesDaily,
    messagesDaily,
    upcomingReservations,
    recentDemandes,
    recentMessages,
  ] = await Promise.all([
    db.select({ count: count() }).from(demandes),
    db
      .select({ status: demandes.status, count: count() })
      .from(demandes)
      .groupBy(demandes.status),
    db
      .select({ type: demandes.type, count: count() })
      .from(demandes)
      .groupBy(demandes.type),
    db
      .select({ ville: demandes.ville, count: count() })
      .from(demandes)
      .groupBy(demandes.ville),
    db.select({ count: count() }).from(messages),
    db
      .select({ status: messages.status, count: count() })
      .from(messages)
      .groupBy(messages.status),
    db.select({ count: count() }).from(reservations),
    db
      .select({ statut: reservations.statut, count: count() })
      .from(reservations)
      .groupBy(reservations.statut),
    db
      .select({
        day: sql<string>`date(${demandes.createdAt} / 1000, 'unixepoch')`,
        count: count(),
      })
      .from(demandes)
      .where(gte(demandes.createdAt, sevenDaysAgo))
      .groupBy(sql`date(${demandes.createdAt} / 1000, 'unixepoch')`)
      .orderBy(sql`date(${demandes.createdAt} / 1000, 'unixepoch')`),
    db
      .select({
        day: sql<string>`date(${messages.createdAt} / 1000, 'unixepoch')`,
        count: count(),
      })
      .from(messages)
      .where(gte(messages.createdAt, sevenDaysAgo))
      .groupBy(sql`date(${messages.createdAt} / 1000, 'unixepoch')`)
      .orderBy(sql`date(${messages.createdAt} / 1000, 'unixepoch')`),
    db
      .select()
      .from(reservations)
      .where(gte(reservations.dateReservation, now))
      .orderBy(reservations.dateReservation)
      .limit(5),
    db.select().from(demandes).orderBy(desc(demandes.createdAt)).limit(5),
    db.select().from(messages).orderBy(desc(messages.createdAt)).limit(5),
  ]);

  const demandesByStatusMap = Object.fromEntries(
    demandesByStatus.map((r) => [r.status, r.count]),
  );
  const messagesByStatusMap = Object.fromEntries(
    messagesByStatus.map((r) => [r.status, r.count]),
  );
  const reservationsByStatusMap = Object.fromEntries(
    reservationsByStatus.map((r) => [r.statut, r.count]),
  );

  const demandesDailyMap = Object.fromEntries(
    demandesDaily.map((r) => [r.day, r.count]),
  );
  const messagesDailyMap = Object.fromEntries(
    messagesDaily.map((r) => [r.day, r.count]),
  );

  const activity = Array.from({ length: 7 }, (_, i) => {
    const dayStart = todayStart - (6 - i) * DAY_MS;
    const dayKey = new Date(dayStart).toISOString().slice(0, 10);
    return {
      label: formatDay(dayStart),
      demandes: demandesDailyMap[dayKey] ?? 0,
      messages: messagesDailyMap[dayKey] ?? 0,
    };
  });

  return jsonResponse({
    counts: {
      demandes: {
        total: demandesTotal[0]?.count ?? 0,
        byStatus: demandesByStatusMap,
      },
      messages: {
        total: messagesTotal[0]?.count ?? 0,
        byStatus: messagesByStatusMap,
      },
      reservations: {
        total: reservationsTotal[0]?.count ?? 0,
        byStatus: reservationsByStatusMap,
      },
    },
    breakdown: {
      demandesByType: demandesByType.map((r) => ({
        label: r.type,
        value: r.count,
      })),
      demandesByVille: demandesByVille.map((r) => ({
        label: r.ville,
        value: r.count,
      })),
    },
    activity,
    upcomingReservations,
    recentDemandes,
    recentMessages,
  });
}
