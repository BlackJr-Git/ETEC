import { NextResponse } from "next/server";
import { demandes } from "@/db/schema";
import { getDatabase } from "@/lib/db";
const kinds = new Set([
  "achat",
  "funerailles",
  "diaspora",
  "renseignement",
  "reclamation",
]);
function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as Record<string, unknown>;
    const type = clean(raw.type, 30),
      nom = clean(raw.nom, 120),
      telephone = clean(raw.telephone, 40),
      email = clean(raw.email, 180),
      ville = clean(raw.ville, 30),
      site = clean(raw.site, 120),
      message = clean(raw.message, 3000);
    if (
      !kinds.has(type) ||
      nom.length < 2 ||
      telephone.length < 6 ||
      !message ||
      !["Kinshasa", "Lubumbashi"].includes(ville) ||
      (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ||
      raw.accord !== "on"
    )
      return NextResponse.json(
        { error: "Veuillez vérifier les champs du formulaire." },
        { status: 400 },
      );
    const id = crypto.randomUUID();
    const reference = `ETEC-${new Date().getUTCFullYear()}-${id.slice(0, 8).toUpperCase()}`;
    const now = Date.now();
    await getDatabase()
      .insert(demandes)
      .values({
        id: reference,
        type,
        nom,
        telephone,
        email: email || null,
        ville,
        site: site || null,
        message,
        createdAt: now,
        updatedAt: now,
        status: "nouveau",
      });
    return NextResponse.json({ reference }, { status: 201 });
  } catch (error) {
    console.error("Request submission failed", error);
    return NextResponse.json(
      { error: "Service temporairement indisponible." },
      { status: 503 },
    );
  }
}
