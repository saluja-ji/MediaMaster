import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEngageActivities, createEngageActivity, generateAutoReply, fetchSocialAccounts } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Robot, 
  MessageSquare, 
  Heart, 
  UserPlus, 
  Settings, 
  Clock, 
  Filter, 
  RefreshCw, 
  Zap, 
  MessageCircle,
  ThumbsUp,
  Users,
  ArrowRight,
  Bell,
  Search,
  Loader2
} from "lucide-react";
import { 
  FaTwitter, 
  FaInstagram, 
  FaFacebook, 
  FaLinkedin, 
  FaTiktok, 
  FaYoutube 
} from "react-icons/fa";
import { format, formatDistanceToNow } from "date-fns";
import { EngageActivity } from "@shared/schema";

export default function AutoEngage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("activities");
  const [commentText, setCommentText] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [accountName, setAccountName] = useState("your_account");
  const [generatingReply, setGeneratingReply] = useState(false);
  const [autoReply, setAutoReply] = useState("");

  // Fetch engage activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ["/api/engage-activities"],
    queryFn: () => fetchEngageActivities()
  });

  // Format engage activities for display
  const engageActivities = activitiesData ? activitiesData.map((activity: EngageActivity) => ({
    ...activity,
    timeSince: activity.performedAt ? formatDistanceToNow(new Date(activity.performedAt), { addSuffix: true }) : "recently"
  })) : [];

  // Fetch social accounts
  const { data: socialAccounts, isLoading: accountsLoading } = useQuery({
    queryKey: ["/api/social-accounts"],
    queryFn: () => fetchSocialAccounts()
  });

  // Generate auto-reply
  const handleGenerateReply = async () => {
    if (!commentText) {
      toast({
        title: "Comment text required",
        description: "Please enter a comment to generate a reply",
        variant: "destructive"
      });
      return;
    }

    setGeneratingReply(true);
    
    try {
      const result = await generateAutoReply({
        comment: commentText,
        platform,
        accountName,
        postTopic: "Lifestyle and product recommendations"
      });
      
      setAutoReply(result.reply);
      
      toast({
        title: "Reply generated",
        description: "AI has generated a response to the comment"
      });
    } catch (error) {
      toast({
        title: "Reply generation failed",
        description: "There was an error generating the auto-reply",
        variant: "destructive"
      });
    } finally {
      setGeneratingReply(false);
    }
  };

  // Helper function to get activity icon
  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'reply':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'like':
        return <Heart className="h-5 w-5 text-pink-500" />;
      case 'follow':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      default:
        return <Robot className="h-5 w-5 text-gray-500" />;
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
        return <MessageCircle className="text-gray-400" />;
    }
  };

  // Helper function to get activity description
  const getActivityDescription = (activity: EngageActivity & { timeSince?: string }) => {
    switch (activity.type.toLowerCase()) {
      case 'reply':
        return `replied to a comment on your ${activity.platform} post`;
      case 'like':
        return `liked ${activity.targetContent || "comments"} on your recent posts`;
      case 'follow':
        return `followed back ${activity.targetContent || "new followers"}`;
      default:
        return `performed ${activity.type} action on ${activity.platform}`;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Auto-Engage Assistant</h1>
          <p className="text-sm text-gray-600 mt-1">
            Automate interactions and keep your audience engaged
          </p>
        </div>
        <div>
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Recent Activities</span>
              <span className="sm:hidden">Activities</span>
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Reply Generator</span>
              <span className="sm:hidden">Replies</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Auto-Engage Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="activities">
          <Card>
            <CardHeader className="px-6 py-4 flex items-center justify-between space-y-0">
              <CardTitle className="text-xl font-semibold flex items-center">
                <Robot className="mr-2 h-5 w-5 text-primary-500" />
                Auto-Engage Activities
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {activitiesLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-4" />
                  <p className="text-gray-500">Loading auto-engage activities...</p>
                </div>
              ) : engageActivities.length > 0 ? (
                <div className="space-y-6">
                  {/* Activity Timeline */}
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                    <div className="space-y-6 relative">
                      {engageActivities.map((activity, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 z-10">
                            <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div className="ml-6 bg-white p-4 rounded-lg border border-gray-200 flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  AI Assistant {getActivityDescription(activity)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                  <Clock className="mr-1 h-3 w-3" /> {activity.timeSince}
                                  <span className="ml-2 flex items-center">
                                    {getPlatformIcon(activity.platform)}
                                    <span className="ml-1 capitalize">{activity.platform}</span>
                                  </span>
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs capitalize">
                                {activity.type}
                              </Badge>
                            </div>
                            
                            {activity.content && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                                "{activity.content}"
                              </div>
                            )}
                            
                            {activity.targetUsername && (
                              <div className="mt-3 text-xs text-gray-500">
                                <span className="font-medium">Target: </span>
                                @{activity.targetUsername}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Robot className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">No auto-engage activities yet</p>
                  <p className="text-sm text-gray-400 mt-1">Configure auto-engage to start automated interactions</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center w-full">
                <p className="text-sm text-gray-600">Showing recent activities</p>
                <Button variant="outline" size="sm">View All Activities</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="generator">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="text-primary-500 mr-2 h-5 w-5" />
                    AI Reply Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Platform</label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Account Name</label>
                    <Input
                      placeholder="Your account name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Comment to Reply To</label>
                    <Textarea
                      placeholder="Paste the comment you want to reply to..."
                      className="min-h-[100px] resize-none"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={handleGenerateReply}
                    disabled={!commentText || generatingReply}
                  >
                    {generatingReply ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Reply...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate AI Reply
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Generated Reply</CardTitle>
                </CardHeader>
                <CardContent>
                  {generatingReply ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-4" />
                      <p className="text-sm text-gray-500">Generating reply...</p>
                    </div>
                  ) : autoReply ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0">
                            {/* Account Image Placeholder */}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium">{accountName}</p>
                            <p className="text-sm mt-1">{autoReply}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" className="flex-1">Edit</Button>
                        <Button className="flex-1">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Use Reply
                        </Button>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium mb-2">Why this works:</h4>
                        <ul className="text-xs text-gray-600 space-y-1 pl-5 list-disc">
                          <li>Personalized and friendly tone</li>
                          <li>Encourages further engagement</li>
                          <li>Authentic voice that matches your brand</li>
                          <li>Optimized for the selected platform</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500">No reply generated yet</p>
                      <p className="text-sm text-gray-400 mt-1">Enter a comment and generate a reply</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="text-primary-500 mr-2 h-5 w-5" />
                Auto-Engage Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <ThumbsUp className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-medium">Like Comments</h3>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Automatically like comments on your posts to show engagement.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Like probability</p>
                      <p className="text-sm font-medium">80%</p>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full">
                      <div className="h-1.5 rounded-full bg-blue-500" style={{ width: '80%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Less frequent</span>
                      <span>More frequent</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-green-500 mr-2" />
                      <h3 className="font-medium">Auto-Reply</h3>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Automatically reply to comments using AI-generated responses.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Reply probability</p>
                      <p className="text-sm font-medium">60%</p>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full">
                      <div className="h-1.5 rounded-full bg-green-500" style={{ width: '60%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Less frequent</span>
                      <span>More frequent</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-purple-500 mr-2" />
                      <h3 className="font-medium">Follow Back</h3>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Automatically follow users who follow your account.
                  </p>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm">Account types to follow</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-gray-100">
                        Verified
                      </Badge>
                      <Badge variant="outline" className="bg-gray-100">
                        Non-private
                      </Badge>
                      <Badge variant="outline" className="bg-gray-100">
                        Similar niche
                      </Badge>
                      <Badge variant="outline" className="bg-gray-100">
                        Active users
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <ArrowRight className="h-5 w-5 text-amber-500 mr-2" />
                      <h3 className="font-medium">Pre-Post Engagement</h3>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Engage with similar content before posting to boost visibility.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Engagement count</p>
                      <p className="text-sm font-medium">10 interactions</p>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full">
                      <div className="h-1.5 rounded-full bg-amber-500" style={{ width: '50%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Fewer</span>
                      <span>More</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">Schedule Active Hours</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{day}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={i < 5 ? "bg-green-100 text-green-800" : "bg-gray-100"}>
                            {i < 5 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{i < 5 ? "9:00 AM - 6:00 PM" : "-"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">Blacklist</h3>
                <div className="border rounded-lg p-4">
                  <div className="flex mb-4">
                    <Input placeholder="Add keyword or account to blacklist" className="mr-2" />
                    <Button>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5">
                      spam
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </Button>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5">
                      competitor
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </Button>
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1 px-3 py-1.5">
                      @bad_actor
                      <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </Button>
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
