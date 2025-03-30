import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics, fetchSocialAccounts } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageSquare, 
  RefreshCw, 
  Download, 
  Filter,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  Zap
} from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa";
import { format, subDays, subMonths } from "date-fns";

// Sample data for the analytics charts
const engagementData = [
  { name: "Jan 1", likes: 125, comments: 85, shares: 36 },
  { name: "Jan 2", likes: 157, comments: 92, shares: 42 },
  { name: "Jan 3", likes: 134, comments: 76, shares: 28 },
  { name: "Jan 4", likes: 187, comments: 110, shares: 49 },
  { name: "Jan 5", likes: 201, comments: 123, shares: 58 },
  { name: "Jan 6", likes: 176, comments: 98, shares: 41 },
  { name: "Jan 7", likes: 220, comments: 142, shares: 63 },
];

const followerGrowthData = [
  { name: "Week 1", value: 1240 },
  { name: "Week 2", value: 1578 },
  { name: "Week 3", value: 1892 },
  { name: "Week 4", value: 2390 },
  { name: "Week 5", value: 2895 },
  { name: "Week 6", value: 3200 },
  { name: "Week 7", value: 3590 },
  { name: "Week 8", value: 4125 },
];

const contentPerformanceData = [
  { name: "Product Reviews", value: 35 },
  { name: "How-to Guides", value: 25 },
  { name: "Personal Stories", value: 20 },
  { name: "Behind the Scenes", value: 15 },
  { name: "News & Updates", value: 5 },
];

const CONTENT_COLORS = ["#4338CA", "#818CF8", "#A5B4FC", "#C7D2FE", "#E0E7FF"];

const bestPerformingPosts = [
  {
    id: 1,
    platform: "instagram",
    content: "Our new product line is finally here! Check out these amazing designs that will transform your space.",
    engagement: 2450,
    impressions: 12500,
    date: subDays(new Date(), 5)
  },
  {
    id: 2,
    platform: "twitter",
    content: "We're excited to announce our partnership with @BigBrand to bring you exclusive deals this summer!",
    engagement: 1870,
    impressions: 9200,
    date: subDays(new Date(), 8)
  },
  {
    id: 3,
    platform: "facebook",
    content: "Behind the scenes look at our design process. It takes a village to create products that make a difference.",
    engagement: 1560,
    impressions: 7800,
    date: subDays(new Date(), 12)
  }
];

