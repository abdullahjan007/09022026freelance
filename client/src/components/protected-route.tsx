import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: ReactNode;
    requireActiveSubscription?: boolean;
    requiredTier?: "tier1" | "tier2";
}

export function ProtectedRoute({
    children,
    requireActiveSubscription = true,
    requiredTier
}: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            setLocation("/login");
            return;
        }

        if (!isLoading && isAuthenticated && requireActiveSubscription) {
            const isTrial = user?.subscriptionStatus === "trial";
            const isActive = user?.subscriptionStatus === "active";
            const currentTier = user?.subscriptionTier;

            // 1. Check if subscription/trial is active
            let hasAccess = false;
            if (isTrial && user?.trialEndDate) {
                const trialEnd = new Date(user.trialEndDate);
                if (trialEnd > new Date()) {
                    hasAccess = true;
                }
            } else if (isActive) {
                hasAccess = true;
            }

            if (!hasAccess) {
                setLocation("/subscription");
                return;
            }

            // 2. Check for required tier (Trial has access to everything)
            if (requiredTier && !isTrial) {
                if (requiredTier === "tier2" && currentTier !== "tier2") {
                    // If they have tier1 but need tier2
                    setLocation("/subscription");
                    return;
                }
            }
        }
    }, [isLoading, isAuthenticated, user, requireActiveSubscription, requiredTier, setLocation]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <>{children}</>;
}
