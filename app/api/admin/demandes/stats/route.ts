import { eq, count } from "drizzle-orm";
import { demandes } from "@/db/schema";
import { getDatabase } from "@/lib/db";
import { requireSession, jsonResponse, errorResponse } from "@/lib/admin";

export async function GET(request: Request) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const db = getDatabase();

  const [total, byStatus, byType, byVille, recent] = await Promise.all([
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
    db
      .select({ count: count() })
      .from(demandes)
      .where(eq(demandes.status, "nouveau")),
  ]);

  return jsonResponse({
    total: total[0]?.count ?? 0,
    byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.count])),
    byType: byType.map((r) => ({ label: r.type, value: r.count })),
    byVille: byVille.map((r) => ({ label: r.ville, value: r.count })),
    nouvelles: recent[0]?.count ?? 0,
  });
}
