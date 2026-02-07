import { Router, type Express } from "express";
import { requireAuth } from "../auth/middleware";
import {
    createCheckoutSession,
    createBillingPortalSession,
    getSubscriptionInfo,
    constructWebhookEvent,
    handleCheckoutComplete,
    handleSubscriptionUpdate,
    handleSubscriptionDeleted,
} from "./service";
import { z } from "zod";

const checkoutSchema = z.object({
    tier: z.enum(["tier1", "tier2"]),
});

export function registerStripeRoutes(app: Express) {
    const router = Router();

    /**
     * POST /api/stripe/create-checkout-session
     * Create a Stripe checkout session for subscription
     */
    router.post("/create-checkout-session", requireAuth, async (req, res) => {
        try {
            const parsed = checkoutSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: parsed.error.errors,
                });
            }

            if (!req.user) {
                return res.status(401).json({ error: "Not authenticated" });
            }

            const { tier } = parsed.data;

            const protocol = req.headers["x-forwarded-proto"] || req.protocol;
            const host = req.headers.host;
            const baseUrl = `${protocol}://${host}`;

            const checkoutUrl = await createCheckoutSession({
                userId: req.user.id,
                tier,
                successUrl: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${baseUrl}/subscription`,
            });

            res.json({ url: checkoutUrl });
        } catch (error: any) {
            console.error("Checkout session error:", error);
            res.status(500).json({ error: error.message || "Failed to create checkout session" });
        }
    });

    /**
     * POST /api/stripe/create-portal-session
     * Create a billing portal session for managing subscription
     */
    router.post("/create-portal-session", requireAuth, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Not authenticated" });
            }

            const protocol = req.headers["x-forwarded-proto"] || req.protocol;
            const host = req.headers.host;
            const baseUrl = `${protocol}://${host}`;

            const portalUrl = await createBillingPortalSession(
                req.user.id,
                `${baseUrl}/subscription`
            );

            res.json({ url: portalUrl });
        } catch (error: any) {
            console.error("Portal session error:", error);
            res.status(500).json({ error: error.message || "Failed to create portal session" });
        }
    });

    /**
     * GET /api/stripe/subscription-info
     * Get current user's subscription information
     */
    router.get("/subscription-info", requireAuth, async (req, res) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: "Not authenticated" });
            }

            const info = await getSubscriptionInfo(req.user.id);
            res.json(info);
        } catch (error: any) {
            console.error("Subscription info error:", error);
            res.status(500).json({ error: error.message || "Failed to get subscription info" });
        }
    });

    /**
     * POST /api/stripe/webhook
     * Stripe webhook endpoint for subscription events
     */
    router.post("/webhook", async (req, res) => {
        const signature = req.headers["stripe-signature"];

        if (!signature) {
            return res.status(400).json({ error: "Missing stripe-signature header" });
        }

        try {
            const event = constructWebhookEvent(
                req.rawBody as Buffer,
                signature as string
            );

            // Handle the event
            switch (event.type) {
                case "checkout.session.completed":
                    await handleCheckoutComplete(event.data.object as any);
                    break;

                case "customer.subscription.updated":
                    await handleSubscriptionUpdate(event.data.object as any);
                    break;

                case "customer.subscription.deleted":
                    await handleSubscriptionDeleted(event.data.object as any);
                    break;

                default:
                    console.log(`Unhandled event type: ${event.type}`);
            }

            res.json({ received: true });
        } catch (error: any) {
            console.error("Webhook error:", error);
            res.status(400).json({ error: error.message || "Webhook error" });
        }
    });

    app.use("/api/stripe", router);
}
