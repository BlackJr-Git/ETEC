"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result =
      mode === "signin"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ name, email, password });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "Une erreur est survenue.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="font-admin flex min-h-screen items-center justify-center bg-(--cream) p-4">
      <div className="w-full max-w-sm rounded-2xl border border-[#e7e7dd] bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-[0.14em] text-(--muted-foreground)">
            ETEC
          </p>
          <h1 className="mt-2 font-display text-3xl font-normal tracking-tight text-(--ink)">
            Espace admin
          </h1>
          <p className="mt-1.5 text-sm text-(--muted-foreground)">
            {mode === "signin"
              ? "Connectez-vous pour gérer les demandes."
              : "Créez un compte administrateur."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                required
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@etec.example"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          {error && (
            <p className="rounded-md bg-rose-50 p-2.5 text-sm text-rose-700">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Chargement…"
              : mode === "signin"
                ? "Se connecter"
                : "Créer le compte"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-sm text-(--muted-foreground) hover:text-(--ink)"
        >
          {mode === "signin"
            ? "Créer un compte administrateur"
            : "J’ai déjà un compte"}
        </button>
      </div>
    </div>
  );
}
