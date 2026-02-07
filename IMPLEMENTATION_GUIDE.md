# Teacher-Buddy Authentication & Subscription Implementation

## Overview
This document outlines the implementation of mandatory authentication, Stripe subscriptions, and bug fixes for the Teacher-Buddy application.

## ✅ Completed Implementation

### 1. Database Schema Updates
**File:** `shared/models/auth.ts`

- Added `password` field for email/password authentication (hashed with bcrypt)
- Added Stripe integration fields:
  - `stripeCustomerId` - Unique Stripe customer ID
  - `stripeSubscriptionId` - Active subscription ID
  - `subscriptionStatus` - trial, active, past_due, canceled, expired
  - `subscriptionTier` - tier1 or tier2
- Added trial management fields:
  - `trialStartDate` - When trial began
  - `trialEndDate` - When trial expires (1 month from registration)
- Added `lastLoginAt` timestamp

**Database Migration:**
Run `npm run db:push` to apply schema changes to PostgreSQL database.

### 2. Dependencies Installed
```bash
npm install bcryptjs stripe @stripe/stripe-js @types/bcryptjs
```

### 3. Backend Services Created

#### Authentication Service
**File:** `server/auth/service.ts`

Features:
- User registration with automatic 1-month free trial
- Email/password authentication with bcrypt hashing
- Trial expiration checking
- Feature access control based on subscription tier
- Tier 1 ($3/month): Search, Save PDFs, Personal Planner
- Tier 2 ($5/month): All Tier 1 features + Student Grader

#### Authentication Middleware
**File:** `server/auth/middleware.ts`

