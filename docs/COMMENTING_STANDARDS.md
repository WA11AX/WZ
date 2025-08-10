# Code Commenting Standards

This document outlines the commenting standards for the WZ Tournament Platform project.

## TypeScript/JavaScript Comments

### Function Documentation

Use JSDoc comments for all exported functions and class methods:

```typescript
/**
 * Calculates the prize distribution for tournament winners
 * @param totalPrize - Total prize pool amount
 * @param participantCount - Number of tournament participants
 * @param distribution - Prize distribution percentages
 * @returns Array of prize amounts for each position
 */
export function calculatePrizeDistribution(
  totalPrize: number,
  participantCount: number,
  distribution: number[]
): number[] {
  // Implementation...
}
```

### Component Documentation

Document React components with their props and usage:

```typescript
interface ButtonProps {
  /** Button text content */
  children: React.ReactNode;
  /** Button variant style */
  variant?: "primary" | "secondary" | "danger";
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Click handler function */
  onClick?: () => void;
}

/**
 * Button component with consistent styling and behavior
 * 
 * @example
 * <Button variant="primary" onClick={handleClick}>
 *   Submit
 * </Button>
 */
export function Button({ children, variant = "primary", ...props }: ButtonProps) {
  // Implementation...
}
```

### Interface Documentation

Document complex interfaces and types:

```typescript
/**
 * Tournament configuration and state
 */
interface Tournament {
  /** Unique tournament identifier */
  id: string;
  /** Tournament display name */
  title: string;
  /** Detailed tournament description */
  description: string;
  /** Tournament status */
  status: "upcoming" | "active" | "completed";
  /** Entry fee in stars */
  entryFee: number;
  /** Total prize pool */
  prize: number;
  /** List of participant user IDs */
  participants: string[];
}
```

### Service Class Documentation

Document service classes and their methods:

```typescript
/**
 * Service for managing tournament operations
 */
export class TournamentService {
  /**
   * Retrieves tournament by ID
   * @param id - Tournament identifier
   * @returns Tournament data or null if not found
   * @throws {Error} When database operation fails
   */
  async getTournamentById(id: string): Promise<Tournament | null> {
    // Implementation...
  }
}
```

## Inline Comments

### When to Use Inline Comments

- Complex business logic
- Non-obvious algorithms
- Workarounds or temporary solutions
- Important edge cases

### Examples

```typescript
// Calculate exponential backoff delay for retry attempts
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

// FIXME: This is a temporary workaround for the API rate limiting
// TODO: Implement proper queue management
await sleep(delay);

// Edge case: Handle empty participant list
if (tournament.participants.length === 0) {
  return { canJoin: false, reason: "Tournament has no participants" };
}
```

## Comment Guidelines

### Do's

- **Explain WHY, not WHAT**: Focus on the reasoning behind the code
- **Keep comments up-to-date**: Update comments when code changes
- **Use proper grammar**: Write in complete sentences with proper punctuation
- **Be concise**: Keep comments brief but informative
- **Document public APIs**: All exported functions/classes should have JSDoc comments

### Don'ts

- **Don't comment obvious code**: `i++; // increment i`
- **Don't leave outdated comments**: Remove or update comments when code changes
- **Don't use comments to disable code**: Use version control instead
- **Don't write novels**: Keep comments concise and focused

## Special Comment Types

### TODO Comments

Mark future improvements or features:

```typescript
// TODO: Add user permission checking
// TODO: Implement tournament brackets visualization
```

### FIXME Comments

Mark known issues that need fixing:

```typescript
// FIXME: Race condition when multiple users join simultaneously
// FIXME: Memory leak in WebSocket connection handling
```

### NOTE Comments

Mark important information for other developers:

```typescript
// NOTE: This function must be called before tournament starts
// NOTE: Order of operations is critical here
```

### HACK Comments

Mark temporary or non-ideal solutions:

```typescript
// HACK: Working around API limitation, remove when v2 is available
// HACK: Manual delay to prevent rate limiting
```

## Documentation Comments

### README Updates

When adding new features:
1. Update the project structure section
2. Add usage examples
3. Update installation/setup instructions
4. Document new environment variables

### API Documentation

Document API endpoints in controllers:

```typescript
/**
 * GET /api/tournaments/:id
 * Retrieves a specific tournament by ID
 * 
 * @param req.params.id - Tournament ID
 * @returns Tournament data with participants
 * @throws 404 if tournament not found
 * @throws 500 for server errors
 */
async getTournamentById(req: Request, res: Response) {
  // Implementation...
}
```

## Review Checklist

Before submitting code:

- [ ] All public functions have JSDoc comments
- [ ] Complex logic has explanatory comments
- [ ] No commented-out code blocks
- [ ] Comments are grammatically correct
- [ ] Comments explain WHY, not WHAT
- [ ] API endpoints are documented
- [ ] Interfaces and types are documented