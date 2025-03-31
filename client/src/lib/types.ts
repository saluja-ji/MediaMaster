// Social media platform types
export type SocialPlatform = 
  | "instagram" 
  | "twitter" 
  | "facebook" 
  | "linkedin" 
  | "tiktok" 
  | "youtube" 
  | "medium" 
  | "pinterest" 
  | "snapchat" 
  | "threads" 
  | "reddit" 
  | "discord" 
  | "tumblr" 
  | "whatsapp" 
  | "telegram" 
  | "mastodon";

// Collaboration types
export type CollaborationType = 
  | "guest_post" 
  | "co_created_content" 
  | "live_stream" 
  | "podcast_appearance" 
  | "product_review" 
  | "joint_contest" 
  | "story_takeover" 
  | "cross_promotion" 
  | "series_collaboration" 
  | "affiliate_partnership";

// Creator collaboration parameters
export interface CollaborationParams {
  preferredCollabTypes?: CollaborationType[];
  preferredPlatforms?: SocialPlatform[];
  count?: number;
}

// Creator collaboration suggestion interface 
export interface CreatorCollaboration {
  creatorName: string;
  platform: SocialPlatform;
  audienceSize: number;
  engagementRate: number;
  audienceOverlap: number;
  contentSynergy: number;
  niche: string;
  topics: string[];
  recommendedCollabTypes: CollaborationType[];
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