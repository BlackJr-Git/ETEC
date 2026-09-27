import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error("La variable DATABASE_URL n’est pas configurée.");
  return drizzle(connectionString, { schema });
}
