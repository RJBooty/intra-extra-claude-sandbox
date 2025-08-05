import { ProjectNotification } from '../types/notifications';
// Mock Supabase client for development
export const supabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      then: (callback: Function) => {
        // Return mock data based on table
        if (table === 'clients') {
          callback({
            data: [
              { id: '1', name: 'John Smith', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+1-555-0123', classification: 'Canopy' },
              { id: '2', name: 'Sarah Johnson', company: 'Event Solutions', email: 'sarah@eventsolutions.com', phone: '+1-555-0124', classification: 'Direct' },
              { id: '3', name: 'Mike Davis', company: 'Festival Group', email: 'mike@festivalgroup.com', phone: '+1-555-0125', classification: 'Partner' }
            ],
            error: null
          });
        }
        if (table === 'users') {
          callback({
            data: [
              { id: '1', name: 'John Smith', email: 'john@casfid.com', role: 'Sales Manager' },
              { id: '2', name: 'Sarah Johnson', email: 'sarah@casfid.com', role: 'Account Executive' },
              { id: '3', name: 'Mike Davis', email: 'mike@casfid.com', role: 'Project Manager' }
            ],
            error: null
          });
        }
        if (table === 'opportunities') {
          callback({
            data: [
              {
                id: '1',
                company_name: 'Tech Corp',
                event_name: 'Annual Technology Conference',
                deal_value: 50000,
                currency: 'USD',
                stage: 'Contacted',
                lead_score: 85,
                temperature: 'Hot',
                client_tier: 'Canopy',
                event_type: 'Conference',
                owner_id: '1',
                owner: { name: 'John Smith', email: 'john@casfid.com' },
                event_date: '2024-06-15',
                win_probability: 75,
                is_previous_client: true,
                budget_confirmed: true,
                multiple_events: false,
                decision_maker_engaged: true,
                created_at: new Date().toISOString()
              },
              {
                id: '2',
                company_name: 'Event Solutions',
                event_name: 'Product Launch Event',
                deal_value: 30000,
                currency: 'USD',
                stage: 'Qualified',
                lead_score: 65,
                temperature: 'Warm',
                client_tier: 'Sapling',
                event_type: 'Corporate',
                owner_id: '2',
                owner: { name: 'Sarah Johnson', email: 'sarah@casfid.com' },
                event_date: '2024-07-10',
                win_probability: 50,
                is_previous_client: false,
                budget_confirmed: false,
                multiple_events: false,
                decision_maker_engaged: false,
                created_at: new Date().toISOString()
              }
            ],
            error: null
          });
        }
        return Promise.resolve({ data: [], error: null });
      }
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: Date.now().toString(), ...data }, error: null })
      })
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: value, ...data }, error: null })
        })
      })
    })
  })
};

