import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/lib/api";
import { Post } from "@shared/schema";
import { Calendar, Clock, CheckCircle, AlertCircle, Eye, Edit, Trash2, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa";
import { Link } from "wouter";

export default function ContentCalendar() {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState("month");
  const [platform, setPlatform] = useState("all");
  
  // Get the start and end of the current month for filtering
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);
  
  // Fetch posts for the current month
  const { data: postsData, isLoading } = useQuery({
    queryKey: ["/api/posts", { startDate: startDate.toISOString(), endDate: endDate.toISOString(), platform: platform !== "all" ? platform : undefined }],
    queryFn: () => fetchPosts({
      startDate,
      endDate,
      platform: platform !== "all" ? platform as any : undefined
    }),
    staleTime: 60000 // 1 minute
  });

  const posts = postsData || [];
  
  // Generate days for the month view
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  const handleViewChange = (value: string) => {
    setView(value);
  };
  
  const handlePlatformChange = (value: string) => {
    setPlatform(value);
  };
  
  const handleCreatePost = () => {
    toast({
      title: "Create New Post",
      description: "Opening content editor"
    });
  };
  
  const handleEditPost = (post: Post) => {
    toast({
      title: "Edit Post",
      description: `Editing post for ${post.platform}`
    });
  };
  
  const handleDeletePost = (post: Post) => {
    toast({
      title: "Delete Post",
      description: `Deleting post for ${post.platform}`,
      variant: "destructive"
    });
  };
  
  // Helper function to get post status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Published
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Scheduled
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Draft
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
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
        return <Calendar className="text-gray-400" />;
    }
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Content Calendar</h1>
        <Link href="/editor">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Post
          </Button>
        </Link>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handlePreviousMonth}>
                <span className="sr-only">Previous month</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button variant="outline" onClick={handleNextMonth}>
                <span className="sr-only">Next month</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={platform} onValueChange={handlePlatformChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="w-[200px]">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={view} onValueChange={handleViewChange} className="w-full">
            <TabsContent value="month" className="mt-0">
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                  <div key={day} className="bg-gray-50 p-2 font-medium text-sm text-gray-700">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-0.5 mt-0.5">
                {days.map((day, i) => {
                  // Get posts for this day
                  const dayPosts = posts.filter(post => 
                    post.scheduledAt && isSameDay(new Date(post.scheduledAt), day)
                  );
                  
                  return (
                    <div 
                      key={i} 
                      className="min-h-[120px] bg-white border border-gray-200 p-1.5 text-sm"
                    >
                      <div className="text-right text-gray-600 text-xs mb-1">
                        {format(day, 'd')}
                      </div>
                      
                      <div className="space-y-1 overflow-y-auto max-h-[90px]">
                        {isLoading ? (
                          <div className="text-center py-2">
                            <div className="animate-spin h-4 w-4 border-2 border-primary-500 rounded-full border-t-transparent mx-auto"></div>
                          </div>
                        ) : dayPosts.length > 0 ? (
                          dayPosts.map(post => (
                            <div 
                              key={post.id} 
                              className="p-1 bg-gray-50 rounded border border-gray-200 text-xs flex items-center space-x-1 cursor-pointer hover:bg-gray-100"
                              onClick={() => handleEditPost(post)}
                            >
                              <span className="flex-shrink-0">
                                {getPlatformIcon(post.platform)}
                              </span>
                              <span className="truncate flex-1">
                                {post.content.substring(0, 15)}
                                {post.content.length > 15 ? '...' : ''}
                              </span>
                            </div>
                          ))
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="mt-0">
              <div className="divide-y divide-gray-200">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading content calendar...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-4 text-gray-500">No posts scheduled for this period</p>
                    <p className="text-sm text-gray-400">Create your first post to see it here</p>
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="py-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {getPlatformIcon(post.platform)}
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {post.scheduledAt 
                                  ? format(new Date(post.scheduledAt), "MMM d, yyyy 'at' h:mm a") 
                                  : "Draft"}
                              </p>
                            </div>
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="mt-2 text-sm text-gray-600">
                            {post.content}
                          </p>
                          <div className="mt-3 flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditPost(post)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                              onClick={() => handleDeletePost(post)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
