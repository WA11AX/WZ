# Component Documentation

This document provides usage examples and documentation for the components in the WZ Tournament Platform.

## Layout Components

### Container

Provides responsive max-width and horizontal centering.

```typescript
import { Container } from "@/components/layout";

// Basic usage
<Container>
  <YourContent />
</Container>

// With size control
<Container size="lg" centered={false}>
  <YourContent />
</Container>
```

**Props:**
- `size`: "sm" | "md" | "lg" | "xl" | "full" (default: "sm")
- `centered`: boolean (default: true)
- `className`: string (optional)

### Stack

Provides flexible layouts with consistent spacing.

```typescript
import { Stack } from "@/components/layout";

// Vertical stack (default)
<Stack gap="md">
  <Item1 />
  <Item2 />
  <Item3 />
</Stack>

// Horizontal stack
<Stack direction="row" gap="lg" align="center" justify="between">
  <Item1 />
  <Item2 />
</Stack>
```

**Props:**
- `direction`: "row" | "col" (default: "col")
- `gap`: "none" | "sm" | "md" | "lg" | "xl" (default: "md")
- `align`: "start" | "center" | "end" | "stretch"
- `justify`: "start" | "center" | "end" | "between" | "around" | "evenly"

### Grid

Provides responsive CSS Grid layouts.

```typescript
import { Grid } from "@/components/layout";

// Responsive grid
<Grid cols={3} gap="md">
  <Item1 />
  <Item2 />
  <Item3 />
</Grid>

// Fixed grid without responsive behavior
<Grid cols={2} gap="lg" responsive={false}>
  <Item1 />
  <Item2 />
</Grid>
```

**Props:**
- `cols`: 1 | 2 | 3 | 4 | 6 | 12 (default: 1)
- `gap`: "none" | "sm" | "md" | "lg" | "xl" (default: "md")
- `responsive`: boolean (default: true)

### PageLayout

Complete page layout with header, container, and content area.

```typescript
import { PageLayout } from "@/components/layout";

<PageLayout
  title="Tournament Dashboard"
  description="Manage your tournaments and view statistics"
  maxWidth="lg"
>
  <YourPageContent />
</PageLayout>
```

**Props:**
- `title`: string (optional)
- `description`: string (optional) 
- `showHeader`: boolean (default: true)
- `maxWidth`: "sm" | "md" | "lg" | "xl" | "full" (default: "sm")
- `spacing`: "sm" | "md" | "lg" | "xl" (default: "lg")

## Common Components

### Loading

Loading states and spinners.

```typescript
import { Loading, LoadingOverlay, LoadingSkeleton } from "@/components/common";

// Basic loading spinner
<Loading size="md" text="Loading tournaments..." />

// Full-screen overlay
<LoadingOverlay text="Processing payment..." />

// Content skeleton
<LoadingSkeleton rows={3} />
```

### Alert

Alert messages with different variants.

```typescript
import { Alert } from "@/components/common";

// Basic alert
<Alert variant="info">
  Tournament registration is now open!
</Alert>

// Dismissible alert with title
<Alert 
  variant="warning" 
  title="Payment Required"
  dismissible 
  onDismiss={handleDismiss}
>
  You need to pay the entry fee to join this tournament.
</Alert>
```

**Props:**
- `variant`: "info" | "success" | "warning" | "error" (default: "info")
- `title`: string (optional)
- `dismissible`: boolean (default: false)
- `onDismiss`: () => void (required if dismissible)

## Animation Components

### FadeIn

Smooth fade-in effects with optional directional movement.

```typescript
import { FadeIn } from "@/components/common";

<FadeIn direction="up" delay={0.2} duration={0.5}>
  <YourComponent />
</FadeIn>
```

**Props:**
- `direction`: "up" | "down" | "left" | "right" (default: "up")
- `delay`: number (default: 0)
- `duration`: number (default: 0.3)

### SlideIn

Slide-in effects from specified direction.

```typescript
import { SlideIn } from "@/components/common";

<SlideIn direction="left" delay={0.1}>
  <SidebarContent />
</SlideIn>
```

### ScaleIn

Scale-in effect with spring animation.

```typescript
import { ScaleIn } from "@/components/common";

<ScaleIn scale={0.9} duration={0.4}>
  <ModalContent />
</ScaleIn>
```

### StaggerContainer

Staggers animations of child elements.

```typescript
import { StaggerContainer, FadeIn } from "@/components/common";

<StaggerContainer staggerDelay={0.1}>
  {items.map(item => (
    <FadeIn key={item.id}>
      <ItemComponent item={item} />
    </FadeIn>
  ))}
</StaggerContainer>
```

### Pulse

Gentle pulsing effect for attention.

```typescript
import { Pulse } from "@/components/common";

<Pulse scale={1.05} duration={2}>
  <NotificationBadge />
</Pulse>
```

## Feature Components

### TournamentCard

Tournament display card with all tournament information.

```typescript
import { TournamentCard } from "@/components/features/tournaments";

<TournamentCard
  tournament={tournamentData}
  onJoin={handleJoinTournament}
  showJoinButton={true}
/>
```

**Props:**
- `tournament`: Tournament object
- `onJoin`: (tournament: Tournament) => void (optional)
- `showJoinButton`: boolean (default: true)

## Design System Usage

### Colors

```typescript
import { colors } from "@/lib/constants";

// Using semantic colors
className="text-semantic-text-primary bg-semantic-surface"

// Using brand colors
className="text-telegram-blue bg-tournament-gold"

// Using gradients
className="bg-gradient-to-r from-blue-400 to-blue-600"
```

### Typography

```typescript
import { typography } from "@/lib/constants";

// Using typography styles in Tailwind
className="text-2xl font-semibold leading-8"

// Or access the design tokens directly
const headingStyle = typography.styles.h1;
```

### Spacing

```typescript
import { spacing } from "@/lib/constants";

// Using semantic spacing
className="p-component-padding-md m-component-margin-lg"

// Using spacing scale
className="p-4 m-6"
```

## Best Practices

### Component Composition

```typescript
// Good: Compose layout components
<PageLayout title="Tournaments">
  <Stack gap="lg">
    <Container size="md">
      <Grid cols={2} gap="md">
        {tournaments.map(tournament => (
          <FadeIn key={tournament.id}>
            <TournamentCard tournament={tournament} />
          </FadeIn>
        ))}
      </Grid>
    </Container>
  </Stack>
</PageLayout>
```

### Animation Timing

```typescript
// Good: Stagger animations for lists
<StaggerContainer staggerDelay={0.1}>
  {items.map((item, index) => (
    <FadeIn key={item.id} delay={index * 0.1}>
      <ItemComponent item={item} />
    </FadeIn>
  ))}
</StaggerContainer>
```

### Responsive Design

```typescript
// Good: Use responsive props
<Grid cols={3} responsive={true}>
  {/* Will be 1 col on mobile, 2 on tablet, 3 on desktop */}
</Grid>

<Container size="lg">
  {/* Responsive max-width */}
</Container>
```