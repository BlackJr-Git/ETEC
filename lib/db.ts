import { drizzle } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "@/db/schema";

export function getDatabase() {
  const db = env.DB;
  if (!db) throw new Error("La base de données D1 (DB) n’est pas disponible.");
  return drizzle(db, { schema });
}
