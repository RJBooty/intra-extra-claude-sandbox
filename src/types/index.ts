export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  classification: 'Canopy' | 'Direct' | 'Partner' | 'Vendor';
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  project_id: string;
  project_code: string;  // Unique Project Identification Code (e.g., UK-0001)
  client_id: string;
  client?: Client;
  event_location: string;
  event_start_date: string;
  event_end_date: string;
  expected_attendance: number;
  event_type: 'Conference' | 'Festival' | 'Exhibition' | 'Sports' | 'Corporate' | 'Other';
  event_image?: string;  // URL or path to event image
  
  // Additional metadata fields
  onsite_start_date?: string;
  onsite_end_date?: string;
  show_start_date?: string;
  show_end_date?: string;
  voucher_sale_start?: string;
  voucher_sale_end?: string;
  topup_start?: string;
  topup_end?: string;
  refund_window_start?: string;
  refund_window_end?: string;
  delivery_address?: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  delivery_contact_email?: string;
  wristband_order_deadline?: string;
  load_in_date?: string;
  load_out_date?: string;
  qr_code_url?: string;
  
  // Project status and phase
  current_phase: number;
  phase_progress: number;
  status: 'Active' | 'Completed' | 'On Hold' | 'Cancelled';
  
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'proposal' | 'contract' | 'custom';
  template_url?: string;
  created_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  template_id?: string;
  document_name: string;
  document_url: string;
  document_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

export interface ProjectPhase {
  id: number;
  name: string;
  description: string;
  order: number;
}

// Sales Pipeline Types
export interface Opportunity {
  id: string;
  company_name: string;
  event_name: string;
  deal_value: number;
  currency: string;
  stage: OpportunityStage;
  lead_score: number;
  temperature: 'Hot' | 'Warm' | 'Cold';
  client_tier: ClientTier;
  event_type: string;
  owner_id: string;
  owner?: User;
  event_date?: string;
  decision_date?: string;
  win_probability: number;
  created_project_id?: string;
  is_previous_client?: boolean;
  budget_confirmed?: boolean;
  multiple_events?: boolean;
  referral_source?: string;
  decision_maker_engaged?: boolean;
  contract_link?: string;
  contract_signed?: boolean;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

export type OpportunityStage = 
  | 'Contacted'
  | 'Qualified'
  | 'First Meet Scheduled'
  | 'Proposal Sent'
  | 'Negotiations'
  | 'Contract Signature'
  | 'Kickoff'
  | 'Operations';

export type ClientTier = 'Seed' | 'Sapling' | 'Canopy' | 'Jungle' | 'Rainforest';

export interface OpportunityActivity {
  id: string;
  opportunity_id: string;
  activity_type: 'Email' | 'Call' | 'Meeting' | 'Note';
  subject: string;
  description: string;
  duration?: number;
  participants?: string[];
  created_by: string;
  created_at: string;
}

export interface OpportunityStageHistory {
  id: string;
  opportunity_id: string;
  from_stage: OpportunityStage;
  to_stage: OpportunityStage;
  changed_by: string;
  changed_at: string;
  reason?: string;
}

export interface LeadScoringFactor {
  id: string;
  opportunity_id: string;
  factor_type: string;
  points: number;
  calculated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface PipelineMetrics {
  total_opportunities: number;
  total_value: number;
  conversion_rate: number;
  average_deal_size: number;
  stage_distribution: Record<OpportunityStage, number>;
  temperature_distribution: Record<'Hot' | 'Warm' | 'Cold', number>;
}

// Re-export ROI types
export * from './roi';

// Re-export permission types
export * from './permissions';