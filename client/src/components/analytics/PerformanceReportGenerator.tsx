import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Separator
} from '../ui/index';
import { Platform } from '@shared/schema';
import { generatePerformanceReport } from '../../lib/api';
import { queryClient } from '../../lib/queryClient';
import { CalendarIcon, LineChart, BarChart, PieChart, TrendingUp, TrendingDown, Star, Download } from 'lucide-react';

// Platforms available for selection
const PLATFORM_OPTIONS: Platform[] = [
  'instagram',
  'twitter',
  'facebook',
  'linkedin',
  'tiktok',
  'youtube',
  'pinterest',
  'snapchat',
  'threads',
  'reddit',
  'medium'
];

interface ReportTimeframe {
  label: string;
  value: number; // Days to look back
}

const TIMEFRAME_OPTIONS: ReportTimeframe[] = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Year to date', value: 365 }
];

interface PerformanceReportData {
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

export const PerformanceReportGenerator: React.FC = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [timeframe, setTimeframe] = useState<number>(30);
  
  // Query for the generated report
  const { data: report, isLoading: isReportLoading } = useQuery<PerformanceReportData>({
    queryKey: ['/api/performance-report'],
    enabled: false
  });
  
  // Mutation for generating the report
  const generateReportMutation = useMutation({
    mutationFn: (data: { startDate: Date, endDate: Date, platforms?: Platform[] }) => 
      generatePerformanceReport(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/performance-report'], data);
    }
  });
  
  const handleGenerateReport = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeframe);
    
    generateReportMutation.mutate({
      startDate,
      endDate,
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined
    });
  };
  
  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };
  
  const formatPlatformName = (platform: string): string => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Report Generator</CardTitle>
          <CardDescription>Generate comprehensive one-click social media performance reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Platforms to include</h3>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map(platform => (
                <Badge
                  key={platform}
                  variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => togglePlatform(platform)}
                >
                  {formatPlatformName(platform)}
                </Badge>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Time period</h3>
            <Select 
              value={timeframe.toString()} 
              onValueChange={(val) => setTimeframe(parseInt(val))}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAME_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateReport}
            disabled={generateReportMutation.isPending}
            className="w-full sm:w-auto"
          >
            {generateReportMutation.isPending ? "Generating Report..." : "Generate Performance Report"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Loading state */}
      {generateReportMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-sm text-muted-foreground">
                Analyzing performance data across all platforms and generating insights...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Error state */}
      {generateReportMutation.isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive p-4">
              <p className="font-medium">Unable to generate performance report</p>
              <p className="text-sm mt-1">Please try again or adjust your parameters</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Report display */}
      {report && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Performance Report</h2>
            <Button variant="outline" size="sm" className="flex gap-2">
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
          
          {/* Summary card */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Generated on {report.reportDate}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-1 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Overall Score</p>
                  <p className="text-2xl font-bold">{report.summary.overallScore}/100</p>
                </div>
                <div className="space-y-1 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Top Platform</p>
                  <p className="text-xl font-bold">{formatPlatformName(report.summary.topPerformingPlatform)}</p>
                </div>
                <div className="space-y-1 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Engagement</p>
                  <p className="text-2xl font-bold">{formatNumber(report.summary.totalEngagement)}</p>
                </div>
                <div className="space-y-1 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Audience Growth</p>
                  <p className="text-2xl font-bold">+{report.summary.audienceGrowth}%</p>
                </div>
                <div className="space-y-1 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Conversion Rate</p>
                  <p className="text-2xl font-bold">{report.summary.conversionRate}%</p>
                </div>
                <div className="space-y-1 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(report.summary.revenueGenerated)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Platform Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>How each platform is performing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {report.platformBreakdown.map((platform, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{formatPlatformName(platform.platform)}</h3>
                      <Badge variant={platform.score > 75 ? "success" : platform.score > 50 ? "default" : "outline"}>
                        {platform.score}/100
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Engagement</p>
                      </div>
                      <p className="text-2xl font-bold">{formatNumber(platform.engagement)}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Growth</p>
                      </div>
                      <p className="text-2xl font-bold">+{platform.growth}%</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm font-medium">Revenue</p>
                      </div>
                      <p className="text-2xl font-bold">{formatCurrency(platform.revenue)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 p-4 bg-muted rounded-md">
                    <p className="text-sm font-medium">Top Performing Post</p>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{platform.topPost.date}</p>
                    </div>
                    <p className="text-sm">{platform.topPost.content}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <p className="text-sm font-medium">{formatNumber(platform.topPost.engagement)} engagements</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Recommendations</p>
                    <ul className="space-y-1">
                      {platform.recommendations.map((recommendation, i) => (
                        <li key={i} className="text-sm flex gap-2 items-start">
                          <div className="bg-primary h-1.5 w-1.5 rounded-full mt-1.5"></div>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {index < report.platformBreakdown.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Insights & Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Important patterns in your performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.insights.map((insight, i) => (
                    <li key={i} className="pl-4 border-l-2 border-primary text-sm">
                      {insight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Where your content is gaining or losing traction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium">Improving Areas</p>
                  </div>
                  <ul className="space-y-1">
                    {report.trends.improving.map((trend, i) => (
                      <li key={i} className="text-sm pl-4 border-l-2 border-green-500">
                        {trend}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-medium">Declining Areas</p>
                  </div>
                  <ul className="space-y-1">
                    {report.trends.declining.map((trend, i) => (
                      <li key={i} className="text-sm pl-4 border-l-2 border-red-500">
                        {trend}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-medium">Opportunities</p>
                  </div>
                  <ul className="space-y-1">
                    {report.trends.opportunities.map((opportunity, i) => (
                      <li key={i} className="text-sm pl-4 border-l-2 border-amber-500">
                        {opportunity}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Recommended Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Next Steps</CardTitle>
              <CardDescription>Priority actions based on your performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.nextSteps.map((step, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-muted rounded-md">
                    <div className="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Apply Recommendations to Content Calendar</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};