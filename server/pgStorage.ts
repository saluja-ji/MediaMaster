import { eq, and, gte, lte, desc, sql, isNull } from 'drizzle-orm';
import * as schema from '@shared/schema';
import { db } from './db';
import { IStorage, 
  LoginCredentials,
  User, InsertUser,
  SocialAccount, InsertSocialAccount,
  Post, InsertPost,
  AnalyticsData, InsertAnalyticsData,
  EngageActivity, InsertEngageActivity,
  Insight, InsertInsight,
  MonetizationRecord, InsertMonetizationRecord
} from './storage';

export class PgStorage implements IStorage {
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return users[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(schema.users).where(eq(schema.users.username, username));
    return users[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }
  
  async updateUser(id: number, user: Partial<User>): Promise<User | undefined> {
    const result = await db.update(schema.users)
      .set(user)
      .where(eq(schema.users.id, id))
      .returning();
    return result[0];
  }
  
  // Authentication
  async authenticateUser(credentials: LoginCredentials): Promise<User | undefined> {
    const users = await db.select().from(schema.users)
      .where(eq(schema.users.username, credentials.username));
    
    if (users.length === 0) return undefined;
    
    const user = users[0];
    
    // In a real app, we would compare hashed passwords here
    if (user.password === credentials.password) {
      return user;
    }
    
    return undefined;
  }
  
  // Social Account operations
  async getSocialAccountsByUserId(userId: number): Promise<SocialAccount[]> {
    return db.select().from(schema.socialAccounts)
      .where(eq(schema.socialAccounts.userId, userId));
  }
  
  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const result = await db.insert(schema.socialAccounts).values(account).returning();
    return result[0];
  }
  
  async updateSocialAccount(id: number, account: Partial<SocialAccount>): Promise<SocialAccount | undefined> {
    const result = await db.update(schema.socialAccounts)
      .set(account)
      .where(eq(schema.socialAccounts.id, id))
      .returning();
    return result[0];
  }
  
  async deleteSocialAccount(id: number): Promise<boolean> {
    const result = await db.delete(schema.socialAccounts)
      .where(eq(schema.socialAccounts.id, id));
    return result.count > 0;
  }
  
