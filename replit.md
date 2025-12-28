# TaskMaster - Productivity Application for Educators

## Overview

TaskMaster is a web-based productivity application designed specifically for teachers and educators. It provides tools for lesson planning, task management, class organization, and communication templates. The application follows a clean, system-based design inspired by Linear, Notion, and Asana to reduce cognitive load and maximize teacher productivity.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Build Tool**: Vite with hot module replacement

The frontend follows a page-based structure with shared components:
- Pages: Dashboard, Lessons, Tasks, Classes, Communication
- Layout: Collapsible sidebar navigation with main content area
- Forms: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **API Style**: RESTful endpoints under `/api/*` prefix
- **Development**: Vite dev server with HMR proxied through Express

The backend serves both the API and static frontend assets in production. Development mode uses Vite middleware for hot reloading.

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Validation**: Zod schemas generated from Drizzle schemas via `drizzle-zod`
- **Current Storage**: In-memory storage implementation (`MemStorage` class) with interface ready for database migration

### Core Data Models
- **Users**: Basic authentication with username/password
- **Lessons**: Lesson planning with title, subject, grade, duration, objectives, content, materials, status
- **Tasks**: Task management with priority levels, status tracking, due dates
- **Classes**: Class/student group organization
- **Templates**: Reusable communication templates

### Project Structure
```
├── client/           # Frontend React application
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── pages/       # Route-level page components
│       ├── hooks/       # Custom React hooks
│       └── lib/         # Utilities and query client
├── server/           # Backend Express application
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   └── storage.ts    # Data storage interface
├── shared/           # Shared code between frontend/backend
│   └── schema.ts     # Drizzle schema definitions
└── migrations/       # Database migrations (Drizzle Kit)
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migration management (`npm run db:push`)

### UI Framework
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, forms, etc.)
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Form Handling
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Zod integration for React Hook Form

### Development Tools
- **Vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Production server bundling