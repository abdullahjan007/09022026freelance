import { sql } from "drizzle-orm";
import { index, jsonb, pgTable, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table.
// Enhanced with email/password authentication and Stripe subscriptions
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // hashed password for email/password auth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),

  // Stripe subscription fields
  stripeCustomerId: varchar("stripe_customer_id").unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("trial"), // trial, active, past_due, canceled, expired
  subscriptionTier: varchar("subscription_tier"), // tier1, tier2

  // Trial management
  trialStartDate: timestamp("trial_start_date"),
  trialEndDate: timestamp("trial_end_date"),

  // Admin fields
  isAdmin: boolean("is_admin").default(false),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
