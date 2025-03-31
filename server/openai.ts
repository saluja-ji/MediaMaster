import OpenAI from "openai";
import { Post, AnalyticsData, EngageActivity, SocialAccount } from "@shared/schema";
import fs from "fs";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ContentAnalysisResult {
  engagementScore: number;
  shadowbanRisk: number;
  recommendations: string[];
  optimizedContent?: string;
  risks?: string[];
  bestTimeToPost?: string;
  audienceMatch?: number;
}

export interface MonetizationSuggestion {
  type: string;
  partnerName: string;
  estimatedRevenue: { min: number; max: number };
  description: string;
  confidence: number;
  audienceMatch?: number;
  conversionEstimate?: number;
  potentialReach?: number;
}

export interface AudienceInsight {
  demographic: string;
  interests: string[];
  behavior: string;
  platforms: string[];
  recommendedApproach: string;
}

export interface ShadowbanAnalysis {
  risk: number;
  triggers: string[];
  recommendations: string[];
  platformSpecificIssues?: Record<string, string[]>;
}

export interface ContentCalendarSuggestion {
  date: string;
  topic: string;
  contentType: string;
  hashtags: string[];
  description: string;
  targetAudience: string;
}

/**
 * Analyzes content for engagement prediction and shadowban risks
 */
export async function analyzeContent(post: Partial<Post>): Promise<ContentAnalysisResult> {
  try {
    if (!post.content) {
      throw new Error("Post content is required for analysis");
    }

    const prompt = `
      Analyze the following social media post for ${post.platform || "a social media platform"}:
      
      POST CONTENT:
      ${post.content}
      
      ${post.tags ? `HASHTAGS: ${post.tags.join(', ')}` : ''}
      
      Please provide the following analysis in JSON format:
      1. An engagement score from 0-100 predicting how well this post will perform
      2. A shadowban risk score from 0-10 (0 being no risk, 10 being extreme risk)
      3. A list of 2-3 specific recommendations to improve engagement
      4. An optimized version of the content (optional, only if improvements are needed)
      5. A list of specific shadowban risks or content policy issues if any exist
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI expert in social media content optimization and platform policy compliance."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      engagementScore: Math.min(100, Math.max(0, result.engagementScore || 50)),
      shadowbanRisk: Math.min(10, Math.max(0, result.shadowbanRisk || 1)),
      recommendations: result.recommendations || [],
      optimizedContent: result.optimizedContent,
      risks: result.risks
    };
  } catch (error) {
    console.error("Error analyzing content with OpenAI:", error);
    
    // Return a fallback result if API fails
    return {
      engagementScore: 50,
      shadowbanRisk: 1,
      recommendations: ["Use more engaging language", "Add relevant hashtags", "Include a call to action"],
    };
  }
}

/**
 * Generates auto-reply content for comments
 */
export async function generateAutoReply(comment: string, context: {
  platform: string;
  accountName: string;
  postTopic?: string;
}): Promise<string> {
  try {
    const prompt = `
      Generate a friendly, authentic-sounding reply to this comment on ${context.platform}:
      
      COMMENT: "${comment}"
      
      CONTEXT:
      - Platform: ${context.platform}
      - Account Name: ${context.accountName}
      ${context.postTopic ? `- Post Topic: ${context.postTopic}` : ''}
      
      The reply should be:
      - Friendly and conversational
      - Authentic (not obviously automated)
      - Brief (1-2 sentences max)
      - Include emojis if appropriate for the platform
      - Not overly promotional
      
      Reply:
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a social media manager who writes authentic, engaging replies to comments."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 100
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error generating auto-reply with OpenAI:", error);
    return "Thanks for your comment! 😊";
  }
}

/**
 * Generates monetization suggestions based on content and audience
 */
