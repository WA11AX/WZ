import { type User, type InsertUser, type Tournament, type InsertTournament, users, tournaments } from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";
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
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Set up periodic cache cleanup to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCache();
    }, 60000); // Clean up every minute
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expires) {
        this.cache.delete(key);
      }
    }
  }

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

  private invalidateCache(pattern: string): void {
    // Invalidate cache entries that match the pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Cleanup method to be called when shutting down
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
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
    try {
      const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
      return user || undefined;
    } catch (error) {
      console.error('Error fetching user by telegram ID:', error);
      throw new Error(`Failed to fetch user with telegram ID ${telegramId}`);
    }
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
    const cacheKey = 'tournaments:active';
    
    // Проверяем кэш
    const cached = this.getFromCache<Tournament[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // Получаем только активные и предстоящие турниры по умолчанию
      const tournamentList = await db.select()
        .from(tournaments)
        .where(or(eq(tournaments.status, 'upcoming'), eq(tournaments.status, 'active')))
        .orderBy(tournaments.date)
        .limit(50); // Ограничиваем количество для производительности
      
      // Сохраняем в кэш
      this.setCache(cacheKey, tournamentList);
      
      return tournamentList;
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      throw new Error('Failed to fetch tournaments');
    }
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const cacheKey = `tournament:${id}`;
    
    // Check cache first
    const cached = this.getFromCache<Tournament>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
      
      if (tournament) {
        // Cache the tournament data
        this.setCache(cacheKey, tournament);
      }
      
      return tournament || undefined;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw new Error(`Failed to fetch tournament with id ${id}`);
    }
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const [tournament] = await db
      .insert(tournaments)
      .values({
        id: randomUUID(),
        ...insertTournament,
        participants: [],
        createdAt: new Date()
      })
      .returning();
    
    // Invalidate tournaments cache since we added a new tournament
    this.invalidateCache('tournaments');
    
    return tournament;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    const [tournament] = await db
      .update(tournaments)
      .set(updates)
      .where(eq(tournaments.id, id))
      .returning();
    
    if (tournament) {
      // Invalidate both tournaments list cache and specific tournament cache
      this.invalidateCache('tournaments');
      this.invalidateCache(`tournament:${id}`);
    }
    
    return tournament || undefined;
  }

  async deleteTournament(id: string): Promise<boolean> {
    const result = await db.delete(tournaments).where(eq(tournaments.id, id));
    
    if (result.rowCount !== null && result.rowCount > 0) {
      // Invalidate both tournaments list cache and specific tournament cache
      this.invalidateCache('tournaments');
      this.invalidateCache(`tournament:${id}`);
      return true;
    }
    
    return false;
  }

  async registerForTournament(tournamentId: string, userId: string): Promise<boolean> {
    // Use a transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Get tournament with row-level lock to prevent race conditions
      const [tournament] = await tx
        .select()
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId))
        .for('update'); // This prevents other transactions from modifying the same row
      
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .for('update');
      
      if (!tournament || !user) return false;
      if (tournament.participants.includes(userId)) return false;
      if (tournament.participants.length >= tournament.maxParticipants) return false;
      if (user.stars < tournament.entryFee) return false;

      // Update user: deduct entry fee and add tournament
      await tx
        .update(users)
        .set({
          stars: user.stars - tournament.entryFee,
          participatingTournaments: [...user.participatingTournaments, tournamentId]
        })
        .where(eq(users.id, userId));
      
      // Update tournament: add participant
      await tx
        .update(tournaments)
        .set({
          participants: [...tournament.participants, userId]
        })
        .where(eq(tournaments.id, tournamentId));
      
      // Invalidate cache after successful registration
      this.invalidateCache('tournaments');
      this.invalidateCache(`tournament:${tournamentId}`);
      
      return true;
    });
  }

  async unregisterFromTournament(tournamentId: string, userId: string): Promise<boolean> {
    // Use a transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Get tournament with row-level lock to prevent race conditions
      const [tournament] = await tx
        .select()
        .from(tournaments)
        .where(eq(tournaments.id, tournamentId))
        .for('update');
      
      const [user] = await tx
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .for('update');
      
      if (!tournament || !user) return false;
      
      const participantIndex = tournament.participants.indexOf(userId);
      const userTournamentIndex = user.participatingTournaments.indexOf(tournamentId);
      
      if (participantIndex === -1 || userTournamentIndex === -1) return false;
      
      // Update user: refund entry fee and remove tournament
      const newUserTournaments = [...user.participatingTournaments];
      newUserTournaments.splice(userTournamentIndex, 1);
      
      await tx
        .update(users)
        .set({
          stars: user.stars + tournament.entryFee,
          participatingTournaments: newUserTournaments
        })
        .where(eq(users.id, userId));
      
      // Update tournament: remove participant
      const newParticipants = [...tournament.participants];
      newParticipants.splice(participantIndex, 1);
      
      await tx
        .update(tournaments)
        .set({
          participants: newParticipants
        })
        .where(eq(tournaments.id, tournamentId));
      
      // Invalidate cache after successful unregistration
      this.invalidateCache('tournaments');
      this.invalidateCache(`tournament:${tournamentId}`);
      
      return true;
    });
  }

  // Initialize with sample data if database is empty
  async initializeData(): Promise<void> {
    try {
      const existingTournaments = await db.select().from(tournaments).limit(1);
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
    } catch (error) {
      console.error('Error initializing data:', error);
      // Не прерываем запуск приложения из-за ошибки инициализации
    }
  }
}

export const storage = new DatabaseStorage();

// Initialize sample data on startup
storage.initializeData().catch(console.error);

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  storage.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  storage.destroy();
  process.exit(0);
});
