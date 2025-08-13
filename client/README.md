# Client (Frontend)

React-based frontend application for the WZ Tournament Platform.

## 🏗️ Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Utility libraries and configurations
├── pages/         # Page components and routing
├── types/         # TypeScript type definitions
├── App.tsx        # Main application component
└── main.tsx       # Application entry point
```

## 🎨 UI Components

The application uses a modern component library built on:

- **Radix UI**: Headless, accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Framer Motion**: Smooth animations

## 🔗 Key Features

### State Management

- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling and validation

### Real-time Communication

- **WebSocket**: Live tournament updates
- **Telegram SDK**: Integration with Telegram Web App

### Routing

- **Wouter**: Lightweight React router

## 🛠️ Development

### Running the Client

```bash
# Development server (from project root)
npm run dev

# Type checking
npm run check
```

### Component Development

Components are organized using the compound component pattern:

```typescript
// Example component structure
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{tournament.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Tournament details */}
      </CardContent>
    </Card>
  )
}
```

### Hooks

Custom hooks are located in `src/hooks/`:

- `use-toast.ts`: Toast notification management
- Custom hooks for WebSocket connections, API calls, etc.

### Styling

The project uses Tailwind CSS with custom configuration:

- Custom color palette
- Animation utilities
- Component variants with `class-variance-authority`

## 📱 Telegram Integration

The app is designed to work as a Telegram Web App:

```typescript
import WebApp from "@twa-dev/sdk";

// Initialize Telegram Web App
WebApp.ready();
```

## 🔧 Build Configuration

The client is built using Vite with:

- **Fast HMR**: Hot module replacement for development
- **Code Splitting**: Automatic code splitting for optimal loading
- **Asset Optimization**: Automatic asset optimization and bundling

## 🎯 Performance

- **Lazy Loading**: Routes and components are lazy-loaded
- **Query Caching**: API responses are cached with TanStack Query
- **Asset Optimization**: Images and assets are optimized during build
