import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, AlertTriangle, Sparkles, Coins } from "lucide-react";
import { Insight } from "@shared/schema";
import { useState } from "react";

interface AIInsightProps {
  insights: Array<{
    id: string;
    type: "engagement" | "shadowban" | "monetization";
    title: string;
    description: string;
    actions: Array<{
      label: string;
      primary?: boolean;
      onClick: () => void;
    }>;
  }>;
  loading?: boolean;
  lastUpdated?: string;
}

export default function AIInsightPanel({ 
  insights = [],
  loading = false, 
  lastUpdated = "3h ago" 
}: AIInsightProps) {
  return (
    <Card className="h-full">
      <CardHeader className="px-5 py-4 border-b border-gray-200 flex flex-row justify-between items-center space-y-0">
        <CardTitle className="font-semibold text-gray-800 flex items-center">
          <Brain className="text-primary-500 mr-2 h-5 w-5" />
          AI Insights & Recommendations
        </CardTitle>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">Updated {lastUpdated}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
            <span className="sr-only">Refresh</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M21 12a9 9 0 0 1-9 9c-4.97 0-9-4.03-9-9s4.03-9 9-9h7.5"></path>
              <path d="M16 5v4h4"></path>
              <path d="M19.841 9.5l.159-4.5"></path>
            </svg>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">No insights available yet</p>
            <p className="text-sm text-gray-400">Check back later for AI-powered recommendations</p>
          </div>
        ) : (
          insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))
        )}
      </CardContent>
      
      <CardFooter className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-center">
        <Button variant="link" className="text-sm text-primary-600 font-medium hover:text-primary-700">
          View All Insights
        </Button>
      </CardFooter>
    </Card>
  );
}

function InsightCard({ insight }: { insight: AIInsightProps["insights"][0] }) {
  // Determine card appearance based on type
  let bgClass = "from-primary-50";
  let iconBackground = "bg-primary-100";
  let iconColor = "text-primary-500";
  let Icon = Sparkles;
  
  if (insight.type === "shadowban") {
    bgClass = "from-amber-50";
    iconBackground = "bg-amber-100";
    iconColor = "text-amber-500";
    Icon = AlertTriangle;
  } else if (insight.type === "monetization") {
    bgClass = "from-green-50";
    iconBackground = "bg-green-100";
    iconColor = "text-green-500";
    Icon = Coins;
  }
  
  return (
    <div className={`border border-gray-100 rounded-lg p-4 bg-gradient-to-r ${bgClass} to-transparent`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={`h-10 w-10 rounded-full ${iconBackground} flex items-center justify-center ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-900">{insight.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{insight.description}</p>
          <div className="mt-3 flex space-x-2">
            {insight.actions.map((action, index) => (
              <Button
                key={index}
                variant={action.primary ? "secondary" : "outline"}
                size="sm"
                onClick={action.onClick}
                className={action.primary 
                  ? insight.type === "shadowban" 
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                    : insight.type === "monetization"
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-primary-100 text-primary-700 hover:bg-primary-200"
                  : ""}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
