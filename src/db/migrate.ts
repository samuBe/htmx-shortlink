import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./connect";

async function main() {
  try {
    await migrate(db, {
      migrationsFolder: "src/db/migrations",
    });
    console.log("Tables migrated!");
    process.exit(0);
  } catch (error) {
    console.error("Error performing migration: ", error);
    process.exit(1);
  }
}

main();
