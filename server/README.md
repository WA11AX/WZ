# Server (Backend)

Express.js backend API for the WZ Tournament Platform with TypeScript support.

## 🏗️ Structure

```
server/
├── index.ts       # Main server entry point
├── routes.ts      # API route definitions
├── storage.ts     # Database connection and utilities
└── vite.ts        # Vite integration for development
```

## 🚀 Features

### API Endpoints

- **Tournament Management**: CRUD operations for tournaments
- **User Management**: User registration, authentication, and profiles
- **Real-time Communication**: WebSocket support for live updates

### Database Integration

- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Robust relational database
- **Connection Pooling**: Efficient database connection management

### Authentication

- **Session-based Auth**: Express sessions with secure storage
- **Telegram Integration**: Authentication via Telegram Web App

## 🛠️ Development

### Running the Server

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Production start
npm run start
```

### Database Operations

```bash
# Push schema changes to database
npm run db:push

# Seed demo tournaments (optional)
npm run seed

# View database configuration
cat drizzle.config.ts
```

### API Development

The server uses a modular route structure:

```typescript
// Example route handler
import { db } from './storage';
import { tournaments } from '@shared/schema';

app.get('/api/tournaments', async (req, res) => {
  try {
    const allTournaments = await db.select().from(tournaments);
    res.json(allTournaments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});
```

## 🔐 Security Features

### Session Management

- **Secure Sessions**: HTTP-only cookies with secure settings
- **Session Store**: Persistent session storage
- **CSRF Protection**: Cross-site request forgery protection

### Input Validation

- **Zod Schemas**: Runtime type validation using shared schemas
- **Request Sanitization**: Input sanitization and validation

### Error Handling

- **Centralized Error Handling**: Consistent error responses
- **Request Logging**: Comprehensive request/response logging

## 📊 Database Schema

The server uses shared database schemas from the `@shared` package:

```typescript
import { users, tournaments, insertUserSchema } from '@shared/schema';

// Type-safe database operations
const newUser = await db.insert(users).values(validatedUserData);
```

## 🔧 Configuration

### Environment Variables

- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption secret
- `TELEGRAM_BOT_TOKEN`: Telegram bot API token
- `ADMIN_TELEGRAM_ID` (optional): Telegram user ID with admin access

### Middleware Stack

1. **JSON Parser**: Express JSON body parser
2. **Session Management**: Express session middleware
3. **Request Logging**: Custom request/response logging
4. **Static Serving**: Static file serving in production
5. **API Routes**: RESTful API endpoints

## 🌐 WebSocket Integration

Real-time features are implemented using WebSockets:

```typescript
import { WebSocketServer } from 'ws';

// WebSocket server for real-time updates
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    // Handle real-time tournament updates
  });
});
```

## 📈 Performance

- **Request Logging**: Monitor API performance and usage
- **Database Optimization**: Efficient queries with Drizzle ORM
- **Static Caching**: Cached static asset serving
- **Compression**: Response compression for better performance

## 🚀 Deployment

The server is built for deployment with:

- **ESBuild**: Fast bundling for production
- **Process Management**: Production-ready process handling
- **Health Checks**: Basic health check endpoints