export default function Analytics() {
  const [period, setPeriod] = useState("7days");
  const [platform, setPlatform] = useState("all");
  const [tab, setTab] = useState("overview");

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
        return <BarChart2 className="text-gray-400" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track performance across all your social media platforms
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 gap-3">
        <div className="w-full md:w-auto md:flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1 hidden md:block"></div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-3 w-full md:w-[360px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TabsContent value="overview" className="mt-0 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Followers</p>
                  <h3 className="mt-1 text-2xl font-semibold text-gray-900">24,521</h3>
                  <div className="mt-1 flex items-center">
                    <span className="text-success-500 flex items-center text-xs font-medium">
                      <ArrowUp className="mr-1 h-3 w-3" /> 2.5%
                    </span>
                    <span className="ml-1.5 text-xs text-gray-500">vs last period</span>
                  </div>
                </div>
                <div className="rounded-full p-2 bg-blue-50 text-blue-500">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Impressions</p>
                  <h3 className="mt-1 text-2xl font-semibold text-gray-900">357,842</h3>
                  <div className="mt-1 flex items-center">
                    <span className="text-success-500 flex items-center text-xs font-medium">
                      <ArrowUp className="mr-1 h-3 w-3" /> 12.4%
                    </span>
                    <span className="ml-1.5 text-xs text-gray-500">vs last period</span>
                  </div>
                </div>
                <div className="rounded-full p-2 bg-indigo-50 text-indigo-500">
                  <Eye className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Engagement Rate</p>
                  <h3 className="mt-1 text-2xl font-semibold text-gray-900">4.7%</h3>
                  <div className="mt-1 flex items-center">
                    <span className="text-success-500 flex items-center text-xs font-medium">
                      <ArrowUp className="mr-1 h-3 w-3" /> 0.8%
                    </span>
                    <span className="ml-1.5 text-xs text-gray-500">vs last period</span>
                  </div>
                </div>
                <div className="rounded-full p-2 bg-purple-50 text-purple-500">
                  <Heart className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg. Comments</p>
                  <h3 className="mt-1 text-2xl font-semibold text-gray-900">28.5</h3>
                  <div className="mt-1 flex items-center">
                    <span className="text-danger-500 flex items-center text-xs font-medium">
                      <ArrowDown className="mr-1 h-3 w-3" /> 1.2%
                    </span>
                    <span className="ml-1.5 text-xs text-gray-500">vs last period</span>
                  </div>
                </div>
                <div className="rounded-full p-2 bg-amber-50 text-amber-500">
                  <MessageSquare className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="px-5 py-4 border-b border-gray-200 flex items-center justify-between space-y-0">
                <CardTitle className="text-lg font-semibold">Engagement Over Time</CardTitle>
                <Select defaultValue="30days">
                  <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 days</SelectItem>
                    <SelectItem value="30days">30 days</SelectItem>
                    <SelectItem value="90days">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="likes" stackId="a" fill="#4338CA" />
                      <Bar dataKey="comments" stackId="a" fill="#818CF8" />
                      <Bar dataKey="shares" stackId="a" fill="#C7D2FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader className="px-5 py-4 border-b border-gray-200">
                <CardTitle className="text-lg font-semibold">Content Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-60 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentPerformanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {contentPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CONTENT_COLORS[index % CONTENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Engagement']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {contentPerformanceData.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="h-3 w-3 rounded-full mr-2" 
                        style={{ backgroundColor: CONTENT_COLORS[index % CONTENT_COLORS.length] }}
                      ></div>
                      <span className="text-sm">{item.name}</span>
                      <span className="ml-auto text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Follower Growth Chart */}
        <Card>
          <CardHeader className="px-5 py-4 border-b border-gray-200 flex items-center justify-between space-y-0">
            <CardTitle className="text-lg font-semibold">Follower Growth</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-primary-500 mr-2"></div>
                <span className="text-sm text-gray-600">Total Followers</span>
              </div>
              <Select defaultValue="8weeks">
                <SelectTrigger className="h-8 w-[120px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4weeks">4 weeks</SelectItem>
                  <SelectItem value="8weeks">8 weeks</SelectItem>
                  <SelectItem value="6months">6 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={followerGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4338CA" 
                    strokeWidth={3} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Best Performing Posts */}
        <Card>
          <CardHeader className="px-5 py-4 border-b border-gray-200">
            <CardTitle className="text-lg font-semibold">Best Performing Posts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {bestPerformingPosts.map((post, index) => (
                <div key={index} className="p-5">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getPlatformIcon(post.platform)}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-800 capitalize">
                          {post.platform}
                        </p>
                        <span className="mx-2 text-gray-300">•</span>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" /> 
                          {format(post.date, "MMM d, yyyy")}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{post.content}</p>
                      <div className="mt-2 flex flex-wrap gap-3">
                        <div className="flex items-center">
                          <div className="text-xs font-medium text-gray-500">Engagement:</div>
                          <div className="ml-1 text-xs font-semibold">{post.engagement.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-xs font-medium text-gray-500">Impressions:</div>
                          <div className="ml-1 text-xs font-semibold">{post.impressions.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-xs font-medium text-gray-500">Engagement Rate:</div>
                          <div className="ml-1 text-xs font-semibold">
                            {((post.engagement / post.impressions) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="ml-2 flex-shrink-0">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="engagement" className="mt-0 space-y-6">
        <Card>
          <CardHeader className="px-5 py-4 border-b border-gray-200">
            <CardTitle className="text-lg font-semibold">Engagement Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="text-center p-6 border rounded-lg">
                  <Heart className="h-8 w-8 text-pink-500 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold">24,356</h3>
                  <p className="text-gray-500 text-sm">Total Likes</p>
                  <div className="mt-2 flex items-center justify-center">
                    <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" /> 12.5%
                    </Badge>
                  </div>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold">5,782</h3>
                  <p className="text-gray-500 text-sm">Total Comments</p>
                  <div className="mt-2 flex items-center justify-center">
                    <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" /> 8.3%
                    </Badge>
                  </div>
                </div>
                <div className="text-center p-6 border rounded-lg">
                  <Zap className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold">3,148</h3>
                  <p className="text-gray-500 text-sm">Total Shares</p>
                  <div className="mt-2 flex items-center justify-center">
                    <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center">
                      <ArrowDown className="h-3 w-3 mr-1" /> 2.1%
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="likes" 
                        stroke="#EC4899" 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                        activeDot={{ r: 5 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="comments" 
                        stroke="#3B82F6" 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                        activeDot={{ r: 5 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="shares" 
                        stroke="#F59E0B" 
                        strokeWidth={2} 
                        dot={{ r: 3 }} 
                        activeDot={{ r: 5 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold">Engagement by Time of Day</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { time: "12 AM", engagement: 120 },
                      { time: "3 AM", engagement: 80 },
                      { time: "6 AM", engagement: 210 },
                      { time: "9 AM", engagement: 340 },
                      { time: "12 PM", engagement: 520 },
                      { time: "3 PM", engagement: 680 },
                      { time: "6 PM", engagement: 820 },
                      { time: "9 PM", engagement: 560 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#4338CA" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold">Engagement by Day of Week</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { day: "Monday", engagement: 380 },
                      { day: "Tuesday", engagement: 420 },
                      { day: "Wednesday", engagement: 510 },
                      { day: "Thursday", engagement: 480 },
                      { day: "Friday", engagement: 650 },
                      { day: "Saturday", engagement: 780 },
                      { day: "Sunday", engagement: 620 }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="px-5 py-4 border-b border-gray-200">
            <CardTitle className="text-lg font-semibold">Engagement by Content Type</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { type: "Images", engagement: 620 },
                      { type: "Videos", engagement: 840 },
                      { type: "Carousels", engagement: 720 },
                      { type: "Text Only", engagement: 320 },
                      { type: "Links", engagement: 280 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="type" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#4338CA" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Content Type Analysis</h3>
                  <p className="text-sm text-gray-600">
                    Videos generate the highest engagement with an average of 840 interactions per post. 
                    Carousels and images also perform well. Text-only posts and links show the lowest engagement.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Recommendations</h3>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                    <li>Increase video content to maximize engagement</li>
                    <li>Use carousel posts for product showcases and tutorials</li>
                    <li>Include compelling images with all text posts</li>
                    <li>Avoid sharing plain links without visual content</li>
                    <li>Experiment with live videos to boost real-time interaction</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <Zap className="h-4 w-4 mr-1 text-blue-500" />
                    AI-Powered Insight
                  </h3>
                  <p className="text-sm text-blue-700">
                    Your audience engages 215% more with video content when posted between 6-8 PM 
                    on weekdays. Consider adjusting your content calendar to capitalize on this pattern.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="audience" className="mt-0 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold">Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Age Distribution</h3>
                  <div className="space-y-2">
                    {[
                      { age: "18-24", percentage: 15 },
                      { age: "25-34", percentage: 42 },
                      { age: "35-44", percentage: 28 },
                      { age: "45-54", percentage: 10 },
                      { age: "55+", percentage: 5 }
                    ].map((group, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{group.age}</span>
                          <span className="font-medium">{group.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-primary-500 h-1.5 rounded-full"
                            style={{ width: `${group.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Gender</h3>
                  <div className="relative h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Female", value: 64 },
                            { name: "Male", value: 35 },
                            { name: "Other", value: 1 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          <Cell fill="#818CF8" />
                          <Cell fill="#C7D2FE" />
                          <Cell fill="#E0E7FF" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold">Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-4">
                <h3 className="text-sm font-medium mb-3">Top Countries</h3>
                <div className="space-y-3">
                  {[
                    { country: "United States", percentage: 45 },
                    { country: "United Kingdom", percentage: 15 },
                    { country: "Canada", percentage: 12 },
                    { country: "Australia", percentage: 8 },
                    { country: "Germany", percentage: 5 },
                    { country: "Others", percentage: 15 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{item.country}</span>
                        <span className="font-medium">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary-500 h-1.5 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-200 mt-6">
                  <h3 className="text-sm font-medium mb-3">Top Cities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "New York", "London", "Los Angeles", "Toronto", 
                      "Sydney", "Chicago", "Berlin", "Melbourne"
                    ].map((city, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary-500 mr-2"></div>
                        {city}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-5 py-4 border-b border-gray-200">
              <CardTitle className="text-lg font-semibold">Active Times</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Most Active Hours</h3>
                  <div className="relative h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { hour: "6 AM", active: 5 },
                          { hour: "9 AM", active: 15 },
                          { hour: "12 PM", active: 25 },
                          { hour: "3 PM", active: 40 },
                          { hour: "6 PM", active: 75 },
                          { hour: "9 PM", active: 60 },
                          { hour: "12 AM", active: 30 }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="active" fill="#4338CA" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-3">Most Active Days</h3>
                  <div className="grid grid-cols-7 gap-1">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => {
                      const activityLevels = [45, 52, 49, 63, 87, 73, 40];
                      return (
                        <div key={index} className="text-center">
                          <div 
                            className="mx-auto w-full bg-primary-100 rounded-t-sm" 
                            style={{ height: `${activityLevels[index] * 0.7}px` }}
                          >
                            <div 
                              className="w-full bg-primary-500 rounded-t-sm"
                              style={{ height: `${activityLevels[index] * 0.7 * (activityLevels[index] / 100)}px` }}
                            ></div>
                          </div>
                          <div className="text-xs mt-1">{day}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <h3 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-green-600" />
                    Optimal Posting Times
                  </h3>
                  <p className="text-sm text-green-700">
                    Based on your audience activity, the best times to post are 
                    <span className="font-medium"> Fridays at 6-7 PM</span> and 
                    <span className="font-medium"> Saturdays at 11 AM-1 PM</span>.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="px-5 py-4 border-b border-gray-200">
            <CardTitle className="text-lg font-semibold">Audience Interests</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-wrap gap-3">
                {[
                  { topic: "Technology", level: 85 },
                  { topic: "Travel", level: 72 },
                  { topic: "Fitness", level: 68 },
                  { topic: "Food & Cooking", level: 64 },
                  { topic: "Fashion", level: 57 },
                  { topic: "Photography", level: 53 },
                  { topic: "Music", level: 48 },
                  { topic: "Books", level: 42 },
                  { topic: "Art", level: 38 },
                  { topic: "Gaming", level: 35 },
                  { topic: "Beauty", level: 32 },
                  { topic: "Finance", level: 28 }
                ].map((interest, index) => (
                  <div 
                    key={index} 
                    className="rounded-full px-4 py-2 text-sm" 
                    style={{ 
                      backgroundColor: `rgba(67, 56, 202, ${interest.level / 100})`,
                      color: interest.level > 50 ? 'white' : 'black',
                      fontSize: `${Math.max(0.75, interest.level / 100 + 0.5)}rem`
                    }}
                  >
                    {interest.topic}
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Interest Insights</h3>
                <p className="text-sm text-gray-600">
                  Your audience shows strong interest in technology, travel, and fitness topics. 
                  Content related to these areas consistently outperforms other categories by 37%.
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-500">RECOMMENDATIONS</h4>
                  <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                    <li>Create more tech review and tutorial content</li>
                    <li>Share travel destination highlights and tips</li>
                    <li>Incorporate fitness challenges and workout guides</li>
                    <li>Consider crossover content like "Tech for Travelers" or "Fitness Tech Reviews"</li>
                    <li>Experiment with food content focused on healthy recipes for fitness enthusiasts</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <h3 className="text-xs font-medium text-primary-800 flex items-center">
                    <Zap className="h-3.5 w-3.5 mr-1 text-primary-600" />
                    NEW OPPORTUNITY
                  </h3>
                  <p className="text-sm text-primary-700 mt-1">
                    There's a growing interest in sustainable travel among your audience. 
                    Content combining technology, travel, and sustainability could create a unique positioning.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
}
