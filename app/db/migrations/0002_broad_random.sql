-- Primero, eliminamos las restricciones de clave foránea
ALTER TABLE "game_rankings" DROP CONSTRAINT IF EXISTS "game_rankings_game_id_games_id_fk";
ALTER TABLE "game_rankings" DROP CONSTRAINT IF EXISTS "game_rankings_user_id_users_id_fk";
ALTER TABLE "games" DROP CONSTRAINT IF EXISTS "games_owner_users_id_fk";

-- Luego, cambiamos los tipos de columna
ALTER TABLE "game_rankings" ALTER COLUMN "game_id" SET DATA TYPE text;
ALTER TABLE "game_rankings" ALTER COLUMN "user_id" SET DATA TYPE text;
ALTER TABLE "users" ALTER COLUMN "id" SET DATA TYPE text;
ALTER TABLE "games" ALTER COLUMN "id" SET DATA TYPE text;
ALTER TABLE "games" ALTER COLUMN "owner" SET DATA TYPE text;

-- Finalmente, restablecemos las restricciones de clave foránea
ALTER TABLE "game_rankings" ADD CONSTRAINT "game_rankings_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE;
ALTER TABLE "game_rankings" ADD CONSTRAINT "game_rankings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "games" ADD CONSTRAINT "games_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "users"("id") ON DELETE CASCADE;