export async function generateMonetizationSuggestions(data: {
  postHistory: string[];
  audienceDescription: string;
  platform: string;
}): Promise<MonetizationSuggestion[]> {
  try {
    const prompt = `
      Generate monetization suggestions for a social media account with:
      
      PLATFORM: ${data.platform}
      
      AUDIENCE DESCRIPTION: ${data.audienceDescription}
      
      RECENT POST TOPICS: ${data.postHistory.join(', ')}
      
      Please provide 3 monetization suggestions in JSON format, each with:
      - type: The type of monetization (affiliate, sponsored, product, etc.)
      - partnerName: Suggested partner/brand name
      - estimatedRevenue: Min and max revenue estimate range
      - description: Brief explanation of the opportunity
      - confidence: A score from 0-1 indicating confidence in the suggestion
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI expert in social media monetization strategies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.suggestions || [];
  } catch (error) {
    console.error("Error generating monetization suggestions with OpenAI:", error);
    
    // Return a fallback result if API fails
    return [
      {
        type: "affiliate",
        partnerName: "Amazon Associates",
        estimatedRevenue: { min: 100, max: 500 },
        description: "Promote relevant products from Amazon that align with your content.",
        confidence: 0.8
      }
    ];
  }
}

/**
 * Generates insights from analytics data
 */
export async function generateInsightsFromAnalytics(data: {
  engagementTrends: any[];
  contentTypes: any[];
  schedule: any[];
  platform: string;
}): Promise<string[]> {
  try {
    const prompt = `
      Analyze the following social media analytics data for ${data.platform}:
      
      ENGAGEMENT TRENDS: ${JSON.stringify(data.engagementTrends)}
      CONTENT TYPES: ${JSON.stringify(data.contentTypes)}
      POSTING SCHEDULE: ${JSON.stringify(data.schedule)}
      
      Provide 3-5 actionable insights in JSON format as an array of strings. 
      Each insight should highlight a pattern and suggest a specific action to improve performance.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI social media analytics expert who provides actionable insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.insights || [];
  } catch (error) {
    console.error("Error generating analytics insights with OpenAI:", error);
    throw new Error("Unable to generate analytics insights. Please check your OpenAI API key and try again.");
  }
}

/**
 * Conducts detailed shadowban risk analysis for platform-specific content
 */
export async function analyzeShadowbanRisk(data: {
  content: string;
  platform: string;
  hashtags?: string[];
  urls?: string[];
  mentionCount?: number;
}): Promise<ShadowbanAnalysis> {
  try {
    const prompt = `
      Analyze the following social media content for shadowban risks on ${data.platform}:
      
      CONTENT: ${data.content}
      ${data.hashtags ? `HASHTAGS: ${data.hashtags.join(', ')}` : ''}
      ${data.urls ? `URLS: ${data.urls.join(', ')}` : ''}
      ${data.mentionCount ? `MENTION COUNT: ${data.mentionCount}` : ''}
      
      Provide a detailed shadowban risk analysis in JSON format with these fields:
      - risk: A numeric score from 0-10 indicating overall shadowban risk
      - triggers: Array of specific content elements that could trigger algorithmic penalties
      - recommendations: Array of specific actions to reduce shadowban risk
      - platformSpecificIssues: Object with platform-specific policy violations or risks
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI expert in social media algorithm policies and shadowban prevention across all major platforms."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      risk: Math.min(10, Math.max(0, result.risk || 0)),
      triggers: result.triggers || [],
      recommendations: result.recommendations || [],
      platformSpecificIssues: result.platformSpecificIssues || {}
    };
  } catch (error) {
    console.error("Error analyzing shadowban risk with OpenAI:", error);
    throw new Error("Unable to analyze shadowban risk. Please check your OpenAI API key and try again.");
  }
}

/**
 * Analyzes an image for content policy compliance and engagement potential
 */
export async function analyzeImageContent(base64Image: string, context: {
  platform: string;
  contentDescription?: string;
}): Promise<{
  policyCompliance: boolean;
  engagementScore: number;
  recommendations: string[];
  risks: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI expert in social media image analysis, policy compliance, and engagement optimization."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image intended for ${context.platform} in detail. ${context.contentDescription ? `Context: ${context.contentDescription}` : ''}
              
              Provide the following in JSON format:
              1. policyCompliance: Boolean indicating if the image complies with platform content policies
              2. engagementScore: Number from 0-100 predicting engagement potential
              3. recommendations: Array of 2-3 suggestions to improve the image
              4. risks: Array of potential content policy issues or concerns`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      policyCompliance: result.policyCompliance ?? true,
      engagementScore: Math.min(100, Math.max(0, result.engagementScore || 50)),
      recommendations: result.recommendations || [],
      risks: result.risks || []
    };
  } catch (error) {
    console.error("Error analyzing image with OpenAI:", error);
    throw new Error("Unable to analyze image content. Please check your OpenAI API key and try again.");
  }
}

