import { eq, like, and, or, desc, sql, inArray } from "drizzle-orm";
import { reservations } from "@/db/schema";
import { getDatabase } from "@/lib/db";
import {
  requireSession,
  parsePagination,
  jsonResponse,
  errorResponse,
} from "@/lib/admin";

const allowedStatuses = new Set([
  "en_attente",
  "confirmee",
  "annulee",
]);

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
  if (status && allowedStatuses.has(status)) conditions.push(eq(reservations.statut, status));
  if (type) conditions.push(eq(reservations.type, type));
  if (ville) conditions.push(eq(reservations.ville, ville));
  if (search) {
    const term = `%${search}%`;
    conditions.push(
      or(
        like(reservations.nom, term),
        like(reservations.email, term),
        like(reservations.telephone, term),
        like(reservations.site, term)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(reservations)
      .where(where)
      .orderBy(desc(reservations.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(reservations)
      .where(where),
  ]);

  const count = countResult[0]?.count ?? 0;

  return jsonResponse({
    data: rows,
    meta: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
}

export async function POST(request: Request) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const body = (await request.json()) as {
    nom?: string;
    telephone?: string;
    email?: string;
    ville?: string;
    site?: string;
    dateReservation?: number;
    type?: string;
    statut?: string;
    notes?: string;
    demandeId?: string;
  };

  if (!body.nom || !body.telephone || !body.ville || !body.dateReservation || !body.type) {
    return errorResponse("Champs obligatoires manquants.");
  }

  if (body.statut && !allowedStatuses.has(body.statut)) {
    return errorResponse("Statut invalide.");
  }

  const id = crypto.randomUUID();
  const now = Date.now();

  const db = getDatabase();
  await db.insert(reservations).values({
    id,
    nom: body.nom,
    telephone: body.telephone,
    email: body.email,
    ville: body.ville,
    site: body.site,
    dateReservation: body.dateReservation,
    type: body.type,
    statut: body.statut ?? "en_attente",
    notes: body.notes,
    demandeId: body.demandeId,
    createdAt: now,
    updatedAt: now,
  });

  const row = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
  });

  return jsonResponse(row, 201);
}

export async function PATCH(request: Request) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const body = (await request.json()) as {
    ids?: string[];
    statut?: string;
  };

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return errorResponse("Aucun identifiant fourni.");
  }

  if (body.statut && !allowedStatuses.has(body.statut)) {
    return errorResponse("Statut invalide.");
  }

  const db = getDatabase();
  const update: Record<string, unknown> = { updatedAt: Date.now() };
  if (body.statut) update.statut = body.statut;

  await db.update(reservations).set(update).where(inArray(reservations.id, body.ids));

  return jsonResponse({ updated: body.ids.length });
}
