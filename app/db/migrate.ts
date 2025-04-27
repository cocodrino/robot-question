import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "./schema";

config({ path: ".env" });

const client = createClient({
    url: "file:./app/db/sqlite.db"
});

const db = drizzle(client, { schema });

async function main() {
    console.log("Migrating database...");
    await migrate(db, { migrationsFolder: "app/db/migrations" });
    console.log("Migration completed");
    process.exit(0);
}

main().catch((err) => {
    console.error("Migration failed");
    console.error(err);
    process.exit(1);
}); 