/**
 * Generates content calendar suggestions based on trends and audience
 */
export async function generateContentCalendar(data: {
  niche: string;
  upcomingEvents?: string[];
  pastSuccessfulTopics?: string[];
  audienceInterests?: string[];
  platform: string;
  numberOfSuggestions?: number;
}): Promise<ContentCalendarSuggestion[]> {
  try {
    const numberOfSuggestions = data.numberOfSuggestions || 7;
    const prompt = `
      Generate a content calendar for a ${data.niche} account on ${data.platform} with the following information:
      
      ${data.upcomingEvents ? `UPCOMING EVENTS: ${data.upcomingEvents.join(', ')}` : ''}
      ${data.pastSuccessfulTopics ? `PAST SUCCESSFUL TOPICS: ${data.pastSuccessfulTopics.join(', ')}` : ''}
      ${data.audienceInterests ? `AUDIENCE INTERESTS: ${data.audienceInterests.join(', ')}` : ''}
      
      Provide ${numberOfSuggestions} content suggestions in JSON format as an array of objects, each with:
      - date: A date within the next 30 days (format: YYYY-MM-DD)
      - topic: The main topic of the content
      - contentType: The format (e.g., image, video, carousel, story, etc.)
      - hashtags: Array of 3-5 relevant hashtags
      - description: Brief content description
      - targetAudience: The specific audience segment this content targets
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert social media content strategist who creates high-performing content calendars."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.suggestions || [];
  } catch (error) {
    console.error("Error generating content calendar with OpenAI:", error);
    throw new Error("Unable to generate content calendar. Please check your OpenAI API key and try again.");
  }
}

/**
 * Generates brand partnership matches based on creator profile and content
 */
export interface BrandPartnershipMatch {
  brandName: string;
  industry: string;
  productCategories: string[];
  partnershipTypes: string[];
  minBudget: number;
  maxBudget: number;
  targetAudience: {
    demographics: string[];
    interests: string[];
    platforms: string[];
  };
  requirements: {
    minFollowers: number;
    minEngagementRate: number;
    contentTypes: string[];
  };
  matchScore: number;
  matchReasoning: string;
  brandWebsite?: string;
  contactEmail?: string;
}

export async function generateBrandPartnershipMatches(data: {
  userProfile: {
    content: string[];
    platforms: string[];
    audienceSize: number;
    engagementRate: number;
    niche: string;
    audienceDescription: string;
    previousPartnerships?: string[];
  };
  preferredIndustries?: string[];
  preferredPartnershipTypes?: string[];
  count?: number;
}): Promise<BrandPartnershipMatch[]> {
  try {
    const count = data.count || 5;
    const prompt = `
      Generate ${count} brand partnership matches for a social media creator with the following profile:
      
      CONTENT TOPICS: ${data.userProfile.content.join(', ')}
      PLATFORMS: ${data.userProfile.platforms.join(', ')}
      AUDIENCE SIZE: ${data.userProfile.audienceSize}
      ENGAGEMENT RATE: ${data.userProfile.engagementRate}%
      NICHE: ${data.userProfile.niche}
      AUDIENCE DESCRIPTION: ${data.userProfile.audienceDescription}
      ${data.userProfile.previousPartnerships ? 
        `PREVIOUS PARTNERSHIPS: ${data.userProfile.previousPartnerships.join(', ')}` : ''}
      ${data.preferredIndustries ? 
        `PREFERRED INDUSTRIES: ${data.preferredIndustries.join(', ')}` : ''}
      ${data.preferredPartnershipTypes ? 
        `PREFERRED PARTNERSHIP TYPES: ${data.preferredPartnershipTypes.join(', ')}` : ''}
      
      Please provide results in JSON format as an array of brand partnership matches, each with:
      - brandName: Name of the brand
      - industry: Brand's industry
      - productCategories: Array of product categories the brand offers
      - partnershipTypes: Array of possible partnership types (affiliate, sponsored, ambassador, etc.)
      - minBudget: Minimum partnership budget estimate
      - maxBudget: Maximum partnership budget estimate
      - targetAudience: Object with demographics, interests, and platforms arrays
      - requirements: Object with minFollowers, minEngagementRate, and contentTypes array
      - matchScore: Number from 0-1 indicating match quality
      - matchReasoning: Short explanation of why this is a good match
      - brandWebsite: Optional URL for the brand
      - contactEmail: Optional contact email for partnerships
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI expert in brand partnerships and influencer marketing."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.matches || [];
  } catch (error) {
    console.error("Error generating brand partnership matches with OpenAI:", error);
    throw new Error("Unable to generate brand partnership matches. Please check your OpenAI API key and try again.");
  }
}

