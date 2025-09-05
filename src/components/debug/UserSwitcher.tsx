import React, { useState } from 'react';
import { auth } from '../../lib/supabase';
import { userService } from '../../lib/userService';
import toast from 'react-hot-toast';

export function UserSwitcher() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      // Clear the user cache before switching
      userService.clearCache();
      await auth.signOut(); // First sign out current user
      
      const { error } = await auth.signIn(email, password);
      if (error) throw error;
      
      // Clear cache again after login to ensure fresh data
      userService.clearCache();
      
      toast.success(`Logged in as ${email}`);
      // Refresh page to update all components
      window.location.reload();
    } catch (error) {
      console.error('Login error:', error);
      toast.error(`Failed to login: ${error}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed top-20 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm text-sm z-50">
      <h3 className="font-bold mb-3">User Switcher (Testing)</h3>
      
      <div className="space-y-2">
        <button
          onClick={() => handleLogin('tyson@casfid.com', 'password')}
          disabled={isLoggingIn}
          className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoggingIn ? 'Switching...' : 'Login as James Tyson'}
        </button>
        
        <button
          onClick={() => handleLogin('tyson@tundratides.com', 'password')}
          disabled={isLoggingIn}
          className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoggingIn ? 'Switching...' : 'Login as Tundra Tides'}
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        Click buttons to switch between users and test profiles
      </div>
    </div>
  );
}