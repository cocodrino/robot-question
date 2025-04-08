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

// Solo ejecutar migraciones en desarrollo
if (process.env.NODE_ENV === "development") {
    migrate(db, { migrationsFolder: "app/db/migrations" });
}

export default db;