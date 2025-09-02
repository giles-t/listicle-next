'use client';

import { User } from '@supabase/supabase-js';

interface DashboardClientProps {
  user: User;
}

export function DashboardClient({ user }: DashboardClientProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to your Dashboard!
          </h1>
          <p className="text-gray-600 mb-4">
            Hello {user.email}! You&apos;ve successfully signed in.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              🎉 Authentication Working!
            </h2>
            <p className="text-blue-800">
              Your magic link authentication is now working correctly with SSR. 
              This is where your listicle creation and management features will go.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Lists</h3>
            <p className="text-gray-600 mb-4">Start creating your first listicle</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Coming Soon
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">My Lists</h3>
            <p className="text-gray-600 mb-4">View and manage your lists</p>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Coming Soon
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 mb-4">Track your list performance</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 