import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import type { GameQuestions } from "~/types/game-questions";

export const users = sqliteTable("users", {
    id: text("id").primaryKey().$defaultFn(() => generateId()),
    name: text('name').notNull()
});

export const games = sqliteTable("games", {
    id: text("id").primaryKey().$defaultFn(() => generateId()),
    topic: text("topic").notNull(),
    owner: text("owner").references(() => users.id, { onDelete: 'cascade' }),
    questions: text("questions", { mode: 'json' }).$type<GameQuestions[]>().notNull().default([]),
});

export const gameRankings = sqliteTable("game_rankings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    gameId: text("game_id").references(() => games.id, { onDelete: 'cascade' }),
    userId: text("user_id").references(() => users.id, { onDelete: 'cascade' }),
    score: integer("score").notNull(),
});

export const ipRequests = sqliteTable("ip_requests", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ip: text("ip").notNull(),
    count: integer("count").notNull().default(0),
    date: integer("date").notNull().default(Date.now()),
});

// we want small ids, uuids are too long
function generateId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export type InsertUser = typeof users.$inferInsert;
export type InsertGame = typeof games.$inferInsert;
export type InsertGameRanking = typeof gameRankings.$inferInsert;

export type User = typeof users.$inferSelect;
export type Game = typeof games.$inferSelect;
export type GameRanking = typeof gameRankings.$inferSelect;