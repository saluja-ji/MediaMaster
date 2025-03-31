// Import types from the schema file
import * as schema from '@shared/schema';

// Type aliases to maintain backward compatibility
export type User = schema.User;
export type InsertUser = schema.InsertUser;
export type SocialAccount = schema.SocialAccount;
export type InsertSocialAccount = schema.InsertSocialAccount;
export type Post = schema.Post;
export type InsertPost = schema.InsertPost;
export type AnalyticsData = schema.AnalyticsData;
export type InsertAnalyticsData = schema.InsertAnalyticsData;
export type EngageActivity = schema.EngageActivity;
export type InsertEngageActivity = schema.InsertEngageActivity;
export type Insight = schema.Insight;
export type InsertInsight = schema.InsertInsight;
export type MonetizationRecord = schema.MonetizationRecord;
export type InsertMonetizationRecord = schema.InsertMonetizationRecord;
export type BrandPartnership = schema.BrandPartnership;
export type InsertBrandPartnership = schema.InsertBrandPartnership;
export type LoginCredentials = schema.LoginCredentials;

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Authentication
  authenticateUser(credentials: LoginCredentials): Promise<User | undefined>;
  
  // Social Account operations
  getSocialAccountsByUserId(userId: number): Promise<SocialAccount[]>;
  createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccount(id: number, account: Partial<SocialAccount>): Promise<SocialAccount | undefined>;
  deleteSocialAccount(id: number): Promise<boolean>;
  
  // Post operations
  getPosts(userId: number, filters?: {
    platform?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Post[]>;
  getScheduledPosts(userId: number): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Analytics operations
  getAnalyticsData(userId: number, filters?: {
    platform?: string;
    startDate?: Date;
    endDate?: Date;
    postId?: number;
  }): Promise<AnalyticsData[]>;
  createAnalyticsData(data: InsertAnalyticsData): Promise<AnalyticsData>;
  
  // Auto-engage operations
  getEngageActivities(userId: number, filters?: {
    platform?: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
  }): Promise<EngageActivity[]>;
  createEngageActivity(activity: InsertEngageActivity): Promise<EngageActivity>;
  
  // Insight operations
  getInsights(userId: number, filters?: {
    type?: string;
    isRead?: boolean;
    isApplied?: boolean;
  }): Promise<Insight[]>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  updateInsight(id: number, insight: Partial<Insight>): Promise<Insight | undefined>;
  
  // Monetization operations
  getMonetizationRecords(userId: number, filters?: {
    platform?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<MonetizationRecord[]>;
  createMonetizationRecord(record: InsertMonetizationRecord): Promise<MonetizationRecord>;
  
  // Brand partnership operations
  getBrandPartnerships(userId: number, filters?: {
    industry?: string;
    applicationStatus?: string;
    minMatchScore?: number;
  }): Promise<BrandPartnership[]>;
  getBrandPartnership(id: number): Promise<BrandPartnership | undefined>;
  createBrandPartnership(partnership: InsertBrandPartnership): Promise<BrandPartnership>;
  updateBrandPartnership(id: number, partnership: Partial<BrandPartnership>): Promise<BrandPartnership | undefined>;
  deleteBrandPartnership(id: number): Promise<boolean>;
  
  // Dashboard data
  getDashboardStats(userId: number): Promise<{
    totalFollowers: number;
    engagementRate: number;
    revenueGenerated: number;
    scheduledPosts: number;
  }>;
  
  getMonetizationSummary(userId: number): Promise<{
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
  }>;
  
  getPlatformROI(userId: number): Promise<{
    platform: string;
    revenue: number;
    percentage: number;
  }[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private socialAccounts: Map<number, SocialAccount>;
  private posts: Map<number, Post>;
  private analyticsData: Map<number, AnalyticsData>;
  private engageActivities: Map<number, EngageActivity>;
  private insights: Map<number, Insight>;
  private monetizationRecords: Map<number, MonetizationRecord>;
  private brandPartnerships: Map<number, BrandPartnership>;
  
  private userId: number = 1;
  private accountId: number = 1;
  private postId: number = 1;
  private analyticsId: number = 1;
  private activityId: number = 1;
  private insightId: number = 1;
  private monetizationId: number = 1;
  private partnershipId: number = 1;
  
  constructor() {
    this.users = new Map();
    this.socialAccounts = new Map();
    this.posts = new Map();
    this.analyticsData = new Map();
    this.engageActivities = new Map();
    this.insights = new Map();
    this.monetizationRecords = new Map();
    this.brandPartnerships = new Map();
    
    // Create a demo user
    const demoUser: User = {
      id: this.userId++,
      username: "demo",
      password: "password123", // In a real app, this would be hashed
      email: "demo@example.com",
      fullName: "Alex Morgan",
      avatarUrl: "https://randomuser.me/api/portraits/women/42.jpg",
      preferences: {
        dashboard: {
          defaultPeriod: '30days',
          defaultPlatform: 'all',
          enabledWidgets: ['performance', 'upcoming-posts', 'ai-insights', 'monetization']
        },
        content: {
          defaultPlatform: 'instagram',
          autoAnalyzeContent: true,
          preferredPostTimes: {
            instagram: ['9:00', '18:00'],
            twitter: ['8:00', '12:00', '17:00'],
            facebook: ['11:00', '20:00']
          },
          defaultHashtags: {
            instagram: ['marketing', 'socialmedia', 'strategy'],
            twitter: ['digitalmarketing', 'contentcreator'],
            facebook: ['business', 'entrepreneur']
          }
        },
        autoEngage: {
          enabled: true,
          replyToComments: true,
          likeRelevantContent: true,
          followBackUsers: false,
          engagementFrequency: 'medium',
          maxDailyInteractions: 25,
          platforms: ['instagram', 'twitter']
        },
        monetization: {
          enabledTypes: ['affiliate', 'sponsored', 'product'],
          minRevenueThreshold: 100,
          targetRevenueGoals: {
            instagram: 2000,
            twitter: 1000,
            facebook: 1500
          },
          preferredPartners: ['Amazon', 'Shopify', 'Nike'],
          automaticSuggestions: true
        },
        analytics: {
          defaultView: 'overview',
          kpiPriorities: ['engagement', 'revenue', 'followers'],
          customReportSchedule: 'weekly',
          emailReports: true
        },
        notifications: {
          email: true,
          inApp: true,
          types: ['insights', 'shadowban-risk', 'monetization', 'scheduled-posts']
        }
      },
      createdAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);
    
    // Add some sample social accounts
    const platforms = ["twitter", "instagram", "facebook"];
    platforms.forEach(platform => {
      const account: SocialAccount = {
        id: this.accountId++,
        userId: demoUser.id,
        platform,
        username: `alex_${platform}`,
        displayName: `Alex Morgan on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
        profileUrl: `https://${platform}.com/alex_${platform}`,
        avatarUrl: `https://randomuser.me/api/portraits/women/${this.accountId + 10}.jpg`,
        bio: `Digital marketing expert and content creator on ${platform}`,
        followerCount: 10000 + Math.floor(Math.random() * 15000),
        followingCount: 1000 + Math.floor(Math.random() * 2000),
        accessToken: `sample_token_${platform}`,
        refreshToken: `sample_refresh_${platform}`,
        tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        isPrimary: platform === "instagram", // Make Instagram the primary account
        lastSynced: new Date(),
        accountCategory: platform === "facebook" ? "business" : "creator",
        verificationStatus: platform === "twitter" ? "verified" : "unverified",
        accountCreatedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        accountHealth: 0.8 + (Math.random() * 0.2), // 0.8-1.0 range
        apiVersion: "v2",
        webhookUrl: null,
        scopes: ["read", "write", "profile"],
      };
      this.socialAccounts.set(account.id, account);
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.userId++,
      createdAt: new Date(),
      avatarUrl: user.avatarUrl || null,
      preferences: user.preferences || null,
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Authentication
  async authenticateUser(credentials: LoginCredentials): Promise<User | undefined> {
    const user = await this.getUserByUsername(credentials.username);
    if (user && user.password === credentials.password) {
      return user;
    }
    return undefined;
  }
  
  // Social Account operations
  async getSocialAccountsByUserId(userId: number): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values()).filter(
      (account) => account.userId === userId,
    );
  }
  
  async createSocialAccount(account: InsertSocialAccount): Promise<SocialAccount> {
    const newAccount: SocialAccount = {
      ...account,
      id: this.accountId++,
      // Set default values for all fields that might be optional
      displayName: account.displayName || null,
      profileUrl: account.profileUrl || null,
      avatarUrl: account.avatarUrl || null,
      bio: account.bio || null,
      followerCount: account.followerCount || null,
      followingCount: account.followingCount || null,
      isPrimary: account.isPrimary || false,
      lastSynced: account.lastSynced || null,
      accountCategory: account.accountCategory || null,
      verificationStatus: account.verificationStatus || null,
      accountCreatedAt: account.accountCreatedAt || null,
      accountHealth: account.accountHealth || null,
      apiVersion: account.apiVersion || null,
      webhookUrl: account.webhookUrl || null,
      scopes: account.scopes || null,
      accessToken: account.accessToken || null,
      refreshToken: account.refreshToken || null,
      tokenExpiry: account.tokenExpiry || null,
      isActive: account.isActive || true,
    };
    this.socialAccounts.set(newAccount.id, newAccount);
    return newAccount;
  }
  
  async updateSocialAccount(id: number, account: Partial<SocialAccount>): Promise<SocialAccount | undefined> {
    const existing = this.socialAccounts.get(id);
    if (!existing) return undefined;
    
    const updated: SocialAccount = { ...existing, ...account };
    this.socialAccounts.set(id, updated);
    return updated;
  }
  
  async deleteSocialAccount(id: number): Promise<boolean> {
    return this.socialAccounts.delete(id);
  }
  
  // Post operations
  async getPosts(userId: number, filters?: {
    platform?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Post[]> {
    let posts = Array.from(this.posts.values()).filter(
      (post) => post.userId === userId,
    );
    
    if (filters) {
      if (filters.platform) {
        posts = posts.filter(post => post.platform === filters.platform);
      }
      
      if (filters.status) {
        posts = posts.filter(post => post.status === filters.status);
      }
      
      if (filters.startDate) {
        posts = posts.filter(post => 
          post.scheduledAt ? new Date(post.scheduledAt) >= filters.startDate! : false
        );
      }
      
      if (filters.endDate) {
        posts = posts.filter(post => 
          post.scheduledAt ? new Date(post.scheduledAt) <= filters.endDate! : false
        );
      }
    }
    
    return posts;
  }
  
  async getScheduledPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.userId === userId && post.status === "scheduled",
    );
  }
  
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async createPost(post: InsertPost): Promise<Post> {
    const newPost: Post = {
      ...post,
      id: this.postId++,
      // Handle fields that might be optional
      socialAccountId: post.socialAccountId || null,
      mediaUrls: post.mediaUrls || null,
      scheduledAt: post.scheduledAt || null,
      publishedAt: null, // This will be set when the post is published
      tags: post.tags || null,
      categories: post.categories || null,
      isMonetized: post.isMonetized || false,
      monetizationDetails: post.monetizationDetails || null,
      aiGenerated: post.aiGenerated || false,
      aiPrompt: post.aiPrompt || null,
      postUrl: post.postUrl || null,
      postAnalysis: null, // This will be populated after analysis
      visibility: post.visibility || "public",
      lastUpdated: new Date(),
      externalPostId: post.externalPostId || null,
      engagementScore: 0, // Will be updated by AI analysis
      shadowbanRisk: 0, // Will be updated by AI analysis
      audienceMatch: 0, // Will be updated by AI analysis
    };
    this.posts.set(newPost.id, newPost);
    return newPost;
  }
  
  async updatePost(id: number, post: Partial<Post>): Promise<Post | undefined> {
    const existing = this.posts.get(id);
    if (!existing) return undefined;
    
    const updated: Post = { ...existing, ...post };
    this.posts.set(id, updated);
    return updated;
  }
  
  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
  
  // Analytics operations
  async getAnalyticsData(userId: number, filters?: {
    platform?: string;
    startDate?: Date;
    endDate?: Date;
    postId?: number;
  }): Promise<AnalyticsData[]> {
    let data = Array.from(this.analyticsData.values()).filter(
      (data) => data.userId === userId,
    );
    
    if (filters) {
      if (filters.platform) {
        data = data.filter(item => item.platform === filters.platform);
      }
      
      if (filters.postId) {
        data = data.filter(item => item.postId === filters.postId);
      }
      
      if (filters.startDate) {
        data = data.filter(item => new Date(item.date) >= filters.startDate!);
      }
      
      if (filters.endDate) {
        data = data.filter(item => new Date(item.date) <= filters.endDate!);
      }
    }
    
    return data;
  }
  
  async createAnalyticsData(data: InsertAnalyticsData): Promise<AnalyticsData> {
    const newData: AnalyticsData = {
      ...data,
      id: this.analyticsId++,
      // Handle optional fields
      socialAccountId: data.socialAccountId || null,
      postId: data.postId || null,
      likes: data.likes || null,
      comments: data.comments || null,
      shares: data.shares || null,
      saves: data.saves || null,
      clicks: data.clicks || null,
      impressions: data.impressions || null,
      reach: data.reach || null,
      engagement: null, // Calc from likes/comments/shares
      followersGained: data.followersGained || null,
      followersLost: null, // Calculate from historical data
      totalFollowers: data.totalFollowers || null,
      viewDuration: data.viewDuration || null,
      completionRate: data.completionRate || null,
      conversionRate: data.conversionRate || null,
      bouncerate: data.bouncerate || null,
      demographics: data.demographics || null,
      geographics: data.geographics || null,
      referrers: data.referrers || null,
      deviceInfo: data.deviceInfo || null,
      peakHours: data.peakHours || null,
      bestPerforming: data.bestPerforming || false,
      comparisonToAvg: data.comparisonToAvg || null,
    };
    this.analyticsData.set(newData.id, newData);
    return newData;
  }
  
  // Auto-engage operations
  async getEngageActivities(userId: number, filters?: {
    platform?: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
  }): Promise<EngageActivity[]> {
    let activities = Array.from(this.engageActivities.values()).filter(
      (activity) => activity.userId === userId,
    );
    
    if (filters) {
      if (filters.platform) {
        activities = activities.filter(item => item.platform === filters.platform);
      }
      
      if (filters.type) {
        activities = activities.filter(item => item.type === filters.type);
      }
      
      if (filters.startDate) {
        activities = activities.filter(item => new Date(item.date) >= filters.startDate!);
      }
      
      if (filters.endDate) {
        activities = activities.filter(item => new Date(item.date) <= filters.endDate!);
      }
    }
    
    return activities;
  }
  
  async createEngageActivity(activity: InsertEngageActivity): Promise<EngageActivity> {
    const newActivity: EngageActivity = {
      ...activity,
      id: this.activityId++,
      targetId: activity.targetId || null,
      targetType: activity.targetType || null,
      targetContent: activity.targetContent || null,
      response: activity.response || null,
    };
    this.engageActivities.set(newActivity.id, newActivity);
    return newActivity;
  }
  
  // Insight operations
  async getInsights(userId: number, filters?: {
    type?: string;
    isRead?: boolean;
    isApplied?: boolean;
  }): Promise<Insight[]> {
    let insights = Array.from(this.insights.values()).filter(
      (insight) => insight.userId === userId,
    );
    
    if (filters) {
      if (filters.type) {
        insights = insights.filter(item => item.type === filters.type);
      }
      
      if (filters.isRead !== undefined) {
        insights = insights.filter(item => item.isRead === filters.isRead);
      }
      
      if (filters.isApplied !== undefined) {
        insights = insights.filter(item => item.isApplied === filters.isApplied);
      }
    }
    
    return insights;
  }
  
  async createInsight(insight: InsertInsight): Promise<Insight> {
    const newInsight: Insight = {
      ...insight,
      id: this.insightId++,
      platform: insight.platform || null,
      createdAt: new Date(),
      isRead: insight.isRead || false,
      isApplied: insight.isApplied || false,
      expiresAt: insight.expiresAt || null,
      metadata: insight.metadata || null,
    };
    this.insights.set(newInsight.id, newInsight);
    return newInsight;
  }
  
  async updateInsight(id: number, insight: Partial<Insight>): Promise<Insight | undefined> {
    const existing = this.insights.get(id);
    if (!existing) return undefined;
    
    const updated: Insight = { ...existing, ...insight };
    this.insights.set(id, updated);
    return updated;
  }
  
  // Monetization operations
  async getMonetizationRecords(userId: number, filters?: {
    platform?: string;
    source?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<MonetizationRecord[]> {
    let records = Array.from(this.monetizationRecords.values()).filter(
      (record) => record.userId === userId,
    );
    
    if (filters) {
      if (filters.platform) {
        records = records.filter(item => item.platform === filters.platform);
      }
      
      if (filters.source) {
        records = records.filter(item => item.source === filters.source);
      }
      
      if (filters.startDate) {
        records = records.filter(item => new Date(item.date) >= filters.startDate!);
      }
      
      if (filters.endDate) {
        records = records.filter(item => new Date(item.date) <= filters.endDate!);
      }
    }
    
    return records;
  }
  
  async createMonetizationRecord(record: InsertMonetizationRecord): Promise<MonetizationRecord> {
    const newRecord: MonetizationRecord = {
      ...record,
      id: this.monetizationId++,
      // Handle optional fields
      status: record.status || null,
      sourceType: record.sourceType || null,
      currency: record.currency || 'USD',
      conversionRate: record.conversionRate || null,
      payout: record.payout || null,
      payoutDate: record.payoutDate || null,
      paymentMethod: record.paymentMethod || null,
      taxWithheld: record.taxWithheld || null,
      netAmount: record.netAmount || null,
      postId: record.postId || null,
      campaignName: record.campaignName || null,
      campaignId: record.campaignId || null,
      partnerName: record.partnerName || null,
      partnerId: record.partnerId || null,
      commissionType: record.commissionType || null,
      commissionRate: record.commissionRate || null,
      productName: record.productName || null,
      productId: record.productId || null,
      productCategory: record.productCategory || null,
      purchaseQuantity: record.purchaseQuantity || null,
      customerType: record.customerType || null,
      isRecurring: record.isRecurring || false,
      isRenewal: record.isRenewal || false,
      tags: record.tags || null,
      notes: record.notes || null,
      metrics: record.metrics || null,
    };
    this.monetizationRecords.set(newRecord.id, newRecord);
    return newRecord;
  }
  
  // Dashboard data
  async getDashboardStats(userId: number): Promise<{
    totalFollowers: number;
    engagementRate: number;
    revenueGenerated: number;
    scheduledPosts: number;
  }> {
    // Get accounts to calculate followers
    const accounts = await this.getSocialAccountsByUserId(userId);
    const totalFollowers = accounts.reduce((sum, acc) => sum + (acc.followerCount || 0), 0);
    
    // For a real app, we'd calculate from analytics data
    const engagementRate = 0.032; // 3.2% engagement rate (simulated)
    
    // Get revenue from monetization records
    const monetizationRecords = await this.getMonetizationRecords(userId);
    const revenueGenerated = monetizationRecords.reduce((sum, record) => sum + record.amount, 0);
    
    // Get scheduled posts count
    const scheduledPosts = (await this.getScheduledPosts(userId)).length;
    
    return {
      totalFollowers,
      engagementRate,
      revenueGenerated,
      scheduledPosts,
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
    const records = await this.getMonetizationRecords(userId);
    
    // Calculate total revenue
    const totalRevenue = records.reduce((sum, record) => sum + record.amount, 0);
    
    // Count affiliate sales (assuming sourceType is 'affiliate')
    const affiliateRecords = records.filter(record => record.sourceType === 'affiliate');
    const affiliateSales = affiliateRecords.length;
    
    // Count sponsored posts (assuming sourceType is 'sponsored')
    const sponsoredRecords = records.filter(record => record.sourceType === 'sponsored');
    const sponsoredPosts = sponsoredRecords.length;
    
    // Calculate top revenue sources
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
    
    // Convert to array and sort by amount
    const topSources = Array.from(sourceMap.entries())
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        conversions: data.conversions,
        change: Math.random() * 0.4 - 0.1, // Random change between -10% and +30%
        logoUrl: `https://logo.clearbit.com/${name.toLowerCase().replace(/\s+/g, '')}.com`,
      }))
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
    let partnerships = Array.from(this.brandPartnerships.values()).filter(
      (partnership) => partnership.userId === userId,
    );
    
    if (filters) {
      if (filters.industry) {
        partnerships = partnerships.filter(partnership => partnership.industry === filters.industry);
      }
      
      if (filters.applicationStatus) {
        partnerships = partnerships.filter(partnership => partnership.applicationStatus === filters.applicationStatus);
      }
      
      if (filters.minMatchScore) {
        partnerships = partnerships.filter(partnership => partnership.matchScore >= filters.minMatchScore!);
      }
    }
    
    return partnerships;
  }
  
  async getBrandPartnership(id: number): Promise<BrandPartnership | undefined> {
    return this.brandPartnerships.get(id);
  }
  
  async createBrandPartnership(partnership: InsertBrandPartnership): Promise<BrandPartnership> {
    const newPartnership: BrandPartnership = {
      ...partnership,
      id: this.partnershipId++,
      // Handle optional fields
      brandWebsite: partnership.brandWebsite || null,
      brandLogoUrl: partnership.brandLogoUrl || null,
      targetAudience: partnership.targetAudience || null,
      partnershipTypes: partnership.partnershipTypes || [],
      minBudget: partnership.minBudget || null,
      maxBudget: partnership.maxBudget || null,
      currency: partnership.currency || "USD",
      requirements: partnership.requirements || null,
      applicationStatus: partnership.applicationStatus || "not_applied",
      applicationDate: partnership.applicationDate || null,
      matchScore: partnership.matchScore || 0,
      matchReasoning: partnership.matchReasoning || null,
      contactEmail: partnership.contactEmail || null,
      contactName: partnership.contactName || null,
      notes: partnership.notes || null,
    };
    this.brandPartnerships.set(newPartnership.id, newPartnership);
    return newPartnership;
  }
  
  async updateBrandPartnership(id: number, partnership: Partial<BrandPartnership>): Promise<BrandPartnership | undefined> {
    const existing = this.brandPartnerships.get(id);
    if (!existing) return undefined;
    
    const updated: BrandPartnership = { ...existing, ...partnership };
    this.brandPartnerships.set(id, updated);
    return updated;
  }
  
  async deleteBrandPartnership(id: number): Promise<boolean> {
    return this.brandPartnerships.delete(id);
  }
}

// Export the singleton storage instance
// Use DatabaseStorage if DATABASE_URL is available, otherwise fallback to MemStorage
import { DatabaseStorage } from './DatabaseStorage';

// Use the PostgreSQL database storage by default when available
const databaseEnabled = process.env.DATABASE_URL !== undefined;
export const storage = databaseEnabled ? new DatabaseStorage() : new MemStorage();