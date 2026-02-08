import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";
import { Link } from "wouter";

interface FeatureLockProps {
    children: ReactNode;
    requiredTier: "tier1" | "tier2";
    featureName: string;
}

export function FeatureLock({
    children,
    requiredTier,
    featureName
}: FeatureLockProps) {
    const { user } = useAuth();

    const isTrial = user?.subscriptionStatus === "trial";
    const currentTier = user?.subscriptionTier;

    // Trial users have access to everything
    let hasAccess = isTrial;

    if (!isTrial) {
        if (requiredTier === "tier1" && (currentTier === "tier1" || currentTier === "tier2")) {
            hasAccess = true;
        } else if (requiredTier === "tier2" && currentTier === "tier2") {
            hasAccess = true;
        }
    }

    if (hasAccess) return <>{children}</>;

    return (
        <div className="relative group">
            {/* Blurred Content */}
            <div className="blur-[2px] pointer-events-none select-none opacity-50">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[1px] rounded-lg z-10 transition-all group-hover:bg-white/70 dark:group-hover:bg-slate-900/70">
                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-border flex flex-col items-center text-center max-w-[280px]">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                        {requiredTier === "tier2" ? (
                            <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        ) : (
                            <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        )}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{featureName}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        This feature requires a {requiredTier === "tier1" ? "Tier 1" : "Tier 2 Pro"} subscription.
                    </p>
                    <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                        <Link href="/subscription">Unlock Feature</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
