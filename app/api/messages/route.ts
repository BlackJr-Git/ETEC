import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const raw = (await request.json()) as Record<string, unknown>;
    const nom = clean(raw.nom, 120);
    const telephone = clean(raw.telephone, 40);
    const email = clean(raw.email, 180);
    const sujet = clean(raw.sujet, 200);
    const contenu = clean(raw.contenu, 3000);

    if (nom.length < 2 || sujet.length < 2 || contenu.length < 5) {
      return NextResponse.json(
        { error: "Veuillez vérifier les champs du formulaire." },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "L’adresse e-mail semble invalide." },
        { status: 400 }
      );
    }

    if (!env.DB) throw new Error("D1 indisponible");

    const id = crypto.randomUUID();
    await env.DB.prepare(
      "INSERT INTO messages (id, nom, telephone, email, sujet, contenu, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
      .bind(
        id,
        nom,
        telephone || null,
        email || null,
        sujet,
        contenu,
        "nouveau",
        Date.now(),
        Date.now()
      )
      .run();

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Message submission failed", error);
    return NextResponse.json(
      { error: "Service temporairement indisponible." },
      { status: 503 }
    );
  }
}
