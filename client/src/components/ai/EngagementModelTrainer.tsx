import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { trainEngagementModel, fetchPosts, fetchAnalytics, fetchSocialAccounts } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Sparkles, BarChart2, Clock, ArrowRight, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { subDays } from "date-fns";

export interface EngagementModelTrainerProps {
  className?: string;
}

export function EngagementModelTrainer({ className }: EngagementModelTrainerProps) {
  const { toast } = useToast();
  const [lookbackPeriod, setLookbackPeriod] = useState<number>(90);
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'training' | 'complete'>('idle');
  const [modelData, setModelData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Check if user has enough data for training
  const { data: posts = [] } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: fetchPosts,
    enabled: trainingStatus === 'idle' // Only fetch initial data when not training
  });
  
  const { data: analytics = [] } = useQuery({
    queryKey: ['/api/analytics'],
    queryFn: () => fetchAnalytics(),
    enabled: trainingStatus === 'idle' // Only fetch initial data when not training
  });

  // Train model mutation
  const trainModel = useMutation({
    mutationFn: trainEngagementModel,
    onSuccess: (data) => {
      setModelData(data.model);
      setTrainingStatus('complete');
      toast({
        title: "Model Training Complete",
        description: "Your personalized engagement model has been successfully trained.",
      });
    },
    onError: (error) => {
      setTrainingStatus('idle');
      toast({
        title: "Training Failed",
        description: "Failed to train engagement model. Please try again later.",
        variant: "destructive"
      });
    }
  });
  
  // Check if we have enough data to train
  const hasEnoughData = posts.length >= 5 && analytics.length >= 10;
  
  // Handle start training
  const handleStartTraining = () => {
    setTrainingStatus('training');
    trainModel.mutate({ lookbackPeriod });
  };
  
  // Format topics into a readable string
  const formatTopics = (topics: string[]): string => {
    if (!topics || topics.length === 0) return "None identified";
    return topics.join(", ");
  };

  // Begin the training view
  if (trainingStatus === 'idle') {
    return (
      <div className={className}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">AI Engagement Pattern Training</CardTitle>
            <CardDescription>
              Train an advanced AI model on your specific content engagement patterns to receive personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!hasEnoughData && (
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertTitle>Insufficient data for optimal training</AlertTitle>
                <AlertDescription>
                  You need at least 5 posts and 10 analytics records for effective model training. 
                  The model can still be trained, but results may be less accurate.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="lookback-period">Training Data Period</Label>
                <span className="text-sm font-medium">{lookbackPeriod} days</span>
              </div>
              <Slider
                id="lookback-period"
                min={30}
                max={365}
                step={30}
                defaultValue={[lookbackPeriod]}
                onValueChange={(values) => setLookbackPeriod(values[0])}
              />
              <p className="text-sm text-muted-foreground">
                Longer periods include more data for better pattern recognition, but may include outdated trends.
              </p>
            </div>
            
            <div className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-medium mb-2">What You'll Get:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex">
                  <Sparkles className="h-5 w-5 mr-2 text-primary" />
                  <span>Custom engagement pattern identification based on your content history</span>
                </li>
                <li className="flex">
                  <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                  <span>Analysis of high vs. low-performing content attributes</span>
                </li>
                <li className="flex">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  <span>Optimal posting times and formats specific to your audience</span>
                </li>
                <li className="flex">
                  <ArrowRight className="h-5 w-5 mr-2 text-primary" />
                  <span>Personalized content strategy recommendations</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleStartTraining}
              disabled={trainModel.isPending}
            >
              {trainModel.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Training Model...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Train Engagement Model
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Model is training or complete
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">AI Engagement Model</CardTitle>
              <CardDescription>
                {trainingStatus === 'training' 
                  ? 'Your personalized engagement model is currently training...' 
                  : 'Your personalized engagement model has been trained on your content history'}
              </CardDescription>
            </div>
            {trainingStatus === 'complete' && (
              <Badge className="ml-2" variant="outline">
                Model ID: {modelData.modelId.substring(0, 8)}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        {trainingStatus === 'training' ? (
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Training Your AI Model</h3>
            <p className="text-center text-muted-foreground max-w-md">
              We're analyzing your content performance patterns to create a custom engagement model. 
              This process may take a few moments to complete.
            </p>
          </CardContent>
        ) : (
          <>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="patterns">Content Patterns</TabsTrigger>
                  <TabsTrigger value="insights">Audience Insights</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card rounded-lg p-4 border">
                      <h3 className="text-sm font-medium text-muted-foreground">Platforms Analyzed</h3>
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          {modelData.platforms.map((platform: string) => (
                            <Badge key={platform} variant="outline">{platform}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-card rounded-lg p-4 border">
                      <h3 className="text-sm font-medium text-muted-foreground">Trained On</h3>
                      <div className="mt-2">
                        <p className="text-lg font-medium">
                          {new Date(modelData.trainedOn).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {lookbackPeriod} day lookback period
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-card rounded-lg p-4 border">
                      <h3 className="text-sm font-medium text-muted-foreground">Top Performance Factor</h3>
                      <div className="mt-2">
                        <p className="text-lg font-medium">
                          {modelData.predictedPerformanceFactors[0] || "No factors identified"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-lg p-4 border">
                    <h3 className="font-medium mb-2">Performance Prediction Factors</h3>
                    <ul className="space-y-2">
                      {modelData.predictedPerformanceFactors.map((factor: string, i: number) => (
                        <li key={i} className="flex items-center">
                          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary h-6 w-6 text-sm mr-3">
                            {i + 1}
                          </span>
                          <span>{factor}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-card rounded-lg p-4 border">
                    <h3 className="font-medium mb-2">Audience Affinities</h3>
                    <div className="flex flex-wrap gap-2">
                      {modelData.audienceAffinities.map((affinity: string, i: number) => (
                        <Badge key={i} variant="secondary">{affinity}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="patterns" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-lg p-4 border">
                      <h3 className="font-medium mb-4 text-green-600 dark:text-green-400 flex items-center">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        High Engagement Content
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Topics</h4>
                          <p className="text-sm">{formatTopics(modelData.contentPatterns.highEngagement.topics)}</p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Content Formats</h4>
                          <div className="flex flex-wrap gap-2">
                            {modelData.contentPatterns.highEngagement.formats.map((format: string, i: number) => (
                              <Badge key={i} variant="outline">{format}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Optimal Timing</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Days</p>
                              <p className="text-sm">
                                {modelData.contentPatterns.highEngagement.timing.daysOfWeek.join(", ")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Time of Day</p>
                              <p className="text-sm">
                                {modelData.contentPatterns.highEngagement.timing.timeOfDay.join(", ")}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Content Attributes</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Length</p>
                              <p className="text-sm">
                                {modelData.contentPatterns.highEngagement.contentAttributes.length}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Media Types</p>
                              <p className="text-sm">
                                {modelData.contentPatterns.highEngagement.contentAttributes.mediaTypes.join(", ")}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Tone & Style</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {modelData.contentPatterns.highEngagement.contentAttributes.toneAttributes.map((attr: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">{attr}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-card rounded-lg p-4 border">
                      <h3 className="font-medium mb-4 text-red-600 dark:text-red-400 flex items-center">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Low Engagement Content
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Topics</h4>
                          <p className="text-sm">{formatTopics(modelData.contentPatterns.lowEngagement.topics)}</p>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Content Formats</h4>
                          <div className="flex flex-wrap gap-2">
                            {modelData.contentPatterns.lowEngagement.formats.map((format: string, i: number) => (
                              <Badge key={i} variant="outline">{format}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Suboptimal Timing</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Days</p>
                              <p className="text-sm">
                                {modelData.contentPatterns.lowEngagement.timing.daysOfWeek.join(", ")}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Time of Day</p>
                              <p className="text-sm">
                                {modelData.contentPatterns.lowEngagement.timing.timeOfDay.join(", ")}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Content Attributes</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Length</p>
                              <p className="text-sm">
                                {modelData.contentPatterns.lowEngagement.contentAttributes.length}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Media Types</p>
                              <p className="text-sm">
                                {modelData.contentPatterns.lowEngagement.contentAttributes.mediaTypes.join(", ")}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Tone & Style</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {modelData.contentPatterns.lowEngagement.contentAttributes.toneAttributes.map((attr: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">{attr}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="insights" className="space-y-6">
                  <div className="space-y-4">
                    <div className="bg-card rounded-lg p-4 border">
                      <h3 className="font-medium mb-3">Audience Affinities</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your audience responds most strongly to these content themes and approaches
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {modelData.audienceAffinities.map((affinity: string, i: number) => (
                          <div key={i} className="bg-muted rounded-md p-3">
                            <p className="text-sm">{affinity}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-card rounded-lg p-4 border">
                      <h3 className="font-medium mb-3">Performance Prediction Factors</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        These factors have the strongest influence on your content performance
                      </p>
                      
                      <ul className="space-y-3">
                        {modelData.predictedPerformanceFactors.map((factor: string, i: number) => (
                          <li key={i} className="flex">
                            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary h-6 w-6 text-sm mr-3">
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-sm">{factor}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setTrainingStatus('idle');
                  setModelData(null);
                }}
              >
                Train New Model
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}