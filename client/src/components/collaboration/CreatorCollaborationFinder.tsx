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
  Badge,
  Checkbox
} from '../ui/index';
import { Platform } from '@shared/schema';
import { generateCreatorCollaborations } from '../../lib/api';
import { CollaborationType } from '../../lib/types';
import { 
  Users, 
  Search, 
  CheckCircle, 
  ArrowRight, 
  BarChart3,
  UserPlus, 
  Star,
  Zap,
  MessageCircle,
  Link as LinkIcon,
  Mail,
  UserCheck,
  ArrowUpRight
} from 'lucide-react';

// Platforms available for selection
const PLATFORM_OPTIONS: Platform[] = [
  'instagram',
  'twitter',
  'facebook',
  'linkedin',
  'tiktok',
  'youtube',
  'pinterest',
  'snapchat',
  'threads',
  'reddit',
  'medium'
];

// Collaboration types
const COLLABORATION_OPTIONS: CollaborationType[] = [
  'video',
  'podcast',
  'shoutout',
  'giveaway',
  'live',
  'story_takeover',
  'joint_post',
  'guest_content',
  'challenge',
  'product_collab'
];

// Minimum audience size options
const AUDIENCE_SIZE_OPTIONS = [
  { label: 'Any size', value: 0 },
  { label: '5K+', value: 5000 },
  { label: '10K+', value: 10000 },
  { label: '50K+', value: 50000 },
  { label: '100K+', value: 100000 },
  { label: '500K+', value: 500000 },
  { label: '1M+', value: 1000000 }
];

// Audience overlap options
const AUDIENCE_OVERLAP_OPTIONS = [
  { label: 'Any overlap', value: 0 },
  { label: 'Low overlap (for new audiences)', value: 20 },
  { label: 'Medium overlap', value: 40 },
  { label: 'High overlap (similar audiences)', value: 60 }
];

interface CreatorCollaboration {
  creatorName: string;
  platform: string;
  audienceSize: number;
  engagementRate: number;
  audienceOverlap: number;
  contentSynergy: number;
  niche: string;
  topics: string[];
  recommendedCollabTypes: CollaborationType[];
  potentialReach: number;
  contactMethod?: string;
  profileUrl?: string;
  collaborationIdeas: string[];
  benefitPrediction: {
    followerGain: string;
    engagementBoost: string;
    monetizationPotential: string;
  };
  matchScore: number;
}