/**
 * Analyzes competitor profiles to generate strategic insights
 */
export async function analyzeCompetitors(data: {
  competitorProfiles: Array<{
    name: string;
    description: string;
    topContent: string[];
    followerCount?: number;
    engagementRate?: number;
  }>;
  industry: string;
  platform: string;
}): Promise<{
  opportunities: string[];
  threats: string[];
  contentGaps: string[];
  recommendedStrategies: string[];
}> {
  try {
    const prompt = `
      Analyze the following competitor profiles in the ${data.industry} industry on ${data.platform}:
      
      ${data.competitorProfiles.map((competitor, index) => `
        COMPETITOR ${index + 1}: ${competitor.name}
        DESCRIPTION: ${competitor.description}
        ${competitor.followerCount ? `FOLLOWERS: ${competitor.followerCount}` : ''}
        ${competitor.engagementRate ? `ENGAGEMENT RATE: ${competitor.engagementRate}%` : ''}
        TOP PERFORMING CONTENT: ${competitor.topContent.join('; ')}
      `).join('\n\n')}
      
      Provide a competitive analysis in JSON format with these fields:
      - opportunities: Array of market opportunities based on competitor gaps
      - threats: Array of competitive threats to be aware of
      - contentGaps: Array of content types/topics that competitors are not covering well
      - recommendedStrategies: Array of specific strategies to gain competitive advantage
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI competitive intelligence expert specializing in social media strategy."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    return {
      opportunities: result.opportunities || [],
      threats: result.threats || [],
      contentGaps: result.contentGaps || [],
      recommendedStrategies: result.recommendedStrategies || []
    };
  } catch (error) {
    console.error("Error analyzing competitors with OpenAI:", error);
    throw new Error("Unable to analyze competitors. Please check your OpenAI API key and try again.");
  }
}

/**
 * Generate a comprehensive social media performance report in one click
 */
export interface PerformanceReport {
  summary: {
    overallScore: number;
    topPerformingPlatform: string;
    totalEngagement: number;
    audienceGrowth: number;
    conversionRate: number;
    revenueGenerated: number;
  };
  platformBreakdown: Array<{
    platform: string;
    score: number;
    engagement: number;
    growth: number;
    revenue: number;
    topPost: {
      content: string;
      engagement: number;
      date: string;
    };
    recommendations: string[];
  }>;
  insights: string[];
  trends: {
    improving: string[];
    declining: string[];
    opportunities: string[];
  };
  nextSteps: string[];
  reportDate: string;
}

export async function generatePerformanceReport(data: {
  userId: number;
  analyticsData: AnalyticsData[];
  posts: Post[];
  socialAccounts: SocialAccount[];
  startDate: Date;
  endDate: Date;
  platforms?: string[];
}): Promise<PerformanceReport> {
  try {
    // Format data for better OpenAI analysis
    const platforms = data.platforms || [...new Set(data.socialAccounts.map(acc => acc.platform))];
    const platformAnalytics = platforms.map(platform => {
      const platformData = data.analyticsData.filter(item => item.platform === platform);
      const platformPosts = data.posts.filter(post => post.platform === platform);
      
      // Calculate platform engagement metrics
      const totalLikes = platformData.reduce((sum, item) => sum + (item.likes || 0), 0);
      const totalComments = platformData.reduce((sum, item) => sum + (item.comments || 0), 0);
      const totalShares = platformData.reduce((sum, item) => sum + (item.shares || 0), 0);
      const totalReach = platformData.reduce((sum, item) => sum + (item.reach || 0), 0);
      
      // Identify top post
      let topPost = null;
      if (platformPosts.length > 0) {
        const postAnalytics = {};
        
        // Calculate engagement for each post
        platformData.forEach(item => {
          if (item.postId) {
            postAnalytics[item.postId] = (postAnalytics[item.postId] || 0) + 
              (item.likes || 0) + (item.comments || 0) + (item.shares || 0);
          }
        });
        
        // Find post with highest engagement
        let maxEngagement = 0;
        let topPostId = null;
        
        Object.entries(postAnalytics).forEach(([postId, engagement]) => {
          if (engagement > maxEngagement) {
            maxEngagement = engagement as number;
            topPostId = parseInt(postId);
          }
        });
        
        if (topPostId) {
          const post = platformPosts.find(p => p.id === topPostId);
          if (post) {
            topPost = {
              id: post.id,
              content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
              engagement: maxEngagement,
              date: post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : 'N/A'
            };
          }
        }
      }
      
      return {
        platform,
        metrics: {
          totalLikes,
          totalComments,
          totalShares,
          totalReach,
          totalPosts: platformPosts.length,
          engagementRate: totalReach > 0 ? 
            ((totalLikes + totalComments + totalShares) / totalReach * 100).toFixed(2) : 0
        },
        topPost
      };
    });
    
    const prompt = `
      Generate a comprehensive social media performance report for the date range ${data.startDate.toISOString().split('T')[0]} to ${data.endDate.toISOString().split('T')[0]} with the following data:

      PLATFORM ANALYTICS:
      ${JSON.stringify(platformAnalytics, null, 2)}
      
      Provide a complete performance report in JSON format with these sections:
      - summary: Overall performance metrics including overall score (0-100), top platform, total engagement, audience growth, conversion rate, and revenue
      - platformBreakdown: Detail for each platform including performance score, metrics, top post, and 2-3 platform-specific recommendations
      - insights: 3-5 key insights about overall performance
      - trends: Lists of improving metrics, declining metrics, and opportunities
      - nextSteps: 3-5 actionable recommendations to improve performance
      - reportDate: Current date
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert social media analyst who creates detailed performance reports. Your reports are data-driven, insightful, and provide clear actionable recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    const today = new Date().toISOString().split('T')[0];
    
    return {
      summary: result.summary || {
        overallScore: 0,
        topPerformingPlatform: platforms[0] || "instagram",
        totalEngagement: 0,
        audienceGrowth: 0,
        conversionRate: 0,
        revenueGenerated: 0
      },
      platformBreakdown: result.platformBreakdown || platforms.map(p => ({
        platform: p,
        score: 0,
        engagement: 0,
        growth: 0,
        revenue: 0,
        topPost: { content: "N/A", engagement: 0, date: today },
        recommendations: ["Analyze platform-specific data to generate recommendations"]
      })),
      insights: result.insights || ["Insufficient data for detailed insights"],
      trends: result.trends || {
        improving: [],
        declining: [],
        opportunities: ["Collect more data for trend analysis"]
      },
      nextSteps: result.nextSteps || ["Set up consistent tracking for better analysis"],
      reportDate: today
    };
  } catch (error) {
    console.error("Error generating performance report with OpenAI:", error);
    throw new Error("Unable to generate performance report. Please check your OpenAI API key and try again.");
  }
}

