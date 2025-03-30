import { db } from './db';
import { 
  users, posts, socialAccounts, analyticsData,
  engageActivities, insights, monetizationRecords,
  brandPartnerships
} from '@shared/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
import { 
  User, InsertUser, SocialAccount, InsertSocialAccount,
  Post, InsertPost, AnalyticsData, InsertAnalyticsData,
  EngageActivity, InsertEngageActivity, Insight, InsertInsight,
  MonetizationRecord, InsertMonetizationRecord, LoginCredentials,
  BrandPartnership, InsertBrandPartnership, IStorage
} from './storage';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Authentication
  async authenticateUser(credentials: LoginCredentials): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.username, credentials.username),
          eq(users.password, credentials.password)
        )
      );
    return user || undefined;
  }

  // Social Account operations
  async getSocialAccountsByUserId(userId: number): Promise<SocialAccount[]> {
    return db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId));
  }

  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const [newAccount] = await db
      .insert(socialAccounts)
      .values(account)
      .returning();
    return newAccount;
  }

  async updateSocialAccount(id: number, account: Partial<SocialAccount>): Promise<SocialAccount | undefined> {
    const [updatedAccount] = await db
      .update(socialAccounts)
      .set(account)
      .where(eq(socialAccounts.id, id))
      .returning();
    return updatedAccount || undefined;
  }

  async deleteSocialAccount(id: number): Promise<boolean> {
    const [deletedAccount] = await db
      .delete(socialAccounts)
      .where(eq(socialAccounts.id, id))
      .returning();
    return !!deletedAccount;
  }

  // Post operations
  async getPosts(userId: number, filters?: {
    platform?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Post[]> {
    let query = db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId));

    if (filters?.platform) {
      query = query.where(eq(posts.platform, filters.platform));
    }

    if (filters?.status) {
      query = query.where(eq(posts.status, filters.status));
    }

    if (filters?.startDate && filters.startDate instanceof Date) {
      query = query.where(gte(posts.scheduledAt, filters.startDate));
    }

    if (filters?.endDate && filters.endDate instanceof Date) {
      query = query.where(lte(posts.scheduledAt, filters.endDate));
    }

    return query;
  }

  async getScheduledPosts(userId: number): Promise<Post[]> {
    return db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.userId, userId),
          eq(posts.status, 'scheduled')
        )
      );
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db
      .insert(posts)
      .values(post)
      .returning();
    return newPost;
  }

  async updatePost(id: number, post: Partial<Post>): Promise<Post | undefined> {
    const [updatedPost] = await db
      .update(posts)
      .set(post)
      .where(eq(posts.id, id))
      .returning();
    return updatedPost || undefined;
  }

  async deletePost(id: number): Promise<boolean> {
    const [deletedPost] = await db
      .delete(posts)
      .where(eq(posts.id, id))
      .returning();
    return !!deletedPost;
  }

  // Analytics operations
  async getAnalyticsData(userId: number, filters?: {
    platform?: string;
    startDate?: Date;
    endDate?: Date;
    postId?: number;
  }): Promise<AnalyticsData[]> {
    let query = db
      .select()
      .from(analyticsData)
      .where(eq(analyticsData.userId, userId));

    if (filters?.platform) {
      query = query.where(eq(analyticsData.platform, filters.platform));
    }

    if (filters?.postId) {
      query = query.where(eq(analyticsData.postId, filters.postId));
    }

    if (filters?.startDate && filters.startDate instanceof Date) {
      query = query.where(gte(analyticsData.date, filters.startDate));
    }

    if (filters?.endDate && filters.endDate instanceof Date) {
      query = query.where(lte(analyticsData.date, filters.endDate));
    }

    return query;
  }

  async createAnalyticsData(data: InsertAnalyticsData): Promise<AnalyticsData> {
    const [newData] = await db
      .insert(analyticsData)
      .values(data)
      .returning();
    return newData;
  }

  // Auto-engage operations
  async getEngageActivities(userId: number, filters?: {
    platform?: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
  }): Promise<EngageActivity[]> {
    let query = db
      .select()
      .from(engageActivities)
      .where(eq(engageActivities.userId, userId));

    if (filters?.platform) {
      query = query.where(eq(engageActivities.platform, filters.platform));
    }

    if (filters?.type) {
      query = query.where(eq(engageActivities.type, filters.type));
    }

    if (filters?.startDate && filters.startDate instanceof Date) {
      query = query.where(gte(engageActivities.date, filters.startDate));
    }

    if (filters?.endDate && filters.endDate instanceof Date) {
      query = query.where(lte(engageActivities.date, filters.endDate));
    }

    return query;
  }

  async createEngageActivity(activity: InsertEngageActivity): Promise<EngageActivity> {
    const [newActivity] = await db
      .insert(engageActivities)
      .values(activity)
      .returning();
    return newActivity;
  }

  // Insight operations
  async getInsights(userId: number, filters?: {
    type?: string;
    isRead?: boolean;
    isApplied?: boolean;
  }): Promise<Insight[]> {
    let query = db
      .select()
      .from(insights)
      .where(eq(insights.userId, userId));

    if (filters?.type) {
      query = query.where(eq(insights.type, filters.type));
    }

    if (filters?.isRead !== undefined) {
      query = query.where(eq(insights.isRead, filters.isRead));
    }

    if (filters?.isApplied !== undefined) {
      query = query.where(eq(insights.isApplied, filters.isApplied));
    }

    return query.orderBy(desc(insights.createdAt));
  }

  async createInsight(insight: InsertInsight): Promise<Insight> {
    const [newInsight] = await db
      .insert(insights)
      .values(insight)
      .returning();
    return newInsight;
  }

  async updateInsight(id: number, insight: Partial<Insight>): Promise<Insight | undefined> {
    const [updatedInsight] = await db
      .update(insights)
      .set(insight)
      .where(eq(insights.id, id))
      .returning();
    return updatedInsight || undefined;
  }

  // Monetization operations
  async getMonetizationRecords(userId: number, filters?: {
    platform?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<MonetizationRecord[]> {
    let query = db
      .select()
      .from(monetizationRecords)
      .where(eq(monetizationRecords.userId, userId));

    if (filters?.platform) {
      query = query.where(eq(monetizationRecords.platform, filters.platform));
    }

    if (filters?.source) {
      query = query.where(eq(monetizationRecords.source, filters.source));
    }

    if (filters?.startDate && filters.startDate instanceof Date) {
      query = query.where(gte(monetizationRecords.date, filters.startDate));
    }

    if (filters?.endDate && filters.endDate instanceof Date) {
      query = query.where(lte(monetizationRecords.date, filters.endDate));
    }

    return query.orderBy(desc(monetizationRecords.date));
  }

  async createMonetizationRecord(record: InsertMonetizationRecord): Promise<MonetizationRecord> {
    const [newRecord] = await db
      .insert(monetizationRecords)
      .values(record)
      .returning();
    return newRecord;
  }

  // Dashboard data
  async getDashboardStats(userId: number): Promise<{
    totalFollowers: number;
    engagementRate: number;
    revenueGenerated: number;
    scheduledPosts: number;
  }> {
    // Get all social accounts to calculate total followers
    const accounts = await this.getSocialAccountsByUserId(userId);
    const totalFollowers = accounts.reduce((sum, acc) => sum + (acc.followerCount || 0), 0);

    // Get analytics data to calculate engagement rate
    const recentAnalytics = await db
      .select()
      .from(analyticsData)
      .where(
        and(
          eq(analyticsData.userId, userId),
          gte(analyticsData.date, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
        )
      );
    
    // Calculate engagement rate from recent analytics
    let engagementRate = 0;
    if (recentAnalytics.length > 0) {
      const totalReach = recentAnalytics.reduce((sum, data) => sum + (data.reach || 0), 0);
      const totalEngagement = recentAnalytics.reduce((sum, data) => {
        return sum + 
          (data.likes || 0) + 
          (data.comments || 0) + 
          (data.shares || 0) + 
          (data.saves || 0);
      }, 0);
      
      engagementRate = totalReach > 0 ? totalEngagement / totalReach : 0;
    }

    // Get revenue data
    const monetizationRecords = await this.getMonetizationRecords(userId, {
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
    });
    const revenueGenerated = monetizationRecords.reduce((sum, record) => sum + record.amount, 0);

    // Get scheduled posts count
    const scheduledPosts = await this.getScheduledPosts(userId);

    return {
      totalFollowers,
      engagementRate,
      revenueGenerated,
      scheduledPosts: scheduledPosts.length,
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
    // Get all monetization records
    const records = await this.getMonetizationRecords(userId);
    
    // Calculate total revenue
    const totalRevenue = records.reduce((sum, record) => sum + record.amount, 0);
    
    // Count affiliate sales
    const affiliateRecords = records.filter(record => record.sourceType === 'affiliate');
    const affiliateSales = affiliateRecords.length;
    
    // Count sponsored posts
    const sponsoredRecords = records.filter(record => record.sourceType === 'sponsored');
    const sponsoredPosts = sponsoredRecords.length;
    
    // Calculate top sources
    const sourceMap = new Map<string, { amount: number, conversions: number }>();
    
    records.forEach(record => {
      const sourceName = record.partnerName || record.source;
      if (!sourceMap.has(sourceName)) {
        sourceMap.set(sourceName, { amount: 0, conversions: 0 });
      }
      
      const current = sourceMap.get(sourceName)!;
      current.amount += record.amount;
      current.conversions += 1;
      sourceMap.set(sourceName, current);
    });
    
    // Get records from previous period for comparison
    const currentDate = new Date();
    const previousPeriodStart = new Date(currentDate);
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 2);
    const previousPeriodEnd = new Date(currentDate);
    previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1);
    
    const previousRecords = await this.getMonetizationRecords(userId, {
      startDate: previousPeriodStart,
      endDate: previousPeriodEnd,
    });
    
    const previousSourceMap = new Map<string, number>();
    previousRecords.forEach(record => {
      const sourceName = record.partnerName || record.source;
      if (!previousSourceMap.has(sourceName)) {
        previousSourceMap.set(sourceName, 0);
      }
      previousSourceMap.set(sourceName, previousSourceMap.get(sourceName)! + record.amount);
    });
    
    // Convert to array with percentage changes
    const topSources = Array.from(sourceMap.entries())
      .map(([name, data]) => {
        const previousAmount = previousSourceMap.get(name) || 0;
        const change = previousAmount > 0 
          ? (data.amount - previousAmount) / previousAmount 
          : 1; // 100% increase if there was no previous data
        
        return {
          name,
          amount: data.amount,
          conversions: data.conversions,
          change,
          logoUrl: `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, '')}.com`,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Take top 5
    
    return {
      totalRevenue,
      affiliateSales,
      sponsoredPosts,
      topRevenueSources: topSources,
    };
  }

  async getPlatformROI(userId: number): Promise<{
    platform: string;
    revenue: number;
    percentage: number;
  }[]> {
    // Get all monetization records
    const records = await this.getMonetizationRecords(userId);
    
    // Group by platform
    const platformMap = new Map<string, number>();
    
    records.forEach(record => {
      if (!platformMap.has(record.platform)) {
        platformMap.set(record.platform, 0);
      }
      
      platformMap.set(record.platform, platformMap.get(record.platform)! + record.amount);
    });
    
    // Calculate total revenue
    const totalRevenue = Array.from(platformMap.values()).reduce((sum, amount) => sum + amount, 0);
    
    // Convert to array with percentages
    return Array.from(platformMap.entries())
      .map(([platform, revenue]) => ({
        platform,
        revenue,
        percentage: totalRevenue > 0 ? revenue / totalRevenue : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  // Brand partnership operations
  async getBrandPartnerships(userId: number, filters?: {
    industry?: string;
    applicationStatus?: string;
    minMatchScore?: number;
  }): Promise<BrandPartnership[]> {
    let query = db
      .select()
      .from(brandPartnerships)
      .where(eq(brandPartnerships.userId, userId));
    
    if (filters?.industry) {
      query = query.where(eq(brandPartnerships.industry, filters.industry));
    }
    
    if (filters?.applicationStatus) {
      query = query.where(eq(brandPartnerships.applicationStatus, filters.applicationStatus));
    }
    
    if (filters?.minMatchScore && filters.minMatchScore > 0) {
      query = query.where(gte(brandPartnerships.matchScore, filters.minMatchScore));
    }
    
    return query.orderBy(desc(brandPartnerships.matchScore));
  }
  
  async getBrandPartnership(id: number): Promise<BrandPartnership | undefined> {
    const [partnership] = await db
      .select()
      .from(brandPartnerships)
      .where(eq(brandPartnerships.id, id));
    return partnership || undefined;
  }
  
  async createBrandPartnership(partnership: InsertBrandPartnership): Promise<BrandPartnership> {
    const [newPartnership] = await db
      .insert(brandPartnerships)
      .values(partnership)
      .returning();
    return newPartnership;
  }
  
  async updateBrandPartnership(id: number, partnership: Partial<BrandPartnership>): Promise<BrandPartnership | undefined> {
    const [updatedPartnership] = await db
      .update(brandPartnerships)
      .set(partnership)
      .where(eq(brandPartnerships.id, id))
      .returning();
    return updatedPartnership || undefined;
  }
  
  async deleteBrandPartnership(id: number): Promise<boolean> {
    const [deletedPartnership] = await db
      .delete(brandPartnerships)
      .where(eq(brandPartnerships.id, id))
      .returning();
    return !!deletedPartnership;
  }
}