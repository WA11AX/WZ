# WZ Tournament Platform

A modern TypeScript-based tournament platform for gaming competitions, built with React, Express.js, and PostgreSQL.

## 🚀 Features

- **Tournament Management**: Create and manage gaming tournaments with customizable settings
- **User Authentication**: Telegram-based authentication system
- **Real-time Updates**: WebSocket support for live tournament updates
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Database Integration**: PostgreSQL with Drizzle ORM for type-safe database operations

## 🏗️ Project Structure

```
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── common/        # Shared/reusable components
│   │   │   ├── features/      # Feature-specific components
│   │   │   ├── layout/        # Layout components
│   │   │   └── ui/           # Base UI components (from shadcn/ui)
│   │   ├── lib/              # Utility libraries and configurations
│   │   │   ├── constants/     # Design system constants
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── types/         # TypeScript type definitions
│   │   │   └── utils/         # Utility functions
│   │   └── pages/            # Page components
├── server/                   # Express.js backend API
│   ├── api/                  # API layer
│   │   ├── controllers/      # Route controllers
│   │   └── routes/           # API route definitions
│   ├── middleware/           # Express middleware
│   ├── models/               # Database models (future)
│   └── services/             # Business logic layer
├── shared/                   # Shared types and database schemas
├── attached_assets/          # Static assets and media files
└── dist/                    # Build output directory
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** components for accessible UI
- **TanStack Query** for data fetching
- **Framer Motion** for animations

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** database
- **Drizzle ORM** for database operations
- **WebSocket** support for real-time features
- **Passport.js** for authentication

### Development Tools
- **TypeScript** for type safety
- **ESLint** and **Prettier** for code quality
- **Vite** for development server and building

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd WZ
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type check with TypeScript
- `npm run db:push` - Push database schema changes

## 🏆 Tournament Features

- **Battle Royale Tournaments**: Support for battle royale style competitions
- **Entry Fees & Prizes**: Configurable entry fees and prize pools
- **Participant Management**: Handle participant registration and limits
- **Tournament Status**: Track upcoming, active, and completed tournaments
- **User Stars System**: Track user achievements and standings

## 🔧 Development

### Code Style

This project uses ESLint and Prettier for consistent code formatting. The project includes comprehensive linting rules for TypeScript, React, and general code quality.

Run the linters before committing:

```bash
npm run lint        # Fix linting issues
npm run format      # Format code
npm run validate    # Run all checks (lint, format, type-check)
```

### Pre-commit Hooks

The project uses Husky and lint-staged for pre-commit validation:
- Automatically formats code on commit
- Runs linting and fixes issues
- Ensures type safety before commits

### Component Development

#### Design System

The project includes a comprehensive design system with:
- **Colors**: Semantic color tokens and brand colors
- **Typography**: Font scales and text styles
- **Spacing**: Consistent spacing scale
- **Animations**: Pre-built animation components

Import design tokens:
```typescript
import { colors, typography, spacing } from "@/lib/constants";
```

#### Component Organization

- **`components/common/`**: Reusable components (Loading, Alert, Animations)
- **`components/layout/`**: Layout components (Container, Stack, Grid, Header)
- **`components/features/`**: Feature-specific components (tournaments/)
- **`components/ui/`**: Base UI components from shadcn/ui

#### Animation Components

Use pre-built animation components for smooth UX:
```typescript
import { FadeIn, SlideIn, ScaleIn, StaggerContainer } from "@/components/common";

<FadeIn delay={0.2}>
  <YourComponent />
</FadeIn>
```

### API Development

#### Service Layer

Business logic is organized in services:
- **`UserService`**: User-related operations
- **`TournamentService`**: Tournament management

#### Controller Layer

Controllers handle HTTP requests and responses:
- **`UserController`**: User API endpoints
- **`TournamentController`**: Tournament API endpoints

#### Middleware

- **`authMiddleware`**: Authentication for API routes
- **`requireAdmin`**: Admin authorization

### VSCode Setup

The project includes VSCode configuration for optimal development:
- Auto-formatting on save
- ESLint integration
- TypeScript IntelliSense
- Recommended extensions

### Database

The project uses Drizzle ORM with PostgreSQL. Schema files are located in the `shared/` directory.

To make database changes:
1. Edit schema files in `shared/schema.ts`
2. Run `npm run db:push` to apply changes

## 📦 Deployment

1. Build the project:
```bash
npm run build
```

2. Set production environment variables

3. Start the production server:
```bash
npm run start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.