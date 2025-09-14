// src/lib/services/userService.ts
import { supabase } from '../supabase';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  phone?: string;
  avatar_url?: string;
  job_title?: string;
  department?: 'Operations' | 'Sales' | 'Technical' | 'Finance' | 'HR' | 'Management';
  office_location?: 'UK' | 'Spain' | 'Remote' | 'Client Site';
  employee_id?: string;
  start_date?: string;
  manager_id?: string;
  preferred_communication?: 'email' | 'phone' | 'teams' | 'slack';
  timezone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  daily_rate?: number;
  currency?: string;
  tax_status?: 'PAYE' | 'Self-Employed' | 'Limited Company' | 'Overseas';
  availability_status?: 'available' | 'busy' | 'unavailable' | 'on_leave';
  next_available_date?: string;
  travel_willingness?: 'local' | 'national' | 'international' | 'any';
  passport_expiry?: string;
  visa_requirements?: string[];
  insurance_valid_until?: string;
  dbs_check_date?: string;
  projects_completed?: number;
  total_days_worked?: number;
  average_client_rating?: number;
  last_performance_review?: string;
  is_active?: boolean;
  profile_completion_percentage?: number;
  last_login?: string;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_type: 'Master' | 'Senior' | 'Mid' | 'External' | 'HR';
  role_level: number;
  role_description?: string;
  assigned_by?: string;
  assigned_at?: string;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
}

export interface UserWithRole extends UserProfile {
  role?: UserRole;
}

class UserService {
  // =====================================================
  // PROFILE MANAGEMENT
  // =====================================================

  async getCurrentUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching current user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get current user profile:', error);
      return null;
    }
  }

  async getCurrentUserWithRole(): Promise<UserWithRole | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
<<<<<<< HEAD
=======
        // If profile doesn't exist and user is tyson@casfid.com, create a mock profile
        if (user.email === 'tyson@casfid.com') {
          console.log('Creating mock profile for tyson@casfid.com');
          return {
            id: user.id,
            email: user.email!,
            first_name: 'James',
            last_name: 'Tyson',
            display_name: 'James Tyson',
            job_title: 'Platform Owner',
            department: 'Management',
            is_active: true,
            role: {
              id: 'master-role-tyson',
              user_id: user.id,
              role_type: 'Master',
              role_level: 1,
              assigned_by: null,
              assigned_at: new Date().toISOString(),
              is_active: true
            }
          } as UserWithRole;
        }
