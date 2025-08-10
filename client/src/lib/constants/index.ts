// API endpoints
export const API_ENDPOINTS = {
  USER_ME: '/api/user/me',
  TOURNAMENTS: '/api/tournaments',
  TOURNAMENT_JOIN: '/api/tournaments/join',
  ADMIN_TOURNAMENTS: '/api/admin/tournaments',
} as const;

// Tournament status constants
export const TOURNAMENT_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

// Tournament types
export const TOURNAMENT_TYPES = {
  BATTLE_ROYALE: 'Battle Royale',
  ELIMINATION: 'Elimination',
  TEAM_MATCH: 'Team Match',
} as const;

// Color constants for design system
export const COLORS = {
  PRIMARY: {
    BLUE: '#0088cc',
    LIGHT_BLUE: '#40a9ff',
    DARK_BLUE: '#003d6b',
  },
  SECONDARY: {
    GOLD: '#ffd700',
    ORANGE: '#ff6b35',
    GREEN: '#00c851',
    PURPLE: '#7b1fa2',
  },
  GRADIENTS: {
    BLUE: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    GREEN: 'linear-gradient(135deg, #00c851 0%, #00a043 100%)',
    ORANGE: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
    PURPLE: 'linear-gradient(135deg, #7b1fa2 0%, #512da8 100%)',
  },
} as const;

// Animation constants
export const ANIMATIONS = {
  DURATION: {
    FAST: '150ms',
    NORMAL: '300ms',
    SLOW: '500ms',
  },
  EASING: {
    EASE_OUT: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

// Type exports for constants
export type TournamentStatus = typeof TOURNAMENT_STATUS[keyof typeof TOURNAMENT_STATUS];
export type TournamentType = typeof TOURNAMENT_TYPES[keyof typeof TOURNAMENT_TYPES];