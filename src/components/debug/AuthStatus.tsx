import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/supabase';
import { userService } from '../../lib/userService';

export function AuthStatus() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        // Get auth user
        const user = await auth.getCurrentUser();
        setAuthUser(user);

        if (user) {
          // Try to get profile user
          console.log('AuthStatus: Trying to fetch user profile...');
          try {
            const profile = await userService.getCurrentUserProfile();
            console.log('AuthStatus: Profile fetched successfully:', profile);
            setProfileUser(profile);
          } catch (profileError: any) {
            console.log('AuthStatus: Profile fetch failed:', profileError);
            setError(profileError.message);
          }
        }
      } catch (authError: any) {
        setError(authError.message);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, []);

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-4 max-w-sm">
        <h3 className="font-semibold text-blue-800">Auth Status</h3>
        <p className="text-blue-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg p-4 max-w-sm shadow-lg z-50">
      <h3 className="font-semibold text-gray-800 mb-2">🔍 Debug: Auth Status</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Auth User:</strong> {authUser ? '✅' : '❌'}
          {authUser && (
            <div className="ml-2 text-gray-600">
              <div>Email: {authUser.email}</div>
              <div>ID: {authUser.id?.substring(0, 8)}...</div>
            </div>
          )}
        </div>

        <div>
          <strong>Profile Tables:</strong> {profileUser ? '✅' : '❌'}
          {error && (
            <div className="ml-2 text-red-600 text-xs">
              Error: {error}
            </div>
          )}
          {profileUser && (
            <div className="ml-2 text-gray-600">
              <div>Name: {profileUser.display_name}</div>
              <div>Role: {profileUser.role?.role_type || 'None'}</div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-gray-200 text-xs text-gray-500">
          {error?.includes('migration needed') ? (
            <span className="text-orange-600">⚠️ Run migration in Supabase</span>
          ) : (
            <span className="text-green-600">✅ System ready</span>
          )}
        </div>
      </div>
    </div>
  );
}