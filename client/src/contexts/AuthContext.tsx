import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, LogOut } from "lucide-react";

interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    subscriptionStatus: string | null;
    subscriptionTier: string | null;
    trialEndDate: string | null;
    isAdmin: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    forgotPassword: (email: string) => Promise<string>;
    resetPassword: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [, setLocation] = useLocation();
    const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const checkAuth = async () => {
        try {
            const response = await fetch("/api/auth/me");
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Login failed");
        }

        const data = await response.json();
        setUser(data.user);
        setWelcomeDialogOpen(true);
        setTimeout(() => setWelcomeDialogOpen(false), 3000);
    };

    const register = async (data: any) => {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Registration failed");
        }

        // We don't call setUser here because we want the user to log in manually 
        // after registration as per requirements.
    };

    const forgotPassword = async (email: string): Promise<string> => {
        const response = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to process request");
        }

        const data = await response.json();
        return data.token;
    };

    const resetPassword = async (data: any) => {
        const response = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to reset password");
        }
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            setLogoutDialogOpen(true);
            setTimeout(() => setLogoutDialogOpen(false), 3000);
            setLocation("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                forgotPassword,
                resetPassword,
                logout,
                checkAuth,
            }}
        >
            {children}
            <Dialog open={welcomeDialogOpen} onOpenChange={setWelcomeDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-[#6C4EE3] border-2 shadow-[0_0_15px_rgba(108,78,227,0.3)] [&>button]:hidden">
                    <DialogHeader>
                        <DialogTitle className="text-center text-[#6C4EE3] text-2xl font-bold flex flex-col items-center gap-4 pt-4">
                            <CheckCircle className="h-12 w-12 text-[#6C4EE3]" />
                            Welcome back to TeacherBuddy!
                        </DialogTitle>
                        <DialogDescription className="text-center text-slate-600 dark:text-slate-300 pb-2">
                            You have successfully signed in.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-[#6C4EE3] border-2 shadow-[0_0_15px_rgba(108,78,227,0.3)] [&>button]:hidden">
                    <DialogHeader>
                        <DialogTitle className="text-center text-[#6C4EE3] text-2xl font-bold flex flex-col items-center gap-4 pt-4">
                            <LogOut className="h-12 w-12 text-[#6C4EE3]" />
                            Thanks for using TeacherBuddy
                        </DialogTitle>
                        <DialogDescription className="text-center text-slate-600 dark:text-slate-300 pb-2">
                            You have been logged out successfully.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
