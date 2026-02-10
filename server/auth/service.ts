import bcrypt from "bcryptjs";
import { db } from "../db";
import { users, type User } from "@shared/schema";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 10;

export interface RegisterData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with a hashed password
 */
export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Register a new user with email and password
 * Automatically starts a 1-month free trial
 */
export async function registerUser(data: RegisterData): Promise<User> {
    const { email, password, firstName, lastName } = data;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
    });

    if (existingUser) {
        throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Calculate trial dates (1 month from now)
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setMonth(trialEndDate.getMonth() + 1);

    // Create user with trial
    const [newUser] = await db
        .insert(users)
        .values({
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            subscriptionStatus: "trial",
            trialStartDate,
            trialEndDate,
        })
        .returning();

    return newUser;
}

/**
 * Authenticate a user with email and password
 */
export async function authenticateUser(
    data: LoginData
): Promise<User | null> {
    const { email, password } = data;

    // Find user by email
    const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
    });

    if (!user || !user.password) {
        return null;
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
        return null;
    }

    // Update last login
    await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

    return user;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    return user || null;
}

/**
 * Check if user's trial has expired
 */
export function isTrialExpired(user: User): boolean {
    if (user.subscriptionStatus !== "trial") {
        return false;
    }

    if (!user.trialEndDate) {
        return true; // No trial end date means trial is invalid
    }

    return new Date() > new Date(user.trialEndDate);
}

/**
 * Check if user has an active subscription (including trial)
 */
export function hasActiveSubscription(user: User): boolean {
    if (user.isAdmin) return true;
    if (user.subscriptionStatus === "trial") {
        return !isTrialExpired(user);
    }

    return user.subscriptionStatus === "active";
}

/**
 * Check if user has access to a specific feature based on their tier
 */
export function hasFeatureAccess(
    user: User,
    feature: "search" | "save_pdfs" | "planner" | "grader"
): boolean {
    // Admins always have access to all features
    if (user.isAdmin) return true;

    // Check if subscription is active
    if (!hasActiveSubscription(user)) {
        return false;
    }

    // Trial users have access to all features
    if (user.subscriptionStatus === "trial") {
        return true;
    }

    // Tier 1: Search, Save PDFs, Personal Planner
    const tier1Features = ["search", "save_pdfs", "planner"];

    // Tier 2: All features including Student Grader
    const tier2Features = [...tier1Features, "grader"];

    if (user.subscriptionTier === "tier1") {
        return tier1Features.includes(feature);
    }

    if (user.subscriptionTier === "tier2") {
        return tier2Features.includes(feature);
    }

    return false;
}
