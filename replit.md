# Tournament Manager - Telegram Mini App

## Overview

This is a Telegram Mini App for tournament management built with a modern full-stack architecture. The application allows users to browse and join gaming tournaments, with payment processing through Telegram Stars. The system includes real-time updates, user authentication via Telegram WebApp API, and an admin panel for tournament management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing without unnecessary complexity
- **State Management**: TanStack React Query for server state management, caching, and synchronization
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Mobile-First Design**: Optimized for Telegram Mini App constraints with responsive design

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Real-time Communication**: WebSocket server for live tournament updates and notifications
- **Architecture Pattern**: RESTful API with shared schema validation between frontend and backend

### Database & Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL via Supabase (as of January 2025)
- **Schema Management**: Shared TypeScript schemas using Drizzle with Zod validation
- **Storage**: DatabaseStorage implementation using PostgreSQL for persistent data

### Authentication & Authorization
- **Primary Auth**: Telegram WebApp API integration using @twa-dev/sdk
- **Session Management**: Express session middleware with PostgreSQL session store
- **User Context**: Telegram user data extraction from WebApp initData for seamless authentication
- **Admin Controls**: Role-based access control for tournament management features

### Payment Integration
- **Payment Provider**: Telegram Stars native payment system
- **Transaction Handling**: Direct integration with Telegram's payment API for tournament entry fees
- **User Balance**: Internal stars balance tracking with transaction history

### Real-time Features
- **WebSocket Implementation**: Native WebSocket server for tournament updates
- **Event Broadcasting**: Real-time notifications for tournament registrations, updates, and status changes
- **Connection Management**: Automatic reconnection handling for mobile network reliability

### Development & Build System
- **Package Manager**: npm with lockfile for dependency consistency
- **Development Server**: Vite dev server with Express API proxy
- **TypeScript Configuration**: Strict type checking with path mapping for clean imports
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Environment**: Replit-optimized with development banner and error overlay

### API Design
- **REST Endpoints**: Standard HTTP methods for CRUD operations
- **Route Structure**: Organized by resource (tournaments, users) with nested actions
- **Error Handling**: Centralized error middleware with consistent JSON responses
- **Request Validation**: Zod schema validation for all API inputs
- **Response Format**: Consistent JSON structure with proper HTTP status codes

### UI/UX Considerations
- **Telegram Integration**: Native Telegram buttons (MainButton, BackButton) for seamless user experience
- **Color Scheme**: Telegram-native color palette with custom tournament-specific branding
- **Typography**: Inter font family for readability across devices
- **Loading States**: Skeleton components and loading indicators for smooth user experience
- **Toast Notifications**: Non-intrusive feedback for user actions

## External Dependencies

### Core Dependencies
- **@twa-dev/sdk**: Telegram WebApp SDK for native app integration and user authentication
- **@supabase/supabase-js**: Supabase client for database, auth, storage, and realtime features
- **pg**: PostgreSQL driver for Supabase database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect support
- **@tanstack/react-query**: Server state management and caching solution

### UI & Styling
- **@radix-ui/react-\***: Comprehensive set of accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework for rapid styling
- **class-variance-authority**: Component variant management for consistent design system
- **lucide-react**: Modern icon library with consistent visual language

### Development Tools
- **vite**: Fast build tool with HMR for development efficiency
- **tsx**: TypeScript execution engine for development server
- **wouter**: Lightweight router alternative to React Router
- **zod**: Schema validation library for runtime type checking

### Backend Infrastructure
- **express**: Web application framework for Node.js
- **ws**: WebSocket library for real-time communication
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **date-fns**: Date manipulation library for tournament scheduling

### Form & Validation
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Zod resolver integration for form validation
- **drizzle-zod**: Auto-generated Zod schemas from Drizzle table definitions

## Recent Changes (January 2025)

- **Fixed Application Startup Issues**: Resolved duplicate export error in `server/db.ts` 
- **Removed Next.js Directives**: Cleaned up all directives from Shadcn/ui components that were causing import errors in Vite environment
- **Stabilized Development Environment**: Application now runs properly with WebSocket connections and API endpoints functioning correctly
- **Switched to Supabase Database**: Migrated from Replit Database to Supabase for PostgreSQL hosting
- **UI Improvements**: Removed tournament type badges and stars balance display from header for cleaner interface