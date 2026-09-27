"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessageSection() {
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="wrap py-16 lg:py-24" id="message">
      <div className="mx-auto max-w-2xl rounded-xl border border-[#e7e7dd] bg-white p-6 md:p-10">
        <p className="eyebrow dark mb-4">NOUS ÉCRIRE</p>
        <h2 className="mb-2 text-2xl font-normal tracking-tight text-(--ink)">
          Laisser un message
        </h2>
        <p className="mb-6 text-sm text-(--muted-foreground)">
          Pour une question simple ou un suivi, envoyez-nous un message. Notre
          équipe vous répondra.
        </p>

        {status === "success" ? (
          <div
            className="rounded-md bg-emerald-50 p-4 text-emerald-800"
            role="status"
          >
            <p className="font-medium">Votre message a bien été envoyé.</p>
            <p className="text-sm">
              Nous le traiterons dans les meilleurs délais.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setStatus("idle")}
            >
              Envoyer un autre message <ArrowUpRight size={16} />
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-(--ink)">Nom</label>
                <input
                  name="nom"
                  required
                  maxLength={120}
                  placeholder="Votre nom"
                  className="w-full rounded-md border border-[#d9d6ce] bg-(--cream) px-3 py-2 text-sm outline-none focus:border-(--ink)"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-(--ink)">
                  Téléphone / WhatsApp
                </label>
                <input
                  name="telephone"
                  type="tel"
                  maxLength={40}
                  placeholder="+243 …"
                  className="w-full rounded-md border border-[#d9d6ce] bg-(--cream) px-3 py-2 text-sm outline-none focus:border-(--ink)"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--ink)">
                Adresse e-mail
              </label>
              <input
                name="email"
                type="email"
                maxLength={180}
                placeholder="vous@exemple.com"
                className="w-full rounded-md border border-[#d9d6ce] bg-(--cream) px-3 py-2 text-sm outline-none focus:border-(--ink)"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--ink)">Sujet</label>
              <input
                name="sujet"
                required
                maxLength={200}
                placeholder="Objet de votre message"
                className="w-full rounded-md border border-[#d9d6ce] bg-(--cream) px-3 py-2 text-sm outline-none focus:border-(--ink)"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--ink)">
                Message
              </label>
              <textarea
                name="contenu"
                required
                maxLength={3000}
                rows={4}
                placeholder="Votre message…"
                className="w-full rounded-md border border-[#d9d6ce] bg-(--cream) px-3 py-2 text-sm outline-none focus:border-(--ink)"
              />
            </div>
            {status === "error" && (
              <p className="text-sm text-rose-700">
                Une erreur est survenue. Veuillez vérifier les champs et
                réessayer.
              </p>
            )}
            <Button type="submit" disabled={status === "sending"}>
              Envoyer le message <ArrowUpRight size={16} />
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
