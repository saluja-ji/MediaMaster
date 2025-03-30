import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "@/components/dashboard/StatCard";
import AIInsightPanel from "@/components/dashboard/AIInsightPanel";
import UpcomingPostsPanel from "@/components/dashboard/UpcomingPostsPanel";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import AutoEngageActivity from "@/components/dashboard/AutoEngageActivity";
import MonetizationPanel from "@/components/dashboard/MonetizationPanel";
import ROIBreakdownPanel from "@/components/dashboard/ROIBreakdownPanel";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  fetchDashboardStats, 
  fetchScheduledPosts, 
  fetchEngageActivities,
  fetchMonetizationSummary,
  fetchPlatformROI,
  fetchInsights
} from "@/lib/api";
import { Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Post, EngageActivity } from "@shared/schema";

// Sample performance data for the chart
const samplePerformanceData = [
  { name: "Mon", likes: 420, comments: 120, shares: 45 },
  { name: "Tue", likes: 380, comments: 150, shares: 60 },
  { name: "Wed", likes: 510, comments: 180, shares: 75 },
  { name: "Thu", likes: 470, comments: 160, shares: 65 },
  { name: "Fri", likes: 580, comments: 210, shares: 90 },
  { name: "Sat", likes: 620, comments: 240, shares: 105 },
  { name: "Sun", likes: 560, comments: 190, shares: 80 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [chartPeriod, setChartPeriod] = useState<"7days" | "30days" | "90days">("7days");
  
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: fetchDashboardStats
  });
  
  // Fetch scheduled posts
  const { data: scheduledPostsData, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts/scheduled"],
    queryFn: fetchScheduledPosts
  });
  
  // Fetch engage activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/engage-activities"],
    queryFn: () => fetchEngageActivities({ limit: 3 })
  });
  
  // Fetch monetization summary
  const { data: monetizationData, isLoading: monetizationLoading } = useQuery({
    queryKey: ["/api/dashboard/monetization"],
    queryFn: fetchMonetizationSummary
  });
  
  // Fetch platform ROI
  const { data: platformROI, isLoading: roiLoading } = useQuery({
    queryKey: ["/api/dashboard/platform-roi"],
    queryFn: fetchPlatformROI
  });

  // Format scheduled posts for display
  const scheduledPosts = scheduledPostsData ? scheduledPostsData.map((post: Post) => ({
    ...post,
    formattedTime: post.scheduledAt ? formatPostTime(post.scheduledAt) : "Draft"
  })).slice(0, 3) : [];
  
  // Format engage activities for display
  const engageActivities = activitiesData ? activitiesData.map((activity: EngageActivity) => ({
    ...activity,
    timeSince: activity.performedAt ? formatDistanceToNow(new Date(activity.performedAt), { addSuffix: true }) : "recently"
  })).slice(0, 3) : [];

  // AI insights
  const mockInsights = [
    {
      id: "1",
      type: "engagement" as const,
      title: "Engagement Opportunity",
      description: "Posts with images of your product in outdoor settings receive 43% higher engagement than indoor shots. Try scheduling more outdoor content.",
      actions: [
        { label: "Apply to Calendar", primary: true, onClick: () => toast({ title: "Applied to calendar", description: "Your content calendar has been updated" }) },
        { label: "Dismiss", onClick: () => toast({ title: "Insight dismissed" }) }
      ]
    },
    {
      id: "2",
      type: "shadowban" as const,
      title: "Shadowban Risk Detected",
      description: "Your scheduled post for tomorrow (9:00 AM) contains hashtags that were recently flagged on Instagram. We recommend removing #travel and #vacation.",
      actions: [
        { label: "Review Post", primary: true, onClick: () => toast({ title: "Reviewing post", description: "Opening post editor" }) },
        { label: "Ignore", onClick: () => toast({ title: "Risk ignored" }) }
      ]
    },
    {
      id: "3",
      type: "monetization" as const,
      title: "Monetization Opportunity",
      description: "Based on your audience demographics, our AI suggests collaboration with Brand X (fitness products). Estimated revenue: $500-750 per sponsored post.",
      actions: [
        { label: "Explore Opportunity", primary: true, onClick: () => toast({ title: "Exploring opportunity", description: "Opening monetization details" }) },
        { label: "Save for Later", onClick: () => toast({ title: "Saved for later" }) }
      ]
    }
  ];

  function formatPostTime(dateString: string | Date) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "EEE, h:mm a");
    }
  }

  const handlePeriodChange = (period: "7days" | "30days" | "90days") => {
    setChartPeriod(period);
    // In a real app, this would trigger a new data fetch
  };

  const handleEditPost = (postId: number) => {
    toast({
      title: "Edit Post",
      description: `Opening editor for post #${postId}`
    });
    // In a real app, this would navigate to the editor with the post loaded
  };

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.fullName || "Alex"}!</h1>
        <p className="mt-1 text-sm text-gray-600">Here's what's happening with your social media channels today.</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Followers"
          value={statsLoading ? "-" : stats?.totalFollowers.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          change={{ value: 2.5, type: "increase", label: "vs last week" }}
        />
        
        <StatCard
          title="Engagement Rate"
          value={statsLoading ? "-" : `${stats?.engagementRate}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          change={{ value: 0.8, type: "increase", label: "vs last week" }}
        />
        
        <StatCard
          title="Revenue Generated"
          value={statsLoading ? "-" : `$${stats?.revenueGenerated}`}
          icon={<DollarSign className="h-5 w-5" />}
          change={{ value: 4.1, type: "decrease", label: "vs last week" }}
        />
        
        <StatCard
          title="Scheduled Posts"
          value={statsLoading ? "-" : stats?.scheduledPosts}
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>
      
      {/* AI Insights & Content Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <AIInsightPanel insights={mockInsights} loading={false} lastUpdated="3h ago" />
        </div>
        
        <div>
          <UpcomingPostsPanel 
            posts={scheduledPosts} 
            loading={postsLoading} 
            onEditPost={handleEditPost}
          />
        </div>
      </div>
      
      {/* Analytics & Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <PerformanceChart 
            data={samplePerformanceData} 
            loading={false} 
            period={chartPeriod}
            onPeriodChange={handlePeriodChange}
          />
        </div>
        
        <div>
          <AutoEngageActivity 
            activities={engageActivities} 
            loading={activitiesLoading} 
            isActive={true}
          />
        </div>
      </div>
      
      {/* Monetization & ROI Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonetizationPanel 
            data={monetizationData} 
            loading={monetizationLoading} 
          />
        </div>
        
        <div>
          <ROIBreakdownPanel 
            data={platformROI} 
            loading={roiLoading}
          />
        </div>
      </div>
    </div>
  );
}
