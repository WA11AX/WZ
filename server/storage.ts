import { type User, type InsertUser, type Tournament, type InsertTournament, users, tournaments } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Tournament methods
  getTournaments(): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined>;
  deleteTournament(id: string): Promise<boolean>;
  
  // Registration methods
  registerForTournament(tournamentId: string, userId: string): Promise<boolean>;
  unregisterFromTournament(tournamentId: string, userId: string): Promise<boolean>;
}



// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  private cache = new Map<string, { data: any; expires: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 минут

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached || Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.cacheTimeout
    });
  }
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error(`Failed to fetch user with id ${id}`);
    }
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        telegramId: insertUser.telegramId,
        username: insertUser.username,
        firstName: insertUser.firstName,
        lastName: insertUser.lastName,
        isAdmin: insertUser.isAdmin ?? false,
        stars: 1000, // Give new users some stars
        participatingTournaments: []
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getTournaments(): Promise<Tournament[]> {
    try {
      // Получаем только активные и предстоящие турниры по умолчанию
      const tournamentList = await db.select()
        .from(tournaments)
        .where(or(eq(tournaments.status, 'upcoming'), eq(tournaments.status, 'active')))
        .orderBy(tournaments.date)
        .limit(50); // Ограничиваем количество для производительности
      return tournamentList;
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw new Error('Failed to fetch tournaments');
    }
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament || undefined;
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const [tournament] = await db
      .insert(tournaments)
      .values({
        title: insertTournament.title,
        description: insertTournament.description,
        mapName: insertTournament.mapName,
        mapImage: insertTournament.mapImage,
        date: insertTournament.date,
        entryFee: insertTournament.entryFee,
        prize: insertTournament.prize,
        maxParticipants: insertTournament.maxParticipants ?? 100,
        participants: [],
        status: (insertTournament.status ?? "upcoming") as "upcoming" | "active" | "completed",
        tournamentType: insertTournament.tournamentType ?? "BATTLE ROYALE",
      })
      .returning();
    return tournament;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    const [tournament] = await db
      .update(tournaments)
      .set(updates)
      .where(eq(tournaments.id, id))
      .returning();
    return tournament || undefined;
  }

  async deleteTournament(id: string): Promise<boolean> {
    const result = await db.delete(tournaments).where(eq(tournaments.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async registerForTournament(tournamentId: string, userId: string): Promise<boolean> {
    const tournament = await this.getTournament(tournamentId);
    const user = await this.getUser(userId);
    
    if (!tournament || !user) return false;
    if (tournament.participants.includes(userId)) return false;
    if (tournament.participants.length >= tournament.maxParticipants) return false;
    if (user.stars < tournament.entryFee) return false;

    // Update user: deduct entry fee and add tournament
    await this.updateUser(userId, {
      stars: user.stars - tournament.entryFee,
      participatingTournaments: [...user.participatingTournaments, tournamentId]
    });
    
    // Update tournament: add participant
    await this.updateTournament(tournamentId, {
      participants: [...tournament.participants, userId]
    });
    
    return true;
  }

  async unregisterFromTournament(tournamentId: string, userId: string): Promise<boolean> {
    const tournament = await this.getTournament(tournamentId);
    const user = await this.getUser(userId);
    
    if (!tournament || !user) return false;
    
    const participantIndex = tournament.participants.indexOf(userId);
    const userTournamentIndex = user.participatingTournaments.indexOf(tournamentId);
    
    if (participantIndex === -1 || userTournamentIndex === -1) return false;
    
    // Update user: refund entry fee and remove tournament
    const newUserTournaments = [...user.participatingTournaments];
    newUserTournaments.splice(userTournamentIndex, 1);
    
    await this.updateUser(userId, {
      stars: user.stars + tournament.entryFee,
      participatingTournaments: newUserTournaments
    });
    
    // Update tournament: remove participant
    const newParticipants = [...tournament.participants];
    newParticipants.splice(participantIndex, 1);
    
    await this.updateTournament(tournamentId, {
      participants: newParticipants
    });
    
    return true;
  }

  // Initialize with sample data if database is empty
  async initializeData(): Promise<void> {
    const existingTournaments = await this.getTournaments();
    if (existingTournaments.length === 0) {
      // Create sample tournaments
      await this.createTournament({
        title: "Tournament on the Rebirth Island",
        description: "Intense battle royale action on the iconic Rebirth Island map",
        mapName: "REBIRTH ISLAND",
        mapImage: "https://images.unsplash.com/photo-1538481199464-7160b8f4a85a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
        date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        entryFee: 100,
        prize: 2500,
        maxParticipants: 100,
        status: "active",
        tournamentType: "BATTLE ROYALE",
      });

      await this.createTournament({
        title: "Championship Finals",
        description: "Elite tournament with the highest stakes and rewards",
        mapName: "CYBER CITY",
        mapImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        entryFee: 250,
        prize: 1250,
        maxParticipants: 50,
        status: "upcoming",
        tournamentType: "CHAMPIONSHIP",
      });
    }
  }
}

export const storage = new DatabaseStorage();

// Initialize sample data on startup
storage.initializeData().catch(console.error);
