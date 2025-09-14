import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for authentication
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  signOut: async () => {
    return await supabase.auth.signOut()
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange: (callback: (user: any) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  },

  resetPasswordForEmail: async (email: string, options?: { redirectTo?: string }) => {
    return await supabase.auth.resetPasswordForEmail(email, options)
  },

  updateUser: async (attributes: { password?: string; email?: string; data?: any }) => {
    return await supabase.auth.updateUser(attributes)
  },

  getSession: async () => {
    return await supabase.auth.getSession()
  }
}

// Export auth methods directly from supabase
export { supabase as default }

// User profile management functions
export async function getUserProfile(userId?: string) {
  try {
    const targetUserId = userId || (await auth.getCurrentUser())?.id;
    if (!targetUserId) return null;

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
      .eq('id', targetUserId)
      .eq('user_roles.is_active', true)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      ...data,
      role: data.role?.[0] || null,
      preferences: data.preferences?.[0] || null
    };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

export async function updateUserProfile(profileData: any) {
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
    console.error('Failed to update user profile:', error);
    throw error;
  }
}

// Helper function to get user role - uses user_roles table
export const getUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_type')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
  
  if (error) {
    console.error('Error fetching user role:', error)
    return 'user'
  }
  
  const roleType = data?.role_type?.toLowerCase() || 'user'
  const roleMapping: { [key: string]: string } = {
    'master': 'master',
    'senior': 'senior', 
    'mid': 'mid',
    'external': 'external',
    'hr': 'hr'
  }
  
  return roleMapping[roleType] || 'user'
}

// Helper function to check if user is master
export const isMasterUser = async (userId: string) => {
  const role = await getUserRole(userId)
  return role === 'master'
}

// Helper function to get user role level (numeric)
export const getUserRoleLevel = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_level')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
  
  if (error) {
    console.error('Error fetching user role level:', error)
    return 5 // default to lowest level (External)
  }
  
  return data?.role_level || 5
}

// Helper function to check if user has minimum role level
export const hasMinimumRoleLevel = async (userId: string, requiredLevel: number) => {
  const userLevel = await getUserRoleLevel(userId)
  return userLevel <= requiredLevel // Lower numbers = higher access (1=Master, 5=External)
}

// Helper function to get full user role info
export const getUserRoleInfo = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single()
  
  if (error) {
    console.error('Error fetching user role info:', error)
    return null
  }
  
  return data
}

// Database helpers with error handling
export async function getClients() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      // Return empty array if table doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.warn('Clients table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return [];
  }
}

