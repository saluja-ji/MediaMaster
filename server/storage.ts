import {
  User, InsertUser,
  SocialAccount, InsertSocialAccount,
  Post, InsertPost,
  AnalyticsData, InsertAnalyticsData,
  EngageActivity, InsertEngageActivity,
  Insight, InsertInsight,
  MonetizationRecord, InsertMonetizationRecord,
  LoginCredentials
} from "@shared/schema";

// Interface that defines all storage operations
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
  
  private userId: number = 1;
  private accountId: number = 1;
  private postId: number = 1;
  private analyticsId: number = 1;
  private activityId: number = 1;
  private insightId: number = 1;
  private monetizationId: number = 1;
  
  constructor() {
    this.users = new Map();
    this.socialAccounts = new Map();
    this.posts = new Map();
    this.analyticsData = new Map();
    this.engageActivities = new Map();
    this.insights = new Map();
    this.monetizationRecords = new Map();
    
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
      // Set default values for all new fields
      displayName: account.displayName || null,
      profileUrl: account.profileUrl || null,
      avatarUrl: account.avatarUrl || null,
      bio: account.bio || null,
      followerCount: account.followerCount || 0,
      followingCount: account.followingCount || 0,
      isPrimary: account.isPrimary || false,
      lastSynced: account.lastSynced || null,
      accountCategory: account.accountCategory || null,
      verificationStatus: account.verificationStatus || null,
      accountCreatedAt: account.accountCreatedAt || null,
      accountHealth: account.accountHealth || null,
      apiVersion: account.apiVersion || null,
      webhookUrl: account.webhookUrl || null,
      scopes: account.scopes || null,
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
      engagementScore: Math.random() * 100, // Simulated AI score
      shadowbanRisk: Math.random() * 5, // Simulated AI risk assessment
      audienceMatch: Math.random() * 0.8 + 0.2, // Random 0.2-1.0 value
      publishedAt: post.publishedAt || null,
      mediaUrls: post.mediaUrls || null,
      scheduledAt: post.scheduledAt || null,
      tags: post.tags || null,
      categories: post.categories || null,
      socialAccountId: post.socialAccountId || null,
      isMonetized: post.isMonetized || false,
      monetizationDetails: post.monetizationDetails || null,
      aiGenerated: post.aiGenerated || false,
      aiPrompt: post.aiPrompt || null,
      postUrl: post.postUrl || null,
      postAnalysis: post.postAnalysis || null,
      visibility: post.visibility || "public",
      lastUpdated: new Date(),
      externalPostId: post.externalPostId || null,
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
      socialAccountId: data.socialAccountId || null,
      postId: data.postId || null,
      likes: data.likes || null,
      comments: data.comments || null,
      shares: data.shares || null,
      saves: data.saves || null,
      clicks: data.clicks || null,
      impressions: data.impressions || null,
      reach: data.reach || null,
      engagement: data.engagement || null,
      engagementRate: data.engagementRate || null,
      followerGain: data.followerGain || null,
      followerLoss: data.followerLoss || null,
      videoViews: data.videoViews || null,
      videoCompletionRate: data.videoCompletionRate || null,
      averageViewDuration: data.averageViewDuration || null,
      totalViewDuration: data.totalViewDuration || null,
      demographics: data.demographics || null,
      topLocations: data.topLocations || null,
      topAgeGroup: data.topAgeGroup || null,
      topGender: data.topGender || null,
      sentiment: data.sentiment || null,
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
        activities = activities.filter(item => new Date(item.performedAt) >= filters.startDate!);
      }
      
      if (filters.endDate) {
        activities = activities.filter(item => new Date(item.performedAt) <= filters.endDate!);
      }
    }
    
    return activities;
  }
  
  async createEngageActivity(activity: InsertEngageActivity): Promise<EngageActivity> {
    const newActivity: EngageActivity = {
      ...activity,
      id: this.activityId++,
      performedAt: new Date(),
      socialAccountId: activity.socialAccountId || null,
      content: activity.content || null,
      postId: activity.postId || null,
      targetUsername: activity.targetUsername || null,
      targetContent: activity.targetContent || null,
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
    let userInsights = Array.from(this.insights.values()).filter(
      (insight) => insight.userId === userId,
    );
    
    if (filters) {
      if (filters.type) {
        userInsights = userInsights.filter(item => item.type === filters.type);
      }
      
      if (filters.isRead !== undefined) {
        userInsights = userInsights.filter(item => item.isRead === filters.isRead);
      }
      
      if (filters.isApplied !== undefined) {
        userInsights = userInsights.filter(item => item.isApplied === filters.isApplied);
      }
    }
    
    return userInsights;
  }
  
  async createInsight(insight: InsertInsight): Promise<Insight> {
    const newInsight: Insight = {
      ...insight,
      id: this.insightId++,
      createdAt: new Date(),
      isRead: false,
      isApplied: false,
      socialAccountId: insight.socialAccountId || null,
      severity: insight.severity || null,
      relatedPostId: insight.relatedPostId || null,
      metadata: insight.metadata || null
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
      status: record.status || null,
      tags: record.tags || null,
      postId: record.postId || null,
      currency: record.currency || null,
      transactionId: record.transactionId || null,
      paymentMethod: record.paymentMethod || null,
      accountNumber: record.accountNumber || null,
      commission: record.commission || null,
      referredBy: record.referredBy || null,
      campaignId: record.campaignId || null,
      campaignName: record.campaignName || null,
      partnerName: record.partnerName || null,
      contractId: record.contractId || null,
      convertedFrom: record.convertedFrom || null,
      conversionUrl: record.conversionUrl || null,
      conversionRate: record.conversionRate || null,
      impressions: record.impressions || null,
      clicks: record.clicks || null,
      ctr: record.ctr || null,
      costPerClick: record.costPerClick || null,
      costPerMille: record.costPerMille || null,
      adSpend: record.adSpend || null,
      roi: record.roi || null,
      profitMargin: record.profitMargin || null,
      notes: record.notes || null,
      metrics: record.metrics || null
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
    // For demo purposes, return mock data
    return {
      totalFollowers: 24521,
      engagementRate: 4.7,
      revenueGenerated: 1842,
      scheduledPosts: 12
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
    // For demo purposes, return mock data
    return {
      totalRevenue: 7842,
      affiliateSales: 124,
      sponsoredPosts: 8,
      topRevenueSources: [
        {
          name: "Amazon Associates",
          amount: 2450,
          conversions: 78,
          change: 12,
          logoUrl: "https://logo.clearbit.com/amazon.com"
        },
        {
          name: "Shopify Partners",
          amount: 1820,
          conversions: 32,
          change: 8,
          logoUrl: "https://logo.clearbit.com/shopify.com"
        },
        {
          name: "Fitness Brand X (Sponsored)",
          amount: 1500,
          conversions: 2,
          change: 0,
          logoUrl: "https://via.placeholder.com/150"
        }
      ]
    };
  }
  
  async getPlatformROI(userId: number): Promise<{
    platform: string;
    revenue: number;
    percentage: number;
  }[]> {
    // For demo purposes, return mock data
    return [
      {
        platform: "instagram",
        revenue: 3824,
        percentage: 58
      },
      {
        platform: "facebook",
        revenue: 2541,
        percentage: 32
      },
      {
        platform: "twitter",
        revenue: 1477,
        percentage: 10
      }
    ];
  }
}

export const storage = new MemStorage();
