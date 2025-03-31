import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { generatePerformanceReport, fetchSocialAccounts } from "@/lib/api";
import { Platform } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, FileDown, BarChart2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { addDays, format, subDays, subMonths } from "date-fns";

// Helper function to convert platform name to icon
const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram':
      return '📸';
    case 'twitter':
    case 'x':
      return '🐦';
    case 'facebook':
      return '👍';
    case 'tiktok':
      return '🎵';
    case 'youtube':
      return '🎥';
    case 'linkedin':
      return '💼';
    case 'pinterest':
      return '📌';
    case 'snapchat':
      return '👻';
    case 'threads':
      return '🧵';
    default:
      return '🌐';
  }
};

export interface PerformanceReportProps {
  className?: string;
}

export function PerformanceReportGenerator({ className }: PerformanceReportProps) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  
  // Fetch accounts to get available platforms
  const { data: accounts = [] } = useQuery({
    queryKey: ['/api/social-accounts'],
    queryFn: fetchSocialAccounts
  });
  
  // Get unique platforms from accounts
  const availablePlatforms = [...new Set(accounts.map(account => account.platform))];
  
  // Toggle platform selection
  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };
  
  // Generate report mutation
  const generateReport = useMutation({
    mutationFn: generatePerformanceReport,
    onSuccess: (data) => {
      setReportData(data);
      toast({
        title: "Report Generated",
        description: "Your performance report has been successfully generated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate performance report. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle generate report
  const handleGenerateReport = () => {
    generateReport.mutate({
      startDate,
      endDate,
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined
    });
  };
  
  // Handle download report as JSON
  const handleDownloadReport = () => {
    if (!reportData) return;
    
    const reportBlob = new Blob(
      [JSON.stringify(reportData, null, 2)],
      { type: 'application/json' }
    );
    
    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `social-media-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className={className}>
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">One-Click Performance Report</CardTitle>
            <CardDescription>
              Generate a comprehensive social media performance report for your selected date range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <DatePicker
                    id="start-date"
                    date={startDate}
                    onSelect={setStartDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <DatePicker
                    id="end-date"
                    date={endDate}
                    onSelect={setEndDate}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Platforms to Include</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {availablePlatforms.map(platform => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={`platform-${platform}`}
                        checked={selectedPlatforms.includes(platform as Platform)}
                        onCheckedChange={() => togglePlatform(platform as Platform)}
                      />
                      <label
                        htmlFor={`platform-${platform}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {getPlatformIcon(platform)} {platform}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => {
                setStartDate(subMonths(new Date(), 1));
                setEndDate(new Date());
                setSelectedPlatforms([]);
              }}
            >
              Reset
            </Button>
            <Button 
              onClick={handleGenerateReport}
              disabled={generateReport.isPending}
            >
              {generateReport.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {reportData && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Performance Report</CardTitle>
                <CardDescription>
                  Report generated on {format(new Date(reportData.reportDate), 'MMM d, yyyy')}
                  {' '} for data from {format(startDate, 'MMM d, yyyy')} to {format(endDate, 'MMM d, yyyy')}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                <FileDown className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Summary Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card rounded-lg p-4 border">
                    <h4 className="text-sm font-medium text-muted-foreground">Overall Score</h4>
                    <div className="mt-2 flex items-center">
                      <span className="text-3xl font-bold">{reportData.summary.overallScore}</span>
                      <span className="text-sm text-muted-foreground ml-2">/100</span>
                    </div>
                    <Progress 
                      value={reportData.summary.overallScore} 
                      className="mt-2"
                    />
                  </div>
                  <div className="bg-card rounded-lg p-4 border">
                    <h4 className="text-sm font-medium text-muted-foreground">Top Platform</h4>
                    <div className="mt-2 flex items-center">
                      <span className="text-3xl font-bold">{getPlatformIcon(reportData.summary.topPerformingPlatform)}</span>
                      <span className="text-xl ml-2">{reportData.summary.topPerformingPlatform}</span>
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-4 border">
                    <h4 className="text-sm font-medium text-muted-foreground">Total Engagement</h4>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{reportData.summary.totalEngagement.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Platform Breakdown */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Platform Performance</h3>
                <div className="space-y-4">
                  {reportData.platformBreakdown.map((platform: any) => (
                    <div key={platform.platform} className="bg-card rounded-lg p-4 border">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium flex items-center">
                          <span className="mr-2">{getPlatformIcon(platform.platform)}</span>
                          {platform.platform}
                        </h4>
                        <Badge variant={platform.score > 70 ? "success" : platform.score > 40 ? "default" : "destructive"}>
                          Score: {platform.score}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Engagement</p>
                          <p className="font-medium">{platform.engagement.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Growth</p>
                          <p className="font-medium">
                            {platform.growth >= 0 ? '+' : ''}{platform.growth}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="font-medium">${platform.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      {platform.topPost.content !== "N/A" && (
                        <div className="mt-2 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">Top Post ({platform.topPost.date})</p>
                          <p className="text-sm mt-1">{platform.topPost.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {platform.topPost.engagement.toLocaleString()} engagement
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Recommendations:</p>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          {platform.recommendations.map((rec: string, i: number) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Insights */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Key Insights</h3>
                <ul className="space-y-2">
                  {reportData.insights.map((insight: string, i: number) => (
                    <li key={i} className="bg-card rounded-lg p-3 border">
                      <div className="flex">
                        <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary h-6 w-6 text-sm mr-3">
                          {i + 1}
                        </span>
                        <p>{insight}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Trends */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Observed Trends</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card rounded-lg p-4 border">
                    <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                      Improving Metrics
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {reportData.trends.improving.length > 0 ? (
                        reportData.trends.improving.map((trend: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="text-green-500 mr-2">↑</span>
                            {trend}
                          </li>
                        ))
                      ) : (
                        <li className="text-muted-foreground italic">No improving metrics identified</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="bg-card rounded-lg p-4 border">
                    <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">
                      Declining Metrics
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {reportData.trends.declining.length > 0 ? (
                        reportData.trends.declining.map((trend: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="text-red-500 mr-2">↓</span>
                            {trend}
                          </li>
                        ))
                      ) : (
                        <li className="text-muted-foreground italic">No declining metrics identified</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="bg-card rounded-lg p-4 border">
                    <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                      Opportunities
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {reportData.trends.opportunities.length > 0 ? (
                        reportData.trends.opportunities.map((trend: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <span className="text-blue-500 mr-2">→</span>
                            {trend}
                          </li>
                        ))
                      ) : (
                        <li className="text-muted-foreground italic">No opportunities identified</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Next Steps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recommended Next Steps</h3>
                <div className="bg-card rounded-lg p-4 border">
                  <ol className="space-y-2 list-decimal list-inside">
                    {reportData.nextSteps.map((step: string, i: number) => (
                      <li key={i} className="text-sm">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}