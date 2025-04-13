import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: text("id").primaryKey().$defaultFn(() => generateId()),
    name: text('name').notNull()
});

export const games = pgTable("games", {
    id: text("id").primaryKey().$defaultFn(() => generateId()),
    topic: text("topic").notNull(),
    owner: text("owner").references(() => users.id, { onDelete: 'cascade' }),
    questions: jsonb("questions").notNull().default([]),
});

export const gameRankings = pgTable("game_rankings", {
    id: serial("id").primaryKey(),
    gameId: text("game_id").references(() => games.id, { onDelete: 'cascade' }),
    userId: text("user_id").references(() => users.id, { onDelete: 'cascade' }),
    score: integer("score").notNull(),
});

export const ipRequests = pgTable("ip_requests", {
    id: serial("id").primaryKey(),
    ip: text("ip").notNull(),
    count: integer("count").notNull().default(0),
    date: timestamp("date").notNull().defaultNow(),
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