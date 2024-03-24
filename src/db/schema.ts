import { pgTable, text } from "drizzle-orm/pg-core";

export const links = pgTable("links", {
  shortLink: text("short-link").primaryKey(),
  longLink: text("long-link").notNull().default("/"),
});
