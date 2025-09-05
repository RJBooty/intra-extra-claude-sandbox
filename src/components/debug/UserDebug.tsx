import React, { useState, useEffect } from 'react';
import { auth } from '../../lib/supabase';
import { userService } from '../../lib/userService';

export function UserDebug() {
  const [authUser, setAuthUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkData = async () => {
      try {
        // Check auth user
        const user = await auth.getCurrentUser();
        setAuthUser(user);
        console.log('Auth user:', user);

        if (user) {
          // Try to get user profile
          try {
            const profile = await userService.getCurrentUserProfile();
            setUserProfile(profile);
            console.log('User profile:', profile);
          } catch (profileError) {
            console.error('Profile error:', profileError);
            setError(`Profile error: ${profileError}`);
          }
        }
      } catch (authError) {
        console.error('Auth error:', authError);
        setError(`Auth error: ${authError}`);
      } finally {
        setLoading(false);
      }
    };

    checkData();
  }, []);

  if (loading) return <div>Checking user data...</div>;

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md text-xs">
      <h3 className="font-bold mb-2">User Debug Info</h3>
      
      <div className="mb-2">
        <strong>Auth User:</strong>
        <pre className="bg-gray-100 p-1 mt-1 rounded text-xs overflow-auto">
          {authUser ? JSON.stringify({
            id: authUser.id,
            email: authUser.email,
            metadata: authUser.user_metadata
          }, null, 2) : 'Not logged in'}
        </pre>
      </div>

      <div className="mb-2">
        <strong>User Profile:</strong>
        <pre className="bg-gray-100 p-1 mt-1 rounded text-xs overflow-auto">
          {userProfile ? JSON.stringify({
            name: userProfile.display_name || userProfile.first_name,
            email: userProfile.email,
            role: userProfile.role?.role_type
          }, null, 2) : 'No profile found'}
        </pre>
      </div>

      {error && (
        <div className="mb-2">
          <strong className="text-red-600">Error:</strong>
          <div className="text-red-600 text-xs">{error}</div>
        </div>
      )}
    </div>
  );
}