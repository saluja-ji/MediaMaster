import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, MessageSquare, Heart, UserPlus, Clock } from "lucide-react";
import { Link } from "wouter";
import { EngageActivity } from "@shared/schema";
import { FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";

interface AutoEngageActivityProps {
  activities: Array<EngageActivity & { 
    timeSince?: string;
  }>;
  loading?: boolean;
  isActive?: boolean;
}

export default function AutoEngageActivity({ 
  activities = [], 
  loading = false,
  isActive = true
}: AutoEngageActivityProps) {
  function getActivityIcon(type: string) {
    switch (type.toLowerCase()) {
      case 'reply':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
            <MessageSquare className="h-4 w-4" />
          </div>
        );
      case 'like':
        return (
          <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
            <Heart className="h-4 w-4" />
          </div>
        );
      case 'follow':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
            <UserPlus className="h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <Bot className="h-4 w-4" />
          </div>
        );
    }
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="px-5 py-4 border-b border-gray-200 flex flex-row justify-between items-center space-y-0">
        <CardTitle className="font-semibold text-gray-800 flex items-center">
          <Bot className="text-secondary-500 mr-2 h-5 w-5" />
          Auto-Engage Activity
        </CardTitle>
        <div>
          <Badge
            variant="outline"
            className={`${
              isActive
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">No recent activities</p>
            <p className="text-sm text-gray-400">Configure Auto-Engage to start automating interactions</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">AI Assistant</span> {getActivityDescription(activity)}
                  </p>
                  <div className="mt-1 text-xs text-gray-500 flex items-center">
                    <Clock className="mr-1 h-3 w-3" /> {activity.timeSince || "recently"}
                  </div>
                  {activity.content && (
                    <div className="mt-2 p-2.5 rounded-lg bg-gray-50 text-sm text-gray-700">
                      "{activity.content}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <CardFooter className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
        <Link href="/auto-engage">
          <Button variant="link" className="text-sm text-gray-600 font-medium hover:text-gray-700">
            Configure Auto-Engage
          </Button>
        </Link>
        <Link href="/auto-engage">
          <Button variant="link" className="text-sm text-primary-600 font-medium hover:text-primary-700">
            View All Activity
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function getActivityDescription(activity: EngageActivity) {
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
}
