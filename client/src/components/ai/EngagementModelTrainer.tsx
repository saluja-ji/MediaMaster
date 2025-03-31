import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Badge
} from '../ui/index';
import { trainEngagementModel } from '../../lib/api';
import { Brain, Activity, Zap, ChevronRight, BarChart, PieChart, LineChart, Hash, Clock, TrendingUp } from 'lucide-react';

// Options for training period
const LOOKBACK_OPTIONS = [
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last 6 months', value: 180 },
  { label: 'Last year', value: 365 }
];

// Interface for the engagement model data structure
interface UserEngagementModel {
  modelId: string;
  userId: number;
  platforms: string[];
  trainedOn: Date;
  contentPatterns: {
    highEngagement: {
      topics: string[];
      formats: string[];
      timing: {
        daysOfWeek: string[];
        timeOfDay: string[];
      };
      contentAttributes: {
        length: string;
        mediaTypes: string[];
        toneAttributes: string[];
      };
    };
    lowEngagement: {
      topics: string[];
      formats: string[];
      timing: {
        daysOfWeek: string[];
        timeOfDay: string[];
      };
      contentAttributes: {
        length: string;
        mediaTypes: string[];
        toneAttributes: string[];
      };
    };
  };
  audienceAffinities: string[];
  predictedPerformanceFactors: string[];
}