export const CreatorCollaborationFinder: React.FC = () => {
  // Filter states
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [minAudienceSize, setMinAudienceSize] = useState<number>(0);
  const [preferredCollabTypes, setPreferredCollabTypes] = useState<CollaborationType[]>([]);
  const [audienceOverlap, setAudienceOverlap] = useState<number>(0);
  const [creatorNiche, setCreatorNiche] = useState<string>('');
  
  // Mutation for finding collaborations
  const findCollabsMutation = useMutation({
    mutationFn: (data: {
      platforms?: Platform[];
      minAudienceSize?: number;
      preferredCollabTypes?: CollaborationType[];
      audienceOverlap?: number;
      creatorNiche?: string;
    }) => generateCreatorCollaborations(data)
  });
  
  // Handle finding collaborations
  const handleFindCollaborations = () => {
    findCollabsMutation.mutate({
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
      minAudienceSize: minAudienceSize > 0 ? minAudienceSize : undefined,
      preferredCollabTypes: preferredCollabTypes.length > 0 ? preferredCollabTypes : undefined,
      audienceOverlap: audienceOverlap > 0 ? audienceOverlap : undefined,
      creatorNiche: creatorNiche ? creatorNiche : undefined
    });
  };
  
  // Toggle platform selection
  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };
  
  // Toggle collaboration type selection
  const toggleCollabType = (type: CollaborationType) => {
    if (preferredCollabTypes.includes(type)) {
      setPreferredCollabTypes(preferredCollabTypes.filter(t => t !== type));
    } else {
      setPreferredCollabTypes([...preferredCollabTypes, type]);
    }
  };
  
  // Format platform name
  const formatPlatformName = (platform: string): string => {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };
  
  // Format collaboration type name for display
  const formatCollabType = (type: CollaborationType): string => {
    switch(type) {
      case 'video': return 'Video Collab';
      case 'podcast': return 'Podcast Guest';
      case 'shoutout': return 'Shoutout Exchange';
      case 'giveaway': return 'Joint Giveaway';
      case 'live': return 'Live Stream';
      case 'story_takeover': return 'Story Takeover';
      case 'joint_post': return 'Joint Post';
      case 'guest_content': return 'Guest Content';
      case 'challenge': return 'Challenge';
      case 'product_collab': return 'Product Collab';
      default: return type;
    }
  };
  
  // Format number with K, M suffixes
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  // Format percentage
  const formatPercentage = (value: number): string => {
    return value.toFixed(1) + '%';
  };
  
  // Get match score text and color
  const getMatchScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-blue-500';
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Creator Collaboration Finder
          </CardTitle>
          <CardDescription>
            Find the perfect creator collaborations based on audience match and content synergy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map(platform => (
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
              {COLLABORATION_OPTIONS.map((type: CollaborationType) => (
                <Badge
                  key={type}
                  variant={preferredCollabTypes.includes(type) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCollabType(type)}
                >
                  {formatCollabType(type)}
                </Badge>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Minimum Audience Size</h3>
              <Select 
                value={minAudienceSize.toString()} 
                onValueChange={(val) => setMinAudienceSize(parseInt(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select minimum audience size" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_SIZE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Audience Overlap</h3>
              <Select 
                value={audienceOverlap.toString()} 
                onValueChange={(val) => setAudienceOverlap(parseInt(val))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select desired audience overlap" />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OVERLAP_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Creator Niche (Optional)</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={creatorNiche}
                onChange={(e) => setCreatorNiche(e.target.value)}
                placeholder="e.g. fitness, beauty, tech, finance, travel"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleFindCollaborations}
            disabled={findCollabsMutation.isPending}
            className="w-full sm:w-auto"
          >
            {findCollabsMutation.isPending ? "Finding Collaborations..." : "Find Collaborations"}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Loading state */}
      {findCollabsMutation.isPending && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
              <p className="mt-4 text-sm text-muted-foreground">
                Analyzing creator profiles and finding the best matches for your audience...
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Error state */}
      {findCollabsMutation.isError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive p-4">
              <p className="font-medium">Unable to find creator collaborations</p>
              <p className="text-sm mt-1">Please try again or adjust your parameters</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Results display */}
      {findCollabsMutation.isSuccess && findCollabsMutation.data && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Collaboration Opportunities</h2>
            <Badge variant="outline" className="text-sm">
              {findCollabsMutation.data.length} matches found
            </Badge>
          </div>
          
          {findCollabsMutation.data.map((collab: CreatorCollaboration, index: number) => (
            <Card key={index} className="overflow-hidden">
              <div className="border-l-4 border-primary h-full absolute left-0"></div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{collab.creatorName}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {formatPlatformName(collab.platform)}
                      </Badge>
                      <span className="text-sm">{collab.niche}</span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-2xl font-bold ${getMatchScoreColor(collab.matchScore)}`}>
                      {collab.matchScore}%
                    </span>
                    <span className="text-xs text-muted-foreground">Match Score</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-muted-foreground">Audience Size</span>
                    <span className="text-xl font-bold">{formatNumber(collab.audienceSize)}</span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-muted-foreground">Engagement Rate</span>
                    <span className="text-xl font-bold">{formatPercentage(collab.engagementRate)}</span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-muted-foreground">Audience Overlap</span>
                    <span className="text-xl font-bold">{formatPercentage(collab.audienceOverlap)}</span>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-muted-foreground">Content Synergy</span>
                    <span className="text-xl font-bold">{formatPercentage(collab.contentSynergy)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Recommended Collaboration Types
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {collab.recommendedCollabTypes.map((type: CollaborationType) => (
                      <Badge key={type} variant="secondary">
                        {formatCollabType(type)}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    Collaboration Ideas
                  </h3>
                  <ul className="space-y-2">
                    {collab.collaborationIdeas.map((idea: string, i: number) => (
                      <li key={i} className="text-sm flex gap-2 items-start">
                        <div className="bg-primary h-1.5 w-1.5 rounded-full mt-1.5"></div>
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted p-4 rounded-md">
                  <div className="space-y-1">
                    <span className="text-xs font-medium flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-blue-500" />
                      Follower Growth
                    </span>
                    <p className="text-sm">{collab.benefitPrediction.followerGain}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-xs font-medium flex items-center gap-1">
                      <BarChart3 className="h-3 w-3 text-green-500" />
                      Engagement Boost
                    </span>
                    <p className="text-sm">{collab.benefitPrediction.engagementBoost}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-xs font-medium flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-500" />
                      Monetization Potential
                    </span>
                    <p className="text-sm">{collab.benefitPrediction.monetizationPotential}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Common Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {collab.topics.map((topic: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
                {collab.profileUrl && (
                  <Button variant="outline" size="sm" className="gap-1">
                    <LinkIcon className="h-3 w-3" />
                    View Profile
                  </Button>
                )}
                
                {collab.contactMethod && (
                  <Button variant="outline" size="sm" className="gap-1">
                    <Mail className="h-3 w-3" />
                    Contact Creator
                  </Button>
                )}
                
                <Button className="ml-auto gap-1">
                  Initiate Collaboration
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};