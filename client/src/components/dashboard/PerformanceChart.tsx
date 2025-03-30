import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { LineChartIcon } from "lucide-react";

interface PerformanceChartProps {
  data: Array<{
    name: string;
    likes: number;
    comments: number;
    shares: number;
    [key: string]: any;
  }>;
  loading?: boolean;
  period?: "7days" | "30days" | "90days";
  onPeriodChange?: (period: "7days" | "30days" | "90days") => void;
}

export default function PerformanceChart({ 
  data = [],
  loading = false,
  period = "7days",
  onPeriodChange
}: PerformanceChartProps) {
  const handlePeriodChange = (value: string) => {
    onPeriodChange && onPeriodChange(value as "7days" | "30days" | "90days");
  };
  
  // Calculate totals
  const totalEngagement = data.reduce((sum, item) => sum + item.likes + item.comments + item.shares, 0);
  
  return (
    <Card className="h-full">
      <CardHeader className="px-5 py-4 border-b border-gray-200 flex flex-row justify-between items-center space-y-0">
        <CardTitle className="font-semibold text-gray-800 flex items-center">
          <LineChartIcon className="text-primary-500 mr-2 h-5 w-5" />
          Performance Analytics
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Select defaultValue={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="h-8 w-[140px] text-sm">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500">Total Engagement</h3>
            <p className="text-2xl font-semibold text-gray-900">{loading ? "-" : totalEngagement.toLocaleString()}</p>
          </div>
          <div className="flex flex-wrap mt-2 sm:mt-0">
            <div className="flex items-center mr-4">
              <div className="h-3 w-3 rounded-full bg-primary-500 mr-1"></div>
              <span className="text-xs text-gray-600">Likes</span>
            </div>
            <div className="flex items-center mr-4">
              <div className="h-3 w-3 rounded-full bg-primary-300 mr-1"></div>
              <span className="text-xs text-gray-600">Comments</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 rounded-full bg-primary-200 mr-1"></div>
              <span className="text-xs text-gray-600">Shares</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 w-full">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
            </div>
          ) : data.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center text-gray-500">
                <LineChartIcon className="mx-auto h-12 w-12 text-gray-300" />
                <p className="text-sm mt-2">No performance data available</p>
                <p className="text-xs mt-1 text-gray-400">Start posting to see engagement insights</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 5,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="likes" stackId="a" fill="hsl(var(--primary))" />
                <Bar dataKey="comments" stackId="a" fill="hsl(var(--primary) / 0.6)" />
                <Bar dataKey="shares" stackId="a" fill="hsl(var(--primary) / 0.4)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
