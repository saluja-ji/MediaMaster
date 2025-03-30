import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { analyzeContent, createPost, fetchSocialAccounts } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { insertPostSchema, platformEnum } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle, Calendar, Clock, Image, Hash, Camera, LineChart, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa";
import { format } from "date-fns";

// Extended schema with validation
const postFormSchema = insertPostSchema.extend({
  scheduledAt: z.string().optional(),
  mediaFiles: z.array(z.string()).optional(),
  analyze: z.boolean().optional()
});

type PostFormValues = z.infer<typeof postFormSchema>;

export default function ContentEditor() {
  const { toast } = useToast();
  const [tab, setTab] = useState("editor");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Fetch social accounts
  const { data: socialAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/social-accounts"],
    queryFn: fetchSocialAccounts
  });
  
  // Set up form
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: "",
      platform: "twitter",
      status: "draft",
      tags: [],
      mediaUrls: [],
      scheduledAt: undefined,
      analyze: true
    }
  });
  
  // For content character count
  const content = form.watch("content");
  const platform = form.watch("platform");
  
  // Character limits by platform
  const characterLimits: Record<string, number> = {
    twitter: 280,
    instagram: 2200,
    facebook: 63206,
    linkedin: 3000,
    tiktok: 2200,
    youtube: 5000
  };
  
  const currentLimit = characterLimits[platform] || 280;
  const characterCount = content.length;
  const isOverLimit = characterCount > currentLimit;
  
  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (data: PostFormValues) => {
      // Convert scheduledAt to ISO string if provided
      if (data.scheduledAt) {
        const scheduledDate = new Date(data.scheduledAt);
        return createPost({
          ...data,
          scheduledAt: scheduledDate.toISOString(),
          status: "scheduled"
        }, data.analyze);
      }
      
      return createPost(data, data.analyze);
    },
    onSuccess: () => {
      toast({
        title: "Post created successfully",
        description: form.getValues("status") === "scheduled" 
          ? "Your post has been scheduled" 
          : "Your post has been saved as a draft"
      });
      
      // Reset form
      form.reset();
      setAnalysisResult(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Analyze content
  const analyzeContentHandler = async () => {
    const content = form.getValues("content");
    const platform = form.getValues("platform");
    const tags = form.getValues("tags") || [];
    
    if (!content) {
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
        content,
        platform,
        tags
      });
      
      setAnalysisResult(result);
      setTab("analysis");
      
      toast({
        title: "Analysis complete",
        description: "Check out our AI recommendations"
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: "There was an error analyzing your content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Handle form submission
  const onSubmit = (data: PostFormValues) => {
    createPostMutation.mutate(data);
  };
  
  // Helper function to get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <FaTwitter className="text-blue-400 h-5 w-5" />;
      case 'instagram':
        return <FaInstagram className="text-pink-500 h-5 w-5" />;
      case 'facebook':
        return <FaFacebook className="text-blue-600 h-5 w-5" />;
      case 'linkedin':
        return <FaLinkedin className="text-blue-700 h-5 w-5" />;
      case 'tiktok':
        return <FaTiktok className="text-black h-5 w-5" />;
      case 'youtube':
        return <FaYoutube className="text-red-600 h-5 w-5" />;
      default:
        return <Sparkles className="text-gray-400 h-5 w-5" />;
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Content Editor</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Tabs value={tab} onValueChange={setTab}>
                <div className="flex justify-between items-center">
                  <CardTitle>Create New Post</CardTitle>
                  <TabsList>
                    <TabsTrigger value="editor">Editor</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="analysis" disabled={!analysisResult}>Analysis</TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </CardHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent>
                  <TabsContent value="editor" className="mt-0 space-y-4">
                    <FormField
                      control={form.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Platform</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select platform" />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Textarea
                                placeholder="What's on your mind?"
                                className="resize-none min-h-[200px]"
                                {...field}
                              />
                              <div className={`absolute bottom-2 right-2 text-xs ${
                                isOverLimit ? "text-red-500 font-semibold" : "text-gray-500"
                              }`}>
                                {characterCount}/{currentLimit}
                              </div>
                            </div>
                          </FormControl>
                          {isOverLimit && (
                            <FormMessage>
                              Content exceeds the maximum length for {platform}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => {
                          // In a real app, this would open a media selector
                          toast({
                            title: "Media selector",
                            description: "This would open a media selector in a real app"
                          });
                        }}
                      >
                        <Image className="h-4 w-4" />
                        Add Media
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => {
                          // In a real app, this would open a hashtag selector
                          toast({
                            title: "Hashtag selector",
                            description: "This would open a hashtag selector in a real app"
                          });
                        }}
                      >
                        <Hash className="h-4 w-4" />
                        Add Hashtags
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => {
                          // In a real app, this would open the camera
                          toast({
                            title: "Camera",
                            description: "This would open the camera in a real app"
                          });
                        }}
                      >
                        <Camera className="h-4 w-4" />
                        Take Photo
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="scheduledAt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Schedule</FormLabel>
                            <FormControl>
                              <div className="flex space-x-2">
                                <Input
                                  type="datetime-local"
                                  min={new Date().toISOString().slice(0, 16)}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Leave empty to save as draft
                            </FormDescription>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="analyze"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                AI Analysis
                              </FormLabel>
                              <FormDescription>
                                Analyze content for engagement and risks
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-0">
                    <div className="border rounded-lg p-4 max-w-md mx-auto">
                      <div className="flex items-center space-x-2 mb-3">
                        {getPlatformIcon(platform)}
                        <div>
                          <p className="text-sm font-semibold">Your Account</p>
                          <p className="text-xs text-gray-500">
                            {form.getValues("scheduledAt")
                              ? format(new Date(form.getValues("scheduledAt")), "MMM d, yyyy 'at' h:mm a")
                              : "Draft"}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-sm whitespace-pre-wrap mb-3">{content}</p>
                      
                      {/* This would display media previews in a real app */}
                      <div className="bg-gray-100 rounded-lg h-40 flex items-center justify-center text-gray-400">
                        <Camera className="h-6 w-6 mr-2" />
                        Media Preview
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analysis" className="mt-0">
                    {analysisResult ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg border p-4 text-center">
                            <LineChart className="h-8 w-8 mx-auto mb-2 text-primary-500" />
                            <p className="text-sm font-medium text-gray-500">Engagement Score</p>
                            <p className="text-2xl font-semibold mt-1">
                              {analysisResult.engagementScore}/100
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                              <div 
                                className="bg-primary-500 h-2.5 rounded-full" 
                                style={{ width: `${analysisResult.engagementScore}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg border p-4 text-center">
                            <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                            <p className="text-sm font-medium text-gray-500">Shadowban Risk</p>
                            <p className="text-2xl font-semibold mt-1">
                              {analysisResult.shadowbanRisk}/10
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  analysisResult.shadowbanRisk > 5 
                                    ? 'bg-red-500' 
                                    : analysisResult.shadowbanRisk > 3 
                                      ? 'bg-amber-500' 
                                      : 'bg-green-500'
                                }`}
                                style={{ width: `${analysisResult.shadowbanRisk * 10}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-lg border p-4 text-center">
                            <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                            <p className="text-sm font-medium text-gray-500">AI Recommendations</p>
                            <p className="text-2xl font-semibold mt-1">
                              {analysisResult.recommendations?.length || 0}
                            </p>
                          </div>
                        </div>
                        
                        {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
                          <div className="bg-white rounded-lg border p-4">
                            <h3 className="text-sm font-semibold mb-3">Recommendations</h3>
                            <ul className="list-disc pl-5 space-y-2">
                              {analysisResult.recommendations.map((rec: string, i: number) => (
                                <li key={i} className="text-sm text-gray-700">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {analysisResult.risks && analysisResult.risks.length > 0 && (
                          <div className="bg-white rounded-lg border p-4 border-amber-200 bg-amber-50">
                            <h3 className="text-sm font-semibold mb-3 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                              Potential Risks
                            </h3>
                            <ul className="list-disc pl-5 space-y-2">
                              {analysisResult.risks.map((risk: string, i: number) => (
                                <li key={i} className="text-sm text-gray-700">{risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {analysisResult.optimizedContent && (
                          <div className="bg-white rounded-lg border p-4 border-green-200 bg-green-50">
                            <h3 className="text-sm font-semibold mb-3 flex items-center">
                              <Sparkles className="h-4 w-4 mr-2 text-green-500" />
                              AI Optimized Version
                            </h3>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {analysisResult.optimizedContent}
                            </p>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="mt-3"
                              onClick={() => {
                                form.setValue("content", analysisResult.optimizedContent);
                                setTab("editor");
                                toast({
                                  title: "Content updated",
                                  description: "AI optimized content has been applied"
                                });
                              }}
                            >
                              Apply Optimized Version
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto" />
                        <p className="mt-4 text-gray-500">No analysis available</p>
                        <p className="text-sm text-gray-400">Analyze your content to see AI recommendations</p>
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={analyzeContentHandler}
                    disabled={!content || analyzing || isOverLimit}
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Analyze Content
                      </>
                    )}
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      variant="outline"
                      onClick={() => {
                        // Set to draft before submitting
                        form.setValue("status", "draft");
                      }}
                      disabled={createPostMutation.isPending || isOverLimit}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Save as Draft
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={
                        !form.getValues("scheduledAt") || 
                        createPostMutation.isPending || 
                        isOverLimit
                      }
                    >
                      {createPostMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Schedule Post
                        </>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base">Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : socialAccounts && socialAccounts.length > 0 ? (
                <div className="space-y-3">
                  {socialAccounts.map((account: any) => (
                    <div key={account.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {getPlatformIcon(account.platform)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">
                            {account.username}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {account.platform}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={account.isActive ? "default" : "outline"}
                        className={account.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                      >
                        {account.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No accounts connected</p>
                  <Button variant="link" className="mt-2 text-sm">
                    Connect an account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="flex items-center mb-1">
                    <FaTwitter className="text-blue-400 mr-2" />
                    <p className="font-medium">Twitter</p>
                  </div>
                  <ul className="list-disc pl-5 text-gray-600 text-xs space-y-1">
                    <li>280 character limit</li>
                    <li>Up to 4 images, 1 GIF, or 1 video</li>
                    <li>Best times to post: 8 AM, 12 PM, 7 PM</li>
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <FaInstagram className="text-pink-500 mr-2" />
                    <p className="font-medium">Instagram</p>
                  </div>
                  <ul className="list-disc pl-5 text-gray-600 text-xs space-y-1">
                    <li>2,200 character limit for captions</li>
                    <li>Up to 10 images or videos per post</li>
                    <li>Best times to post: 11 AM, 2 PM, 5 PM</li>
                  </ul>
                </div>
                
                <div>
                  <div className="flex items-center mb-1">
                    <FaFacebook className="text-blue-600 mr-2" />
                    <p className="font-medium">Facebook</p>
                  </div>
                  <ul className="list-disc pl-5 text-gray-600 text-xs space-y-1">
                    <li>63,206 character limit</li>
                    <li>Up to 10 images or videos per post</li>
                    <li>Best times to post: 9 AM, 1 PM, 3 PM</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