export async function createClientRecord(clientData: any) {
  try {
    console.log('📋 createClientRecord: Starting...');
    console.log('📋 createClientRecord: Input data:', clientData);
    
    const insertData = {
      ...clientData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('📋 createClientRecord: Insert data:', insertData);
    
    const { data, error } = await supabase
      .from('clients')
      .insert([insertData])
      .select()
      .single();

    console.log('📋 createClientRecord: Supabase response:', { data, error });

    if (error) {
      console.error('📋 createClientRecord: Supabase error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    
    console.log('📋 createClientRecord: Success!', data);
    return data;
  } catch (error) {
    console.error('📋 createClientRecord: Caught error:', error);
    throw error;
  }
}

// PROJECT MANAGEMENT FUNCTIONS

// Get only active (non-deleted) projects
export async function getActiveProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*)
      `)
      .or('is_deleted.is.null,is_deleted.eq.false') // Handle both null and false values
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch active projects:', error);
    return [];
  }
}

// Get all projects (legacy function - kept for compatibility)
export async function getProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      // Return empty array if table doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.warn('Projects table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

// Get deleted projects (bin contents)
export async function getDeletedProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('is_deleted', true)
      .order('deleted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch deleted projects:', error);
    return [];
  }
}

// Soft delete a project (move to bin)
export async function softDeleteProject(projectId: string, userId: string, reason?: string) {
  try {
    // First check if project exists and is not already deleted
    const { data: existingProject, error: checkError } = await supabase
      .from('projects')
      .select('id, is_deleted')
      .eq('id', projectId)
      .single();

    if (checkError) {
      throw new Error(`Project not found: ${checkError.message}`);
    }

    if (existingProject.is_deleted) {
      throw new Error('Project is already deleted');
    }

    // Perform the soft delete
    const { data, error } = await supabase
      .from('projects')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    // Log the deletion action
    try {
      await supabase
        .from('project_deletions')
        .insert([{
          project_id: projectId,
          action_type: 'soft_delete',
          performed_by: userId,
          reason: reason || 'No reason provided'
        }]);
    } catch (auditError) {
      console.warn('Failed to log deletion audit:', auditError);
      // Don't fail the main operation if audit logging fails
    }

    return data;
  } catch (error) {
    console.error('Failed to soft delete project:', error);
    throw error;
  }
}

// Restore a project from bin
export async function restoreProject(projectId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        is_deleted: false,
        deleted_at: null,
        deleted_by: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .eq('is_deleted', true) // Only restore if currently deleted
      .select()
      .single();

    if (error) throw error;

    // Log the restoration
    try {
      await supabase
        .from('project_deletions')
        .insert([{
          project_id: projectId,
          action_type: 'restore',
          performed_by: userId
        }]);
    } catch (auditError) {
      console.warn('Failed to log restoration audit:', auditError);
      // Don't fail the main operation if audit logging fails
    }

    return data;
  } catch (error) {
    console.error('Failed to restore project:', error);
    throw error;
  }
}

// Permanently delete a project
export async function permanentDeleteProject(projectId: string, userId: string) {
  try {
    // Log the permanent deletion first
    try {
      await supabase
        .from('project_deletions')
        .insert([{
          project_id: projectId,
          action_type: 'permanent_delete',
          performed_by: userId
        }]);
    } catch (auditError) {
      console.warn('Failed to log permanent deletion audit:', auditError);
      // Continue with deletion even if audit fails
    }

    // Then permanently delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('is_deleted', true); // Only delete if currently in bin

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Failed to permanently delete project:', error);
    throw error;
  }
}

export async function createProject(projectData: any) {
  try {
    // Reserve a project code if not provided or if it needs to be generated
    let finalProjectCode = projectData.project_code;
    
    if (!finalProjectCode && projectData.event_location) {
      // Reserve the actual project code only at creation time
      const { data: reservedCode, error: codeError } = await supabase
        .rpc('reserve_project_code', { p_location: projectData.event_location });
      
      if (codeError) {
        console.error('Failed to reserve project code:', codeError);
        throw new Error(`Failed to reserve project code: ${codeError.message}`);
      }
      
      finalProjectCode = reservedCode;
    }

    // Insert project with reserved code in a transaction
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        project_code: finalProjectCode,
        is_deleted: false, // Ensure new projects are not deleted
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      // If insert fails due to duplicate project_code, it will be caught here
      console.error('Project creation failed:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
}

// Sales pipeline functions
export async function moveOpportunityStage(opportunityId: string, newStage: string) {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .update({ 
        stage: newStage,
        updated_at: new Date().toISOString()
      })
      .eq('id', opportunityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to move opportunity stage:', error);
    throw error;
  }
}

export async function getOpportunities() {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching opportunities:', error);
      // Return empty array if table doesn't exist
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.warn('Opportunities table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Failed to fetch opportunities:', error);
    return [];
  }
}

export async function createOpportunity(opportunityData: any) {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .insert([{
        ...opportunityData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create opportunity:', error);
    throw error;
  }
}

export async function updateOpportunity(opportunityId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('opportunities')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', opportunityId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to update opportunity:', error);
    throw error;
  }
}

// User management functions
export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*');
    
    if (error) {
      console.warn('Users table not found, returning empty array');
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return [];
  }
}

export async function createUser(userData: any) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: userData.metadata
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw error;
  }
}

// Lead scoring
export async function calculateLeadScore(opportunityData: any) {
  let score = 0;
  
  // Budget confirmed
  if (opportunityData.budget_confirmed) score += 20;
  
  // Decision maker engaged
  if (opportunityData.decision_maker_engaged) score += 25;
  
  // Previous client
  if (opportunityData.is_previous_client) score += 15;
  
  // Multiple events potential
  if (opportunityData.multiple_events) score += 10;
  
  // Stage-based scoring
  const stageScores: Record<string, number> = {
    'Contacted': 5,
    'Qualified': 10,
    'First Meet Scheduled': 15,
    'Proposal Sent': 20,
    'Negotiations': 25,
    'Contract Signature': 30
  };
  score += stageScores[opportunityData.stage] || 0;
  
  return Math.min(score, 100); // Cap at 100
}

// Opportunity activities
export async function getOpportunityActivities(opportunityId: string) {
  try {
    const { data, error } = await supabase
      .from('opportunity_activities')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.warn('Activities not found, returning empty array');
      return [];
    }
    return data || [];
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return [];
  }
}

export async function createOpportunityActivity(activityData: any) {
  try {
    const { data, error } = await supabase
      .from('opportunity_activities')
      .insert([{
        ...activityData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      // If table doesn't exist, just return the data without saving
      console.warn('Could not save activity:', error);
      return activityData;
    }
    return data;
  } catch (error) {
    console.error('Failed to create activity:', error);
    return activityData;
  }
}

// Convert opportunity to project
export async function convertOpportunityToProject(opportunityId: string) {
  try {
    // Get the opportunity
    const { data: opportunity, error: oppError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', opportunityId)
      .single();
    
    if (oppError) throw oppError;
    
    // Create a project from the opportunity
    const projectData = {
      project_id: `PR-${opportunity.event_name}-${Date.now()}`,
      event_location: opportunity.event_location || 'TBD',
      event_type: opportunity.event_type || 'Conference',
      expected_attendance: 1000,
      status: 'Active',
      event_start_date: opportunity.event_date,
      event_end_date: opportunity.event_date
    };
    
    const newProject = await createProject(projectData);
    
    // Update opportunity with project reference
    await updateOpportunity(opportunityId, {
      created_project_id: newProject.id,
      stage: 'Operations'
    });
    
    return newProject;
  } catch (error) {
    console.error('Failed to convert opportunity:', error);
    throw error;
  }
}

export async function getPipelineMetrics() {
  try {
    const opportunities = await getOpportunities();
    
    // Calculate metrics from opportunities
    const metrics = {
      total_opportunities: opportunities.length,
      total_value: opportunities.reduce((sum, opp) => sum + (opp.deal_value || 0), 0),
      conversion_rate: 0,
      average_deal_size: opportunities.length > 0 
        ? opportunities.reduce((sum, opp) => sum + (opp.deal_value || 0), 0) / opportunities.length 
        : 0,
      stage_distribution: {} as Record<string, number>,
      temperature_distribution: {
        Hot: 0,
        Warm: 0,
        Cold: 0
      } as Record<string, number>
    };
    
    // Count stage distribution
    opportunities.forEach(opp => {
      metrics.stage_distribution[opp.stage] = (metrics.stage_distribution[opp.stage] || 0) + 1;
      if (opp.temperature) {
        metrics.temperature_distribution[opp.temperature] = 
          (metrics.temperature_distribution[opp.temperature] || 0) + 1;
      }
    });
    
    // Calculate conversion rate (opportunities that reached contract stage)
    const contractCount = opportunities.filter(opp => 
      opp.stage === 'Contract Signature' || opp.stage === 'Kickoff' || opp.stage === 'Operations'
    ).length;
    metrics.conversion_rate = opportunities.length > 0 
      ? (contractCount / opportunities.length) * 100 
      : 0;
    
    return metrics;
  } catch (error) {
    console.error('Failed to get pipeline metrics:', error);
    return {
      total_opportunities: 0,
      total_value: 0,
      conversion_rate: 0,
      average_deal_size: 0,
      stage_distribution: {},
      temperature_distribution: { Hot: 0, Warm: 0, Cold: 0 }
    };
  }
}

// Permission system functions
export async function checkUserPermission(
  userId: string,
  module: string,
  section: string,
  action: string,
  projectId?: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_user_permission', {
      p_user_id: userId,
      p_module: module,
      p_section: section,
      p_action: action,
      p_project_id: projectId || null
    });

    if (error) {
      console.error('Permission check error:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}

// Get all permissions for a user
export async function getUserPermissions(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role_type,
        role_permissions!inner(
          is_granted,
          permission:permissions(*)
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to get user permissions:', error);
    return null;
  }
}

// Get user project assignments
export async function getUserProjectAssignments(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_project_assignments')
      .select(`
        *,
        project:projects(
          id,
          project_code,
          event_location,
          client:clients(name)
        )
      `)
      .eq('user_id', userId)
      .eq('active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get project assignments:', error);
    return [];
  }
}

// Assign user to project (Master/Senior only)
export async function assignUserToProject(
  userId: string,
  projectId: string,
  roleOnProject: string,
  assignedBy: string
) {
  try {
    const { data, error } = await supabase
      .from('user_project_assignments')
      .insert([{
        user_id: userId,
        project_id: projectId,
        role_on_project: roleOnProject,
        assigned_by: assignedBy
      }])
      .select()
      .single();

    if (error) throw error;

    // Log the assignment
    await supabase
      .from('permission_audit_log')
      .insert([{
        action_type: 'assign_project',
        target_user_id: userId,
        project_id: projectId,
        changed_by: assignedBy,
        new_value: { role_on_project: roleOnProject }
      }]);

    return data;
  } catch (error) {
    console.error('Failed to assign user to project:', error);
    throw error;
  }
}

// Remove user from project
export async function removeUserFromProject(
  userId: string,
  projectId: string,
  removedBy: string
) {
  try {
    const { error } = await supabase
      .from('user_project_assignments')
      .update({ active: false })
      .eq('user_id', userId)
      .eq('project_id', projectId);

    if (error) throw error;

    // Log the removal
    await supabase
      .from('permission_audit_log')
      .insert([{
        action_type: 'assign_project',
        target_user_id: userId,
        project_id: projectId,
        changed_by: removedBy,
        new_value: { active: false }
      }]);

  } catch (error) {
    console.error('Failed to remove user from project:', error);
    throw error;
  }
}

// Grant permission override to user
export async function grantPermissionOverride(
  userId: string,
  permissionId: string,
  reason: string,
  grantedBy: string,
  expiresAt?: string
) {
  try {
    const { data, error } = await supabase
      .from('user_permission_overrides')
      .upsert([{
        user_id: userId,
        permission_id: permissionId,
        is_granted: true,
        reason,
        override_by: grantedBy,
        expires_at: expiresAt
      }])
      .select()
      .single();

    if (error) throw error;

    // Log the override
    await supabase
      .from('permission_audit_log')
      .insert([{
        action_type: 'override',
        target_user_id: userId,
        permission_id: permissionId,
        changed_by: grantedBy,
        new_value: { is_granted: true, reason, expires_at: expiresAt }
      }]);

    return data;
  } catch (error) {
    console.error('Failed to grant permission override:', error);
    throw error;
  }
}

// Get all permissions (for management)
export async function getAllPermissions() {
  try {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('module', { ascending: true })
      .order('section', { ascending: true })
      .order('action', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get permissions:', error);
    return [];
  }
}

// Get permission audit log
export async function getPermissionAuditLog(limit: number = 100) {
  try {
    const { data, error } = await supabase
      .from('permission_audit_log')
      .select(`
        *,
        target_user:auth.users!target_user_id(email),
        changed_by_user:auth.users!changed_by(email),
        permission:permissions(module, section, action)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to get audit log:', error);
    return [];
  }
}

