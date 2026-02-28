import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import teacherBuddyLogo from "@assets/ATeacherBuddy_logo_on_smartphone_outline-3_1768414106629.png";

type Step = "email" | "reset" | "success";

export default function ForgotPassword() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { forgotPassword, resetPassword } = useAuth();

    // Step tracking
    const [step, setStep] = useState<Step>("email");

    // Email step state
    const [email, setEmail] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // Reset step state
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Step 1: Verify email and get token
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);

        try {
            const resetToken = await forgotPassword(email);
            setToken(resetToken);
            setStep("reset");
            toast({
                title: "Email verified",
                description: "Please enter your new password below.",
            });
        } catch (error: any) {
            toast({
                title: "Verification failed",
                description: error.message || "No account found with that email.",
                variant: "destructive",
            });
        } finally {
            setIsVerifying(false);
        }
    };

    // Step 2: Reset the password
    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Passwords do not match",
                description: "Please make sure your passwords match.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: "Invalid Password",
                description: "Password must be at least 8 characters long.",
                variant: "destructive",
            });
            return;
        }

        setIsResetting(true);

        try {
            await resetPassword({ token, password });
            setStep("success");
            toast({
                title: "Password reset successfully!",
                description: "You can now log in with your new password.",
            });
        } catch (error: any) {
            toast({
                title: "Reset failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsResetting(false);
        }
    };

    const stepTitles: Record<Step, string> = {
        email: "Forgot Password",
        reset: "Set New Password",
        success: "Password Updated",
    };

    const stepDescriptions: Record<Step, string> = {
        email: "Enter your email address to verify your account",
        reset: "Create a new secure password for your account",
        success: "Your password has been successfully changed",
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="space-y-4 text-center">
                    <div className="flex justify-center">
                        <img src={teacherBuddyLogo} alt="TeacherBuddy" className="h-16 w-auto" />
                    </div>

                    {/* Step indicators */}
                    <div className="flex items-center justify-center gap-2">
                        <div className={`h-2 w-8 rounded-full transition-colors ${step === "email" ? "bg-purple-600" : "bg-purple-300"}`} />
                        <div className={`h-2 w-8 rounded-full transition-colors ${step === "reset" ? "bg-purple-600" : step === "success" ? "bg-purple-300" : "bg-gray-200 dark:bg-gray-600"}`} />
                        <div className={`h-2 w-8 rounded-full transition-colors ${step === "success" ? "bg-green-500" : "bg-gray-200 dark:bg-gray-600"}`} />
                    </div>

                    <div>
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            {stepTitles[step]}
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            {stepDescriptions[step]}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Step 1: Email verification */}
                    {step === "email" && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="teacher@school.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isVerifying}
                                    className="h-11"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
                                disabled={isVerifying}
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        <Mail className="mr-2 h-4 w-4" />
                                        Verify Email
                                    </>
                                )}
                            </Button>

                            <button
                                type="button"
                                onClick={() => setLocation("/login")}
                                className="w-full flex items-center justify-center text-sm text-gray-600 hover:text-purple-600 transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Login
                            </button>
                        </form>
                    )}

                    {/* Step 2: New password form */}
                    {step === "reset" && (
                        <form onSubmit={handleResetSubmit} className="space-y-4">
                            <div className="rounded-lg bg-purple-50 dark:bg-purple-900/20 p-3 text-sm text-purple-700 dark:text-purple-300 mb-2">
                                Resetting password for <strong>{email}</strong>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isResetting}
                                        className="h-11 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isResetting}
                                    className="h-11"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
                                disabled={isResetting}
                            >
                                {isResetting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Resetting...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Update Password
                                    </>
                                )}
                            </Button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep("email");
                                    setPassword("");
                                    setConfirmPassword("");
                                    setToken("");
                                }}
                                className="w-full flex items-center justify-center text-sm text-gray-600 hover:text-purple-600 transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Use a different email
                            </button>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === "success" && (
                        <div className="space-y-6 text-center">
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 w-fit mx-auto">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Your password has been updated successfully. You can now sign in with your new password.
                            </p>
                            <Button
                                onClick={() => setLocation("/login")}
                                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold"
                            >
                                Go to Login
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
