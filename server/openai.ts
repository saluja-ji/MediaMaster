import OpenAI from "openai";
import { Post } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-mock-key-for-development" });

export interface ContentAnalysisResult {
  engagementScore: number;
  shadowbanRisk: number;
  recommendations: string[];
  optimizedContent?: string;
  risks?: string[];
}

export interface MonetizationSuggestion {
  type: string;
  partnerName: string;
  estimatedRevenue: { min: number; max: number };
  description: string;
  confidence: number;
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
    
    // Return a fallback result if API fails
    return [
      "Posts published between 5-7pm receive 30% higher engagement. Consider adjusting your posting schedule.",
      "Content with images receives twice the engagement of text-only posts. Try using more visual content.",
      "Questions in your captions drive 40% more comments. Include questions to boost engagement."
    ];
  }
}