Middleware functions:
- `requireAuth` - Requires user to be logged in
- `requireSubscription` - Requires active subscription (trial or paid)
- `requireFeature(feature)` - Requires access to specific feature based on tier
- `optionalAuth` - Adds user to request if authenticated (doesn't block)

#### Stripe Service
**File:** `server/stripe/service.ts`

Features:
- Create Stripe customers for users
- Generate checkout sessions for subscriptions
- Create billing portal sessions for subscription management
- Handle webhook events:
  - `checkout.session.completed` - Subscription activated
  - `customer.subscription.updated` - Subscription status changed
  - `customer.subscription.deleted` - Subscription canceled
- Sync subscription status with database

### 4. API Routes Created

#### Authentication Routes
**File:** `server/auth/routes.ts`

Endpoints:
- `POST /api/auth/register` - Register new user (auto-starts trial)
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info (requires auth)
- `GET /api/auth/check` - Check if user is authenticated

#### Stripe Routes
**File:** `server/stripe/routes.ts`

Endpoints:
- `POST /api/stripe/create-checkout-session` - Create subscription checkout
- `POST /api/stripe/create-portal-session` - Access billing portal
- `GET /api/stripe/subscription-info` - Get user's subscription info
- `POST /api/stripe/webhook` - Handle Stripe webhook events

### 5. Route Protection Applied
**File:** `server/routes.ts`

All existing routes now protected:
- `/api/chat` - Requires `search` feature (Tier 1+)
- `/api/events/*` - Requires `planner` feature (Tier 1+)
- `/api/feedback/generate` - Requires `grader` feature (Tier 2 only)

### 6. Frontend Pages Created

#### Login Page
**File:** `client/src/pages/login.tsx`

Features:
- Email/password login form
- Password visibility toggle
- Error handling and validation
- Redirect to home after successful login
- Link to registration page

#### Registration Page
**File:** `client/src/pages/register.tsx`

Features:
- User registration form (first name, last name, email, password)
- Password confirmation with validation
- Terms and privacy policy acceptance
- Free trial badge highlighting 1-month trial
- Automatic trial enrollment on registration
- Link to login page

#### App Router Updated
**File:** `client/src/App.tsx`

Added routes:
- `/login` - Login page
- `/register` - Registration page (moved to top for priority)

### 7. Type Declarations
**File:** `server/types/express.d.ts`

Extended Express types:
- `SessionData.userId` - User ID stored in session
- `Request.user` - Current authenticated user object

### 8. Environment Variables
**File:** `.env`

Added Stripe configuration:
```env
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
STRIPE_TIER1_PRICE_ID=your_tier1_price_id_here
STRIPE_TIER2_PRICE_ID=your_tier2_price_id_here
```

## 🔄 Remaining Implementation Tasks

### 1. Create Subscription Management Page
**File to create:** `client/src/pages/subscription.tsx`

Features needed:
- Display current subscription status (trial, tier1, tier2, expired)
- Show trial expiration date if on trial
- Tier comparison table:
  - Tier 1 ($3/month): Search, Save PDFs, Personal Planner
  - Tier 2 ($5/month): All features including Student Grader
- "Upgrade" buttons that call `/api/stripe/create-checkout-session`
- "Manage Subscription" button for billing portal
- Trial countdown timer

### 2. Create Authentication Context
**File to create:** `client/src/contexts/AuthContext.tsx`

Features needed:
- Global authentication state
- `useAuth()` hook for components
- Auto-check authentication on app load
- Provide user object to all components
- Handle login/logout state updates

### 3. Create Route Guards
**File to create:** `client/src/components/ProtectedRoute.tsx`

Features needed:
- Redirect to `/login` if not authenticated
- Redirect to `/subscription` if subscription expired
- Check feature access for specific routes

### 4. Fix "New Chat" Bug
**Approach:** Create global chat state management

**File to create:** `client/src/contexts/ChatContext.tsx`

Features needed:
- Global chat state accessible from any page
- `handleNewChat()` function that works across all pages
- Persist chat history across navigation
- Clear chat state when "New Chat" is clicked

**Files to update:**
- `client/src/pages/home.tsx` - Use ChatContext instead of local state
- Add "New Chat" button to navigation/header for global access

### 5. Add UI Indicators
**Components to create:**

#### Trial Status Badge
**File:** `client/src/components/TrialBadge.tsx`
- Show remaining trial days
- Warning when trial is expiring soon
- Link to subscription page

#### Subscription Tier Badge
**File:** `client/src/components/TierBadge.tsx`
- Display current tier (Trial, Tier 1, Tier 2)
- Show included features
- Upgrade prompt for Tier 1 users

#### Feature Lock Overlay
**File:** `client/src/components/FeatureLock.tsx`
- Block access to features not in current tier
- Show upgrade prompt
- Direct link to subscription page

### 6. Update Navigation
**File to update:** `client/src/pages/home.tsx` (or create a shared Header component)

Add to navigation:
- User profile dropdown with:
  - User name and email
  - Subscription status
  - "Manage Subscription" link
  - "Logout" button
- Trial status indicator
- "New Chat" button (globally accessible)

### 7. Configure Stripe
**Steps:**

1. **Create Stripe Account** (if not already done)
   - Go to https://stripe.com
   - Create account or login

2. **Create Products and Prices**
   - Create "Tier 1" product with $3/month recurring price
   - Create "Tier 2" product with $5/month recurring price
   - Copy the Price IDs

3. **Get API Keys**
   - Go to Stripe Dashboard > Developers > API Keys
   - Copy Secret Key and Publishable Key

4. **Set up Webhook**
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy Webhook Secret

5. **Update .env file** with actual values

### 8. Test Database Connection
**Steps:**

1. Verify PostgreSQL connection:
```bash
npm run db:push
```

2. Check if tables were created:
   - Connect to Railway PostgreSQL
   - Verify `users` table has new columns
   - Verify `sessions` table exists

3. Test registration:
   - Register a new user
   - Check database for user record
   - Verify trial dates are set
   - Verify password is hashed

### 9. Handle API Errors on Frontend
**Files to update:**
- All pages that make API calls

Add error handling for:
- 401 Unauthorized → Redirect to `/login`
- 403 Forbidden (subscription required) → Redirect to `/subscription`
- Show feature-specific upgrade prompts

### 10. Add Loading States
**Components to update:**
- All pages with API calls
- Show loading spinners during authentication checks
- Skeleton loaders for subscription status

## 🐛 Bug Fix: "New Chat" Not Working on Different Pages

### Problem
The "New Chat" button only works on the home page because chat state is local to that component.

### Solution
Create a global ChatContext that manages chat state across the entire application.

**Implementation:**

1. Create `client/src/contexts/ChatContext.tsx`:
```typescript
import { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContextType {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  handleNewChat: () => void;
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      setMessages,
      handleNewChat,
      currentConversationId,
      setCurrentConversationId,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
```

2. Wrap App with ChatProvider in `client/src/App.tsx`

3. Update `client/src/pages/home.tsx` to use `useChat()` instead of local state

4. Add "New Chat" button to global navigation that calls `handleNewChat()`

## 📋 Testing Checklist

### Authentication
- [ ] User can register with email/password
- [ ] Registration creates user in database with hashed password
- [ ] Trial dates are set correctly (1 month from registration)
- [ ] User can login with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] User session persists across page refreshes
- [ ] User can logout successfully
- [ ] Unauthenticated users are redirected to login

