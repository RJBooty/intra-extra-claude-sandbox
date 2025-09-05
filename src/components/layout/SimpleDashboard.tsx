import React, { useState, useEffect } from 'react';
import { User, Mail, Briefcase, Calendar, TrendingUp, Users, FolderOpen, BarChart3 } from 'lucide-react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { userService, UserWithRole } from '../../lib/userService';
import { auth } from '../../lib/supabase';
import '../../utils/setupUserProfile'; // Import for browser console access
import '../../utils/createUserProfile'; // Import direct creation method
import { UserSwitcher } from '../debug/UserSwitcher';

interface SimpleDashboardProps {
  onNavigate: (section: string) => void;
}

const quickStats = [
  { label: 'Active Projects', value: '12', icon: FolderOpen, color: 'bg-blue-100 text-blue-600' },
  { label: 'Total Clients', value: '48', icon: Users, color: 'bg-green-100 text-green-600' },
  { label: 'Revenue This Month', value: '€284K', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  { label: 'Completion Rate', value: '94%', icon: BarChart3, color: 'bg-orange-100 text-orange-600' }
];

const recentActivity = [
  { action: 'Created new project', project: 'Tech Conference 2024', time: '2 hours ago' },
  { action: 'Updated client information', project: 'Music Festival 2024', time: '4 hours ago' },
  { action: 'Completed ROI analysis', project: 'Corporate Summit 2024', time: '1 day ago' },
  { action: 'Sent proposal to client', project: 'Art Exhibition 2024', time: '2 days ago' }
];

export function SimpleDashboard({ onNavigate }: SimpleDashboardProps) {
  console.log('SimpleDashboard rendering...');
  
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // Load current user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await userService.getCurrentUserProfile();
        setCurrentUser(profile);
      } catch (error) {
        console.error('SimpleDashboard: Failed to load user profile:', error);
        // Create fallback user data from auth if profile tables don't exist
        try {
          const authUser = await auth.getCurrentUser();
          if (authUser) {
            console.log('SimpleDashboard: Using fallback auth user data');
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
          console.error('SimpleDashboard: Failed to load auth user:', authError);
        }
      } finally {
        setUserLoading(false);
      }
    };

    loadUserProfile();

    // Listen for profile updates
    const handleProfileUpdate = (event: any) => {
      console.log('SimpleDashboard: Profile updated, refreshing...');
      loadUserProfile();
    };

    window.addEventListener('userProfileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, []);
  
  return (
    <div className="relative flex size-full min-h-screen flex-col bg-gray-50 overflow-x-hidden" style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}>
      <UserSwitcher />
      <div className="layout-container flex h-full grow flex-col">
        <Header onSearch={() => {}} onNavigateToDashboard={() => onNavigate('dashboard')} onNavigate={onNavigate} />
        <div className="gap-1 px-3 flex flex-1 justify-start py-5">
          {/* Persistent Sidebar */}
          <Sidebar 
            currentView="dashboard" 
            onNavigate={onNavigate}
          />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col flex-1 ml-4">
            {/* Welcome Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                {userLoading ? (
                  <div className="animate-pulse">
                    <div className="h-10 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-96"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-[#101418] tracking-light text-[32px] font-bold leading-tight">
                      Welcome back, {currentUser?.display_name || currentUser?.first_name || 'User'}!
                    </p>
                    <p className="text-[#5c728a] text-sm font-normal leading-normal">
                      Here's what's happening with your projects today
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* User Profile Card */}
            <div className="px-4 py-3">
              <div className="bg-white rounded-xl border border-[#d4dbe2] p-6">
                {userLoading ? (
                  <div className="flex items-center gap-6 animate-pulse">
                    <div className="rounded-full size-20 bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-48 mb-3"></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                        <div className="h-4 bg-gray-200 rounded w-36"></div>
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-20"
                      style={{ 
                        backgroundImage: currentUser?.avatar_url 
                          ? `url("${currentUser.avatar_url}")` 
                          : `url("https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop")`
                      }}
                    />
                    <div className="flex-1">
                      <h2 className="text-[#101418] text-xl font-bold leading-tight mb-2">
                        {currentUser?.display_name || `${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim() || 'User'}
                      </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#5c728a]" />
                        <span className="text-[#5c728a] text-sm">
                          {currentUser?.job_title || currentUser?.role?.role_type || 'Team Member'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#5c728a]" />
                        <span className="text-[#5c728a] text-sm">
                          {userLoading ? 'Loading...' : currentUser?.email || 'Email not available'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#5c728a]" />
                        <span className="text-[#5c728a] text-sm">
                          {currentUser?.department || 'IntraExtra Team'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#5c728a]" />
                        <span className="text-[#5c728a] text-sm">
                          {currentUser?.start_date 
                            ? `Joined ${new Date(currentUser.start_date).toLocaleDateString()}`
                            : 'Joined Recently'}
                        </span>
                      </div>
                    </div>
                  </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="px-4 py-3">
              <h3 className="text-[#101418] text-lg font-semibold mb-4">Quick Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-xl border border-[#d4dbe2] p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${stat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[#5c728a] text-sm">{stat.label}</p>
                          <p className="text-[#101418] text-xl font-bold">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="px-4 py-3">
              <h3 className="text-[#101418] text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="bg-white rounded-xl border border-[#d4dbe2] overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[#101418] text-sm font-medium">{activity.action}</p>
                          <p className="text-[#5c728a] text-sm">{activity.project}</p>
                        </div>
                        <span className="text-[#5c728a] text-xs">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3">
              <h3 className="text-[#101418] text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => onNavigate('projects')}
                  className="bg-white rounded-xl border border-[#d4dbe2] p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <FolderOpen className="w-6 h-6 text-blue-600 mb-2" />
                  <p className="text-[#101418] font-medium">View All Projects</p>
                  <p className="text-[#5c728a] text-sm">Browse and manage existing projects</p>
                </button>
                
                <button
                  onClick={() => onNavigate('clients')}
                  className="bg-white rounded-xl border border-[#d4dbe2] p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <Users className="w-6 h-6 text-green-600 mb-2" />
                  <p className="text-[#101418] font-medium">Manage Clients</p>
                  <p className="text-[#5c728a] text-sm">View and update client information</p>
                </button>
                
                <button
                  onClick={() => onNavigate('reports')}
                  className="bg-white rounded-xl border border-[#d4dbe2] p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <BarChart3 className="w-6 h-6 text-purple-600 mb-2" />
                  <p className="text-[#101418] font-medium">View Reports</p>
                  <p className="text-[#5c728a] text-sm">Analyze performance metrics</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}