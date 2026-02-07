import { Router, type Express } from "express";
import { registerUser, authenticateUser } from "./service";
import { requireAuth } from "./middleware";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export function registerAuthRoutes(app: Express) {
    const router = Router();

    /**
     * POST /api/auth/register
     * Register a new user with email and password
     */
    router.post("/register", async (req, res) => {
        try {
            const parsed = registerSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: parsed.error.errors,
                });
            }

            const user = await registerUser(parsed.data);

            // Create session
            req.session.userId = user.id;

            // Don't send password back
            const { password, ...userWithoutPassword } = user;

            res.status(201).json({
                message: "Registration successful",
                user: userWithoutPassword,
            });
        } catch (error: any) {
            console.error("Registration error:", error);

            if (error.message.includes("already exists")) {
                return res.status(409).json({ error: error.message });
            }

            res.status(500).json({ error: "Registration failed" });
        }
    });

    /**
     * POST /api/auth/login
     * Login with email and password
     */
    router.post("/login", async (req, res) => {
        try {
            const parsed = loginSchema.safeParse(req.body);

            if (!parsed.success) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: parsed.error.errors,
                });
            }

            const user = await authenticateUser(parsed.data);

            if (!user) {
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Create session
            req.session.userId = user.id;

            // Don't send password back
            const { password, ...userWithoutPassword } = user;

            res.json({
                message: "Login successful",
                user: userWithoutPassword,
            });
        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({ error: "Login failed" });
        }
    });

    /**
     * POST /api/auth/logout
     * Logout current user
     */
    router.post("/logout", (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error("Logout error:", err);
                return res.status(500).json({ error: "Logout failed" });
            }

            res.json({ message: "Logout successful" });
        });
    });

    /**
     * GET /api/auth/me
     * Get current user info
     */
    router.get("/me", requireAuth, async (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        // Don't send password back
        const { password, ...userWithoutPassword } = req.user;

        res.json({ user: userWithoutPassword });
    });

    /**
     * GET /api/auth/check
     * Check if user is authenticated (no auth required)
     */
    router.get("/check", async (req, res) => {
        const userId = req.session?.userId;

        if (!userId) {
            return res.json({ authenticated: false });
        }

        res.json({ authenticated: true, userId });
    });

    app.use("/api/auth", router);
}
