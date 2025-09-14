export interface ProjectPhase {
  id: string;
  project_id: string;
  phase_name: 'discover' | 'build' | 'prepare' | 'deliver' | 'roundup';
  status: 'not_started' | 'in_progress' | 'blocked' | 'complete';
  progress_percentage: number;
  start_date?: string;
  end_date?: string;
  checklist_items: string[];
  checklist_completed: boolean[];
  can_complete: boolean;
  completed_at?: string;
  completed_by?: string;
  assignee_id?: string;
  assignee?: TeamMember;
  created_at: string;
  updated_at: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  phase_id?: string;
  task_name: string;
  description: string;
  assignee_id?: string;
  assignee?: TeamMember;
  due_date?: string;
  status: 'not_started' | 'in_progress' | 'blocked' | 'complete';
  priority: 'critical' | 'high' | 'normal' | 'low';
  estimated_hours?: number;
  actual_hours?: number;
  dependencies: string[];
  is_critical_path: boolean;
  jira_ticket_key?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user?: TeamMember;
  comment: string;
  mentions: string[];
  created_at: string;
}

export interface ProjectRisk {
  id: string;
  project_id: string;
  risk_category: 'technical' | 'logistics' | 'personnel' | 'weather' | 'client';
  description: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  mitigation_plan: string;
  status: 'identified' | 'mitigating' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface ResourceAllocation {
  id: string;
  project_id: string;
  resource_type: 'equipment' | 'crew';
  resource_id: string;
  resource_name: string;
  allocated_from: string;
  allocated_to: string;
  quantity: number;
  rms_sync_status: 'pending' | 'synced' | 'error';
  jue_ticket_id?: string;
  qr_code?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  department?: string;
  skills: string[];
  availability_status: 'available' | 'busy' | 'unavailable';
  created_at: string;
}

export interface ProjectTimeline {
  project_id: string;
  event_date: string;
  phases: {
    discover: { start: string; end: string };
    build: { start: string; end: string };
    prepare: { start: string; end: string };
    deliver: { start: string; end: string };
    roundup: { start: string; end: string };
  };
  critical_dates: {
    contract_signed?: string;
    site_visit?: string;
    equipment_ship?: string;
    load_in?: string;
    load_out?: string;
  };
  calculated_at: string;
}

export interface IntegrationStatus {
  roi: {
    status: 'connected' | 'error' | 'pending';
    message: string;
    last_sync?: string;
  };
  jira: {
    status: 'connected' | 'error' | 'pending';
    project_key?: string;
    message: string;
    last_sync?: string;
  };
  jue: {
    status: 'connected' | 'error' | 'pending';
    message: string;
    last_sync?: string;
  };
  rms: {
    status: 'connected' | 'error' | 'pending';
    message: string;
    last_sync?: string;
  };
  crew_db: {
    status: 'connected' | 'error' | 'pending';
    message: string;
    last_sync?: string;
  };
}

export interface KeyDocument {
  id: string;
  project_id: string;
  document_type: 'staff_advance' | 'client_info_pack' | 'device_allocation' | 'menus' | 'ticketing_matrix' | 'access_matrix' | 'rams' | 'site_map';
  document_name: string;
  document_url?: string;
  upload_status: 'pending' | 'uploaded' | 'linked';
  created_at: string;
  updated_at: string;
}

export interface CriticalPathAnalysis {
  total_duration: number;
  critical_tasks: ProjectTask[];
  float_analysis: {
    task_id: string;
    total_float: number;
    free_float: number;
    impact_days: number;
  }[];
  bottlenecks: string[];
  recommendations: string[];
}

export interface ResourceConflict {
  resource_id: string;
  resource_name: string;
  conflicting_project: string;
  conflict_dates: {
    from: string;
    to: string;
  };
  suggested_alternatives: {
    resource_id: string;
    resource_name: string;
    availability: string;
  }[];
}

export interface OperationsNotification {
  id: string;
  project_id: string;
  type: 'task_overdue' | 'phase_blocked' | 'resource_conflict' | 'critical_path_delay' | 'integration_error';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action_required: boolean;
  action_url?: string;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
}