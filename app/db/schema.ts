import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text('name').notNull()
});

export const games = pgTable("games", {
    id: serial("id").primaryKey(),
    topic: text("topic").notNull(),
    language: text("language").notNull(),
    questionCount: integer("question_count").notNull(),
    owner: integer("owner").references(() => users.id, { onDelete: 'cascade' }),
});

export const gameRankings = pgTable("game_rankings", {
    id: serial("id").primaryKey(),
    gameId: integer("game_id").references(() => games.id, { onDelete: 'cascade' }),
    userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
    score: integer("score").notNull(),
});


export type InsertUser = typeof users.$inferInsert;
export type InsertGame = typeof games.$inferInsert;
export type InsertGameRanking = typeof gameRankings.$inferInsert;

export type User = typeof users.$inferSelect;
export type Game = typeof games.$inferSelect;
export type GameRanking = typeof gameRankings.$inferSelect;