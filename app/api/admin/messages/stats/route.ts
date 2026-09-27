import { eq, count } from "drizzle-orm";
import { messages } from "@/db/schema";
import { getDatabase } from "@/lib/db";
import { requireSession, jsonResponse, errorResponse } from "@/lib/admin";

export async function GET(request: Request) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const db = getDatabase();

  const [total, byStatus, nouveaux, nonRepondus] = await Promise.all([
    db.select({ count: count() }).from(messages),
    db
      .select({ status: messages.status, count: count() })
      .from(messages)
      .groupBy(messages.status),
    db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.status, "nouveau")),
    db
      .select({ count: count() })
      .from(messages)
      .where(eq(messages.status, "lu")),
  ]);

  return jsonResponse({
    total: total[0]?.count ?? 0,
    byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.count])),
    nouveaux: nouveaux[0]?.count ?? 0,
    nonRepondus: (nouveaux[0]?.count ?? 0) + (nonRepondus[0]?.count ?? 0),
  });
}
