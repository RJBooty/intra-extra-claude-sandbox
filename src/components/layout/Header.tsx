import React, { useState, useRef, useEffect } from 'react';
import { Search, CircleDot, LogOut, User, Settings } from 'lucide-react';
import { auth } from '../../lib/supabase';
import { userService, UserWithRole } from '../../lib/userService';
import toast from 'react-hot-toast';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onNavigateToDashboard?: () => void;
  onNavigate?: (section: string) => void;
}

export function Header({ onSearch, onNavigateToDashboard, onNavigate }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load current user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await userService.getCurrentUserProfile();
        setCurrentUser(profile);
      } catch (error) {
        console.error('Header: Failed to load user profile:', error);
        // Create fallback user data from auth if profile tables don't exist
        try {
          const authUser = await auth.getCurrentUser();
          if (authUser) {
            console.log('Header: Using fallback auth user data');
            const fallbackUser: UserWithRole = {
              id: authUser.id,
              email: authUser.email || 'user@example.com',
              first_name: authUser.user_metadata?.first_name || 'User',
              last_name: authUser.user_metadata?.last_name || '',
              display_name: authUser.user_metadata?.display_name || `${authUser.user_metadata?.first_name || 'User'} ${authUser.user_metadata?.last_name || ''}`,
              phone: null,
              avatar_url: null,
              job_title: authUser.user_metadata?.job_title || null,
              department: authUser.user_metadata?.department || null,
              office_location: null,
              start_date: null,
              manager_id: null,
              preferred_communication: null,
              timezone: 'UTC',
              is_active: true,
              last_login: null,
              created_at: authUser.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString(),
              role: null,
              preferences: null
            };
            setCurrentUser(fallbackUser);
          }
        } catch (authError) {
          console.error('Header: Failed to load auth user:', authError);
        }
      } finally {
        setUserLoading(false);
      }
    };

    loadUserProfile();

    // Listen for profile updates
    const handleProfileUpdate = (event: any) => {
      console.log('Header: Profile updated, refreshing...');
      loadUserProfile();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully');
      setShowDropdown(false);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#eaedf1] px-10 py-3 bg-white">
      <div className="flex items-center gap-8">
        <button 
          onClick={onNavigateToDashboard}
          className="flex items-center gap-4 text-[#101418] hover:text-blue-600 transition-colors"
        >
          <div className="size-4">
            <CircleDot className="w-4 h-4" />
          </div>
          <h2 className="text-[#101418] text-lg font-bold leading-tight tracking-[-0.015em]">
            IntraExtra
          </h2>
        </button>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <label className="flex flex-col min-w-40 !h-10 max-w-64">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
            <div className="text-[#5c728a] flex border-none bg-[#eaedf1] items-center justify-center pl-4 rounded-l-xl border-r-0">
              <Search className="w-6 h-6" />
            </div>
            <input
              placeholder="Search projects, clients..."
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101418] focus:outline-0 focus:ring-0 border-none bg-[#eaedf1] focus:border-none h-full placeholder:text-[#5c728a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all"
            style={{
              backgroundImage: currentUser?.avatar_url 
                ? `url("${currentUser.avatar_url}")`
                : `url("https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop")`
            }}
            aria-label="User menu"
          />
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                {userLoading ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-40"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser?.display_name || `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'User'}
                    </p>
                    <p className="text-sm text-gray-500">{currentUser?.email || 'Loading...'}</p>
                  </>
                )}
                {currentUser?.role && (
                  <p className="text-xs text-blue-600 mt-1">{currentUser.role.role_type}</p>
                )}
              </div>
              
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onNavigate?.('user-profile');
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onNavigate?.('settings');
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              
              <hr className="my-1" />
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}