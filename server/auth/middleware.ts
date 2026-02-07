import { Request, Response, NextFunction } from "express";
import { getUserById, hasActiveSubscription, hasFeatureAccess } from "./service";
import type { User } from "@shared/schema";


/**
 * Middleware to require authentication
 * Redirects to login if not authenticated
 */
export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const userId = req.session?.userId;

    if (!userId) {
        return res.status(401).json({
            error: "Authentication required",
            redirectTo: "/login"
        });
    }

    try {
        const user = await getUserById(userId);

        if (!user) {
            req.session.destroy(() => { });
            return res.status(401).json({
                error: "User not found",
                redirectTo: "/login"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ error: "Authentication error" });
    }
}

/**
 * Middleware to require an active subscription
 * Allows trial users and active subscribers
 */
export async function requireSubscription(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.user) {
        return res.status(401).json({
            error: "Authentication required",
            redirectTo: "/login"
        });
    }

    if (!hasActiveSubscription(req.user)) {
        return res.status(403).json({
            error: "Active subscription required",
            redirectTo: "/subscription",
            subscriptionStatus: req.user.subscriptionStatus
        });
    }

    next();
}

/**
 * Middleware factory to require access to a specific feature
 */
export function requireFeature(
    feature: "search" | "save_pdfs" | "planner" | "grader"
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                error: "Authentication required",
                redirectTo: "/login"
            });
        }

        if (!hasFeatureAccess(req.user, feature)) {
            return res.status(403).json({
                error: `Access to ${feature} requires an active subscription`,
                redirectTo: "/subscription",
                feature,
                currentTier: req.user.subscriptionTier,
                subscriptionStatus: req.user.subscriptionStatus
            });
        }

        next();
    };
}

/**
 * Optional auth middleware - adds user to request if authenticated
 * Does not block unauthenticated requests
 */
export async function optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const userId = req.session?.userId;

    if (userId) {
        try {
            const user = await getUserById(userId);
            if (user) {
                req.user = user;
            }
        } catch (error) {
            console.error("Optional auth error:", error);
        }
    }

    next();
}
