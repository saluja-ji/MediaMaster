import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';
import PreferencesPanel from '@/components/settings/PreferencesPanel';

export default function Settings() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="grid gap-8">
        <PreferencesPanel />
      </div>
      
      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-4">About Platform Flexibility</h2>
        <p className="mb-4">
          Our platform is designed to be fully configurable based on your specific marketing strategy
          and platform preferences. Use the options above to customize every aspect of your experience.
        </p>
        <p>
          All settings are saved automatically and will be applied immediately across your account.
          You can adjust these preferences at any time to adapt to changing marketing needs or platform requirements.
        </p>
      </div>
    </div>
  );
}