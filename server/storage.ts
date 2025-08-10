import { type User, type InsertUser, type Tournament, type InsertTournament } from "@shared/schema";
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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tournaments: Map<string, Tournament>;

  constructor() {
    this.users = new Map();
    this.tournaments = new Map();
    this.initializeData();
  }

  private initializeData() {
    // Create sample tournaments
    const sampleTournaments: Tournament[] = [
      {
        id: randomUUID(),
        title: "Tournament on the Rebirth Island",
        description: "Intense battle royale action on the iconic Rebirth Island map",
        mapName: "REBIRTH ISLAND",
        mapImage: "https://images.unsplash.com/photo-1538481199464-7160b8f4a85a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
        date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        entryFee: 100,
        prize: 2500,
        maxParticipants: 100,
        participants: [],
        status: "active",
        tournamentType: "BATTLE ROYALE",
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Championship Finals",
        description: "Elite tournament with the highest stakes and rewards",
        mapName: "CYBER CITY",
        mapImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=300",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        entryFee: 250,
        prize: 1250,
        maxParticipants: 50,
        participants: [],
        status: "upcoming",
        tournamentType: "CHAMPIONSHIP",
        createdAt: new Date(),
      }
    ];

    sampleTournaments.forEach(tournament => {
      this.tournaments.set(tournament.id, tournament);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.telegramId === telegramId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id,
      telegramId: insertUser.telegramId,
      username: insertUser.username,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      isAdmin: insertUser.isAdmin ?? false,
      stars: 1000, // Give new users some stars
      participatingTournaments: []
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getTournaments(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    return this.tournaments.get(id);
  }

  async createTournament(insertTournament: InsertTournament): Promise<Tournament> {
    const id = randomUUID();
    const tournament: Tournament = {
      ...insertTournament,
      id,
      maxParticipants: insertTournament.maxParticipants ?? 100,
      participants: [],
      status: (insertTournament.status ?? "upcoming") as "upcoming" | "active" | "completed",
      tournamentType: insertTournament.tournamentType ?? "BATTLE ROYALE",
      createdAt: new Date(),
    };
    this.tournaments.set(id, tournament);
    return tournament;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    const tournament = this.tournaments.get(id);
    if (!tournament) return undefined;
    
    const updatedTournament = { ...tournament, ...updates };
    this.tournaments.set(id, updatedTournament);
    return updatedTournament;
  }

  async deleteTournament(id: string): Promise<boolean> {
    return this.tournaments.delete(id);
  }

  async registerForTournament(tournamentId: string, userId: string): Promise<boolean> {
    const tournament = this.tournaments.get(tournamentId);
    const user = this.users.get(userId);
    
    if (!tournament || !user) return false;
    if (tournament.participants.includes(userId)) return false;
    if (tournament.participants.length >= tournament.maxParticipants) return false;
    if (user.stars < tournament.entryFee) return false;

    // Deduct entry fee
    user.stars -= tournament.entryFee;
    user.participatingTournaments.push(tournamentId);
    
    // Add to tournament
    tournament.participants.push(userId);
    
    this.users.set(userId, user);
    this.tournaments.set(tournamentId, tournament);
    
    return true;
  }

  async unregisterFromTournament(tournamentId: string, userId: string): Promise<boolean> {
    const tournament = this.tournaments.get(tournamentId);
    const user = this.users.get(userId);
    
    if (!tournament || !user) return false;
    
    const participantIndex = tournament.participants.indexOf(userId);
    const userTournamentIndex = user.participatingTournaments.indexOf(tournamentId);
    
    if (participantIndex === -1 || userTournamentIndex === -1) return false;
    
    // Refund entry fee
    user.stars += tournament.entryFee;
    user.participatingTournaments.splice(userTournamentIndex, 1);
    
    // Remove from tournament
    tournament.participants.splice(participantIndex, 1);
    
    this.users.set(userId, user);
    this.tournaments.set(tournamentId, tournament);
    
    return true;
  }
}

export const storage = new MemStorage();
