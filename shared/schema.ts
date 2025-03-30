import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  preferences: jsonb("preferences"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Social accounts table
export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platform: text("platform").notNull(), // twitter, instagram, facebook, etc.
  username: text("username").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  isActive: boolean("is_active").default(true),
});

export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({
  id: true,
});

// Content/posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  socialAccountId: integer("social_account_id").references(() => socialAccounts.id),
  content: text("content").notNull(),
  mediaUrls: text("media_urls").array(),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  status: text("status").notNull(), // draft, scheduled, published, failed
  engagementScore: real("engagement_score"), // AI predicted engagement score
  shadowbanRisk: real("shadowban_risk"), // AI predicted shadowban risk
  tags: text("tags").array(),
  platform: text("platform").notNull(), // twitter, instagram, facebook, etc.
  isMonetized: boolean("is_monetized").default(false),
  monetizationDetails: jsonb("monetization_details"),
});

// Create the base schema
const basePostSchema = createInsertSchema(posts).omit({
  id: true,
  publishedAt: true,
});

// Create a version for inserts that omits AI-generated fields
export const insertPostSchema = basePostSchema.omit({
  engagementScore: true,
  shadowbanRisk: true,
});

// Create an extended version that includes AI fields for internal use
export const extendedPostSchema = basePostSchema.extend({
  engagementScore: z.number().optional(),
  shadowbanRisk: z.number().optional(),
  publishedAt: z.date().optional().nullable(),
});

// Analytics data
export const analyticsData = pgTable("analytics_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  socialAccountId: integer("social_account_id").references(() => socialAccounts.id),
  postId: integer("post_id").references(() => posts.id),
  date: timestamp("date").notNull(),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  revenue: real("revenue").default(0),
  platform: text("platform").notNull(),
});

export const insertAnalyticsDataSchema = createInsertSchema(analyticsData).omit({
  id: true,
});

// Auto-engage activities
export const engageActivities = pgTable("engage_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  socialAccountId: integer("social_account_id").references(() => socialAccounts.id),
  postId: integer("post_id").references(() => posts.id),
  type: text("type").notNull(), // reply, like, follow, etc.
  content: text("content"), // If it's a reply, store the content
  targetUsername: text("target_username"), // Username of the account engaged with
  targetContent: text("target_content"), // Content engaged with (e.g., comment being replied to)
  performedAt: timestamp("performed_at").defaultNow(),
  platform: text("platform").notNull(),
});

export const insertEngageActivitySchema = createInsertSchema(engageActivities).omit({
  id: true,
  performedAt: true,
});

// AI Insights
export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  socialAccountId: integer("social_account_id").references(() => socialAccounts.id),
  type: text("type").notNull(), // engagement, shadowban, monetization, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  severity: text("severity"), // info, warning, opportunity
  relatedPostId: integer("related_post_id").references(() => posts.id),
  createdAt: timestamp("created_at").defaultNow(),
  isRead: boolean("is_read").default(false),
  isApplied: boolean("is_applied").default(false),
  metadata: jsonb("metadata"), // Additional data related to the insight
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
});

// Monetization records
export const monetizationRecords = pgTable("monetization_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
  source: text("source").notNull(), // affiliate, sponsored, product, etc.
  amount: real("amount").notNull(),
  currency: text("currency").default("USD"),
  date: timestamp("date").notNull(),
  platform: text("platform").notNull(),
  conversionCount: integer("conversion_count").default(1),
  partnerName: text("partner_name"),
  campaignId: text("campaign_id"),
  status: text("status").default("completed"), // pending, completed, failed, etc.
});

export const insertMonetizationRecordSchema = createInsertSchema(monetizationRecords).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type AnalyticsData = typeof analyticsData.$inferSelect;
export type InsertAnalyticsData = z.infer<typeof insertAnalyticsDataSchema>;

export type EngageActivity = typeof engageActivities.$inferSelect;
export type InsertEngageActivity = z.infer<typeof insertEngageActivitySchema>;

export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;

export type MonetizationRecord = typeof monetizationRecords.$inferSelect;
export type InsertMonetizationRecord = z.infer<typeof insertMonetizationRecordSchema>;

// Auth Schemas
export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Platform type definition
export const platformEnum = z.enum(['twitter', 'instagram', 'facebook', 'linkedin', 'tiktok', 'youtube']);
export type Platform = z.infer<typeof platformEnum>;

// User Preferences Schemas
export const userPreferencesSchema = z.object({
  // Default dashboard view settings
  dashboard: z.object({
    defaultPeriod: z.enum(['7days', '30days', '90days', 'year']).default('30days'),
    defaultPlatform: z.enum(['all', ...platformEnum.options]).default('all'),
    enabledWidgets: z.array(z.enum([
      'performance',
      'monetization',
      'upcoming-posts',
      'ai-insights',
      'roi-breakdown',
      'auto-engage'
    ])).default(['performance', 'upcoming-posts', 'ai-insights', 'auto-engage']),
  }).default({}),
  
  // Content creation preferences
  content: z.object({
    defaultPlatform: platformEnum.default('twitter'),
    autoAnalyzeContent: z.boolean().default(true),
    preferredPostTimes: z.record(platformEnum, z.array(z.string())).optional(),
    defaultHashtags: z.record(platformEnum, z.array(z.string())).optional(),
    contentSuggestionTopics: z.array(z.string()).optional(),
  }).default({}),
  
  // Auto-engage settings
  autoEngage: z.object({
    enabled: z.boolean().default(false),
    replyToComments: z.boolean().default(true),
    likeRelevantContent: z.boolean().default(true),
    followBackUsers: z.boolean().default(false),
    engagementFrequency: z.enum(['low', 'medium', 'high']).default('medium'),
    blacklistedKeywords: z.array(z.string()).optional(),
    maxDailyInteractions: z.number().min(0).max(100).default(20),
    platforms: z.array(platformEnum).default(['twitter', 'instagram']),
  }).default({}),
  
  // Monetization preferences
  monetization: z.object({
    enabledTypes: z.array(z.enum([
      'affiliate',
      'sponsored',
      'product',
      'subscription',
      'donation'
    ])).default(['affiliate', 'sponsored']),
    minRevenueThreshold: z.number().default(50),
    targetRevenueGoals: z.record(platformEnum, z.number()).optional(),
    preferredPartners: z.array(z.string()).optional(),
    blacklistedPartners: z.array(z.string()).optional(),
    automaticSuggestions: z.boolean().default(true),
  }).default({}),
  
  // Analytics preferences
  analytics: z.object({
    defaultView: z.enum(['overview', 'engagement', 'audience']).default('overview'),
    kpiPriorities: z.array(z.enum([
      'followers',
      'impressions', 
      'engagement',
      'comments', 
      'revenue'
    ])).default(['engagement', 'followers', 'revenue']),
    customReportSchedule: z.enum(['never', 'daily', 'weekly', 'monthly']).default('weekly'),
    emailReports: z.boolean().default(true),
  }).default({}),
  
  // Notification preferences
  notifications: z.object({
    email: z.boolean().default(true),
    inApp: z.boolean().default(true),
    types: z.array(z.enum([
      'insights',
      'engagement',
      'shadowban-risk',
      'monetization',
      'performance',
      'scheduled-posts'
    ])).default(['insights', 'shadowban-risk', 'monetization']),
  }).default({}),
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;
