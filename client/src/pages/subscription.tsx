import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Check, Loader2, Crown, Sparkles, ArrowLeft, Calendar, Rocket } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface SubscriptionInfo {
    status: string;
    tier: string | null;
    trialEnd: Date | null;
    currentPeriodEnd: Date | null;
}

export default function Subscription() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { user } = useAuth();
    const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
    const [showComingSoon, setShowComingSoon] = useState(false);
    const [selectedTier, setSelectedTier] = useState<string>("");

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
        // Since Stripe credentials are not provided yet, show Coming Soon dialog
        setSelectedTier(tier === "tier1" ? "Tier 1" : "Tier 2");
        setShowComingSoon(true);
        return;

        // Original logic preserved but bypassed for now
        /*
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

            window.location.href = data.url;
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to start checkout",
                variant: "destructive",
            });
            setCheckoutLoading(null);
        }
        */
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

    const getDaysRemaining = (trialEnd: Date | null) => {
        if (!trialEnd) return 0;
        const now = new Date();
        const end = new Date(trialEnd);
        const diff = end.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
        );
    }

    const isTrial = subscriptionInfo?.status === "trial";
    const isActive = subscriptionInfo?.status === "active";
    const currentTier = subscriptionInfo?.tier;
    const daysRemaining = getDaysRemaining(subscriptionInfo?.trialEnd || null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 py-12">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => setLocation("/")}
                    className="mb-6"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Button>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Select the perfect plan for your teaching needs
                    </p>

                    {/* Trial Status */}
                    {isTrial && subscriptionInfo?.trialEnd && (
                        <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full border border-purple-200 dark:border-purple-800">
                            <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <div className="text-left">
                                <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                    Free Trial Active
                                </div>
                                <div className="text-xs text-purple-600 dark:text-purple-400">
                                    {daysRemaining} days remaining • Ends {new Date(subscriptionInfo.trialEnd).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Subscription */}
                    {isActive && currentTier && (
                        <div className="mt-6 inline-block">
                            <Badge className="bg-green-600 text-white px-4 py-2 text-sm">
                                Active Subscription: {currentTier === "tier1" ? "Tier 1" : "Tier 2"}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Tier 1 */}
                    <Card className={`relative transition-all hover:shadow-xl ${currentTier === "tier1" ? "ring-2 ring-purple-600 shadow-lg" : ""}`}>
                        {currentTier === "tier1" && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <Badge className="bg-purple-600 text-white px-4 py-1">Current Plan</Badge>
                            </div>
                        )}
                        <CardHeader className="text-center pb-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                                    <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl mb-2">Tier 1</CardTitle>
                            <div className="text-4xl font-bold text-purple-600">
                                $3<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/month</span>
                            </div>
                            <CardDescription className="text-base mt-2">Essential teaching tools</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <Check className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">AI Search & Chat</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Get instant answers to teaching questions</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <Check className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Save PDFs</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Download and save teaching materials</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <Check className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Personal Planner</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Organize your teaching schedule</div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold"
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
                    <Card className={`relative transition-all hover:shadow-xl ${currentTier === "tier2" ? "ring-2 ring-indigo-600 shadow-lg" : ""}`}>
                        {currentTier === "tier2" && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <Badge className="bg-indigo-600 text-white px-4 py-1">Current Plan</Badge>
                            </div>
                        )}
                        <CardHeader className="text-center pb-8">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                                    <Crown className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl mb-2">Tier 2</CardTitle>
                            <div className="text-4xl font-bold text-indigo-600">
                                $5<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/month</span>
                            </div>
                            <CardDescription className="text-base mt-2">Complete teaching suite</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <Check className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Everything in Tier 1</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">All basic features included</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <Check className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-indigo-600 dark:text-indigo-400">Student Grader</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">AI-powered feedback generation</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <Check className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium">Priority Support</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Get help when you need it</div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold"
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

                {/* Manage Billing */}
                {isActive && (
                    <div className="text-center mt-12">
                        <Button
                            variant="outline"
                            onClick={handleManageBilling}
                            className="px-8"
                        >
                            Manage Billing & Subscription
                        </Button>
                    </div>
                )}

                {/* FAQ or Additional Info */}
                <div className="mt-16 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Can I upgrade or downgrade?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Absolutely! You can change your plan at any time through the billing portal. Changes take effect immediately.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">What happens after my trial ends?</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 dark:text-gray-400">
                                    After your 1-month free trial, you'll need to select a subscription plan to continue using TeacherBuddy. All your data will be preserved.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Coming Soon Dialog */}
            <Dialog open={showComingSoon} onOpenChange={setShowComingSoon}>
                <DialogContent className="sm:max-w-md border-none bg-white dark:bg-gray-900 shadow-2xl">
                    <DialogHeader className="pt-8">
                        <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mb-4">
                            <Rocket className="h-8 w-8 text-purple-600 dark:text-purple-400 animate-bounce" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            Coming Soon!
                        </DialogTitle>
                        <DialogDescription className="text-center text-base mt-2">
                            The <span className="font-bold text-purple-600">{selectedTier}</span> subscription plan is almost ready for you.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 text-center space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            We are currently putting the finishing touches on our secure payment system to ensure the best experience for our teachers.
                        </p>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                Thank you for your patience and for being part of the TeacherBuddy community!
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-center pb-8 px-6">
                        <Button
                            className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold transition-all"
                            onClick={() => setShowComingSoon(false)}
                        >
                            Got it, thanks!
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