// Mock functions for all the database operations
export async function getClients() {
  return [
    { id: '1', name: 'John Smith', company: 'Tech Corp', email: 'john@techcorp.com', phone: '+1-555-0123', classification: 'Canopy', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', name: 'Sarah Johnson', company: 'Event Solutions', email: 'sarah@eventsolutions.com', phone: '+1-555-0124', classification: 'Direct', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', name: 'Mike Davis', company: 'Festival Group', email: 'mike@festivalgroup.com', phone: '+1-555-0125', classification: 'Partner', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];
}

export async function createClient(clientData: any) {
  return {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...clientData
  };
}

export async function createProject(projectData: any) {
  return {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    current_phase: 1,
    phase_progress: 25,
    status: 'Active',
    ...projectData
  };
}

export async function getUsers() {
  return [
    { id: '1', name: 'John Smith', email: 'john@casfid.com', role: 'Sales Manager', created_at: new Date().toISOString() },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@casfid.com', role: 'Account Executive', created_at: new Date().toISOString() },
    { id: '3', name: 'Mike Davis', email: 'mike@casfid.com', role: 'Project Manager', created_at: new Date().toISOString() }
  ];
}

export async function createUser(userData: any) {
  return {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    ...userData
  };
}

export async function getOpportunities(filters?: any) {
  const opportunities = [
    {
      id: '1',
      company_name: 'Tech Corp',
      event_name: 'Annual Technology Conference',
      deal_value: 50000,
      currency: 'USD',
      stage: 'Contacted',
      lead_score: 85,
      temperature: 'Hot',
      client_tier: 'Canopy',
      event_type: 'Conference',
      owner_id: '1',
      owner: { name: 'John Smith', email: 'john@casfid.com' },
      event_date: '2024-06-15',
      win_probability: 75,
      is_previous_client: true,
      budget_confirmed: true,
      multiple_events: false,
      decision_maker_engaged: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      company_name: 'Event Solutions',
      event_name: 'Product Launch Event',
      deal_value: 30000,
      currency: 'USD',
      stage: 'Qualified',
      lead_score: 65,
      temperature: 'Warm',
      client_tier: 'Sapling',
      event_type: 'Corporate',
      owner_id: '2',
      owner: { name: 'Sarah Johnson', email: 'sarah@casfid.com' },
      event_date: '2024-07-10',
      win_probability: 50,
      is_previous_client: false,
      budget_confirmed: false,
      multiple_events: false,
      decision_maker_engaged: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      company_name: 'Festival Group',
      event_name: 'Summer Music Festival',
      deal_value: 75000,
      currency: 'USD',
      stage: 'Proposal Sent',
      lead_score: 90,
      temperature: 'Hot',
      client_tier: 'Jungle',
      event_type: 'Festival',
      owner_id: '1',
      owner: { name: 'John Smith', email: 'john@casfid.com' },
      event_date: '2024-08-20',
      win_probability: 80,
      is_previous_client: true,
      budget_confirmed: true,
      multiple_events: true,
      decision_maker_engaged: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  if (filters?.stage) {
    return opportunities.filter(opp => opp.stage === filters.stage);
  }

  return opportunities;
}

export async function createOpportunity(opportunityData: any) {
  return {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...opportunityData
  };
}

export async function moveOpportunityStage(opportunityId: string, newStage: string) {
  return {
    id: opportunityId,
    stage: newStage,
    updated_at: new Date().toISOString()
  };
}

export async function getOpportunityActivities(opportunityId: string) {
  return [
    {
      id: '1',
      opportunity_id: opportunityId,
      activity_type: 'Email',
      subject: 'Initial contact',
      description: 'Sent initial proposal and pricing information',
      created_by: '1',
      created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
    },
    {
      id: '2',
      opportunity_id: opportunityId,
      activity_type: 'Call',
      subject: 'Follow-up call',
      description: 'Discussed requirements and timeline',
      duration: 30,
      created_by: '1',
      created_at: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
    }
  ];
}

export async function createOpportunityActivity(activityData: any) {
  return {
    id: Date.now().toString(),
    created_at: new Date().toISOString(),
    ...activityData
  };
}

export async function convertOpportunityToProject(opportunityId: string) {
  return {
    id: Date.now().toString(),
    project_id: `PR-${Date.now()}`,
    created_at: new Date().toISOString()
  };
}

export async function getPipelineMetrics() {
  return {
    total_opportunities: 3,
    total_value: 155000,
    conversion_rate: 0.25,
    average_deal_size: 51667,
    stage_distribution: {
      'Contacted': 1,
      'Qualified': 1,
      'Proposal Sent': 1,
      'Negotiations': 0,
      'Contract Signature': 0,
      'Kickoff': 0,
      'Operations': 0
    },
    temperature_distribution: {
      'Hot': 2,
      'Warm': 1,
      'Cold': 0
    }
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

// Mock notifications functions
export async function getProjectNotifications(projectId: string): Promise<ProjectNotification[]> {
  // Mock notifications data
  return [
    {
      id: '1',
      project_id: projectId,
      type: 'task',
      title: 'Review design proposal',
      description: 'Task assigned to you',
      priority: 'medium',
      is_read: false,
      action_url: '/tasks/1',
      action_label: 'View',
      due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    // Add more mock notifications as needed
  ];
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  console.log('Marking notification as read:', notificationId);
  // Mock implementation
}

export async function getUnreadNotificationCount(projectId: string): Promise<number> {
  const notifications = await getProjectNotifications(projectId);
  return notifications.filter(n => !n.is_read).length;
}