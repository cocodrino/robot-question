import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
	schema: "./app/db/schema.ts",
	out: "./app/db/migrations",
	dialect: "sqlite",
	dbCredentials: {
		url: "file:./app/db/sqlite.db"
	}
});