import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { PieChartIcon } from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa";

interface ROIBreakdownPanelProps {
  data?: Array<{
    platform: string;
    revenue: number;
    percentage: number;
  }>;
  loading?: boolean;
}

export default function ROIBreakdownPanel({ data = [], loading = false }: ROIBreakdownPanelProps) {
  // Platform colors
  const PLATFORM_COLORS: Record<string, string> = {
    instagram: '#E1306C',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    tiktok: '#000000',
    youtube: '#FF0000'
  };
  
  // For the pie chart
  const chartData = data.map(item => ({
    name: item.platform.charAt(0).toUpperCase() + item.platform.slice(1),
    value: item.revenue
  }));
  
  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <FaTwitter className="h-4 w-4 text-blue-400" />;
      case 'instagram':
        return <FaInstagram className="h-4 w-4 text-pink-500" />;
      case 'facebook':
        return <FaFacebook className="h-4 w-4 text-blue-600" />;
      case 'linkedin':
        return <FaLinkedin className="h-4 w-4 text-blue-700" />;
      case 'tiktok':
        return <FaTiktok className="h-4 w-4 text-black" />;
      case 'youtube':
        return <FaYoutube className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };
  
  // Get color for platform
  const getPlatformColor = (platform: string) => {
    return PLATFORM_COLORS[platform.toLowerCase()] || '#9CA3AF';
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="px-5 py-4 border-b border-gray-200">
        <CardTitle className="font-semibold text-gray-800 flex items-center">
          <PieChartIcon className="text-primary-500 mr-2 h-5 w-5" />
          ROI By Platform
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
            <p className="mt-4 text-sm text-gray-500">Loading ROI data...</p>
          </div>
        ) : data.length > 0 ? (
          <>
            <div className="mb-6 h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getPlatformColor(data[index].platform)}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-3">
              {data.map((platform, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {getPlatformIcon(platform.platform)}
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {platform.platform.charAt(0).toUpperCase() + platform.platform.slice(1)}
                      </p>
                      <p className="text-sm font-medium text-gray-900">${platform.revenue}</p>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full" 
                        style={{ 
                          width: `${platform.percentage}%`,
                          backgroundColor: getPlatformColor(platform.platform)
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <PieChartIcon className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500">No ROI data available</p>
            <p className="text-sm text-gray-400 mt-1">Start tracking monetization to see ROI by platform</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-center">
        <Button variant="link" className="text-sm text-primary-600 font-medium hover:text-primary-700 mx-auto">
          View Detailed ROI Report
        </Button>
      </CardFooter>
    </Card>
  );
}
