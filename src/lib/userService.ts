import { supabase, auth } from './supabase';
import { User } from '@supabase/supabase-js';

// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  job_title: string | null;
  department: string | null;
  office_location: string | null;
  start_date: string | null;
  manager_id: string | null;
  preferred_communication: 'email' | 'phone' | 'teams' | 'slack' | null;
  timezone: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_type: 'Master' | 'Senior' | 'Mid' | 'External' | 'HR';
  role_level: number;
  assigned_by: string | null;
  assigned_at: string;
  is_active: boolean;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  date_format: string;
  time_format: '12h' | '24h';
  email_notifications: boolean;
  push_notifications: boolean;
  project_updates: boolean;
  system_alerts: boolean;
  default_view: string;
  items_per_page: number;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole extends UserProfile {
  role: UserRole | null;
  preferences: UserPreferences | null;
}

class UserService {
  private userProfileCache: UserWithRole | null = null;
  private cachedUserId: string | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Get current authenticated user with full profile data
  async getCurrentUserProfile(): Promise<UserWithRole | null> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) return null;

      console.log('UserService: Attempting to fetch profile for user:', user.id);
      
      // Check if we have a valid cached profile for THIS user
      const now = Date.now();
      if (this.userProfileCache && 
          this.cachedUserId === user.id && 
          (now - this.cacheTimestamp) < this.CACHE_DURATION) {
        console.log('UserService: Returning cached profile for user:', user.id);
        return this.userProfileCache;
      }
      
      // Clear cache if it's for a different user
      if (this.cachedUserId && this.cachedUserId !== user.id) {
        console.log('UserService: User changed, clearing cache');
        this.clearCache();
      }

      // Handle specific users with fallback profiles
      const knownUsers = ['tyson@casfid.com', 'tyson@tundratides.com'];
      
      if (knownUsers.includes(user.email || '')) {
        try {
          // First try to get the profile normally
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select(`
              *,
              role:user_roles!left(
                id,
                role_type,
                role_level,
                assigned_by,
                assigned_at,
                is_active
              ),
              preferences:user_preferences(*)
            `)
            .eq('id', user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError);
          }

          if (profile) {
            console.log('UserService: Found existing profile:', profile);
            return {
              ...profile,
              role: profile.role?.[0] || null,
              preferences: profile.preferences?.[0] || null
            };
          }
        } catch (err) {
          console.log('UserService: Profile fetch failed, creating fallback');
        }

        // Create fallback profiles for known users
        if (user.email === 'tyson@casfid.com') {
          console.log('UserService: Creating fallback profile for James Tyson');
          const profile = this.createJamesTysonFallback(user);
          this.userProfileCache = profile;
          this.cachedUserId = user.id;
          this.cacheTimestamp = Date.now();
          return profile;
        } else if (user.email === 'tyson@tundratides.com') {
          console.log('UserService: Creating fallback profile for Tundra Tides');
          const profile = this.createTundraTidesFallback(user);
          this.userProfileCache = profile;
          this.cachedUserId = user.id;
          this.cacheTimestamp = Date.now();
          return profile;
        }
      }

      // For other users, try normal flow
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          role:user_roles!inner(
            id,
            role_type,
            role_level,
            assigned_by,
            assigned_at,
            is_active
          ),
          preferences:user_preferences(*)
        `)
        .eq('id', user.id)
        .eq('user_roles.is_active', true)
        .single();
      
      console.log('UserService: Query result - profile:', profile);
      console.log('UserService: Query error:', profileError);

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        
        // If tables don't exist, throw error to trigger fallback in components
        if (profileError.message?.includes('does not exist') || profileError.code === 'PGRST116') {
          throw new Error('User profile tables not found - migration needed');
        }
        return null;
      }

      return {
        ...profile,
        role: profile.role?.[0] || null,
        preferences: profile.preferences?.[0] || null
      };
    } catch (error) {
      console.error('Failed to get current user profile:', error);
      throw error; // Re-throw to trigger fallback handling in components
    }
  }

  // Create fallback profile for James Tyson (Master user)
  private createJamesTysonFallback(user: any): UserWithRole {
    // Check localStorage for avatar
    let storedAvatar = localStorage.getItem('avatar_tyson@casfid.com');
    
    // Clean up invalid blob URLs (from old sessions)
    if (storedAvatar && storedAvatar.startsWith('blob:')) {
      localStorage.removeItem('avatar_tyson@casfid.com');
      storedAvatar = null;
    }
    
    return {
      id: user.id,
      email: 'tyson@casfid.com',
      first_name: 'James',
      last_name: 'Tyson',
      display_name: 'James Tyson',
      phone: null,
      avatar_url: storedAvatar,
      job_title: 'Platform Owner',
      department: 'Technology',
      office_location: null,
      start_date: null,
      manager_id: null,
      preferred_communication: null,
      timezone: 'UTC',
      is_active: true,
      last_login: null,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: {
        id: 'fallback-role-james',
        user_id: user.id,
        role_type: 'Master',
        role_level: 1,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
        is_active: true
      },
      preferences: {
        id: 'fallback-prefs-james',
        user_id: user.id,
        theme: 'light',
        language: 'en',
        date_format: 'DD/MM/YYYY',
        time_format: '24h',
        email_notifications: true,
        push_notifications: true,
        project_updates: true,
        system_alerts: true,
        default_view: 'dashboard',
        items_per_page: 25,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  // Create fallback profile for Tundra Tides (Senior user)
  private createTundraTidesFallback(user: any): UserWithRole {
    // Check localStorage for avatar
    let storedAvatar = localStorage.getItem('avatar_tyson@tundratides.com');
    
    // Clean up invalid blob URLs (from old sessions)
    if (storedAvatar && storedAvatar.startsWith('blob:')) {
      localStorage.removeItem('avatar_tyson@tundratides.com');
      storedAvatar = null;
    }
    
    return {
      id: user.id,
      email: 'tyson@tundratides.com',
      first_name: 'Tundra',
      last_name: 'Tides',
      display_name: 'Tundra Tides',
      phone: null,
      avatar_url: storedAvatar,
      job_title: 'Senior Developer',
      department: 'Development',
      office_location: null,
      start_date: null,
      manager_id: null,
      preferred_communication: null,
      timezone: 'UTC',
      is_active: true,
      last_login: null,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: {
        id: 'fallback-role-tundra',
        user_id: user.id,
        role_type: 'Senior',
        role_level: 2,
        assigned_by: user.id,
        assigned_at: new Date().toISOString(),
        is_active: true
      },
      preferences: {
        id: 'fallback-prefs-tundra',
        user_id: user.id,
        theme: 'dark',
        language: 'en',
        date_format: 'MM/DD/YYYY',
        time_format: '12h',
        email_notifications: true,
        push_notifications: false,
        project_updates: true,
        system_alerts: true,
        default_view: 'projects',
        items_per_page: 50,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  }

  // Update user profile
  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  // Update user preferences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }

  // Create user profile (called during signup)
  async createUserProfile(userData: {
    email: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
    job_title?: string;
    department?: string;
  }): Promise<UserProfile | null> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          id: user.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          display_name: userData.display_name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
          job_title: userData.job_title,
          department: userData.department
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create user profile:', error);
      throw error;
    }
  }

  // Get user role
  async getUserRole(userId?: string): Promise<UserRole | null> {
    try {
      const targetUserId = userId || (await auth.getCurrentUser())?.id;
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user role:', error);
      return null;
    }
  }

  // Assign role to user (Master users only)
  async assignRole(userId: string, roleType: UserRole['role_type']): Promise<UserRole | null> {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) throw new Error('No authenticated user');

      // Check if current user has permission
      const currentUserRole = await this.getUserRole(currentUser.id);
      if (!currentUserRole || currentUserRole.role_type !== 'Master') {
        throw new Error('Insufficient permissions to assign roles');
      }

      // Deactivate existing role
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      // Map role type to level
      const roleLevelMap: Record<UserRole['role_type'], number> = {
        'Master': 1,
        'Senior': 2,
        'Mid': 3,
        'External': 4,
        'HR': 5
      };

      // Create new role
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{
          user_id: userId,
          role_type: roleType,
          role_level: roleLevelMap[roleType],
          assigned_by: currentUser.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to assign role:', error);
      throw error;
    }
  }

  // Check if user has permission
  async hasPermission(requiredRole: UserRole['role_type'], userId?: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      if (!userRole) return false;

      const roleHierarchy = ['Master', 'Senior', 'Mid', 'External', 'HR'];
      const userLevel = roleHierarchy.indexOf(userRole.role_type);
      const requiredLevel = roleHierarchy.indexOf(requiredRole);

      // Special case: HR can only access HR-specific functions
      if (userRole.role_type === 'HR' && requiredRole !== 'HR') {
        return false;
      }

      return userLevel <= requiredLevel;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }

  // Get all users (Master/Senior only)
  async getAllUsers(): Promise<UserWithRole[]> {
    try {
      const currentUser = await this.getCurrentUserProfile();
      if (!currentUser?.role || !['Master', 'Senior'].includes(currentUser.role.role_type)) {
        throw new Error('Insufficient permissions to view all users');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          role:user_roles!inner(
            id,
            role_type,
            role_level,
            assigned_by,
            assigned_at,
            is_active
          ),
          preferences:user_preferences(*)
        `)
        .eq('user_roles.is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(user => ({
        ...user,
        role: user.role?.[0] || null,
        preferences: user.preferences?.[0] || null
      }));
    } catch (error) {
      console.error('Failed to get all users:', error);
      return [];
    }
  }

  // Clear the user profile cache
  clearCache(): void {
    this.userProfileCache = null;
    this.cachedUserId = null;
    this.cacheTimestamp = 0;
    console.log('UserService: Cache cleared');
  }

  // Update avatar
  async updateAvatar(file: File): Promise<string | null> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) throw new Error('No authenticated user');

      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${user.id}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message || 'Unknown error'}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Note: We don't update the profile in the database since we're using fallback profiles
      // The frontend will handle storing the URL in localStorage
      console.log('Avatar uploaded successfully to:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Failed to update avatar:', error);
      
      // Provide more specific error information
      if (error && typeof error === 'object' && 'message' in error) {
        throw new Error(`Avatar upload failed: ${(error as any).message}`);
      }
      throw new Error('Avatar upload failed: Unknown error');
    }
  }

  // Make tyson@casfid.com a Master user
  async setupMasterUser(email: string = 'tyson@casfid.com'): Promise<boolean> {
    try {
      // Find user by email
      const { data: users, error: userError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !users) {
        console.log('User not found:', email);
        return false;
      }

      // Remove existing roles
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', users.id);

      // Assign Master role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{
          user_id: users.id,
          role_type: 'Master',
          role_level: 1,
          assigned_by: users.id // Self-assigned for initial setup
        }]);

      if (roleError) throw roleError;

      console.log(`Master role assigned to ${email}`);
      return true;
    } catch (error) {
      console.error('Failed to setup master user:', error);
      return false;
    }
  }

  // Track user session
  async trackSession(sessionData: {
    ip_address?: string;
    user_agent?: string;
  }): Promise<void> {
    try {
      const user = await auth.getCurrentUser();
      if (!user) return;

      await supabase
        .from('user_sessions')
        .insert([{
          user_id: user.id,
          ip_address: sessionData.ip_address,
          user_agent: sessionData.user_agent
        }]);
    } catch (error) {
      console.error('Failed to track session:', error);
    }
  }
}

export const userService = new UserService();