>>>>>>> 154385223d8bb9b733eed09dd439631b10769d25
        console.error('Error fetching current user profile:', profileError);
        return null;
      }

      // Get user role
      let role = null;
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (!roleError) {
          role = roleData;
        } else if (!roleError.message?.includes('No rows found')) {
          console.warn('Error fetching user role:', roleError.message);
        }
      } catch (err) {
        console.warn('Could not fetch user role:', err);
      }

      // For tyson@casfid.com, always ensure Master role
      if (user.email === 'tyson@casfid.com' && (!role || role.role_type !== 'Master')) {
        console.log('Setting Master role for tyson@casfid.com');
        return {
          ...profile,
          role: {
            id: 'master-role-tyson',
            user_id: user.id,
            role_type: 'Master',
            role_level: 1,
            assigned_by: null,
            assigned_at: new Date().toISOString(),
            is_active: true
          }
        };
      }

      return {
        ...profile,
        role: role || null
      };
    } catch (error) {
      console.error('Failed to get current user with role:', error);
      return null;
    }
  }

  async getUserProfileById(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile by ID:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user profile by ID:', error);
      return null;
    }
  }

  async getAllUserProfiles(): Promise<UserWithRole[]> {
    try {
      // First get all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('is_active', true)
        .order('display_name');

      if (profilesError) {
        // Check if it's a 406 error (table doesn't exist)
        if (profilesError.code === '42P01' || profilesError.message?.includes('relation') || profilesError.message?.includes('does not exist')) {
          console.warn('User profiles table not found. Please run database migrations.');
          return [];
        }
        console.error('Error fetching user profiles:', profilesError);
        return [];
      }

      // Then get roles separately to avoid recursion
      const usersWithRoles: UserWithRole[] = [];
      
      for (const profile of profiles || []) {
        try {
          const { data: role, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', profile.id)
            .eq('is_active', true)
            .single();
          
          if (roleError && !roleError.message?.includes('No rows found')) {
            console.warn(`Could not fetch role for user ${profile.id}:`, roleError.message);
          }
          
          usersWithRoles.push({
            ...profile,
            role: role || undefined
          });
        } catch (roleErr) {
          // If role fetch fails, still include the user without role
          usersWithRoles.push({
            ...profile,
            role: undefined
          });
        }
      }

      return usersWithRoles;
    } catch (error) {
      console.error('Failed to fetch all user profiles:', error);
      return [];
    }
  }

  async getUsersByDepartment(department: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('department', department)
        .eq('is_active', true)
        .order('display_name');

      if (error) {
        console.error('Error fetching users by department:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch users by department:', error);
      return [];
    }
  }

  async getUsersByLocation(location: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('office_location', location)
        .eq('is_active', true)
        .order('display_name');

      if (error) {
        console.error('Error fetching users by location:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch users by location:', error);
      return [];
    }
  }

  async getInternalProfiles(): Promise<UserWithRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles!user_roles_user_id_fkey!inner(
            id,
            role_type,
            role_level,
            assigned_by,
            assigned_at,
            is_active
          )
        `)
        .in('user_roles.role_type', ['Master', 'Senior', 'Mid'])
        .eq('is_active', true)
        .eq('user_roles.is_active', true)
        .order('display_name');

      if (error) {
        console.error('Error fetching internal profiles:', error);
        return [];
      }

      return (data || []).map(user => ({
        ...user,
        role: Array.isArray(user.user_roles) ? user.user_roles[0] : user.user_roles
      }));
    } catch (error) {
      console.error('Failed to fetch internal profiles:', error);
      return [];
    }
  }

  async getSpainProfiles(): Promise<UserWithRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles!user_roles_user_id_fkey(
            id,
            role_type,
            role_level,
            assigned_by,
            assigned_at,
            is_active
          )
        `)
        .eq('office_location', 'Spain')
        .eq('is_active', true)
        .order('display_name');

      if (error) {
        console.error('Error fetching Spain profiles:', error);
        return [];
      }

      return (data || []).map(user => ({
        ...user,
        role: Array.isArray(user.user_roles) ? user.user_roles[0] : user.user_roles
      }));
    } catch (error) {
      console.error('Failed to fetch Spain profiles:', error);
      return [];
    }
  }

  async getContractorProfiles(): Promise<UserWithRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles!user_roles_user_id_fkey!inner(
            id,
            role_type,
            role_level,
            assigned_by,
            assigned_at,
            is_active
          )
        `)
        .eq('user_roles.role_type', 'External')
        .eq('is_active', true)
        .eq('user_roles.is_active', true)
        .order('display_name');

      if (error) {
        console.error('Error fetching contractor profiles:', error);
        return [];
      }

      return (data || []).map(user => ({
        ...user,
        role: Array.isArray(user.user_roles) ? user.user_roles[0] : user.user_roles
      }));
    } catch (error) {
      console.error('Failed to fetch contractor profiles:', error);
      return [];
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      return false;
    }
  }

  async updateCurrentUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      return this.updateUserProfile(user.id, updates);
    } catch (error) {
      console.error('Failed to update current user profile:', error);
      return false;
    }
  }

  async createCurrentUserProfile(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

<<<<<<< HEAD
      // For known admin users, try to bootstrap them
      if (user.email === 'tyson@casfid.com' || user.email === 'j.r.tyson@outlook.com') {
        try {
          const names = user.email === 'tyson@casfid.com'
            ? { first: 'James', last: 'Tyson' }
            : { first: 'JR', last: 'TY' };

          const response = await supabase.rpc('create_bootstrap_master_user', {
            user_email: user.email,
            user_first_name: names.first,
            user_last_name: names.last
          });

          if (response.error) {
            console.error('Bootstrap function error:', response.error);
            return false;
          }

          console.log(`Bootstrap profile creation successful for ${user.email}`);
          return true;
        } catch (error) {
          console.error('Failed to bootstrap user:', error);
          return false;
        }
      }

=======
>>>>>>> 154385223d8bb9b733eed09dd439631b10769d25
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          display_name: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating user profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to create current user profile:', error);
      return false;
    }
  }

  // =====================================================
  // ROLE MANAGEMENT
  // =====================================================

  async getCurrentUserRole(): Promise<UserRole | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      return this.getUserRole(user.id);
    } catch (error) {
      console.error('Failed to get current user role:', error);
      return null;
    }
  }

  async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user role:', error);
      return null;
    }
  }

  async assignRole(userId: string, roleType: UserRole['role_type'], assignedBy?: string): Promise<boolean> {
    try {
      // Deactivate current role
      await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('user_id', userId);

      // Assign new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role_type: roleType,
          assigned_by: assignedBy,
          is_active: true
        });

      if (error) {
        console.error('Error assigning role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Failed to assign role:', error);
      return false;
    }
  }

  async isMasterUser(userId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) return false;

      const { data } = await supabase.rpc('is_master_user', { user_uuid: targetUserId });
      return data || false;
    } catch (error) {
      console.error('Failed to check master user:', error);
      return false;
    }
  }

  async hasPermission(module: string, action: string): Promise<boolean> {
    try {
      const role = await this.getCurrentUserRole();
      if (!role) return false;

      // Simplified permission check - Master has all permissions
      if (role.role_type === 'Master') return true;
      
      // Basic permission logic for other roles
      const permissions = {
        Senior: ['view_all_profiles', 'edit_profiles', 'manage_projects'],
        Mid: ['view_profiles', 'edit_own_profile', 'view_assigned_projects'],
        External: ['view_own_profile', 'edit_own_profile'],
        HR: ['view_all_profiles', 'view_financial_data']
      };

      const userPermissions = permissions[role.role_type] || [];
      return userPermissions.includes(`${action}_${module}`) || userPermissions.includes('view_all_profiles');
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }

  // =====================================================
  // SEARCH & FILTERING
  // =====================================================

  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%,job_title.ilike.%${query}%`)
        .eq('is_active', true)
        .order('display_name')
        .limit(20);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to search users:', error);
      return [];
    }
  }

  async getAvailableUsers(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('availability_status', 'available')
        .eq('is_active', true)
        .order('display_name');

      if (error) {
        console.error('Error fetching available users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch available users:', error);
      return [];
    }
  }

  // =====================================================
  // ANALYTICS & REPORTING
  // =====================================================

  async getUserStats(): Promise<{
    total_users: number;
    active_users: number;
    by_role: Record<string, number>;
    by_department: Record<string, number>;
    by_location: Record<string, number>;
  }> {
    try {
      const profiles = await this.getAllUserProfiles();

      const stats = {
        total_users: profiles.length,
        active_users: profiles.filter(p => p.is_active).length,
        by_role: {} as Record<string, number>,
        by_department: {} as Record<string, number>,
        by_location: {} as Record<string, number>
      };

      profiles.forEach(profile => {
        // Count by role
        if (profile.role?.role_type) {
          stats.by_role[profile.role.role_type] = (stats.by_role[profile.role.role_type] || 0) + 1;
        }

        // Count by department
        if (profile.department) {
          stats.by_department[profile.department] = (stats.by_department[profile.department] || 0) + 1;
        }

        // Count by location
        if (profile.office_location) {
          stats.by_location[profile.office_location] = (stats.by_location[profile.office_location] || 0) + 1;
        }
      });

      return stats;
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        total_users: 0,
        active_users: 0,
        by_role: {},
        by_department: {},
        by_location: {}
      };
    }
  }

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  async trackLogin(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update last login timestamp
      await this.updateUserProfile(user.id, { 
        last_login: new Date().toISOString() 
      });

      // Create session record (optional - only if user_sessions table exists)
      await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_start: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();
    } catch (error) {
      // Don't throw error if session tracking fails
      console.warn('Session tracking failed:', error);
    }
  }

  async trackLogout(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // End current session
      await supabase
        .from('user_sessions')
        .update({
          session_end: new Date().toISOString(),
          is_active: false
        })
        .eq('user_id', user.id)
        .eq('is_active', true);
    } catch (error) {
      // Don't throw error if session tracking fails
      console.warn('Session logout tracking failed:', error);
    }
  }

  async updateAvatar(file: File): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      return publicUrl;
    } catch (error) {
      console.error('Avatar update failed:', error);
      throw error;
    }
  }

  clearCache(): void {
    // Simple cache clearing - in a real app you might have more sophisticated caching
    console.log('User service cache cleared');
    // You could implement actual cache clearing logic here if needed
  }
}

export const userService = new UserService();