/**
 * Train an AI model on user-specific engagement patterns to provide personalized recommendations
 */
export interface UserEngagementModel {
  modelId: string;
  userId: number;
  platforms: string[];
  trainedOn: Date;
  contentPatterns: {
    highEngagement: {
      topics: string[];
      formats: string[];
      timing: {
        daysOfWeek: string[];
        timeOfDay: string[];
      };
      contentAttributes: {
        length: string;
        mediaTypes: string[];
        toneAttributes: string[];
      };
    };
    lowEngagement: {
      topics: string[];
      formats: string[];
      timing: {
        daysOfWeek: string[];
        timeOfDay: string[];
      };
      contentAttributes: {
        length: string;
        mediaTypes: string[];
        toneAttributes: string[];
      };
    };
  };
  audienceAffinities: string[];
  predictedPerformanceFactors: string[];
}

export async function trainUserEngagementModel(data: {
  userId: number;
  posts: Post[];
  analyticsData: AnalyticsData[];
  socialAccounts: SocialAccount[];
  engageActivities: EngageActivity[];
  lookbackPeriod?: number; // Days to look back, default 90
}): Promise<UserEngagementModel> {
  try {
    const lookbackPeriod = data.lookbackPeriod || 90;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookbackPeriod);
    
    // Filter data to the lookback period
    const recentPosts = data.posts.filter(post => 
      post.publishedAt && new Date(post.publishedAt) >= cutoffDate
    );
    
    // Categorize posts by engagement level
    const postEngagements = {};
    data.analyticsData.forEach(item => {
      if (item.postId) {
        const engagement = (item.likes || 0) + (item.comments || 0) + (item.shares || 0) + (item.saves || 0);
        if (!postEngagements[item.postId]) {
          postEngagements[item.postId] = 0;
        }
        postEngagements[item.postId] += engagement;
      }
    });
    
    // Sort posts by engagement
    const postsWithEngagement = recentPosts.map(post => ({
      id: post.id,
      content: post.content,
      platform: post.platform,
      tags: post.tags || [],
      publishTime: post.publishedAt ? new Date(post.publishedAt) : null,
      dayOfWeek: post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { weekday: 'long' }) : null,
      timeOfDay: post.publishedAt ? new Date(post.publishedAt).getHours() : null,
      mediaCount: post.mediaUrls ? post.mediaUrls.length : 0,
      contentLength: post.content ? post.content.length : 0,
      engagement: postEngagements[post.id] || 0
    }));
    
    // Sort by engagement and take top/bottom for analysis
    postsWithEngagement.sort((a, b) => b.engagement - a.engagement);
    const topPosts = postsWithEngagement.slice(0, Math.min(10, Math.ceil(postsWithEngagement.length / 3)));
    const bottomPosts = postsWithEngagement.slice(-Math.min(10, Math.ceil(postsWithEngagement.length / 3)));

    const prompt = `
      Train a personalized engagement model for a social media user based on their historical content performance:

      TOP PERFORMING POSTS:
      ${JSON.stringify(topPosts, null, 2)}
      
      LOWEST PERFORMING POSTS:
      ${JSON.stringify(bottomPosts, null, 2)}
      
      SOCIAL ACCOUNTS:
      ${JSON.stringify(data.socialAccounts.map(acc => ({
        platform: acc.platform,
        accountCategory: acc.accountCategory,
        followerCount: acc.followerCount,
        accountHealth: acc.accountHealth
      })), null, 2)}
      
      Based on this data, create a JSON model that identifies the unique engagement patterns for this specific user. The model should include:
      
      1. Content patterns that lead to high and low engagement (topics, formats, timing, content attributes)
      2. Audience affinities (what the audience responds to most)
      3. Predicted performance factors (what most strongly influences this user's content performance)
      
      Format as a complete JSON object with the structure matching UserEngagementModel.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI expert in social media analytics and machine learning. You specialize in identifying content performance patterns and creating personalized content strategy models."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    const modelId = `model-${data.userId}-${Date.now()}`;
    
    return {
      modelId,
      userId: data.userId,
      platforms: [...new Set(data.socialAccounts.map(acc => acc.platform))],
      trainedOn: new Date(),
      contentPatterns: result.contentPatterns || {
        highEngagement: {
          topics: [],
          formats: [],
          timing: { daysOfWeek: [], timeOfDay: [] },
          contentAttributes: { length: "medium", mediaTypes: [], toneAttributes: [] }
        },
        lowEngagement: {
          topics: [],
          formats: [],
          timing: { daysOfWeek: [], timeOfDay: [] },
          contentAttributes: { length: "medium", mediaTypes: [], toneAttributes: [] }
        }
      },
      audienceAffinities: result.audienceAffinities || [],
      predictedPerformanceFactors: result.predictedPerformanceFactors || []
    };
  } catch (error) {
    console.error("Error training user engagement model with OpenAI:", error);
    throw new Error("Unable to train engagement model. Please check your OpenAI API key and try again.");
  }
}

/**
 * Generate creator collaboration suggestions based on audience insights
 */
export interface CreatorCollaboration {
  creatorName: string;
  platform: string;
  audienceSize: number;
  engagementRate: number;
  audienceOverlap: number;
  contentSynergy: number;
  niche: string;
  topics: string[];
  recommendedCollabTypes: string[];
  potentialReach: number;
  contactMethod?: string;
  profileUrl?: string;
  collaborationIdeas: string[];
  benefitPrediction: {
    followerGain: string;
    engagementBoost: string;
    monetizationPotential: string;
  };
  matchScore: number;
}

export async function generateCreatorCollaborations(data: {
  userId: number;
  userProfile: {
    platforms: string[];
    niches: string[];
    audienceSize: number;
    audienceDemographics: any;
    contentTopics: string[];
    engagementRate: number;
  };
  preferredCollabTypes?: string[];
  preferredPlatforms?: string[];
  count?: number;
}): Promise<CreatorCollaboration[]> {
  try {
    const count = data.count || 5;
    const platforms = data.preferredPlatforms || data.userProfile.platforms || ["instagram", "tiktok", "youtube"];
    
    const prompt = `
      Generate ${count} creator collaboration suggestions based on this social media profile:
      
      PLATFORMS: ${platforms.join(', ')}
      NICHES: ${data.userProfile.niches.join(', ')}
      AUDIENCE SIZE: ${data.userProfile.audienceSize}
      AUDIENCE DEMOGRAPHICS: ${JSON.stringify(data.userProfile.audienceDemographics)}
      CONTENT TOPICS: ${data.userProfile.contentTopics.join(', ')}
      ENGAGEMENT RATE: ${data.userProfile.engagementRate}%
      ${data.preferredCollabTypes ? `PREFERRED COLLAB TYPES: ${data.preferredCollabTypes.join(', ')}` : ''}
      
      For each suggested collaboration, provide the following in JSON format:
      - creatorName: A real creator name that would be a good match (use real, relevant creators in the space)
      - platform: Primary platform of the creator
      - audienceSize: Estimated audience size
      - engagementRate: Estimated engagement rate
      - audienceOverlap: Percentage overlap with user's audience (0-100)
      - contentSynergy: Score indicating content compatibility (0-100)
      - niche: Creator's primary niche
      - topics: Array of creator's main content topics
      - recommendedCollabTypes: Array of suggested collaboration formats
      - potentialReach: Estimated total reach of the collaboration
      - profileUrl: Creator's profile URL if available
      - collaborationIdeas: Array of 2-3 specific collaboration ideas
      - benefitPrediction: Predicted benefits including follower gain, engagement boost, and monetization potential
      - matchScore: Overall compatibility score (0-100)
      
      Ensure suggestions are realistic, diverse in size/type, and provide specific, actionable collaboration ideas.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI expert in social media growth strategies and creator partnerships. You specialize in identifying synergistic collaboration opportunities between creators based on audience overlap and content compatibility."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result.collaborations || [];
  } catch (error) {
    console.error("Error generating creator collaborations with OpenAI:", error);
    throw new Error("Unable to generate creator collaboration suggestions. Please check your OpenAI API key and try again.");
  }
}
