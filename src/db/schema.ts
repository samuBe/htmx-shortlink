import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const links = sqliteTable("links", {
  shortLink: text("short-link").primaryKey(),
  longLink: text("long-link").notNull().default("/"),
});