### Subscriptions
- [ ] Trial users can access all features
- [ ] Trial expiration is calculated correctly
- [ ] Expired trial users are redirected to subscription page
- [ ] Stripe checkout session is created successfully
- [ ] Successful payment activates subscription
- [ ] Tier 1 users can access: Search, Save PDFs, Planner
- [ ] Tier 1 users cannot access: Student Grader
- [ ] Tier 2 users can access all features
- [ ] Subscription status updates via webhooks
- [ ] Billing portal allows subscription management
- [ ] Canceled subscriptions block feature access

### Feature Access
- [ ] Search/Chat requires authentication and active subscription
- [ ] Save PDFs requires Tier 1 or higher
- [ ] Personal Planner requires Tier 1 or higher
- [ ] Student Grader requires Tier 2 only
- [ ] Appropriate error messages for blocked features

### UI/UX
- [ ] Trial badge shows remaining days
- [ ] Subscription tier is displayed in UI
- [ ] "New Chat" works from any page
- [ ] Login page is visually appealing
- [ ] Registration page is visually appealing
- [ ] Subscription page clearly shows tier differences
- [ ] Error messages are user-friendly
- [ ] Loading states are shown during API calls

## 🚀 Deployment Steps

1. **Update Environment Variables on Railway:**
   - Add all Stripe keys
   - Verify DATABASE_URL is correct

2. **Push Database Schema:**
```bash
npm run db:push
```

3. **Build and Deploy:**
```bash
npm run build
git add .
git commit -m "Add authentication and subscription system"
git push
```

4. **Configure Stripe Webhook:**
   - Update webhook URL to production domain
   - Test webhook with Stripe CLI

5. **Test Production:**
   - Register test user
   - Complete test subscription
   - Verify webhook events

## 📝 Notes

- All passwords are hashed with bcrypt (10 salt rounds)
- Sessions are stored in PostgreSQL via `connect-pg-simple`
- Stripe webhooks keep subscription status in sync
- Trial users have full access for 1 month
- After trial, users must subscribe to continue
- Subscription tiers are enforced at the API level
- Frontend redirects provide good UX for blocked access

## 🔒 Security Considerations

- Passwords are never stored in plain text
- Session secrets should be strong and unique
- Stripe webhook signatures are verified
- API routes are protected with authentication middleware
- Feature access is validated on every request
- User input is validated with Zod schemas

## 📞 Support

For issues or questions:
1. Check database connection in Railway
2. Verify Stripe webhook events in Stripe Dashboard
3. Check server logs for authentication errors
4. Verify environment variables are set correctly
