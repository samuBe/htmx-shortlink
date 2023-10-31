import { eq } from "drizzle-orm";
import { InsertLink, Link, db } from "./connect";
import { links } from "./schema";

export const createLink = async (newLink: InsertLink) => {
  await db.insert(links).values(newLink);
};

export const getLongLink = async (shortLink: string) => {
  const link = await db
    .select()
    .from(links)
    .where(eq(links.shortLink, shortLink));

  if (!link) {
    throw Error("No shortlink found!");
  }
  if (link.length < 1) {
    throw Error("No shortlink found!");
  }
  return link[0].longLink;
};
