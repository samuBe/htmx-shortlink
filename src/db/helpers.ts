import { eq } from "drizzle-orm";
import { InsertLink, db } from "./connect";
import { links } from "./schema";

export const createLink = async (newLink: InsertLink) => {
  await db.insert(links).values(newLink);
};

// Returns null when the short link doesn't exist; throws on database errors
export const getLongLink = async (shortLink: string) => {
  const link = await db
    .select()
    .from(links)
    .where(eq(links.shortLink, shortLink));

  return link[0]?.longLink ?? null;
};
