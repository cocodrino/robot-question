import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const { Pool } = pkg;

config({ path: ".env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

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