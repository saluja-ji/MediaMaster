import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { analyzeContent, getMonetizationSuggestions } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, LineChart, ShieldCheck, DollarSign, Sparkles, BarChart, AlertTriangle, User, RefreshCw, Zap, Loader2 } from "lucide-react";
import { platformEnum } from "@shared/schema";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa";

export default function AIAssistant() {
  const { toast } = useToast();
  const [tab, setTab] = useState("content-optimizer");
  const [contentToAnalyze, setContentToAnalyze] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [analyzing, setAnalyzing] = useState(false);
  const [contentAnalysisResult, setContentAnalysisResult] = useState<any>(null);
  
  const [audienceDescription, setAudienceDescription] = useState("");
  const [postHistory, setPostHistory] = useState("");
  const [monetizationPlatform, setMonetizationPlatform] = useState("instagram");
  const [generatingMonetization, setGeneratingMonetization] = useState(false);
  const [monetizationSuggestions, setMonetizationSuggestions] = useState<any>(null);
  
  // Analyze content handler
  const handleContentAnalysis = async () => {
    if (!contentToAnalyze) {
      toast({
        title: "Content required",
        description: "Please enter some content to analyze",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    try {
      const result = await analyzeContent({
        content: contentToAnalyze,
        platform: platform
      });
      
      setContentAnalysisResult(result);
      
      toast({
        title: "Analysis complete",
        description: "Content has been analyzed successfully"
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your content",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Generate monetization suggestions
  const handleMonetizationSuggestions = async () => {
    if (!audienceDescription || !postHistory) {
      toast({
        title: "Information required",
        description: "Please provide audience description and post history",
        variant: "destructive"
      });
      return;
    }
    
    setGeneratingMonetization(true);
    
    try {
      const result = await getMonetizationSuggestions({
        audienceDescription,
        postHistory: postHistory.split('\n').filter(line => line.trim() !== ''),
        platform: monetizationPlatform
      });
      
      setMonetizationSuggestions(result.suggestions);
      
      toast({
        title: "Suggestions generated",
        description: "Monetization suggestions have been generated successfully"
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating monetization suggestions",
        variant: "destructive"
      });
    } finally {
      setGeneratingMonetization(false);
    }
  };
  
  // Helper function to get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <FaTwitter className="text-blue-400" />;
      case 'instagram':
        return <FaInstagram className="text-pink-500" />;
      case 'facebook':
        return <FaFacebook className="text-blue-600" />;
      case 'linkedin':
        return <FaLinkedin className="text-blue-700" />;
      case 'tiktok':
        return <FaTiktok className="text-black" />;
      case 'youtube':
        return <FaYoutube className="text-red-600" />;
      default:
        return <Sparkles className="text-gray-400" />;
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Assistant</h1>
          <p className="text-sm text-gray-600 mt-1">
            Powered by advanced AI to optimize your social media strategy
          </p>
        </div>
      </div>
      
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="content-optimizer" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Content Optimizer</span>
              <span className="sm:hidden">Optimizer</span>
            </TabsTrigger>
            <TabsTrigger value="monetization-advisor" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Monetization Advisor</span>
              <span className="sm:hidden">Monetize</span>
            </TabsTrigger>
            <TabsTrigger value="performance-insights" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span className="hidden sm:inline">Performance Insights</span>
              <span className="sm:hidden">Insights</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="content-optimizer" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="h-5 w-5 text-primary-500 mr-2" />
                    Content Analyzer & Optimizer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {platformEnum.options.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            <div className="flex items-center">
                              {getPlatformIcon(platform)}
                              <span className="ml-2 capitalize">{platform}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Enter your content to analyze..."
                      className="min-h-[200px] resize-none"
                      value={contentToAnalyze}
                      onChange={(e) => setContentToAnalyze(e.target.value)}
                    />
                    <p className="text-xs text-right text-gray-500">
                      {contentToAnalyze.length} characters
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={handleContentAnalysis}
                    disabled={!contentToAnalyze || analyzing}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Analyze Content
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyzing ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-4" />
                      <p className="text-sm text-gray-500">Analyzing your content...</p>
                    </div>
                  ) : contentAnalysisResult ? (
                    <>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Engagement Score</p>
                          <p className="text-2xl font-semibold">{contentAnalysisResult.engagementScore}/100</p>
                        </div>
                        <LineChart className="h-10 w-10 text-primary-500 opacity-70" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary-500 h-2.5 rounded-full" 
                          style={{ width: `${contentAnalysisResult.engagementScore}%` }}
                        ></div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Shadowban Risk</p>
                          <p className="text-2xl font-semibold">{contentAnalysisResult.shadowbanRisk}/10</p>
                        </div>
                        <ShieldCheck className="h-10 w-10 text-amber-500 opacity-70" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            contentAnalysisResult.shadowbanRisk > 5 
                              ? 'bg-red-500' 
                              : contentAnalysisResult.shadowbanRisk > 3 
                                ? 'bg-amber-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${contentAnalysisResult.shadowbanRisk * 10}%` }}
                        ></div>
                      </div>
                      
                      {contentAnalysisResult.recommendations && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium mb-2">Recommendations:</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {contentAnalysisResult.recommendations.map((rec: string, i: number) => (
                                <li key={i} className="text-sm text-gray-700">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      
                      {contentAnalysisResult.risks && contentAnalysisResult.risks.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" />
                              Risks:
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                              {contentAnalysisResult.risks.map((risk: string, i: number) => (
                                <li key={i} className="text-sm text-gray-700">{risk}</li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Brain className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-sm text-gray-500">Enter content and click analyze</p>
                      <p className="text-xs text-gray-400 mt-1">Results will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {contentAnalysisResult && contentAnalysisResult.optimizedContent && (
                <Card className="border-green-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <Zap className="h-5 w-5 text-green-500 mr-2" />
                      AI Optimized Version
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">
                      {contentAnalysisResult.optimizedContent}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      Use This Version
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="monetization-advisor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 text-primary-500 mr-2" />
                    Monetization Advisor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Platform</label>
                    <Select value={monetizationPlatform} onValueChange={setMonetizationPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {platformEnum.options.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            <div className="flex items-center">
                              {getPlatformIcon(platform)}
                              <span className="ml-2 capitalize">{platform}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Audience Description</label>
                    <Textarea
                      placeholder="Describe your audience demographics, interests, and behaviors..."
                      className="min-h-[100px] resize-none"
                      value={audienceDescription}
                      onChange={(e) => setAudienceDescription(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Example: "25-34 year old professionals interested in fitness, tech, and sustainable living."</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Recent Post Topics</label>
                    <Textarea
                      placeholder="List your recent post topics or content themes (one per line)..."
                      className="min-h-[100px] resize-none"
                      value={postHistory}
                      onChange={(e) => setPostHistory(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Example: "Workout routines, Healthy recipes, Tech reviews, Sustainable products"</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={handleMonetizationSuggestions}
                    disabled={!audienceDescription || !postHistory || generatingMonetization}
                  >
                    {generatingMonetization ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Suggestions...
                      </>
                    ) : (
                      <>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Generate Monetization Suggestions
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Monetization Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatingMonetization ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-4" />
                      <p className="text-sm text-gray-500">Generating suggestions...</p>
                    </div>
                  ) : monetizationSuggestions && monetizationSuggestions.length > 0 ? (
                    <div className="space-y-6">
                      {monetizationSuggestions.map((suggestion: any, index: number) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <Badge className="capitalize bg-primary-100 text-primary-800 hover:bg-primary-100">
                              {suggestion.type}
                            </Badge>
                            <Badge variant="outline">
                              {Math.round(suggestion.confidence * 100)}% Confidence
                            </Badge>
                          </div>
                          
                          <h3 className="text-sm font-semibold">{suggestion.partnerName}</h3>
                          <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                          
                          <div className="mt-3 bg-gray-50 p-2 rounded-md">
                            <p className="text-xs font-medium text-gray-700">Estimated Revenue</p>
                            <p className="text-sm font-semibold text-green-600">
                              ${suggestion.estimatedRevenue.min} - ${suggestion.estimatedRevenue.max}
                            </p>
                          </div>
                          
                          <Button variant="outline" size="sm" className="w-full mt-3">
                            Explore Opportunity
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-sm text-gray-500">No suggestions yet</p>
                      <p className="text-xs text-gray-400 mt-1">Fill out the form to generate monetization ideas</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="performance-insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 text-primary-500 mr-2" />
                AI-Powered Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-gray-500">Top Performing Content Type</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="bg-primary-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-primary-100 text-primary-800 hover:bg-primary-100">
                          Product Reviews
                        </Badge>
                        <span className="text-xs text-gray-500">Last 30 days</span>
                      </div>
                      <p className="text-sm">Posts featuring product reviews and tutorials generate 43% higher engagement than other content types.</p>
                      <Button variant="link" className="text-primary-600 p-0 h-auto text-xs mt-2">
                        View detailed analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-gray-500">Best Posting Time</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          8:00 PM - 9:00 PM
                        </Badge>
                        <span className="text-xs text-gray-500">Weekdays</span>
                      </div>
                      <p className="text-sm">Posts published between 8-9 PM on weekdays receive 27% more engagement than other times.</p>
                      <Button variant="link" className="text-blue-600 p-0 h-auto text-xs mt-2">
                        View timing analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-sm font-medium text-gray-500">Audience Growth</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-4 pb-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Growth Opportunity
                        </Badge>
                        <span className="text-xs text-gray-500">Strategy</span>
                      </div>
                      <p className="text-sm">Collaborating with creators in the fitness niche could increase follower growth by an estimated 15-20%.</p>
                      <Button variant="link" className="text-green-600 p-0 h-auto text-xs mt-2">
                        View growth strategies
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 border rounded-lg p-5 bg-amber-50 border-amber-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Content Gap Alert</h3>
                    <p className="mt-1 text-sm text-gray-700">Your content calendar shows a 5-day gap with no planned posts next week. This may impact your engagement metrics.</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-3 bg-white border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Schedule Content
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-4">AI-Generated Content Recommendations</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 text-primary-500 mr-3" />
                      <p className="text-sm">"10 Sustainable Products That Are Actually Worth Your Money"</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 text-primary-500 mr-3" />
                      <p className="text-sm">"Morning Routine: How I Stay Productive Working From Home"</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                    <div className="flex items-center">
                      <Sparkles className="h-5 w-5 text-primary-500 mr-3" />
                      <p className="text-sm">"5 Tech Gadgets That Changed How I Work (2023 Edition)"</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
