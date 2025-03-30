import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DollarSign, ShoppingBag, BarChart, ArrowUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface MonetizationPanelProps {
  data?: {
    totalRevenue: number;
    affiliateSales: number;
    sponsoredPosts: number;
    topRevenueSources: Array<{
      name: string;
      amount: number;
      conversions: number;
      change: number;
      logoUrl: string;
    }>;
  };
  loading?: boolean;
}

export default function MonetizationPanel({ data, loading = false }: MonetizationPanelProps) {
  const [period, setPeriod] = useState("30days");

  return (
    <Card className="h-full">
      <CardHeader className="px-5 py-4 border-b border-gray-200 flex flex-row justify-between items-center space-y-0">
        <CardTitle className="font-semibold text-gray-800 flex items-center">
          <DollarSign className="text-success-500 mr-2 h-5 w-5" />
          Monetization Overview
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
        </div>
      ) : data ? (
        <>
          <div className="px-5 pt-5 grid grid-cols-1 md:grid-cols-3 gap-5 border-b border-gray-200 pb-5">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">${data.totalRevenue.toLocaleString()}</h3>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Affiliate Sales</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">{data.affiliateSales}</h3>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                    <BarChart className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Sponsored Posts</p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">{data.sponsoredPosts}</h3>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <h3 className="font-medium text-gray-700 mb-4">Top Performing Revenue Sources</h3>
            
            <div className="space-y-4">
              {data.topRevenueSources.map((source, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-shrink-0">
                    <img src={source.logoUrl} alt={source.name} className="h-8 w-8 rounded" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">{source.name}</p>
                      <p className="text-sm font-semibold text-gray-900">${source.amount}</p>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <p className="text-xs text-gray-500">{source.conversions} conversions</p>
                      <p className="text-xs text-success-500 flex items-center">
                        <ArrowUp className="mr-1 h-3 w-3" /> {source.change}% vs last month
                      </p>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-success-500 h-1.5 rounded-full" 
                        style={{ width: `${(source.amount / data.totalRevenue) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <CardFooter className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-center">
            <Button variant="link" className="text-sm text-primary-600 font-medium hover:text-primary-700 mx-auto">
              View Full Monetization Report
            </Button>
          </CardFooter>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12">
          <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">No monetization data available</p>
          <p className="text-sm text-gray-400 mt-1">Connect your accounts to track revenue</p>
        </div>
      )}
    </Card>
  );
}
