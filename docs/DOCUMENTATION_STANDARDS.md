# Code Documentation Standards

This document outlines the documentation standards for the WZ Tournament Platform project.

## JSDoc Standards

We use JSDoc comments for documenting functions, classes, interfaces, and components. This ensures consistent documentation that can be used by IDEs and documentation generators.

### Function Documentation

```typescript
/**
 * Calculates the tournament prize pool based on entry fees and participants
 * 
 * @param entryFee - The entry fee per participant in stars
 * @param participantCount - Number of registered participants
 * @param houseCommission - Commission percentage taken by the platform (0-1)
 * @returns The total prize pool amount
 * 
 * @example
 * ```typescript
 * const prizePool = calculatePrizePool(100, 10, 0.1);
 * console.log(prizePool); // 900
 * ```
 */
function calculatePrizePool(entryFee: number, participantCount: number, houseCommission: number): number {
  return (entryFee * participantCount) * (1 - houseCommission);
}
```

### Component Documentation

```typescript
/**
 * Tournament card component displaying tournament information
 * 
 * @component
 * @param props - Component props
 * @param props.tournament - Tournament data object
 * @param props.onJoin - Callback function when user joins tournament
 * @param props.showJoinButton - Whether to display the join button
 * 
 * @example
 * ```tsx
 * <TournamentCard 
 *   tournament={tournamentData}
 *   onJoin={handleJoin}
 *   showJoinButton={true}
 * />
 * ```
 */
export function TournamentCard({ tournament, onJoin, showJoinButton }: TournamentCardProps) {
  // Component implementation
}
```

### Interface/Type Documentation

```typescript
/**
 * Tournament data structure
 * 
 * @interface Tournament
 * @property {string} id - Unique tournament identifier
 * @property {string} title - Tournament display name
 * @property {string} description - Tournament description
 * @property {number} entryFee - Entry fee in stars
 * @property {number} prize - Prize pool amount
 * @property {Date} date - Tournament start date and time
 * @property {'upcoming' | 'active' | 'completed'} status - Current tournament status
 * @property {string[]} participants - Array of participant user IDs
 * @property {number} maxParticipants - Maximum number of participants allowed
 */
interface Tournament {
  id: string;
  title: string;
  description: string;
  entryFee: number;
  prize: number;
  date: Date;
  status: 'upcoming' | 'active' | 'completed';
  participants: string[];
  maxParticipants: number;
}
```

### Service/Class Documentation

```typescript
/**
 * Service for handling tournament-related business logic
 * 
 * @class TournamentService
 * @description Provides methods for tournament management including creation,
 * registration, and status updates. Handles business rules and validation.
 * 
 * @example
 * ```typescript
 * const service = new TournamentService();
 * const tournament = await service.createTournament(tournamentData);
 * ```
 */
export class TournamentService {
  /**
   * Registers a user for a tournament
   * 
   * @param tournamentId - ID of the tournament to join
   * @param telegramId - User's Telegram ID
   * @returns Promise resolving to registration result
   * @throws {Error} When tournament is not found or user cannot join
   */
  async registerUserForTournament(tournamentId: string, telegramId: string): Promise<RegistrationResult> {
    // Implementation
  }
}
```

## Tag Reference

### Required Tags

- `@param` - Document function parameters
- `@returns` - Document return value
- `@throws` - Document exceptions that may be thrown

### Optional Tags

- `@example` - Provide usage examples
- `@since` - Version when feature was added
- `@deprecated` - Mark deprecated features
- `@see` - Reference related functions/components
- `@todo` - Mark incomplete features
- `@component` - Mark React components
- `@hook` - Mark custom React hooks

### Best Practices

1. **Always document public APIs** - Functions, components, and classes that are used by other parts of the application
2. **Include examples** - Especially for complex functions or components
3. **Document edge cases** - Mention special behavior or limitations
4. **Keep descriptions concise** - One line summary, detailed description if needed
5. **Use TypeScript types** - JSDoc should complement, not replace TypeScript types
6. **Update documentation** - Keep docs in sync with code changes

### File Headers

```typescript
/**
 * @fileoverview Tournament management utilities and business logic
 * @module TournamentService
 * @requires ../storage
 * @requires @shared/schema
 * 
 * @author WZ Development Team
 * @since 1.0.0
 */
```

## Component Documentation Example

Here's a complete example of a well-documented React component:

```typescript
/**
 * @fileoverview Responsive tournament card component
 * @module TournamentCard
 */

import { Tournament } from '@shared/schema';

/**
 * Props for the TournamentCard component
 * 
 * @interface TournamentCardProps
 */
interface TournamentCardProps {
  /** Tournament data to display */
  tournament: Tournament;
  /** Callback function triggered when user joins tournament */
  onJoin?: (tournament: Tournament) => void;
  /** Whether to show the join button */
  showJoinButton?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Tournament card component that displays tournament information in a card format
 * 
 * Features:
 * - Responsive design that adapts to mobile and desktop
 * - Interactive hover effects and animations
 * - Status indicators for tournament state
 * - Participant count and entry fee display
 * 
 * @component
 * @param props - Component properties
 * @returns JSX element representing the tournament card
 * 
 * @example
 * Basic usage:
 * ```tsx
 * <TournamentCard 
 *   tournament={tournament}
 *   onJoin={handleJoinTournament}
 *   showJoinButton={true}
 * />
 * ```
 * 
 * @example
 * Read-only mode:
 * ```tsx
 * <TournamentCard 
 *   tournament={tournament}
 *   showJoinButton={false}
 * />
 * ```
 */
export function TournamentCard({ 
  tournament, 
  onJoin, 
  showJoinButton = true,
  className 
}: TournamentCardProps) {
  // Component implementation
}
```

This documentation standard ensures that our codebase is well-documented, making it easier for developers to understand and maintain the code.