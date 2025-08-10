import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isAdmin: boolean("is_admin").default(false),
  stars: integer("stars").default(0),
  participatingTournaments: json("participating_tournaments").$type<string[]>().default([]),
});

export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  mapName: text("map_name").notNull(),
  mapImage: text("map_image").notNull(),
  date: timestamp("date").notNull(),
  entryFee: integer("entry_fee").notNull(),
  prize: integer("prize").notNull(),
  maxParticipants: integer("max_participants").default(100),
  participants: json("participants").$type<string[]>().default([]),
  status: text("status").$type<"upcoming" | "active" | "completed">().default("upcoming"),
  tournamentType: text("tournament_type").default("BATTLE ROYALE"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  stars: true,
  participatingTournaments: true,
});

export const insertTournamentSchema = createInsertSchema(tournaments).omit({
  id: true,
  participants: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Tournament = typeof tournaments.$inferSelect;
