import React, { useState } from 'react';
import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel
} from '../ui/select';
import {
  Button,
  Checkbox,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge
} from '../ui/index';
import { 
  SocialPlatform, 
  CollaborationType,
  CollaborationParams,
  CreatorCollaboration 
} from '../../lib/types';
import { queryClient } from '../../lib/queryClient';
import { apiRequest } from '../../lib/api';

// Platform options for collaboration filtering
const platformOptions: SocialPlatform[] = [
  "instagram",
  "twitter",
  "facebook",
  "linkedin",
  "tiktok",
  "youtube",
  "medium",
  "pinterest",
  "snapchat",
  "threads",
  "reddit",
  "discord",
  "tumblr",
  "whatsapp",
  "telegram",
  "mastodon"
];

// Collaboration type options
const collaborationOptions: CollaborationType[] = [
  "guest_post",
  "co_created_content",
  "live_stream",
  "podcast_appearance",
  "product_review",
  "joint_contest",
  "story_takeover",
  "cross_promotion",
  "series_collaboration",
  "affiliate_partnership"
];

const CreatorCollaborationFinder: React.FC = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([]);
  const [selectedCollabTypes, setSelectedCollabTypes] = useState<CollaborationType[]>([]);
  const [count, setCount] = useState<number>(5);

  // Fetch collaboration suggestions based on selected filters
  const { data: suggestions, isLoading, error, refetch } = useQuery<CreatorCollaboration[]>({
    queryKey: ['/api/collaborations/suggestions'],
    enabled: false
  });

  // Mutation for generating collaboration suggestions
  const generateMutation = useMutation({
    mutationFn: (params: CollaborationParams) => 
      apiRequest('/api/collaborations/suggestions', 'POST', params),
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/collaborations/suggestions'], data);
    }
  });

  const handleGenerateSuggestions = () => {
    generateMutation.mutate({
      preferredCollabTypes: selectedCollabTypes.length > 0 ? selectedCollabTypes : undefined,
      preferredPlatforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
      count
    });
  };

  const togglePlatform = (platform: SocialPlatform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const toggleCollabType = (type: CollaborationType) => {
    if (selectedCollabTypes.includes(type)) {
      setSelectedCollabTypes(selectedCollabTypes.filter(t => t !== type));
    } else {
      setSelectedCollabTypes([...selectedCollabTypes, type]);
    }
  };

  // Format the collaboration type for display
  const formatCollabType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format platform name for display
  const formatPlatformName = (platform: string): string => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Creator Collaborations</CardTitle>
          <CardDescription>
            Discover potential creator partnerships based on audience overlap and content synergy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Preferred Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {platformOptions.map(platform => (
                  <Badge
                    key={platform}
                    variant={selectedPlatforms.includes(platform) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePlatform(platform)}
                  >
                    {formatPlatformName(platform)}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Collaboration Types</h3>
              <div className="flex flex-wrap gap-2">
                {collaborationOptions.map(type => (
                  <Badge
                    key={type}
                    variant={selectedCollabTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleCollabType(type)}
                  >
                    {formatCollabType(type)}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Number of Suggestions</h3>
              <Select 
                value={count.toString()} 
                onValueChange={(val) => setCount(parseInt(val))}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Number of suggestions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Suggestions</SelectLabel>
                    <SelectItem value="3">3 suggestions</SelectItem>
                    <SelectItem value="5">5 suggestions</SelectItem>
                    <SelectItem value="10">10 suggestions</SelectItem>
                    <SelectItem value="15">15 suggestions</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleGenerateSuggestions}
            disabled={generateMutation.isPending}
            className="w-full sm:w-auto"
          >
            {generateMutation.isPending ? "Generating..." : "Find Collaborations"}
          </Button>
        </CardFooter>
      </Card>

      {generateMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-sm text-muted-foreground">
                Analyzing your audience and finding the perfect collaboration matches...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {generateMutation.isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive p-4">
              <p className="font-medium">Unable to generate collaboration suggestions</p>
              <p className="text-sm mt-1">Please try again or adjust your parameters</p>
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Creator Collaboration Suggestions</h2>
          
          {suggestions.map((collab, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{collab.creatorName}</CardTitle>
                    <CardDescription>
                      {collab.niche} Creator on {formatPlatformName(collab.platform)}
                    </CardDescription>
                  </div>
                  <Badge variant="success" className="ml-2">
                    {collab.matchScore * 100}% Match
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="overview">
                  <TabsList className="w-full">
                    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                    <TabsTrigger value="audience" className="flex-1">Audience</TabsTrigger>
                    <TabsTrigger value="ideas" className="flex-1">Collaboration Ideas</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Audience Size</p>
                        <p className="text-2xl font-bold">
                          {collab.audienceSize.toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Engagement Rate</p>
                        <p className="text-2xl font-bold">
                          {(collab.engagementRate * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Content Synergy</p>
                        <p className="text-2xl font-bold">
                          {(collab.contentSynergy * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recommended Collaboration Types</p>
                      <div className="flex flex-wrap gap-2">
                        {collab.recommendedCollabTypes.map(type => (
                          <Badge key={type} variant="secondary">
                            {formatCollabType(type)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {collab.topics.map((topic, i) => (
                          <Badge key={i} variant="outline">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="audience" className="space-y-4 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Audience Overlap</p>
                        <p className="text-2xl font-bold">
                          {(collab.audienceOverlap * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Percentage of shared audience interests and demographics
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Potential Reach</p>
                        <p className="text-2xl font-bold">
                          {collab.potentialReach.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Estimated new audience members you could reach
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Benefit Prediction</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Follower Gain</p>
                          <p className="text-sm">{collab.benefitPrediction.followerGain}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Engagement Boost</p>
                          <p className="text-sm">{collab.benefitPrediction.engagementBoost}</p>
                        </div>
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium">Monetization</p>
                          <p className="text-sm">{collab.benefitPrediction.monetizationPotential}</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ideas" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Collaboration Ideas</p>
                      <ul className="space-y-2 mt-2">
                        {collab.collaborationIdeas.map((idea, i) => (
                          <li key={i} className="pl-4 border-l-2 border-primary text-sm">
                            {idea}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {collab.contactMethod && (
                      <div className="mt-4 p-4 bg-muted rounded-md">
                        <p className="text-sm font-medium">Contact Information</p>
                        <p className="text-sm mt-1">{collab.contactMethod}</p>
                        {collab.profileUrl && (
                          <Button variant="link" className="p-0 h-auto mt-1 text-sm" onClick={() => window.open(collab.profileUrl, '_blank')}>
                            View Profile
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
              
              <CardFooter className="flex flex-wrap gap-2">
                <Button variant="outline">Message</Button>
                <Button>Initiate Collaboration</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorCollaborationFinder;