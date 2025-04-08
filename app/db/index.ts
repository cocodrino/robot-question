import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import postgres from "postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

config({ path: ".env" });

const client = postgres(process.env.DATABASE_URL as string);

const db = drizzle({ client });

migrate(db, { migrationsFolder: "app/db/migrations" });
export default db;