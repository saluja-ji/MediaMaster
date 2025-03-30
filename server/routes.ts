import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as z from "zod";
import { 
  insertPostSchema, 
  extendedPostSchema, 
  insertSocialAccountSchema, 
  insertUserSchema, 
  insertMonetizationRecordSchema, 
  insertBrandPartnershipSchema,
  loginSchema, 
  userPreferencesSchema 
} from "@shared/schema";
import { 
  analyzeContent, 
  generateAutoReply, 
  generateMonetizationSuggestions, 
  generateInsightsFromAnalytics,
  generateBrandPartnershipMatches
} from "./openai";
import session from "express-session";
import MemoryStore from "memorystore";

// Extend the session interface to include userId
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  const SessionStore = MemoryStore(session);
  
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "social-ai-secret",
    })
  );

  // Middleware to check authentication
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // User preferences routes
  app.get("/api/user/preferences", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user.preferences || userPreferencesSchema.parse({}));
  });
  
  app.patch("/api/user/preferences", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get existing preferences or defaults
      const currentPreferences = user.preferences ? userPreferencesSchema.parse(user.preferences) : userPreferencesSchema.parse({});
      
      // Parse and validate the body with the schema
      let userPrefsUpdate = {};
      try {
        // Partial update - only parse the fields that are present
        if (req.body.dashboard) userPrefsUpdate = { ...userPrefsUpdate, dashboard: req.body.dashboard };
        if (req.body.content) userPrefsUpdate = { ...userPrefsUpdate, content: req.body.content };
        if (req.body.autoEngage) userPrefsUpdate = { ...userPrefsUpdate, autoEngage: req.body.autoEngage };
        if (req.body.monetization) userPrefsUpdate = { ...userPrefsUpdate, monetization: req.body.monetization };
        if (req.body.analytics) userPrefsUpdate = { ...userPrefsUpdate, analytics: req.body.analytics };
        if (req.body.notifications) userPrefsUpdate = { ...userPrefsUpdate, notifications: req.body.notifications };
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid preferences format", error: parseError });
      }
      
      // Deep merge the existing preferences with the validated new ones
      const updatedPreferences = {
        ...currentPreferences,
        ...userPrefsUpdate,
      };
      
      // Update user with new preferences
      const updatedUser = await storage.updateUser(userId, { preferences: updatedPreferences });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update preferences" });
      }
      
      res.json(updatedPreferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preferences format", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Social accounts routes
  app.get("/api/social-accounts", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const accounts = await storage.getSocialAccountsByUserId(userId);
    res.json(accounts);
  });

  app.post("/api/social-accounts", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const accountData = insertSocialAccountSchema.parse({
        ...req.body,
        userId
      });
      
      const account = await storage.createSocialAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create social account" });
    }
  });

  app.put("/api/social-accounts/:id", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Verify ownership
      const accounts = await storage.getSocialAccountsByUserId(userId);
      const accountExists = accounts.some(account => account.id === accountId);
      
      if (!accountExists) {
        return res.status(404).json({ message: "Account not found or access denied" });
      }
      
      const updatedAccount = await storage.updateSocialAccount(accountId, req.body);
      res.json(updatedAccount);
    } catch (error) {
      res.status(500).json({ message: "Failed to update social account" });
    }
  });

  app.delete("/api/social-accounts/:id", requireAuth, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Verify ownership
      const accounts = await storage.getSocialAccountsByUserId(userId);
      const accountExists = accounts.some(account => account.id === accountId);
      
      if (!accountExists) {
        return res.status(404).json({ message: "Account not found or access denied" });
      }
      
      await storage.deleteSocialAccount(accountId);
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete social account" });
    }
  });

  // Posts routes
  app.get("/api/posts", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const { platform, status, startDate, endDate } = req.query;
    
    const filters: any = {};
    if (platform) filters.platform = platform as string;
    if (status) filters.status = status as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    
    const posts = await storage.getPosts(userId, filters);
    res.json(posts);
  });

  app.get("/api/posts/scheduled", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const posts = await storage.getScheduledPosts(userId);
    res.json(posts);
  });

  app.get("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPost(postId);
      
      if (!post || post.userId !== req.session.userId) {
        return res.status(404).json({ message: "Post not found or access denied" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const postData = insertPostSchema.parse({
        ...req.body,
        userId
      });
      
      // If AI analysis is requested, analyze the content
      if (req.query.analyze === 'true') {
        const analysis = await analyzeContent(postData);
        // Validate with extendedPostSchema that allows engagementScore and shadowbanRisk
        const postDataWithAnalysis = extendedPostSchema.parse({
          ...postData,
          engagementScore: analysis.engagementScore,
          shadowbanRisk: analysis.shadowbanRisk
        });
        const post = await storage.createPost(postDataWithAnalysis);
        
        res.status(201).json({
          post,
          analysis
        });
      } else {
        const post = await storage.createPost(postData);
        res.status(201).json({ post });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.put("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Verify ownership
      const post = await storage.getPost(postId);
      if (!post || post.userId !== userId) {
        return res.status(404).json({ message: "Post not found or access denied" });
      }
      
      const updatedPost = await storage.updatePost(postId, req.body);
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", requireAuth, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.session.userId!;
      
      // Verify ownership
      const post = await storage.getPost(postId);
      if (!post || post.userId !== userId) {
        return res.status(404).json({ message: "Post not found or access denied" });
      }
      
      await storage.deletePost(postId);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const { platform, startDate, endDate, postId } = req.query;
    
    const filters: any = {};
    if (platform) filters.platform = platform as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (postId) filters.postId = parseInt(postId as string);
    
    const analyticsData = await storage.getAnalyticsData(userId, filters);
    res.json(analyticsData);
  });

  // Dashboard data routes
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const stats = await storage.getDashboardStats(userId);
    res.json(stats);
  });

  app.get("/api/dashboard/monetization", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const monetizationData = await storage.getMonetizationSummary(userId);
    res.json(monetizationData);
  });

  app.get("/api/dashboard/platform-roi", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const platformROI = await storage.getPlatformROI(userId);
    res.json(platformROI);
  });

  // Auto-engage routes
  app.get("/api/engage-activities", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const { platform, type, startDate, endDate } = req.query;
    
    const filters: any = {};
    if (platform) filters.platform = platform as string;
    if (type) filters.type = type as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    
    const activities = await storage.getEngageActivities(userId, filters);
    res.json(activities);
  });

  app.post("/api/engage-activities", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const activityData = {
        ...req.body,
        userId
      };
      
      const activity = await storage.createEngageActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to create engagement activity" });
    }
  });

  app.post("/api/auto-reply", requireAuth, async (req, res) => {
    try {
      const { comment, platform, accountName, postTopic } = req.body;
      
      if (!comment || !platform || !accountName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const reply = await generateAutoReply(comment, { platform, accountName, postTopic });
      res.json({ reply });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate auto-reply" });
    }
  });

  // Insights routes
  app.get("/api/insights", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const { type, isRead, isApplied } = req.query;
    
    const filters: any = {};
    if (type) filters.type = type as string;
    if (isRead !== undefined) filters.isRead = isRead === 'true';
    if (isApplied !== undefined) filters.isApplied = isApplied === 'true';
    
    const insights = await storage.getInsights(userId, filters);
    res.json(insights);
  });

  app.put("/api/insights/:id", requireAuth, async (req, res) => {
    try {
      const insightId = parseInt(req.params.id);
      const updatedInsight = await storage.updateInsight(insightId, req.body);
      
      if (!updatedInsight) {
        return res.status(404).json({ message: "Insight not found" });
      }
      
      res.json(updatedInsight);
    } catch (error) {
      res.status(500).json({ message: "Failed to update insight" });
    }
  });

  // AI Analysis routes
  app.post("/api/analyze-content", requireAuth, async (req, res) => {
    try {
      const { content, platform, tags } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const analysis = await analyzeContent({ content, platform, tags });
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Content analysis failed" });
    }
  });

  app.post("/api/monetization-suggestions", requireAuth, async (req, res) => {
    try {
      const { postHistory, audienceDescription, platform } = req.body;
      
      if (!postHistory || !audienceDescription || !platform) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const suggestions = await generateMonetizationSuggestions({
        postHistory,
        audienceDescription,
        platform
      });
      
      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate monetization suggestions" });
    }
  });

  app.post("/api/analytics-insights", requireAuth, async (req, res) => {
    try {
      const { engagementTrends, contentTypes, schedule, platform } = req.body;
      
      if (!engagementTrends || !contentTypes || !schedule || !platform) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const insights = await generateInsightsFromAnalytics({
        engagementTrends,
        contentTypes,
        schedule,
        platform
      });
      
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate analytics insights" });
    }
  });

  // Monetization routes
  app.get("/api/monetization", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    const { platform, source, startDate, endDate } = req.query;
    
    const filters: any = {};
    if (platform) filters.platform = platform as string;
    if (source) filters.source = source as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    
    const records = await storage.getMonetizationRecords(userId, filters);
    res.json(records);
  });

  app.post("/api/monetization", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const recordData = insertMonetizationRecordSchema.parse({
        ...req.body,
        userId
      });
      
      const record = await storage.createMonetizationRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create monetization record" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