// Enhanced getProjects with permission filtering
export async function getProjectsWithPermissions(userId?: string, userRole?: string) {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        client:clients(*)
      `);

    // For now, let's remove the external user filtering since we don't have 
    // the assigned_users column. We'll implement proper project assignments later.
    // 
    // if (userRole === 'external' && userId) {
    //   // External users only see assigned projects
    //   query = query.eq('assigned_users', userId);
    // }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.warn('Projects table not found, returning empty array');
        return [];
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return [];
  }
}

// Enhanced createProject with project code generation
export async function createProjectWithCode(projectData: any, userRole?: string) {
  try {
    // Check permissions
    if (userRole && !['master', 'senior'].includes(userRole)) {
      throw new Error('Insufficient permissions to create projects');
    }

    // Generate unique project code based on location
    const regionCode = extractRegionCodeFromLocation(projectData.event_location);
    const projectCode = await generateUniqueProjectCode(regionCode);

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        project_code: projectCode,
        current_phase: 1,
        phase_progress: 25,
        status: 'Active',
        is_deleted: false, // Ensure new projects are not deleted
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        client:clients(*)
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
}

// Helper functions
function extractRegionCodeFromLocation(location: string): string {
  const locationLower = location.toLowerCase();
  
  if (locationLower.includes('united kingdom') || locationLower.includes('uk')) return 'UK';
  if (locationLower.includes('spain')) return 'ES';
  if (locationLower.includes('france')) return 'FR';
  if (locationLower.includes('germany')) return 'DE';
  if (locationLower.includes('italy')) return 'IT';
  if (locationLower.includes('united states') || locationLower.includes('usa')) return 'US';
  // Add more countries as needed
  
  return 'XX'; // Default for unknown regions
}

async function generateUniqueProjectCode(regionCode: string): Promise<string> {
  try {
    // Try to use your database function if it exists
    const { data, error } = await supabase.rpc('generate_project_code', {
      p_region: regionCode
    });

    if (error || !data) {
      // Fallback to manual generation
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 9999) + 1;
      return `${regionCode}-${year}-${randomNum.toString().padStart(4, '0')}`;
    }

    return data;
  } catch (error) {
    // Fallback generation
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    return `${regionCode}-${year}-${randomNum.toString().padStart(4, '0')}`;
  }
}

// Real-time subscription for projects
export function subscribeToProjectChanges(callback: (payload: any) => void) {
  return supabase
    .channel('projects_changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'projects' 
      }, 
      callback
    )
    .subscribe();
}

// Legacy delete project function (kept for compatibility)
export async function deleteProject(projectId: string) {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
}