export const EngagementModelTrainer: React.FC = () => {
  const [lookbackPeriod, setLookbackPeriod] = useState<number>(90);
  
  // Mutation for AI model training
  const trainModelMutation = useMutation({
    mutationFn: (params: { lookbackPeriod: number }) => 
      trainEngagementModel(params),
  });
  
  const handleTrainModel = () => {
    trainModelMutation.mutate({ lookbackPeriod });
  };
  
  // Mock data for a previously trained model
  const [modelData, setModelData] = useState<UserEngagementModel | null>(null);
  
  // Set mock data when training is successful for demo purposes
  React.useEffect(() => {
    if (trainModelMutation.isSuccess) {
      // In a real app, this would come from the API response
      // Mock data for demonstration
      const data: UserEngagementModel = trainModelMutation.data || {
        modelId: "em-" + Math.random().toString(36).substring(2, 8),
        userId: 1,
        platforms: ["instagram", "twitter", "tiktok"],
        trainedOn: new Date(),
        contentPatterns: {
          highEngagement: {
            topics: ["Personal stories", "Industry insights", "How-to guides"],
            formats: ["Carousel posts", "Short videos", "Infographics"],
            timing: {
              daysOfWeek: ["Tuesday", "Thursday", "Sunday"],
              timeOfDay: ["7:00-9:00 AM", "6:00-8:00 PM"]
            },
            contentAttributes: {
              length: "Medium-length (400-800 characters)",
              mediaTypes: ["Videos", "Multiple images", "Animated graphics"],
              toneAttributes: ["Conversational", "Enthusiastic", "Authentic"]
            }
          },
          lowEngagement: {
            topics: ["Promotional content", "Generic announcements", "Unrelated topics"],
            formats: ["Text-only posts", "Single image posts", "Reshared content"],
            timing: {
              daysOfWeek: ["Monday", "Friday"],
              timeOfDay: ["11:00 AM-2:00 PM", "10:00 PM-12:00 AM"]
            },
            contentAttributes: {
              length: "Very long (>1000 characters)",
              mediaTypes: ["No media", "Low-quality images"],
              toneAttributes: ["Formal", "Salesy", "Impersonal"]
            }
          }
        },
        audienceAffinities: [
          "Creative professionals",
          "Tech enthusiasts",
          "Early adopters",
          "Working professionals aged 25-40",
          "Users interested in self-improvement"
        ],
        predictedPerformanceFactors: [
          "Content authenticity",
          "Response to comments",
          "Consistent posting schedule",
          "Video content quality",
          "Use of trending audio/hashtags",
          "Story engagement"
        ]
      };
      
      setModelData(data);
    }
  }, [trainModelMutation.isSuccess, trainModelMutation.data]);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Engagement Model Trainer
          </CardTitle>
          <CardDescription>
            Train an AI model on your specific engagement patterns to get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Training dataset size</h3>
            <p className="text-sm text-muted-foreground">
              Select how far back to analyze your content and engagement data
            </p>
            <Select 
              value={lookbackPeriod.toString()} 
              onValueChange={(val) => setLookbackPeriod(parseInt(val))}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {LOOKBACK_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-muted p-4 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                <h4 className="text-sm font-medium">What the model analyzes</h4>
              </div>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Post content and captions
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Media types and quality
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Posting times and frequency
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Hashtag performance
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Audience responses
                </li>
              </ul>
            </div>
            
            <div className="bg-muted p-4 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-500" />
                <h4 className="text-sm font-medium">What you'll learn</h4>
              </div>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Your best posting times
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Content that resonates
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Audience preferences
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Format effectiveness
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Performance predictors
                </li>
              </ul>
            </div>
            
            <div className="bg-muted p-4 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-blue-500" />
                <h4 className="text-sm font-medium">How it helps</h4>
              </div>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  More precise recommendations
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Content personalized to your audience
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Custom scheduling suggestions
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Better content ideas
                </li>
                <li className="flex items-center gap-2">
                  <div className="bg-primary h-1.5 w-1.5 rounded-full"></div>
                  Increased engagement rate
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleTrainModel}
            disabled={trainModelMutation.isPending}
            className="w-full sm:w-auto"
          >
            {trainModelMutation.isPending ? "Training Model..." : "Train Engagement Model"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Loading state */}
      {trainModelMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-sm text-muted-foreground">
                Analyzing your engagement patterns and training a personalized AI model...
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 w-full">
                <div className="flex flex-col items-center p-4 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Analyzing Content</p>
                  <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-4/5"></div>
                  </div>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Processing Engagement</p>
                  <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-3/5"></div>
                  </div>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Building Model</p>
                  <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-2/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Error state */}
      {trainModelMutation.isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive p-4">
              <p className="font-medium">Unable to train engagement model</p>
              <p className="text-sm mt-1">Please try again or adjust your parameters</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Model display */}
      {modelData && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Your Engagement Model
            </h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                Trained {formatDate(new Date(modelData.trainedOn))}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Hash className="h-3 w-3" />
                {modelData.modelId}
              </Badge>
            </div>
          </div>
          
          {/* Platforms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platforms Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {modelData.platforms.map(platform => (
                  <Badge key={platform} className="text-sm">
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* High Engagement Patterns */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                High Engagement Patterns
              </CardTitle>
              <CardDescription>Content characteristics that lead to higher engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-muted-foreground" />
                    Best Topics
                  </h3>
                  <ul className="space-y-2">
                    {modelData.contentPatterns.highEngagement.topics.map((topic, i) => (
                      <li key={i} className="text-sm flex gap-2 items-start">
                        <div className="bg-green-500 h-1.5 w-1.5 rounded-full mt-1.5"></div>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                    Effective Formats
                  </h3>
                  <ul className="space-y-2">
                    {modelData.contentPatterns.highEngagement.formats.map((format, i) => (
                      <li key={i} className="text-sm flex gap-2 items-start">
                        <div className="bg-green-500 h-1.5 w-1.5 rounded-full mt-1.5"></div>
                        {format}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                    Content Attributes
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Length</p>
                    <p className="text-sm">{modelData.contentPatterns.highEngagement.contentAttributes.length}</p>
                    
                    <p className="text-xs font-medium text-muted-foreground mt-2">Media Types</p>
                    <div className="flex flex-wrap gap-1">
                      {modelData.contentPatterns.highEngagement.contentAttributes.mediaTypes.map((media, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {media}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-xs font-medium text-muted-foreground mt-2">Tone</p>
                    <div className="flex flex-wrap gap-1">
                      {modelData.contentPatterns.highEngagement.contentAttributes.toneAttributes.map((tone, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Optimal Posting Times
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Best Days</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {modelData.contentPatterns.highEngagement.timing.daysOfWeek.map((day, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Best Times</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {modelData.contentPatterns.highEngagement.timing.timeOfDay.map((time, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Low Engagement Patterns */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-4 w-4 text-red-500" />
                Low Engagement Patterns
              </CardTitle>
              <CardDescription>Content characteristics that lead to lower engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Topics to Avoid</h3>
                  <ul className="space-y-2">
                    {modelData.contentPatterns.lowEngagement.topics.map((topic, i) => (
                      <li key={i} className="text-sm flex gap-2 items-start">
                        <div className="bg-red-500 h-1.5 w-1.5 rounded-full mt-1.5"></div>
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Ineffective Formats</h3>
                  <ul className="space-y-2">
                    {modelData.contentPatterns.lowEngagement.formats.map((format, i) => (
                      <li key={i} className="text-sm flex gap-2 items-start">
                        <div className="bg-red-500 h-1.5 w-1.5 rounded-full mt-1.5"></div>
                        {format}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Content Attributes to Avoid</h3>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Length</p>
                    <p className="text-sm">{modelData.contentPatterns.lowEngagement.contentAttributes.length}</p>
                    
                    <p className="text-xs font-medium text-muted-foreground mt-2">Media Types</p>
                    <div className="flex flex-wrap gap-1">
                      {modelData.contentPatterns.lowEngagement.contentAttributes.mediaTypes.map((media, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {media}
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-xs font-medium text-muted-foreground mt-2">Tone</p>
                    <div className="flex flex-wrap gap-1">
                      {modelData.contentPatterns.lowEngagement.contentAttributes.toneAttributes.map((tone, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted rounded-md">
                <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-red-500" />
                  Times to Avoid
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Worst Days</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {modelData.contentPatterns.lowEngagement.timing.daysOfWeek.map((day, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Worst Times</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {modelData.contentPatterns.lowEngagement.timing.timeOfDay.map((time, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {time}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Audience and Performance Factors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audience Affinities</CardTitle>
                <CardDescription>Characteristics of your most engaged audience</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {modelData.audienceAffinities.map((affinity, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      {affinity}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Factors</CardTitle>
                <CardDescription>Key elements that predict your content success</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {modelData.predictedPerformanceFactors.map((factor, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Zap className="h-4 w-4 text-amber-500" />
                      {factor}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Use This Model</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <h3 className="text-sm font-medium">Content Creation</h3>
                  <p className="text-sm">Your content editor will now intelligently suggest topics, formats, and styles that match your engagement patterns.</p>
                </div>
                
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <h3 className="text-sm font-medium">Smart Scheduling</h3>
                  <p className="text-sm">The calendar will automatically recommend your optimal posting times based on your model data.</p>
                </div>
                
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <h3 className="text-sm font-medium">AI Analysis</h3>
                  <p className="text-sm">Before publishing, your content will be scored against your model to predict engagement likelihood.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button variant="outline">Export Model Data</Button>
              <Button>Apply to Content Strategy</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};