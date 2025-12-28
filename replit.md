# TaskMaster - Productivity Application for Educators

## Overview

TaskMaster is a comprehensive web-based productivity application designed specifically for teachers and educators. It provides tools for:
- **Lesson Planning**: Create, organize, and manage lesson plans with objectives, content, and materials
- **Task Management**: Track teaching tasks with priority levels and due dates (list and kanban views)
- **Class Organization**: Manage student groups, schedules, and room assignments
- **Communication Templates**: Reusable templates for parent, student, admin, and colleague communications

The application follows a clean, system-based design inspired by Linear, Notion, and Asana to reduce cognitive load and maximize teacher productivity.

## Current Status

**Completed Features:**
- Dashboard with quick stats, recent items, and quick actions
- Lesson Planner with full CRUD operations
- Task Manager with list/kanban view modes and status transitions
- Class Management with student counts and scheduling
- Communication Hub with categorized templates
- Dark/light theme toggle
- Responsive sidebar navigation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching
- **Styling**: Tailwind CSS with CSS variables (light/dark mode)
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **API Style**: RESTful endpoints under `/api/*` prefix
- **Storage**: In-memory storage (MemStorage) with sample data

### API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Lessons | GET, POST `/api/lessons`, GET, PUT, DELETE `/api/lessons/:id` |
| Tasks | GET, POST `/api/tasks`, GET, PUT, DELETE `/api/tasks/:id` |
| Classes | GET, POST `/api/classes`, GET, PUT, DELETE `/api/classes/:id` |
| Templates | GET, POST `/api/templates`, GET, PUT, DELETE `/api/templates/:id` |

### Core Data Models
- **Lessons**: title, subject, grade, duration, objectives, content, materials, status (draft/ready/completed)
- **Tasks**: title, description, priority (low/medium/high), status (todo/in_progress/done), dueDate, subject
- **Classes**: name, subject, grade, studentCount, room, schedule
- **Templates**: name, category (parent/student/admin/colleague), subject, content

### Project Structure
```
├── client/               # Frontend React application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level page components
│       ├── hooks/        # Custom React hooks
│       └── lib/          # Utilities and query client
├── server/               # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   └── storage.ts        # In-memory data storage
├── shared/               # Shared code
│   └── schema.ts         # TypeScript types and Zod schemas
└── design_guidelines.md  # UI/UX design specifications
```

## Development

### Running the Application
The app runs on port 5000 via `npm run dev` which starts both the Express backend and Vite dev server.

### Key Technologies
- React Hook Form + Zod for form validation
- TanStack Query for data fetching and caching
- Lucide React for icons
- Inter font family for typography

## Design Guidelines

The app follows design_guidelines.md specifications:
- Clean, minimal aesthetic inspired by Linear/Notion/Asana
- Inter font for readability
- Card-based layouts with consistent spacing
- Subtle hover/active elevations
- Three-tier text color hierarchy
- Accessible components via Radix UI
