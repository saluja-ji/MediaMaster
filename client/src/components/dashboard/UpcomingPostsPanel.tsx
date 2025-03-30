import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, PlusCircle, Edit, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Post } from "@shared/schema";
import { Link } from "wouter";
import { FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";

interface UpcomingPostsPanelProps {
  posts: Array<Post & { formattedTime?: string }>;
  loading?: boolean;
  onEditPost?: (postId: number) => void;
}

export default function UpcomingPostsPanel({ 
  posts = [], 
  loading = false,
  onEditPost
}: UpcomingPostsPanelProps) {
  function getPlatformIcon(platform: string) {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <FaTwitter className="h-4 w-4" />
          </div>
        );
      case 'instagram':
        return (
          <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
            <FaInstagram className="h-4 w-4" />
          </div>
        );
      case 'facebook':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <FaFacebook className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <Calendar className="h-4 w-4" />
          </div>
        );
    }
  }

  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case 'ready':
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Ready
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
      case 'needs_review':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Needs Review
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 flex items-center gap-1">
            {status}
          </Badge>
        );
    }
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="px-5 py-4 border-b border-gray-200 flex flex-row justify-between items-center space-y-0">
        <CardTitle className="font-semibold text-gray-800 flex items-center">
          <Calendar className="text-secondary-500 mr-2 h-5 w-5" />
          Upcoming Posts
        </CardTitle>
        <Link href="/editor">
          <Button variant="ghost" size="sm" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
            <PlusCircle className="mr-1 h-4 w-4" />
            New
          </Button>
        </Link>
      </CardHeader>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">No upcoming posts</p>
            <p className="text-sm text-gray-400">Create new content to schedule</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  {getPlatformIcon(post.platform)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-800">
                      {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                    </p>
                    <p className="text-xs text-gray-500">{post.formattedTime || "Scheduled"}</p>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{post.content}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    {getStatusBadge(post.status)}
                    <div className="flex-1"></div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                      onClick={() => onEditPost && onEditPost(post.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <CardFooter className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-center">
        <Link href="/calendar">
          <Button variant="link" className="text-sm text-primary-600 font-medium hover:text-primary-700">
            View Content Calendar
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
