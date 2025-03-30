import OpenAI from "openai";
import { Post } from "@shared/schema";
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
