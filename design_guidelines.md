# TeacherBuddy Design Guidelines

## Design Approach
**System-Based Productivity Design** inspired by Linear, Notion, and Asana - prioritizing clarity, efficiency, and cognitive ease for time-pressed educators.

### Core Philosophy
Clean, organized interfaces that reduce mental load. Every element serves teacher productivity with minimal visual noise.

## Typography
- **Primary Font**: Inter or DM Sans via Google Fonts (clean, professional)
- **Headings**: Font weight 600-700, sizes: text-2xl to text-4xl
- **Body Text**: Font weight 400, text-base (16px) for optimal readability
- **Labels/Meta**: Font weight 500, text-sm, subtle hierarchy
- **Mono**: JetBrains Mono for any code/template snippets

## Layout System
**Spacing Units**: Tailwind 2, 4, 6, 8, 12, 16 for consistent rhythm
- **Sidebar**: Fixed 280px (expanded), collapsible to 64px icon-only
- **Main Content**: max-w-7xl with py-8 px-6, responsive breathing room
- **Cards/Modules**: p-6 standard, p-4 for compact variants
- **Section Gaps**: space-y-6 for related content, space-y-12 between major sections

## Component Library

### Dashboard Layout
- **Left Sidebar**: Navigation with icons + labels, collapsible, pinned favorites
- **Top Bar**: Search (global), quick actions, notifications bell, user profile
- **Main Canvas**: Grid/list view toggle, filters, content area

### Task/Lesson Cards
- Rounded corners (rounded-lg)
- Subtle borders, hover lift effect (shadow-sm to shadow-md)
- Status indicators (small colored dots/badges)
- Quick actions on hover (edit, duplicate, share icons)

### Forms & Inputs
- Clean text inputs with focus rings (ring-2)
- Floating labels or clear placeholder text
- Helper text below inputs (text-sm)
- Rich text editor for lesson planning (Tiptap-style toolbar)
- Tag/category selectors with multi-select chips

### Navigation Tabs
- Underline style for section switching
- Clear active state (border-b-2)
- Horizontal for sub-navigation, vertical in sidebar

### Data Display
- **Tables**: Clean rows with alternating subtle background, sortable headers
- **Lists**: Checkbox + title + metadata layout, drag handles for reordering
- **Calendar View**: Month/week grid for lesson planning, event cards

### Modals & Overlays
- Centered modals with backdrop blur
- Slide-out panels from right for detailed views (600px width)
- Toast notifications (top-right, auto-dismiss)

## Page Structure

### Dashboard (Landing)
- **Hero Area**: Welcome message + quick stats (lessons planned, tasks due, recent activity)
- **Quick Actions**: Large button grid (4 columns on desktop) - "New Lesson Plan", "Research Topic", "Manage Classes", "View Calendar"
- **Recent Items**: Card grid showing last edited lessons, upcoming tasks
- **Activity Feed**: Simple timeline of recent actions

### Lesson Planner
- Split view: Outline/structure (left 40%) + Content editor (right 60%)
- Template library accessible via sidebar
- Auto-save indicator, version history

### Task Management
- Kanban board option (columns for To Do, In Progress, Done)
- List view with filters (by subject, priority, due date)
- Batch actions toolbar when items selected

### Communication Hub
- Thread-based conversations
- Draft management area
- Template library for common communications

## Images
**Hero Section**: Use a warm, professional photograph of a teacher working calmly at desk with organized materials - conveys relief and organization. Full-width background with overlay gradient (dark to transparent), CTA buttons with backdrop-blur-md.

**Feature Cards**: Small illustrative icons (not photos) using Heroicons for clean consistency.

## Animations
Minimal, purposeful only:
- Smooth sidebar collapse/expand
- Card hover lifts (transform scale-[1.01])
- Loading spinners for async actions
- No scroll animations, no complex transitions

## Accessibility
- High contrast text (WCAG AA minimum)
- Focus states on all interactive elements
- Keyboard navigation throughout
- Screen reader labels on icon-only buttons
- Clear error states with descriptive messages

**Result**: A calm, professional productivity environment where teachers find tools quickly, create content efficiently, and manage their workload with confidence.