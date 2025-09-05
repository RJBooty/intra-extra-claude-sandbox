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

// Helper function to get user role
export const getUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from('platform_user_roles')
    .select('role_level')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user role:', error)
    return 'user' // default role
  }
  
  return data?.role_level || 'user'
}

// Helper function to check if user is master
export const isMasterUser = async (userId: string) => {
  const role = await getUserRole(userId)
  return role === 'master'
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
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        ...clientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Failed to create client:', error);
    throw error;
  }
}

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

export async function createProject(projectData: any) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
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
      .from('platform_user_roles')
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