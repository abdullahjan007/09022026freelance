# Quick Setup Guide

## Immediate Next Steps

### 1. Configure Stripe (REQUIRED)

Before the app can work, you need to set up Stripe:

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/

2. **Create Products:**
   - Click "Products" → "Add Product"
   - Create "Teacher Buddy - Tier 1"
     - Price: $3.00 USD
     - Billing period: Monthly
     - Copy the Price ID (starts with `price_`)
   - Create "Teacher Buddy - Tier 2"
     - Price: $5.00 USD
     - Billing period: Monthly
     - Copy the Price ID

3. **Get API Keys:**
   - Go to "Developers" → "API Keys"
   - Copy "Secret key" (starts with `sk_`)
   - Copy "Publishable key" (starts with `pk_`)

4. **Set up Webhook:**
   - Go to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Click "Add endpoint"
   - Copy the "Signing secret" (starts with `whsec_`)

5. **Update .env file:**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_TIER1_PRICE_ID=price_...
STRIPE_TIER2_PRICE_ID=price_...
```

### 2. Push Database Schema

Run this command to update your PostgreSQL database:

```bash
npm run db:push
```

This will add the new columns to the `users` table:
- password
- stripeCustomerId
- stripeSubscriptionId
- subscriptionStatus
- subscriptionTier
- trialStartDate
- trialEndDate
- lastLoginAt

### 3. Test the Application

Start the development server:

```bash
npm run dev
```

Then test:

1. **Registration:**
   - Go to http://localhost:5000/register
   - Create a new account
   - Check that you're redirected to home
   - Verify user is created in database with trial status

2. **Login:**
   - Logout (you'll need to add a logout button)
   - Go to http://localhost:5000/login
   - Login with your credentials
   - Verify you can access the app

3. **API Protection:**
   - Try accessing `/api/events` without logging in
   - Should get 401 Unauthorized

### 4. Create Subscription Page (NEXT PRIORITY)

Create `client/src/pages/subscription.tsx`:

```typescript
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Crown, Sparkles } from "lucide-react";

export default function Subscription() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, []);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch("/api/stripe/subscription-info");
      if (response.ok) {
        const data = await response.json();
        setSubscriptionInfo(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (tier: "tier1" | "tier2") => {
    setCheckoutLoading(tier);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
      setCheckoutLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create portal session");
      }

      // Redirect to Stripe Billing Portal
      window.location.href = data.url;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const isTrial = subscriptionInfo?.status === "trial";
  const isActive = subscriptionInfo?.status === "active";
  const currentTier = subscriptionInfo?.tier;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Select the perfect plan for your teaching needs
          </p>
          
          {isTrial && subscriptionInfo?.trialEnd && (
            <div className="mt-4 inline-block">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Trial ends: {new Date(subscriptionInfo.trialEnd).toLocaleDateString()}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Tier 1 */}
          <Card className={`relative ${currentTier === "tier1" ? "ring-2 ring-purple-600" : ""}`}>
            {currentTier === "tier1" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-purple-600 text-white">Current Plan</Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-2xl">Tier 1</CardTitle>
              </div>
              <div className="text-3xl font-bold">
                $3<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <CardDescription>Essential teaching tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>AI Search & Chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Save PDFs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Personal Planner</span>
                </div>
              </div>

              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => handleSubscribe("tier1")}
                disabled={currentTier === "tier1" || checkoutLoading !== null}
              >
                {checkoutLoading === "tier1" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : currentTier === "tier1" ? (
                  "Current Plan"
                ) : (
                  "Subscribe to Tier 1"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tier 2 */}
          <Card className={`relative ${currentTier === "tier2" ? "ring-2 ring-indigo-600" : ""}`}>
            {currentTier === "tier2" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-indigo-600 text-white">Current Plan</Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-6 w-6 text-indigo-600" />
                <CardTitle className="text-2xl">Tier 2</CardTitle>
              </div>
              <div className="text-3xl font-bold">
                $5<span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <CardDescription>Complete teaching suite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Everything in Tier 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">Student Grader</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Priority Support</span>
                </div>
              </div>

              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={() => handleSubscribe("tier2")}
                disabled={currentTier === "tier2" || checkoutLoading !== null}
              >
                {checkoutLoading === "tier2" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : currentTier === "tier2" ? (
                  "Current Plan"
                ) : (
                  "Subscribe to Tier 2"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {isActive && (
          <div className="text-center mt-8">
            <Button variant="outline" onClick={handleManageBilling}>
              Manage Billing
            </Button>
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
```

Then add the route to `App.tsx`:
```typescript
import Subscription from "@/pages/subscription";

// In Router component:
<Route path="/subscription" component={Subscription} />
```

### 5. Add Logout Button

Update the home page or create a header component with a logout button:

```typescript
const handleLogout = async () => {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
    setLocation("/login");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// In your JSX:
<Button onClick={handleLogout}>Logout</Button>
```

### 6. Test Stripe Integration

1. Use Stripe test mode (test API keys)
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any 3-digit CVC
5. Any ZIP code

### 7. Deploy to Production

When ready for production:

1. Update `.env` with production Stripe keys
2. Push database schema: `npm run db:push`
3. Build: `npm run build`
4. Deploy to Railway
5. Update Stripe webhook URL to production domain
6. Test with real payment (then refund)

## Common Issues

### Database Connection Error
- Check `DATABASE_URL` in `.env`
- Verify PostgreSQL is running on Railway
- Run `npm run db:push` to create tables

### Stripe Webhook Not Working
- Verify webhook URL is correct
- Check webhook secret in `.env`
- Use Stripe CLI for local testing: `stripe listen --forward-to localhost:5000/api/stripe/webhook`

### Session Not Persisting
- Check `SESSION_SECRET` is set in `.env`
- Verify `sessions` table exists in database
- Clear browser cookies and try again

### TypeScript Errors
- Run `npm run check` to see all errors
- Most errors will resolve after rebuilding
- Restart TypeScript server in VS Code

## Need Help?

Check the `IMPLEMENTATION_GUIDE.md` for detailed documentation on:
- Complete feature list
- Testing checklist
- Security considerations
- Deployment steps
