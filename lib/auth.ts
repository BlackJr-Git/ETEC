import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "@/db/schema";

function getDatabase() {
  const db = env.DB;
  if (!db) throw new Error("La base de données D1 (DB) n’est pas disponible.");
  return drizzle(db, { schema });
}

export const auth = betterAuth({
  database: drizzleAdapter(getDatabase(), {
    provider: "sqlite",
  }),
  secret:
    env.BETTER_AUTH_SECRET ?? "etec-dev-secret-change-me-in-production-32-char",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
  },
  socialProviders: {},
});
