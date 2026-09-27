import { eq, like, and, or, desc, sql, inArray } from "drizzle-orm";
import { messages } from "@/db/schema";
import { getDatabase } from "@/lib/db";
import {
  requireSession,
  parsePagination,
  jsonResponse,
  errorResponse,
} from "@/lib/admin";

const allowedStatuses = new Set([
  "nouveau",
  "lu",
  "repondu",
  "archive",
]);

export async function GET(request: Request) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const url = new URL(request.url);
  const { page, limit, offset } = parsePagination(url);
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  const db = getDatabase();

  const conditions = [];
  if (status && allowedStatuses.has(status)) conditions.push(eq(messages.status, status));
  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(
        like(messages.nom, term),
        like(messages.email, term),
        like(messages.sujet, term),
        like(messages.contenu, term)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(messages)
      .where(where)
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(where),
  ]);

  const count = countResult[0]?.count ?? 0;

  return jsonResponse({
    data: rows,
    meta: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
}

export async function PATCH(request: Request) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const body = (await request.json()) as {
    ids?: string[];
    status?: string;
  };

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return errorResponse("Aucun identifiant fourni.");
  }

  if (body.status && !allowedStatuses.has(body.status)) {
    return errorResponse("Statut invalide.");
  }

  const db = getDatabase();
  const update: Record<string, unknown> = { updatedAt: Date.now() };
  if (body.status) update.status = body.status;

  await db.update(messages).set(update).where(inArray(messages.id, body.ids));

  return jsonResponse({ updated: body.ids.length });
}
