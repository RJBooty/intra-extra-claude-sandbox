import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Authentication helpers
export const auth = supabase.auth;

// Database helpers
export async function getClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createClient(clientData: any) {
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
}

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createProject(projectData: any) {
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      ...projectData,
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
}

export async function getUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createUser(userData: any) {
  const { data, error } = await supabase
    .from('users')
    .insert([{
      ...userData,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getOpportunities(filters?: any) {
  let query = supabase
    .from('opportunities')
    .select(`
      *,
      owner:users(name, email)
    `)
    .order('created_at', { ascending: false });

  if (filters?.stage) {
    query = query.eq('stage', filters.stage);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createOpportunity(opportunityData: any) {
  const { data, error } = await supabase
    .from('opportunities')
    .insert([{
      ...opportunityData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select(`
      *,
      owner:users(name, email)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function moveOpportunityStage(opportunityId: string, newStage: string) {
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
}

export async function getOpportunityActivities(opportunityId: string) {
  const { data, error } = await supabase
    .from('opportunity_activities')
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createOpportunityActivity(activityData: any) {
  const { data, error } = await supabase
    .from('opportunity_activities')
    .insert([{
      ...activityData,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function convertOpportunityToProject(opportunityId: string) {
  // This would involve creating a project from the opportunity data
  // For now, return a mock response
  const { data: opportunity, error: oppError } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single();

  if (oppError) throw oppError;

  const projectData = {
    project_id: `PR-${Date.now()}`,
    client_id: opportunity.company_name, // This would need proper client mapping
    event_location: 'TBD',
    event_start_date: opportunity.event_date || new Date().toISOString(),
    event_end_date: opportunity.event_date || new Date().toISOString(),
    expected_attendance: 1000,
    event_type: opportunity.event_type,
    current_phase: 1,
    phase_progress: 0,
    status: 'Active'
  };

  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single();

  if (error) throw error;

  // Update opportunity to mark as converted
  await supabase
    .from('opportunities')
    .update({ 
      created_project_id: data.id,
      stage: 'Operations',
      updated_at: new Date().toISOString()
    })
    .eq('id', opportunityId);

  return data;
}

export async function getPipelineMetrics() {
  // Get all opportunities
  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('*');

  if (error) throw error;

  const total_opportunities = opportunities?.length || 0;
  const total_value = opportunities?.reduce((sum, opp) => sum + (opp.deal_value || 0), 0) || 0;
  const average_deal_size = total_opportunities > 0 ? total_value / total_opportunities : 0;

  // Calculate stage distribution
  const stage_distribution: Record<string, number> = {};
  const temperature_distribution: Record<string, number> = {};

  opportunities?.forEach(opp => {
    stage_distribution[opp.stage] = (stage_distribution[opp.stage] || 0) + 1;
    temperature_distribution[opp.temperature] = (temperature_distribution[opp.temperature] || 0) + 1;
  });

  return {
    total_opportunities,
    total_value,
    conversion_rate: 0.25, // This would be calculated based on historical data
    average_deal_size,
    stage_distribution,
    temperature_distribution
  };
}

export function calculateLeadScore(opportunity: any) {
  let score = 0;
  let temperature = 'Cold';
  
  // Client tier scoring
  const tierScores = { 'Seed': 10, 'Sapling': 20, 'Canopy': 30, 'Jungle': 40, 'Rainforest': 50 };
  score += tierScores[opportunity.client_tier as keyof typeof tierScores] || 0;
  
  // Previous client bonus
  if (opportunity.is_previous_client) score += 20;
  
  // Budget confirmed bonus
  if (opportunity.budget_confirmed) score += 15;
  
  // Multiple events bonus
  if (opportunity.multiple_events) score += 10;
  
  // Decision maker engaged bonus
  if (opportunity.decision_maker_engaged) score += 15;
  
  // Referral source bonus
  if (opportunity.referral_source) score += 10;
  
  // Determine temperature
  if (score >= 70) temperature = 'Hot';
  else if (score >= 40) temperature = 'Warm';
  
  return { score, temperature };
}

// Notifications functions
export async function getProjectNotifications(projectId: string) {
  const { data, error } = await supabase
    .from('project_notifications')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('project_notifications')
    .update({ 
      is_read: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function getUnreadNotificationCount(projectId: string): Promise<number> {
  const { count, error } = await supabase
    .from('project_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}