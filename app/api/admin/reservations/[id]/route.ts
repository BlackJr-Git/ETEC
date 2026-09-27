import { eq } from "drizzle-orm";
import { reservations } from "@/db/schema";
import { getDatabase } from "@/lib/db";
import { requireSession, jsonResponse, errorResponse } from "@/lib/admin";

const allowedStatuses = new Set([
  "en_attente",
  "confirmee",
  "annulee",
]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession(request);
  if (!session) return errorResponse("Non authentifié.", 401);

  const { id } = await params;
  const db = getDatabase();
  const row = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
  });

  if (!row) return errorResponse("Réservation introuvable.", 404);
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

  if (body.statut && !allowedStatuses.has(body.statut)) {
    return errorResponse("Statut invalide.");
  }

  const db = getDatabase();
  const update: Record<string, unknown> = { updatedAt: Date.now() };
  if (body.nom) update.nom = body.nom;
  if (body.telephone) update.telephone = body.telephone;
  if (typeof body.email === "string") update.email = body.email;
  if (body.ville) update.ville = body.ville;
  if (typeof body.site === "string") update.site = body.site;
  if (body.dateReservation) update.dateReservation = body.dateReservation;
  if (body.type) update.type = body.type;
  if (body.statut) update.statut = body.statut;
  if (typeof body.notes === "string") update.notes = body.notes;
  if (typeof body.demandeId === "string") update.demandeId = body.demandeId;

  await db.update(reservations).set(update).where(eq(reservations.id, id));

  const row = await db.query.reservations.findFirst({
    where: eq(reservations.id, id),
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
  await db.delete(reservations).where(eq(reservations.id, id));
  return jsonResponse({ deleted: id });
}
