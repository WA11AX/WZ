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
│   │   │   ├── common/        # Shared/common components
│   │   │   ├── features/      # Feature-specific components
│   │   │   ├── layout/        # Layout components and primitives
│   │   │   └── ui/           # Base UI components (shadcn/ui)
│   │   ├── lib/              # Utility libraries
│   │   │   ├── constants/    # Application constants
│   │   │   ├── hooks/        # Custom React hooks
│   │   │   ├── animations.ts # Animation utilities
│   │   │   ├── design-system.ts # Design system configuration
│   │   │   └── utils.ts      # General utilities
│   │   ├── pages/            # Page components
│   │   └── types/            # TypeScript type definitions
│   └── public/               # Static assets
├── server/                   # Express.js backend API
│   ├── api/                  # API layer
│   │   ├── controllers/      # Request handlers
│   │   └── routes/          # API route definitions
│   ├── middleware/           # Express middleware
│   ├── models/              # Database model types
│   ├── services/            # Business logic layer
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # Main route registration
│   ├── storage.ts           # Database operations
│   └── vite.ts              # Vite integration
├── shared/                   # Shared types and schemas
├── .vscode/                  # VSCode configuration
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

### Project Architecture

The application follows a clean architecture pattern with clear separation of concerns:

**Frontend (Client)**
- **Components**: Organized by purpose (common, features, layout, ui)
- **Design System**: Consistent styling with Tailwind CSS and custom design tokens
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing

**Backend (Server)**
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data processing
- **Models**: Type definitions and data structures
- **Middleware**: Authentication, validation, and request processing

### Code Style

This project uses ESLint and Prettier for consistent code formatting, along with pre-commit hooks to ensure code quality:

```bash
npm run lint      # Fix linting issues
npm run format    # Format code
npm run validate  # Run all checks
```

### Development Tools

- **Husky**: Pre-commit hooks for code quality
- **lint-staged**: Run linters on staged files
- **VSCode**: Optimized settings and extensions included

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