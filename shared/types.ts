// Shared types and interfaces for the WZ Tournament Platform

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// WebSocket message types
export interface WebSocketMessage<T = any> {
  type: 'tournament_update' | 'user_update' | 'notification' | 'error';
  payload: T;
  timestamp: string;
}

export interface TournamentUpdateMessage {
  tournamentId: string;
  type: 'participant_joined' | 'participant_left' | 'status_changed' | 'prize_updated';
  data: any;
}

// Tournament related types
export type TournamentStatus = 'upcoming' | 'active' | 'completed';
export type TournamentType = 'BATTLE ROYALE' | 'TEAM DEATHMATCH' | 'CAPTURE_FLAG' | 'CUSTOM';

export interface TournamentFilters {
  status?: TournamentStatus;
  type?: TournamentType;
  minPrize?: number;
  maxPrize?: number;
  dateFrom?: string;
  dateTo?: string;
}

// User related types
export interface UserStats {
  totalTournaments: number;
  tournamentsWon: number;
  totalEarnings: number;
  winRate: number;
  averageRank: number;
}

export interface UserProfile {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  isAdmin: boolean;
  stars: number;
  stats: UserStats;
  participatingTournaments: string[];
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Configuration types
export interface AppConfig {
  apiUrl: string;
  wsUrl: string;
  telegramBotToken?: string;
  environment: 'development' | 'production' | 'test';
  features: {
    realTimeUpdates: boolean;
    telegramAuth: boolean;
    paymentSystem: boolean;
  };
}

// Utility types
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

// Event types for analytics
export interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties: Record<string, any>;
  timestamp: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// Database query types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  include?: string[];
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId: string;
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// Permission types
export type Permission = 
  | 'create_tournament'
  | 'edit_tournament'
  | 'delete_tournament'
  | 'manage_users'
  | 'view_analytics'
  | 'system_admin';

export interface UserPermissions {
  userId: string;
  permissions: Permission[];
  isAdmin: boolean;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ru' | 'es' | 'fr';

export interface UserPreferences {
  theme: Theme;
  language: Language;
  notifications: {
    email: boolean;
    push: boolean;
    telegram: boolean;
  };
  privacy: {
    showProfile: boolean;
    showStats: boolean;
    allowMessages: boolean;
  };
}