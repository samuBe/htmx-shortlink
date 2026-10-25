import "dotenv/config";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { links } from "./schema";

if (!process.env.DBLINK) throw new Error("DBLINK is not set");

const client = postgres(process.env.DBLINK);

export const db = drizzle(client);

export type Link = typeof links.$inferSelect;
export type InsertLink = typeof links.$inferInsert;
