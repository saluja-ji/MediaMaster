import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import {
  BadgeDollarSign,
  BarChart3,
  Calendar,
  Edit3,
  MessageCircle,
  Settings,
  Bell
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { platformEnum } from '@shared/schema';

// Type definitions
type Platform = typeof platformEnum.options[number];

interface PlatformPreference {
  label: string;
  value: Platform;
  icon?: React.ReactNode;
}

interface UserPreferences {
  dashboard?: {
    defaultPeriod?: string;
    defaultPlatform?: string;
    enabledWidgets?: string[];
  };
  content?: {
    defaultPlatform?: Platform;
    autoAnalyzeContent?: boolean;
    preferredPostTimes?: Record<Platform, string[]>;
    defaultHashtags?: Record<Platform, string[]>;
    contentSuggestionTopics?: string[];
  };
  autoEngage?: {
    enabled?: boolean;
    replyToComments?: boolean;
    likeRelevantContent?: boolean;
    followBackUsers?: boolean;
    engagementFrequency?: 'low' | 'medium' | 'high';
    blacklistedKeywords?: string[];
    maxDailyInteractions?: number;
    platforms?: Platform[];
  };
  monetization?: {
    enabledTypes?: string[];
    minRevenueThreshold?: number;
    targetRevenueGoals?: Record<Platform, number>;
    preferredPartners?: string[];
    blacklistedPartners?: string[];
    automaticSuggestions?: boolean;
  };
  analytics?: {
    defaultView?: string;
    kpiPriorities?: string[];
    customReportSchedule?: string;
    emailReports?: boolean;
  };
  notifications?: {
    email?: boolean;
    inApp?: boolean;
    types?: string[];
  };
}

const platforms: PlatformPreference[] = [
  { label: 'Twitter', value: 'twitter' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'TikTok', value: 'tiktok' },
  { label: 'YouTube', value: 'youtube' },
];

export default function PreferencesPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch current preferences
  const { data: preferences, isLoading } = useQuery<UserPreferences>({
    queryKey: ['/api/user/preferences'],
  });

  // Local state to track changes
  const [activeTab, setActiveTab] = useState('dashboard');
  const [localPreferences, setLocalPreferences] = useState<UserPreferences | undefined>(preferences);

  // Update preferences whenever the data is loaded
  React.useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  // Mutation to update preferences
  const updatePreferences = useMutation({
    mutationFn: (updatedPreferences: Partial<UserPreferences>) => {
      return apiRequest(`/api/user/preferences`, 'PATCH', updatedPreferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/preferences'] });
      toast({
        title: 'Preferences updated',
        description: 'Your preferences have been saved successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error updating preferences',
        description: 'Failed to save your preferences. Please try again.',
        variant: 'destructive',
      });
    }
  });

  const handleSave = () => {
    if (localPreferences) {
      updatePreferences.mutate(localPreferences);
    }
  };

  // Helper function to update nested preferences
  const updatePreference = (category: keyof UserPreferences, key: string, value: any) => {
    setLocalPreferences(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      };
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Loading preferences...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!localPreferences) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
          <CardDescription>No preferences found. Save changes to create your preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSave}>Initialize Preferences</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          User Preferences
        </CardTitle>
        <CardDescription>
          Customize your experience by configuring your preferences for each feature.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="autoEngage">Auto-Engage</TabsTrigger>
            <TabsTrigger value="monetization">Monetization</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Dashboard Preferences */}
          <TabsContent value="dashboard">
            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultPeriod">Default Time Period</Label>
                <Select 
                  value={localPreferences.dashboard?.defaultPeriod || '30days'} 
                  onValueChange={(value) => updatePreference('dashboard', 'defaultPeriod', value)}
                >
                  <SelectTrigger id="defaultPeriod">
                    <SelectValue placeholder="Select a time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                    <SelectItem value="year">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="defaultPlatform">Default Platform</Label>
                <Select 
                  value={localPreferences.dashboard?.defaultPlatform || 'all'} 
                  onValueChange={(value) => updatePreference('dashboard', 'defaultPlatform', value)}
                >
                  <SelectTrigger id="defaultPlatform">
                    <SelectValue placeholder="Select default platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {platforms.map(platform => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Enabled Dashboard Widgets</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'performance', label: 'Performance Chart', icon: <BarChart3 className="h-4 w-4" /> },
                    { id: 'monetization', label: 'Monetization Panel', icon: <BadgeDollarSign className="h-4 w-4" /> },
                    { id: 'upcoming-posts', label: 'Upcoming Posts', icon: <Calendar className="h-4 w-4" /> },
                    { id: 'ai-insights', label: 'AI Insights', icon: <Edit3 className="h-4 w-4" /> },
                    { id: 'roi-breakdown', label: 'ROI Breakdown', icon: <BarChart3 className="h-4 w-4" /> },
                    { id: 'auto-engage', label: 'Auto-Engage Activity', icon: <MessageCircle className="h-4 w-4" /> },
                  ].map(widget => (
                    <div key={widget.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`widget-${widget.id}`} 
                        checked={localPreferences.dashboard?.enabledWidgets?.includes(widget.id) || false}
                        onCheckedChange={(checked) => {
                          const current = localPreferences.dashboard?.enabledWidgets || [];
                          const updated = checked 
                            ? [...current, widget.id]
                            : current.filter(id => id !== widget.id);
                          updatePreference('dashboard', 'enabledWidgets', updated);
                        }}
                      />
                      <Label 
                        htmlFor={`widget-${widget.id}`}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {widget.icon}
                        {widget.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Content Preferences */}
          <TabsContent value="content">
            <div className="space-y-4">
              <div>
                <Label htmlFor="contentDefaultPlatform">Default Platform for Content</Label>
                <Select 
                  value={localPreferences.content?.defaultPlatform || 'twitter'} 
                  onValueChange={(value) => updatePreference('content', 'defaultPlatform', value)}
                >
                  <SelectTrigger id="contentDefaultPlatform">
                    <SelectValue placeholder="Select default platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(platform => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-analyze"
                  checked={localPreferences.content?.autoAnalyzeContent}
                  onCheckedChange={(checked) => updatePreference('content', 'autoAnalyzeContent', checked)}
                />
                <Label htmlFor="auto-analyze">Auto-analyze content with AI</Label>
              </div>
              
              <div>
                <Label>Content Suggestion Topics (comma-separated)</Label>
                <Input 
                  value={(localPreferences.content?.contentSuggestionTopics || []).join(', ')}
                  onChange={(e) => {
                    const topics = e.target.value
                      .split(',')
                      .map(topic => topic.trim())
                      .filter(Boolean);
                    updatePreference('content', 'contentSuggestionTopics', topics);
                  }}
                  placeholder="marketing, trends, industry news"
                />
              </div>
            </div>
          </TabsContent>

          {/* Auto-Engage Preferences */}
          <TabsContent value="autoEngage">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-engage-enabled"
                  checked={localPreferences.autoEngage?.enabled}
                  onCheckedChange={(checked) => updatePreference('autoEngage', 'enabled', checked)}
                />
                <Label htmlFor="auto-engage-enabled">Enable Auto-Engage features</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="reply-comments" 
                    checked={localPreferences.autoEngage?.replyToComments}
                    onCheckedChange={(checked) => updatePreference('autoEngage', 'replyToComments', checked)}
                  />
                  <Label htmlFor="reply-comments">Auto-reply to comments</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="like-content" 
                    checked={localPreferences.autoEngage?.likeRelevantContent}
                    onCheckedChange={(checked) => updatePreference('autoEngage', 'likeRelevantContent', checked)}
                  />
                  <Label htmlFor="like-content">Auto-like relevant content</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="follow-back" 
                    checked={localPreferences.autoEngage?.followBackUsers}
                    onCheckedChange={(checked) => updatePreference('autoEngage', 'followBackUsers', checked)}
                  />
                  <Label htmlFor="follow-back">Auto-follow back users</Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="engagement-frequency">Engagement Frequency</Label>
                <Select 
                  value={localPreferences.autoEngage?.engagementFrequency || 'medium'} 
                  onValueChange={(value) => updatePreference('autoEngage', 'engagementFrequency', value)}
                >
                  <SelectTrigger id="engagement-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (few times a day)</SelectItem>
                    <SelectItem value="medium">Medium (several times a day)</SelectItem>
                    <SelectItem value="high">High (many times a day)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="daily-interactions">Maximum Daily Interactions: {localPreferences.autoEngage?.maxDailyInteractions || 20}</Label>
                <Slider 
                  id="daily-interactions"
                  defaultValue={[localPreferences.autoEngage?.maxDailyInteractions || 20]}
                  max={100}
                  step={5}
                  onValueChange={(values) => updatePreference('autoEngage', 'maxDailyInteractions', values[0])}
                />
              </div>
              
              <div>
                <Label>Blacklisted Keywords (comma-separated)</Label>
                <Input 
                  value={(localPreferences.autoEngage?.blacklistedKeywords || []).join(', ')}
                  onChange={(e) => {
                    const keywords = e.target.value
                      .split(',')
                      .map(keyword => keyword.trim())
                      .filter(Boolean);
                    updatePreference('autoEngage', 'blacklistedKeywords', keywords);
                  }}
                  placeholder="competitor, negative, inappropriate"
                />
              </div>
            </div>
          </TabsContent>

          {/* Monetization Preferences */}
          <TabsContent value="monetization">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Enabled Monetization Types</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'affiliate', label: 'Affiliate Marketing' },
                    { id: 'sponsored', label: 'Sponsored Posts' },
                    { id: 'product', label: 'Product Sales' },
                    { id: 'subscription', label: 'Subscriptions' },
                    { id: 'donation', label: 'Donations/Tips' },
                  ].map(type => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`monetization-${type.id}`} 
                        checked={localPreferences.monetization?.enabledTypes?.includes(type.id) || false}
                        onCheckedChange={(checked) => {
                          const current = localPreferences.monetization?.enabledTypes || [];
                          const updated = checked 
                            ? [...current, type.id]
                            : current.filter(id => id !== type.id);
                          updatePreference('monetization', 'enabledTypes', updated);
                        }}
                      />
                      <Label htmlFor={`monetization-${type.id}`}>{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="revenue-threshold">Minimum Revenue Threshold ($): {localPreferences.monetization?.minRevenueThreshold || 50}</Label>
                <Slider 
                  id="revenue-threshold"
                  defaultValue={[localPreferences.monetization?.minRevenueThreshold || 50]}
                  max={500}
                  step={10}
                  onValueChange={(values) => updatePreference('monetization', 'minRevenueThreshold', values[0])}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-suggestions"
                  checked={localPreferences.monetization?.automaticSuggestions}
                  onCheckedChange={(checked) => updatePreference('monetization', 'automaticSuggestions', checked)}
                />
                <Label htmlFor="auto-suggestions">Show automatic monetization suggestions</Label>
              </div>
              
              <div>
                <Label>Preferred Partners (comma-separated)</Label>
                <Input 
                  value={(localPreferences.monetization?.preferredPartners || []).join(', ')}
                  onChange={(e) => {
                    const partners = e.target.value
                      .split(',')
                      .map(partner => partner.trim())
                      .filter(Boolean);
                    updatePreference('monetization', 'preferredPartners', partners);
                  }}
                  placeholder="Amazon, Shopify, Nike"
                />
              </div>
            </div>
          </TabsContent>

          {/* Analytics Preferences */}
          <TabsContent value="analytics">
            <div className="space-y-4">
              <div>
                <Label htmlFor="default-view">Default Analytics View</Label>
                <Select 
                  value={localPreferences.analytics?.defaultView || 'overview'} 
                  onValueChange={(value) => updatePreference('analytics', 'defaultView', value)}
                >
                  <SelectTrigger id="default-view">
                    <SelectValue placeholder="Select default view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="audience">Audience</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="report-schedule">Custom Report Schedule</Label>
                <Select 
                  value={localPreferences.analytics?.customReportSchedule || 'weekly'} 
                  onValueChange={(value) => updatePreference('analytics', 'customReportSchedule', value)}
                >
                  <SelectTrigger id="report-schedule">
                    <SelectValue placeholder="Select report schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="email-reports"
                  checked={localPreferences.analytics?.emailReports}
                  onCheckedChange={(checked) => updatePreference('analytics', 'emailReports', checked)}
                />
                <Label htmlFor="email-reports">Send reports by email</Label>
              </div>
              
              <div className="space-y-2">
                <Label>KPI Priorities</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'followers', label: 'Followers Growth' },
                    { id: 'impressions', label: 'Impressions' },
                    { id: 'engagement', label: 'Engagement Rate' },
                    { id: 'comments', label: 'Comments' },
                    { id: 'revenue', label: 'Revenue' },
                  ].map(kpi => (
                    <div key={kpi.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`kpi-${kpi.id}`} 
                        checked={localPreferences.analytics?.kpiPriorities?.includes(kpi.id) || false}
                        onCheckedChange={(checked) => {
                          const current = localPreferences.analytics?.kpiPriorities || [];
                          const updated = checked 
                            ? [...current, kpi.id]
                            : current.filter(id => id !== kpi.id);
                          updatePreference('analytics', 'kpiPriorities', updated);
                        }}
                      />
                      <Label htmlFor={`kpi-${kpi.id}`}>{kpi.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Preferences */}
          <TabsContent value="notifications">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email-notifications"
                  checked={localPreferences.notifications?.email}
                  onCheckedChange={(checked) => updatePreference('notifications', 'email', checked)}
                />
                <Label htmlFor="email-notifications">Email Notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="in-app-notifications"
                  checked={localPreferences.notifications?.inApp}
                  onCheckedChange={(checked) => updatePreference('notifications', 'inApp', checked)}
                />
                <Label htmlFor="in-app-notifications">In-app Notifications</Label>
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notification Types
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'insights', label: 'AI Insights' },
                    { id: 'engagement', label: 'Engagement Alerts' },
                    { id: 'shadowban-risk', label: 'Shadowban Risk Warnings' },
                    { id: 'monetization', label: 'Monetization Opportunities' },
                    { id: 'performance', label: 'Performance Updates' },
                    { id: 'scheduled-posts', label: 'Scheduled Posts Reminders' },
                  ].map(notif => (
                    <div key={notif.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`notif-${notif.id}`} 
                        checked={localPreferences.notifications?.types?.includes(notif.id) || false}
                        onCheckedChange={(checked) => {
                          const current = localPreferences.notifications?.types || [];
                          const updated = checked 
                            ? [...current, notif.id]
                            : current.filter(id => id !== notif.id);
                          updatePreference('notifications', 'types', updated);
                        }}
                      />
                      <Label htmlFor={`notif-${notif.id}`}>{notif.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={updatePreferences.isPending}
          >
            {updatePreferences.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}