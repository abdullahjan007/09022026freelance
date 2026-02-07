import Stripe from "stripe";
import { db } from "../db";
import { users, type User } from "@shared/schema";
import { eq } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY must be set in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-01-28.clover",
});

export interface CreateCheckoutSessionParams {
    userId: string;
    tier: "tier1" | "tier2";
    successUrl: string;
    cancelUrl: string;
}

export interface SubscriptionInfo {
    status: string;
    tier: string | null;
    trialEnd: Date | null;
    currentPeriodEnd: Date | null;
}

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer(user: User): Promise<string> {
    const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
            userId: user.id,
        },
    });

    // Update user with Stripe customer ID
    await db
        .update(users)
        .set({ stripeCustomerId: customer.id })
        .where(eq(users.id, user.id));

    return customer.id;
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
    params: CreateCheckoutSessionParams
): Promise<string> {
    const { userId, tier, successUrl, cancelUrl } = params;

    // Get user
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
        customerId = await createStripeCustomer(user);
    }

    // Get price ID based on tier
    const priceId =
        tier === "tier1"
            ? process.env.STRIPE_TIER1_PRICE_ID
            : process.env.STRIPE_TIER2_PRICE_ID;

    if (!priceId) {
        throw new Error(`Price ID not configured for ${tier}`);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
            userId,
            tier,
        },
    });

    return session.url!;
}

/**
 * Create a billing portal session for managing subscription
 */
export async function createBillingPortalSession(
    userId: string,
    returnUrl: string
): Promise<string> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user || !user.stripeCustomerId) {
        throw new Error("No Stripe customer found for user");
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: returnUrl,
    });

    return session.url;
}

/**
 * Handle successful checkout (called by webhook)
 */
export async function handleCheckoutComplete(
    session: Stripe.Checkout.Session
): Promise<void> {
    const userId = session.metadata?.userId;
    const tier = session.metadata?.tier as "tier1" | "tier2";

    if (!userId || !tier) {
        console.error("Missing metadata in checkout session");
        return;
    }

    const subscriptionId = session.subscription as string;

    // Update user subscription
    await db
        .update(users)
        .set({
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: "active",
            subscriptionTier: tier,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
}

/**
 * Handle subscription updates (called by webhook)
 */
export async function handleSubscriptionUpdate(
    subscription: Stripe.Subscription
): Promise<void> {
    const customerId = subscription.customer as string;

    // Find user by Stripe customer ID
    const user = await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId),
    });

    if (!user) {
        console.error("User not found for customer:", customerId);
        return;
    }

    // Map Stripe status to our status
    let status: string = subscription.status;
    if (subscription.status === "trialing") {
        status = "trial";
    } else if (subscription.status === "active") {
        status = "active";
    } else if (subscription.status === "past_due") {
        status = "past_due";
    } else if (
        subscription.status === "canceled" ||
        subscription.status === "unpaid"
    ) {
        status = "canceled";
    }

    // Update user subscription
    await db
        .update(users)
        .set({
            stripeSubscriptionId: subscription.id,
            subscriptionStatus: status,
            updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
}

/**
 * Handle subscription deletion (called by webhook)
 */
export async function handleSubscriptionDeleted(
    subscription: Stripe.Subscription
): Promise<void> {
    const customerId = subscription.customer as string;

    // Find user by Stripe customer ID
    const user = await db.query.users.findFirst({
        where: eq(users.stripeCustomerId, customerId),
    });

    if (!user) {
        console.error("User not found for customer:", customerId);
        return;
    }

    // Update user subscription to canceled
    await db
        .update(users)
        .set({
            subscriptionStatus: "canceled",
            updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
}

/**
 * Get subscription info for a user
 */
export async function getSubscriptionInfo(
    userId: string
): Promise<SubscriptionInfo> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user) {
        throw new Error("User not found");
    }

    return {
        status: user.subscriptionStatus || "none",
        tier: user.subscriptionTier,
        trialEnd: user.trialEndDate,
        currentPeriodEnd: null, // Can be fetched from Stripe if needed
    };
}

/**
 * Verify webhook signature
 */
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string
): Stripe.Event {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        throw new Error("STRIPE_WEBHOOK_SECRET not configured");
    }

    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export { stripe };
