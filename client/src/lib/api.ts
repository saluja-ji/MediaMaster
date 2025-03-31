import { queryClient } from "./queryClient";
import { 
  Post, 
  SocialAccount, 
  EngageActivity,
  Insight,
  MonetizationRecord,
  AnalyticsData,
  Platform
} from "@shared/schema";

/**
 * Makes an API request with proper error handling
 */
export async function apiRequest(
  method: string,
  endpoint: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(endpoint, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
  
  return res;
}

// Dashboard API
export async function fetchDashboardStats() {
  const res = await apiRequest("GET", "/api/dashboard/stats");
  return res.json();
}

export async function fetchMonetizationSummary() {
  const res = await apiRequest("GET", "/api/dashboard/monetization");
  return res.json();
}

export async function fetchPlatformROI() {
  const res = await apiRequest("GET", "/api/dashboard/platform-roi");
  return res.json();
}

// Posts API
export async function fetchPosts(filters?: {
  platform?: Platform;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  let url = "/api/posts";
  if (filters) {
    const params = new URLSearchParams();
    if (filters.platform) params.append("platform", filters.platform);
    if (filters.status) params.append("status", filters.status);
    if (filters.startDate) params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate) params.append("endDate", filters.endDate.toISOString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const res = await apiRequest("GET", url);
  return res.json();
}

export async function fetchScheduledPosts() {
  const res = await apiRequest("GET", "/api/posts/scheduled");
  return res.json();
}

export async function fetchPost(id: number) {
  const res = await apiRequest("GET", `/api/posts/${id}`);
  return res.json();
}

export async function createPost(post: Partial<Post>, analyze: boolean = false) {
  let url = "/api/posts";
  if (analyze) {
    url += "?analyze=true";
  }
  
  const res = await apiRequest("POST", url, post);
  queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
  queryClient.invalidateQueries({ queryKey: ["/api/posts/scheduled"] });
  return res.json();
}

export async function updatePost(id: number, post: Partial<Post>) {
  const res = await apiRequest("PUT", `/api/posts/${id}`, post);
  queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
  queryClient.invalidateQueries({ queryKey: ["/api/posts/scheduled"] });
  queryClient.invalidateQueries({ queryKey: [`/api/posts/${id}`] });
  return res.json();
}

export async function deletePost(id: number) {
  const res = await apiRequest("DELETE", `/api/posts/${id}`);
  queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
  queryClient.invalidateQueries({ queryKey: ["/api/posts/scheduled"] });
  return res.json();
}

// Social Accounts API
export async function fetchSocialAccounts() {
  const res = await apiRequest("GET", "/api/social-accounts");
  return res.json();
}

export async function createSocialAccount(account: Partial<SocialAccount>) {
  const res = await apiRequest("POST", "/api/social-accounts", account);
  queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
  return res.json();
}

export async function updateSocialAccount(id: number, account: Partial<SocialAccount>) {
  const res = await apiRequest("PUT", `/api/social-accounts/${id}`, account);
  queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
  return res.json();
}

export async function deleteSocialAccount(id: number) {
  const res = await apiRequest("DELETE", `/api/social-accounts/${id}`);
  queryClient.invalidateQueries({ queryKey: ["/api/social-accounts"] });
  return res.json();
}

// Analytics API
export async function fetchAnalytics(filters?: {
  platform?: Platform;
  startDate?: Date;
  endDate?: Date;
  postId?: number;
}) {
  let url = "/api/analytics";
  if (filters) {
    const params = new URLSearchParams();
    if (filters.platform) params.append("platform", filters.platform);
    if (filters.startDate) params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate) params.append("endDate", filters.endDate.toISOString());
    if (filters.postId) params.append("postId", filters.postId.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const res = await apiRequest("GET", url);
  return res.json();
}

// Auto-engage API
export async function fetchEngageActivities(filters?: {
  platform?: Platform;
  type?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  let url = "/api/engage-activities";
  if (filters) {
    const params = new URLSearchParams();
    if (filters.platform) params.append("platform", filters.platform);
    if (filters.type) params.append("type", filters.type);
    if (filters.startDate) params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate) params.append("endDate", filters.endDate.toISOString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const res = await apiRequest("GET", url);
  return res.json();
}

export async function createEngageActivity(activity: Partial<EngageActivity>) {
  const res = await apiRequest("POST", "/api/engage-activities", activity);
  queryClient.invalidateQueries({ queryKey: ["/api/engage-activities"] });
  return res.json();
}

export async function generateAutoReply(data: {
  comment: string;
  platform: string;
  accountName: string;
  postTopic?: string;
}) {
  const res = await apiRequest("POST", "/api/auto-reply", data);
  return res.json();
}

// Insights API
export async function fetchInsights(filters?: {
  type?: string;
  isRead?: boolean;
  isApplied?: boolean;
}) {
  let url = "/api/insights";
  if (filters) {
    const params = new URLSearchParams();
    if (filters.type) params.append("type", filters.type);
    if (filters.isRead !== undefined) params.append("isRead", filters.isRead.toString());
    if (filters.isApplied !== undefined) params.append("isApplied", filters.isApplied.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const res = await apiRequest("GET", url);
  return res.json();
}

export async function updateInsight(id: number, insight: Partial<Insight>) {
  const res = await apiRequest("PUT", `/api/insights/${id}`, insight);
  queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
  return res.json();
}

// AI Analysis API
export async function analyzeContent(data: {
  content: string;
  platform?: string;
  tags?: string[];
}) {
  const res = await apiRequest("POST", "/api/analyze-content", data);
  return res.json();
}

export async function getMonetizationSuggestions(data: {
  postHistory: string[];
  audienceDescription: string;
  platform: string;
}) {
  const res = await apiRequest("POST", "/api/monetization-suggestions", data);
  return res.json();
}

export async function getAnalyticsInsights(data: {
  engagementTrends: any[];
  contentTypes: any[];
  schedule: any[];
  platform: string;
}) {
  const res = await apiRequest("POST", "/api/analytics-insights", data);
  return res.json();
}

// Monetization API
export async function fetchMonetizationRecords(filters?: {
  platform?: Platform;
  source?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  let url = "/api/monetization";
  if (filters) {
    const params = new URLSearchParams();
    if (filters.platform) params.append("platform", filters.platform);
    if (filters.source) params.append("source", filters.source);
    if (filters.startDate) params.append("startDate", filters.startDate.toISOString());
    if (filters.endDate) params.append("endDate", filters.endDate.toISOString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  const res = await apiRequest("GET", url);
  return res.json();
}

export async function createMonetizationRecord(record: Partial<MonetizationRecord>) {
  const res = await apiRequest("POST", "/api/monetization", record);
  queryClient.invalidateQueries({ queryKey: ["/api/monetization"] });
  return res.json();
}

// Performance Report API
export async function generatePerformanceReport(data: {
  startDate: Date;
  endDate: Date;
  platforms?: Platform[];
}) {
  const payload = {
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    platforms: data.platforms
  };
  
  const res = await apiRequest("POST", "/api/performance-report", payload);
  return res.json();
}

// AI Engagement Model API
export async function trainEngagementModel(data: {
  lookbackPeriod?: number;
}) {
  const res = await apiRequest("POST", "/api/train-engagement-model", data);
  queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
  return res.json();
}

// Creator Collaboration API
export async function generateCreatorCollaborations(data: {
  platforms?: Platform[];
  minAudienceSize?: number;
  preferredCollabTypes?: string[];
  audienceOverlap?: number;
  creatorNiche?: string;
}) {
  const res = await apiRequest("POST", "/api/creator-collaborations", data);
  return res.json();
}
