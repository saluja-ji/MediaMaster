import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';

export default function Monetization() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Monetization</h1>
      
      <div className="grid gap-6">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Revenue Summary</h2>
          <p className="text-gray-600">
            Configure your monetization preferences in the Settings page to customize how
            revenue opportunities are presented and tracked.
          </p>
        </div>
      </div>
    </div>
  );
}