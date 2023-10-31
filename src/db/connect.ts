import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { links } from "./schema";

const client = createClient({
  url: process.env.DBLINK as string,
  authToken: process.env.DBTOKEN as string,
});

export const db = drizzle(client);

export type Link = typeof links.$inferSelect;
export type InsertLink = typeof links.$inferInsert;
