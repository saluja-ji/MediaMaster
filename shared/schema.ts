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
  displayName: text("display_name"), // The display/profile name 
  profileUrl: text("profile_url"), // URL to the social profile
  avatarUrl: text("avatar_url"), // Profile picture URL
  bio: text("bio"), // User's bio/description on the platform
  followerCount: integer("follower_count").default(0),
  followingCount: integer("following_count").default(0),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false), // Is this the main account for this platform
  lastSynced: timestamp("last_synced"), // When account data was last updated
  accountCategory: text("account_category"), // business, personal, creator, etc.
  verificationStatus: text("verification_status"), // verified, unverified, pending
  accountCreatedAt: timestamp("account_created_at"), // When the account was created on the platform
  accountHealth: real("account_health"), // Overall health score (0-1)
  apiVersion: text("api_version"), // Version of API being used (for compatibility)
  webhookUrl: text("webhook_url"), // For receiving platform notifications
  scopes: text("scopes").array(), // Permission scopes granted to the application
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
  audienceMatch: real("audience_match"), // How well the post matches audience interests (0-1)
  tags: text("tags").array(),
  categories: text("categories").array(), // Content categories for better organization
  platform: text("platform").notNull(), // twitter, instagram, facebook, etc.
  isMonetized: boolean("is_monetized").default(false),
  monetizationDetails: jsonb("monetization_details"),
  aiGenerated: boolean("ai_generated").default(false), // Was content AI-generated
  aiPrompt: text("ai_prompt"), // The prompt used to generate content, if AI-generated
  postUrl: text("post_url"), // URL to the published post
  postAnalysis: jsonb("post_analysis"), // Detailed NLP/AI analysis of the post content
  visibility: text("visibility").default("public"), // public, private, followers-only
  lastUpdated: timestamp("last_updated").defaultNow(),
  externalPostId: text("external_post_id"), // ID from the external platform after publishing
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
  audienceMatch: true,
  postAnalysis: true,
  lastUpdated: true,
});

// Create an extended version that includes AI fields for internal use
export const extendedPostSchema = basePostSchema.extend({
  engagementScore: z.number().optional(),
  shadowbanRisk: z.number().optional(),
  audienceMatch: z.number().optional(),
  publishedAt: z.date().optional().nullable(),
  postAnalysis: z.record(z.any()).optional(),
  lastUpdated: z.date().optional(),
});

// Analytics data
export const analyticsData = pgTable("analytics_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  socialAccountId: integer("social_account_id").references(() => socialAccounts.id),
  postId: integer("post_id").references(() => posts.id),
  date: timestamp("date").notNull(),
  // Engagement metrics
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  saves: integer("saves").default(0),
  bookmarks: integer("bookmarks").default(0),
  reactions: integer("reactions").default(0), // For platforms with reactions (Facebook)
  // Reach metrics
  impressions: integer("impressions").default(0), // Total number of times content was displayed
  reach: integer("reach").default(0), // Unique users who saw the content
  views: integer("views").default(0), // For video content
  viewDuration: real("view_duration").default(0), // Average view time for videos in seconds
  // Conversion metrics
  clicks: integer("clicks").default(0),
  linkClicks: integer("link_clicks").default(0),
  profileVisits: integer("profile_visits").default(0),
  followersGained: integer("followers_gained").default(0),
  conversion: real("conversion_rate").default(0), // Click-through or other conversion rate
  // Revenue metrics
  revenue: real("revenue").default(0),
  adRevenue: real("ad_revenue").default(0),
  // Audience demographics (aggregated)
  audienceData: jsonb("audience_data"), // Age, gender, location, etc.
  // Content performance
  contentScore: real("content_score").default(0), // Overall content performance score
  sentimentScore: real("sentiment_score"), // Sentiment analysis of comments (-1 to 1)
  // Timing and context
  bestPerformingTimeSlot: text("best_performing_time_slot"), // Time of day with best engagement
  platform: text("platform").notNull(),
  dataSource: text("data_source"), // API, manual entry, estimated, etc.
  comparisonToAvg: real("comparison_to_avg"), // How post performed compared to account average
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
  // Conversion details
  conversionCount: integer("conversion_count").default(1),
  conversionValue: real("conversion_value").default(0), // Average value per conversion
  conversionRate: real("conversion_rate"), // For calculating performance
  // Partner information
  partnerName: text("partner_name"),
  partnerCategory: text("partner_category"), // Industry/type of partner
  partnerContactInfo: text("partner_contact_info"), // Contact details
  partnerTier: text("partner_tier"), // Partner importance/tier level
  // Campaign details
  campaignId: text("campaign_id"),
  campaignName: text("campaign_name"),
  campaignStartDate: timestamp("campaign_start_date"),
  campaignEndDate: timestamp("campaign_end_date"),
  campaignBudget: real("campaign_budget"),
  campaignType: text("campaign_type"), // Post, story, series, etc.
  campaignGoal: text("campaign_goal"), // Awareness, sales, etc.
  // Transaction details
  status: text("status").default("completed"), // pending, completed, failed, etc.
  paymentMethod: text("payment_method"),
  paymentDueDate: timestamp("payment_due_date"),
  invoiceNumber: text("invoice_number"),
  taxRate: real("tax_rate").default(0),
  taxAmount: real("tax_amount").default(0),
  // Performance
  roi: real("roi"), // Return on investment
  costPerConversion: real("cost_per_conversion"),
  revenuePerPost: real("revenue_per_post"),
  // Additional
  notes: text("notes"),
  tags: text("tags").array(),
  contractUrl: text("contract_url"), // URL to the contract/agreement
  metrics: jsonb("metrics"), // Additional performance metrics
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
export const platformEnum = z.enum([
  'twitter', 
  'instagram', 
  'facebook', 
  'linkedin', 
  'tiktok', 
  'youtube', 
  'pinterest', 
  'snapchat', 
  'threads', 
  'reddit', 
  'discord', 
  'whatsapp', 
  'telegram', 
  'medium', 
  'tumblr',
  'mastodon'
]);
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
