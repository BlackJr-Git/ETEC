import { eq, gte, count } from "drizzle-orm";
import { reservations } from "@/db/schema";
import { getDatabase } from "@/lib/db";
import { requireSession, jsonResponse, errorResponse } from "@/lib/admin";

export async function GET(request: Request) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const db = getDatabase();
  const now = Date.now();

  const [total, byStatus, upcoming, confirmed] = await Promise.all([
    db.select({ count: count() }).from(reservations),
    db
      .select({ statut: reservations.statut, count: count() })
      .from(reservations)
      .groupBy(reservations.statut),
    db
      .select({ count: count() })
      .from(reservations)
      .where(gte(reservations.dateReservation, now)),
    db
      .select({ count: count() })
      .from(reservations)
      .where(eq(reservations.statut, "confirmee")),
  ]);

  return jsonResponse({
    total: total[0]?.count ?? 0,
    byStatus: Object.fromEntries(byStatus.map((r) => [r.statut, r.count])),
    upcoming: upcoming[0]?.count ?? 0,
    confirmed: confirmed[0]?.count ?? 0,
  });
}
