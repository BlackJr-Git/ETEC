import { eq } from "drizzle-orm";
import { demandes } from "@/db/schema";
import { getDatabase } from "@/lib/db";
import { requireSession, jsonResponse, errorResponse } from "@/lib/admin";

const allowedStatuses = new Set([
  "nouveau",
  "en_cours",
  "traite",
  "archive",
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const { id } = await params;
  const db = getDatabase();
  const row = await db.query.demandes.findFirst({
    where: eq(demandes.id, id),
  });

  if (!row) return errorResponse("Demande introuvable.", 404);
  return jsonResponse(row);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const { id } = await params;
  const body = (await request.json()) as {
    status?: string;
    notes?: string;
  };

  if (body.status && !allowedStatuses.has(body.status)) {
    return errorResponse("Statut invalide.");
  }

  const db = getDatabase();
  const update: Record<string, unknown> = { updatedAt: Date.now() };
  if (body.status) update.status = body.status;
  if (typeof body.notes === "string") update.notes = body.notes;

  await db.update(demandes).set(update).where(eq(demandes.id, id));

  const row = await db.query.demandes.findFirst({
    where: eq(demandes.id, id),
  });
  return jsonResponse(row);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const { id } = await params;
  const db = getDatabase();
  await db.delete(demandes).where(eq(demandes.id, id));
  return jsonResponse({ deleted: id });
}
