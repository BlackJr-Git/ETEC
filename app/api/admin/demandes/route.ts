import { eq, like, and, or, desc, sql, inArray } from "drizzle-orm";
import { demandes } from "@/db/schema";
import { getDatabase } from "@/lib/db";
import {
  requireSession,
  parsePagination,
  jsonResponse,
  errorResponse,
} from "@/lib/admin";

const allowedStatuses = new Set(["nouveau", "en_cours", "traite", "archive"]);

export async function GET(request: Request) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const url = new URL(request.url);
  const { page, limit, offset } = parsePagination(url);
  const status = url.searchParams.get("status");
  const type = url.searchParams.get("type");
  const ville = url.searchParams.get("ville");
  const search = url.searchParams.get("search");

  const db = getDatabase();

  const conditions = [];
  if (status && allowedStatuses.has(status))
    conditions.push(eq(demandes.status, status));
  if (type) conditions.push(eq(demandes.type, type));
  if (ville) conditions.push(eq(demandes.ville, ville));
  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(
        like(demandes.nom, term),
        like(demandes.email, term),
        like(demandes.telephone, term),
        like(demandes.message, term),
      ),
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(demandes)
      .where(where)
      .orderBy(desc(demandes.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(demandes)
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
    notes?: string;
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
  if (typeof body.notes === "string") update.notes = body.notes;

  await db.update(demandes).set(update).where(inArray(demandes.id, body.ids));

  return jsonResponse({ updated: body.ids.length });
}
