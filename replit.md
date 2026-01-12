# TaskMaster - AI-Powered Teacher Support Agent

## Overview

TaskMaster is an AI-powered support agent built specifically for teachers and educators. It provides a conversational chat interface where teachers can describe their biggest challenges and receive practical, actionable solutions.

The application helps with:
- **Lesson Planning**: Create engaging, interactive lesson plans
- **Parent Communications**: Draft professional, diplomatic emails to parents
- **Behavior Tracking**: Implement effective classroom behavior management systems
- **Grading Rubrics**: Develop fair, comprehensive grading rubrics

The design follows a clean, teal/green aesthetic with hero messaging focused on relieving teacher pressure.

## Current Status

**Completed Features:**
- Single-page AI chat interface with hero section
- Two-step interaction flow: Guidance first, then Execution with permission
  - Step 1: AI provides tips and strategies (Guidance badge)
  - Step 2: AI creates ready-to-use materials after user confirms (Execute button)
- Streaming AI responses with teacher-focused system prompt
- Quick action chips that send prompts directly to the AI (Popular Teacher Tasks)
- New Chat button to start fresh conversations
- Your Activity History - view, resume, and delete past conversations (localStorage)
- Copy to clipboard: Copy AI response content with visual feedback
- Download as PDF: Export entire conversations as formatted PDF documents
- Dark/light theme support
- Responsive design
- **Replit Auth integration**: Email/password and social login (Google, GitHub, Apple)
- User authentication with Sign Up / Sign In functionality
- Password reset handled automatically via Replit Auth

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (single page for now)
- **State Management**: Local React state for chat messages
- **Styling**: Tailwind CSS with CSS variables (light/dark mode)
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **AI**: OpenAI GPT via Replit AI Integrations (streaming)
- **Storage**: In-memory for chat history

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat` | POST | Send message and receive streaming AI response |

### Project Structure
```
├── client/               # Frontend React application
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Route-level page components
│       │   └── home.tsx  # Main chat interface
│       ├── hooks/        # Custom React hooks
│       └── lib/          # Utilities and query client
├── server/               # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # Main API routes
│   └── replit_integrations/
│       └── chat/         # AI chat integration
│           ├── routes.ts # Chat API endpoint
│           └── storage.ts# In-memory chat storage
├── shared/               # Shared code
│   └── schema.ts         # TypeScript types
└── design_guidelines.md  # UI/UX design specifications
```

## Development

### Running the Application
The app runs on port 5000 via `npm run dev` which starts both the Express backend and Vite dev server.

### Key Technologies
- OpenAI GPT (via Replit AI Integrations)
- TanStack Query for data fetching
- Lucide React for icons
- Inter font family for typography

## Design Guidelines

The app follows design_guidelines.md specifications:
- Clean, minimal aesthetic with teal/green color scheme
- Inter font for readability
- Card-based layouts with consistent spacing
- Subtle hover/active elevations
- Three-tier text color hierarchy
- Accessible components via Radix UI