  // Post operations
  async getPosts(userId: number, filters?: {
    platform?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Post[]> {
    let query = db.select().from(schema.posts)
      .where(eq(schema.posts.userId, userId));
    
    if (filters?.platform) {
      query = query.where(eq(schema.posts.platform, filters.platform));
    }
    
    if (filters?.status) {
      query = query.where(eq(schema.posts.status, filters.status));
    }
    
    if (filters?.startDate) {
      query = query.where(gte(schema.posts.createdAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      query = query.where(lte(schema.posts.createdAt, filters.endDate));
    }
    
    return query.orderBy(desc(schema.posts.createdAt));
  }
  
  async getScheduledPosts(userId: number): Promise<Post[]> {
    return db.select().from(schema.posts)
      .where(and(
        eq(schema.posts.userId, userId),
        eq(schema.posts.status, 'scheduled')
      ))
      .orderBy(desc(schema.posts.scheduledAt));
  }
  
  async getPost(id: number): Promise<Post | undefined> {
    const posts = await db.select().from(schema.posts).where(eq(schema.posts.id, id));
    return posts[0];
  }
  
  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(schema.posts).values(post).returning();
    return result[0];
  }
  
  async updatePost(id: number, post: Partial<Post>): Promise<Post | undefined> {
    const result = await db.update(schema.posts)
      .set(post)
      .where(eq(schema.posts.id, id))
      .returning();
    return result[0];
  }
  
  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(schema.posts)
      .where(eq(schema.posts.id, id));
    return result.count > 0;
  }
  
  // Analytics operations
  async getAnalyticsData(userId: number, filters?: {
    platform?: string;
    startDate?: Date;
    endDate?: Date;
    postId?: number;
  }): Promise<AnalyticsData[]> {
    let query = db.select().from(schema.analyticsData)
      .where(eq(schema.analyticsData.userId, userId));
    
    if (filters?.platform) {
      query = query.where(eq(schema.analyticsData.platform, filters.platform));
    }
    
    if (filters?.postId) {
      query = query.where(eq(schema.analyticsData.postId, filters.postId));
    }
    
    if (filters?.startDate) {
      query = query.where(gte(schema.analyticsData.date, filters.startDate));
    }
    
    if (filters?.endDate) {
      query = query.where(lte(schema.analyticsData.date, filters.endDate));
    }
    
    return query.orderBy(desc(schema.analyticsData.date));
  }
  
  async createAnalyticsData(data: InsertAnalyticsData): Promise<AnalyticsData> {
    const result = await db.insert(schema.analyticsData).values(data).returning();
    return result[0];
  }
  
  // Auto-engage operations
  async getEngageActivities(userId: number, filters?: {
    platform?: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
  }): Promise<EngageActivity[]> {
    let query = db.select().from(schema.engageActivities)
      .where(eq(schema.engageActivities.userId, userId));
    
    if (filters?.platform) {
      query = query.where(eq(schema.engageActivities.platform, filters.platform));
    }
    
    if (filters?.type) {
      query = query.where(eq(schema.engageActivities.activityType, filters.type));
    }
    
    if (filters?.startDate) {
      query = query.where(gte(schema.engageActivities.performedAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      query = query.where(lte(schema.engageActivities.performedAt, filters.endDate));
    }
    
    return query.orderBy(desc(schema.engageActivities.performedAt));
  }
  
  async createEngageActivity(activity: InsertEngageActivity): Promise<EngageActivity> {
    const result = await db.insert(schema.engageActivities).values(activity).returning();
    return result[0];
  }
  
  // Insight operations
  async getInsights(userId: number, filters?: {
    type?: string;
    isRead?: boolean;
    isApplied?: boolean;
  }): Promise<Insight[]> {
    let query = db.select().from(schema.insights)
      .where(eq(schema.insights.userId, userId));
    
    if (filters?.type) {
      query = query.where(eq(schema.insights.type, filters.type));
    }
    
    if (filters?.isRead !== undefined) {
      query = query.where(eq(schema.insights.isRead, filters.isRead));
    }
    
    if (filters?.isApplied !== undefined) {
      query = query.where(eq(schema.insights.isApplied, filters.isApplied));
    }
    
    return query.orderBy(desc(schema.insights.createdAt));
  }
  
  async createInsight(insight: InsertInsight): Promise<Insight> {
    const result = await db.insert(schema.insights).values(insight).returning();
    return result[0];
  }
  
  async updateInsight(id: number, insight: Partial<Insight>): Promise<Insight | undefined> {
    const result = await db.update(schema.insights)
      .set(insight)
      .where(eq(schema.insights.id, id))
      .returning();
    return result[0];
  }
  
  // Monetization operations
  async getMonetizationRecords(userId: number, filters?: {
    platform?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<MonetizationRecord[]> {
    let query = db.select().from(schema.monetizationRecords)
      .where(eq(schema.monetizationRecords.userId, userId));
    
    if (filters?.platform) {
      query = query.where(eq(schema.monetizationRecords.platform, filters.platform));
    }
    
    if (filters?.source) {
      query = query.where(eq(schema.monetizationRecords.source, filters.source));
    }
    
    if (filters?.startDate) {
      query = query.where(gte(schema.monetizationRecords.date, filters.startDate));
    }
    
    if (filters?.endDate) {
      query = query.where(lte(schema.monetizationRecords.date, filters.endDate));
    }
    
    return query.orderBy(desc(schema.monetizationRecords.date));
  }
  
  async createMonetizationRecord(record: InsertMonetizationRecord): Promise<MonetizationRecord> {
    const result = await db.insert(schema.monetizationRecords).values(record).returning();
    return result[0];
  }
  
  // Dashboard data
  async getDashboardStats(userId: number): Promise<{
    totalFollowers: number;
    engagementRate: number;
    revenueGenerated: number;
    scheduledPosts: number;
  }> {
    // Social account stats
    const accountsResult = await db.select({
      followerCount: sql<number>`sum(${schema.socialAccounts.followerCount})`,
    }).from(schema.socialAccounts)
      .where(eq(schema.socialAccounts.userId, userId));
    
    // Revenue stats
    const revenueResult = await db.select({
      totalRevenue: sql<number>`sum(${schema.monetizationRecords.amount})`,
    }).from(schema.monetizationRecords)
      .where(eq(schema.monetizationRecords.userId, userId));
    
    // Scheduled posts count
    const scheduledPostsResult = await db.select({
      count: sql<number>`count(*)`,
    }).from(schema.posts)
      .where(and(
        eq(schema.posts.userId, userId),
        eq(schema.posts.status, 'scheduled')
      ));
    
    // Engagement calculation
    const engagementResult = await db.select({
      likes: sql<number>`sum(${schema.analyticsData.likes})`,
      comments: sql<number>`sum(${schema.analyticsData.comments})`,
      shares: sql<number>`sum(${schema.analyticsData.shares})`,
    }).from(schema.analyticsData)
      .where(eq(schema.analyticsData.userId, userId));
    
    const totalFollowers = accountsResult[0]?.followerCount || 0;
    const totalInteractions = (engagementResult[0]?.likes || 0) + 
                             (engagementResult[0]?.comments || 0) + 
                             (engagementResult[0]?.shares || 0);
                             
    // Calculate engagement rate
    const engagementRate = totalFollowers > 0 ? (totalInteractions / totalFollowers) * 100 : 0;
    
    return {
      totalFollowers,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      revenueGenerated: revenueResult[0]?.totalRevenue || 0,
      scheduledPosts: scheduledPostsResult[0]?.count || 0,
    };
  }
  
  async getMonetizationSummary(userId: number): Promise<{
    totalRevenue: number;
    affiliateSales: number;
    sponsoredPosts: number;
    topRevenueSources: { 
      name: string; 
      amount: number; 
      conversions: number; 
      change: number;
      logoUrl: string;
    }[];
  }> {
    // Total revenue
    const totalRevenueResult = await db.select({
      revenue: sql<number>`sum(${schema.monetizationRecords.amount})`,
    }).from(schema.monetizationRecords)
      .where(eq(schema.monetizationRecords.userId, userId));
    
    // Affiliate revenue
    const affiliateRevenueResult = await db.select({
      revenue: sql<number>`sum(${schema.monetizationRecords.amount})`,
    }).from(schema.monetizationRecords)
      .where(and(
        eq(schema.monetizationRecords.userId, userId),
        eq(schema.monetizationRecords.type, 'affiliate')
      ));
    
    // Sponsored posts revenue
    const sponsoredRevenueResult = await db.select({
      revenue: sql<number>`sum(${schema.monetizationRecords.amount})`,
    }).from(schema.monetizationRecords)
      .where(and(
        eq(schema.monetizationRecords.userId, userId),
        eq(schema.monetizationRecords.type, 'sponsored')
      ));
    
    // Top revenue sources
    const topSourcesResult = await db.select({
      source: schema.monetizationRecords.source,
      amount: sql<number>`sum(${schema.monetizationRecords.amount})`,
      conversions: sql<number>`count(*)`,
    }).from(schema.monetizationRecords)
      .where(eq(schema.monetizationRecords.userId, userId))
      .groupBy(schema.monetizationRecords.source)
      .orderBy(sql<number>`sum(${schema.monetizationRecords.amount})`, 'desc')
      .limit(5);
    
    // For demo purposes, we'll generate some mock change percentages and logo URLs
    const topRevenueSources = topSourcesResult.map(source => ({
      name: source.source,
      amount: source.amount,
      conversions: source.conversions,
      change: Math.floor(Math.random() * 40) - 10, // Random change -10% to +30%
      logoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(source.source)}&background=random`
    }));
    
    return {
      totalRevenue: totalRevenueResult[0]?.revenue || 0,
      affiliateSales: affiliateRevenueResult[0]?.revenue || 0,
      sponsoredPosts: sponsoredRevenueResult[0]?.revenue || 0,
      topRevenueSources
    };
  }
  
  async getPlatformROI(userId: number): Promise<{
    platform: string;
    revenue: number;
    percentage: number;
  }[]> {
    // Get total revenue
    const totalRevenueResult = await db.select({
      revenue: sql<number>`sum(${schema.monetizationRecords.amount})`,
    }).from(schema.monetizationRecords)
      .where(eq(schema.monetizationRecords.userId, userId));
    
    const totalRevenue = totalRevenueResult[0]?.revenue || 0;
    
    // Get revenue by platform
    const platformRevenueResult = await db.select({
      platform: schema.monetizationRecords.platform,
      revenue: sql<number>`sum(${schema.monetizationRecords.amount})`,
    }).from(schema.monetizationRecords)
      .where(eq(schema.monetizationRecords.userId, userId))
      .groupBy(schema.monetizationRecords.platform)
      .orderBy(sql<number>`sum(${schema.monetizationRecords.amount})`, 'desc');
    
    // Calculate percentages
    const result = platformRevenueResult.map(item => ({
      platform: item.platform,
      revenue: item.revenue,
      percentage: totalRevenue > 0 ? parseFloat(((item.revenue / totalRevenue) * 100).toFixed(1)) : 0
    }));
    
    return result;
  }
}