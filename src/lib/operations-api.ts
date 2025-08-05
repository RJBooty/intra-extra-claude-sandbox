import { 
  ProjectPhase, 
  ProjectTask, 
  TeamMember, 
  IntegrationStatus, 
  ProjectTimeline,
  TaskComment,
  CriticalPathAnalysis,
  ResourceConflict,
  ProjectRisk
} from '../types/operations';

// Mock data for development
const mockTeam: TeamMember[] = [
  {
    id: '1',
    name: 'Sophia Carter',
    email: 'sophia@casfid.com',
    role: 'Project Manager',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    department: 'Operations',
    skills: ['Project Management', 'Risk Assessment', 'Team Leadership'],
    availability_status: 'available',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Ethan Bennett',
    email: 'ethan@casfid.com',
    role: 'Technical Lead',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    department: 'Technical',
    skills: ['System Architecture', 'Integration', 'Troubleshooting'],
    availability_status: 'busy',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Olivia Hayes',
    email: 'olivia@casfid.com',
    role: 'Operations Coordinator',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    department: 'Operations',
    skills: ['Logistics', 'Coordination', 'Documentation'],
    availability_status: 'available',
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Liam Foster',
    email: 'liam@casfid.com',
    role: 'Resource Manager',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    department: 'Resources',
    skills: ['Resource Planning', 'Inventory Management', 'Procurement'],
    availability_status: 'available',
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Ava Harper',
    email: 'ava@casfid.com',
    role: 'Team Lead',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
    department: 'Operations',
    skills: ['Team Management', 'Quality Assurance', 'Training'],
    availability_status: 'available',
    created_at: new Date().toISOString()
  }
];

const mockPhases: ProjectPhase[] = [
  {
    id: '1',
    project_id: 'project-1',
    phase_name: 'discover',
    status: 'complete',
    progress_percentage: 100,
    start_date: '2024-01-01',
    end_date: '2024-01-15',
    checklist_items: [
      'Client requirements documented',
      'Site survey completed',
      'Technical feasibility confirmed',
      'Initial risk assessment done',
      'Resource requirements identified'
    ],
    checklist_completed: [true, true, true, true, true],
    can_complete: true,
    completed_at: '2024-01-15T10:00:00Z',
    completed_by: '1',
    assignee_id: '1',
    assignee: mockTeam[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    project_id: 'project-1',
    phase_name: 'build',
    status: 'in_progress',
    progress_percentage: 75,
    start_date: '2024-01-16',
    end_date: '2024-02-01',
    checklist_items: [
      'System architecture designed',
      'Equipment configured',
      'Software setup completed',
      'Integration testing done',
      'Documentation prepared'
    ],
    checklist_completed: [true, true, true, false, false],
    can_complete: false,
    assignee_id: '2',
    assignee: mockTeam[1],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    project_id: 'project-1',
    phase_name: 'prepare',
    status: 'not_started',
    progress_percentage: 0,
    start_date: '2024-02-02',
    end_date: '2024-02-10',
    checklist_items: [
      'Final system testing',
      'Team briefings completed',
      'Equipment shipped',
      'Contingency plans ready',
      'Go-live checklist verified'
    ],
    checklist_completed: [false, false, false, false, false],
    can_complete: false,
    assignee_id: '3',
    assignee: mockTeam[2],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    project_id: 'project-1',
    phase_name: 'deliver',
    status: 'not_started',
    progress_percentage: 0,
    start_date: '2024-02-11',
    end_date: '2024-02-17',
    checklist_items: [
      'On-site setup completed',
      'System go-live successful',
      'Monitoring systems active',
      'Support team deployed',
      'Performance targets met'
    ],
    checklist_completed: [false, false, false, false, false],
    can_complete: false,
    assignee_id: '4',
    assignee: mockTeam[3],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    project_id: 'project-1',
    phase_name: 'roundup',
    status: 'not_started',
    progress_percentage: 0,
    start_date: '2024-02-18',
    end_date: '2024-02-25',
    checklist_items: [
      'Equipment breakdown completed',
      'Data extracted and processed',
      'Client feedback collected',
      'Financial reconciliation done',
      'Project documentation finalized'
    ],
    checklist_completed: [false, false, false, false, false],
    can_complete: false,
    assignee_id: '5',
    assignee: mockTeam[4],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockTasks: ProjectTask[] = [
  {
    id: '1',
    project_id: 'project-1',
    phase_id: '2',
    task_name: 'Configure payment terminals',
    description: 'Set up and configure all payment terminals for the event',
    assignee_id: '2',
    assignee: mockTeam[1],
    due_date: '2024-01-25',
    status: 'in_progress',
    priority: 'high',
    estimated_hours: 8,
    actual_hours: 6,
    dependencies: [],
    is_critical_path: true,
    jira_ticket_key: 'CAS-123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    project_id: 'project-1',
    phase_id: '2',
    task_name: 'Test cashless system integration',
    description: 'Perform end-to-end testing of the cashless payment system',
    assignee_id: '2',
    assignee: mockTeam[1],
    due_date: '2024-01-28',
    status: 'not_started',
    priority: 'critical',
    estimated_hours: 12,
    dependencies: ['1'],
    is_critical_path: true,
    jira_ticket_key: 'CAS-124',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// API Functions
export async function getProjectPhases(projectId: string): Promise<ProjectPhase[]> {
  console.log('🔧 getProjectPhases: Loading phases for project:', projectId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockPhases;
}

export async function getProjectTeam(projectId: string): Promise<TeamMember[]> {
  console.log('👥 getProjectTeam: Loading team for project:', projectId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockTeam;
}

export async function getIntegrationStatus(projectId: string): Promise<IntegrationStatus> {
  console.log('🔗 getIntegrationStatus: Loading integration status for project:', projectId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return {
    roi: {
      status: 'connected',
      message: 'Budget imported',
      last_sync: new Date().toISOString()
    },
    jira: {
      status: 'connected',
      project_key: 'CAS-PROJ-001',
      message: 'Project created',
      last_sync: new Date().toISOString()
    },
    jue: {
      status: 'connected',
      message: 'Equipment requested',
      last_sync: new Date().toISOString()
    },
    rms: {
      status: 'connected',
      message: 'Resources allocated',
      last_sync: new Date().toISOString()
    },
    crew_db: {
      status: 'connected',
      message: 'Team assigned',
      last_sync: new Date().toISOString()
    }
  };
}

export async function getProjectTimeline(projectId: string): Promise<ProjectTimeline> {
  console.log('📅 getProjectTimeline: Loading timeline for project:', projectId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    project_id: projectId,
    event_date: '2024-02-15',
    phases: {
      discover: { start: '2024-01-01', end: '2024-01-15' },
      build: { start: '2024-01-16', end: '2024-02-01' },
      prepare: { start: '2024-02-02', end: '2024-02-10' },
      deliver: { start: '2024-02-11', end: '2024-02-17' },
      roundup: { start: '2024-02-18', end: '2024-02-25' }
    },
    critical_dates: {
      contract_signed: '2024-01-01',
      site_visit: '2024-01-25',
      equipment_ship: '2024-02-05',
      load_in: '2024-02-10',
      load_out: '2024-02-12'
    },
    calculated_at: new Date().toISOString()
  };
}

export async function updatePhase(phaseId: string, updates: Partial<ProjectPhase>): Promise<ProjectPhase> {
  console.log('📝 updatePhase: Updating phase:', phaseId, updates);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const phase = mockPhases.find(p => p.id === phaseId);
  if (!phase) throw new Error('Phase not found');
  
  return {
    ...phase,
    ...updates,
    updated_at: new Date().toISOString()
  };
}

export async function completePhase(phaseId: string): Promise<ProjectPhase> {
  console.log('✅ completePhase: Completing phase:', phaseId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const phase = mockPhases.find(p => p.id === phaseId);
  if (!phase) throw new Error('Phase not found');
  
  return {
    ...phase,
    status: 'complete',
    progress_percentage: 100,
    completed_at: new Date().toISOString(),
    completed_by: 'current_user',
    updated_at: new Date().toISOString()
  };
}

export async function getProjectTasks(projectId: string): Promise<ProjectTask[]> {
  console.log('📋 getProjectTasks: Loading tasks for project:', projectId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 400));
  return mockTasks;
}

export async function createTask(taskData: Partial<ProjectTask>): Promise<ProjectTask> {
  console.log('➕ createTask: Creating new task:', taskData);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return {
    id: Date.now().toString(),
    project_id: taskData.project_id!,
    phase_id: taskData.phase_id,
    task_name: taskData.task_name!,
    description: taskData.description!,
    assignee_id: taskData.assignee_id,
    assignee: taskData.assignee_id ? mockTeam.find(m => m.id === taskData.assignee_id) : undefined,
    due_date: taskData.due_date,
    status: taskData.status || 'not_started',
    priority: taskData.priority || 'normal',
    estimated_hours: taskData.estimated_hours,
    actual_hours: 0,
    dependencies: taskData.dependencies || [],
    is_critical_path: taskData.is_critical_path || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function updateTask(taskId: string, updates: Partial<ProjectTask>): Promise<ProjectTask> {
  console.log('📝 updateTask: Updating task:', taskId, updates);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const task = mockTasks.find(t => t.id === taskId);
  if (!task) throw new Error('Task not found');
  
  return {
    ...task,
    ...updates,
    updated_at: new Date().toISOString()
  };
}

export async function getTaskComments(taskId: string): Promise<TaskComment[]> {
  console.log('💬 getTaskComments: Loading comments for task:', taskId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return [
    {
      id: '1',
      task_id: taskId,
      user_id: '1',
      user: mockTeam[0],
      comment: 'Started working on this task. Will update progress by EOD.',
      mentions: [],
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    }
  ];
}

export async function createTaskComment(commentData: Partial<TaskComment>): Promise<TaskComment> {
  console.log('💬 createTaskComment: Creating comment:', commentData);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return {
    id: Date.now().toString(),
    task_id: commentData.task_id!,
    user_id: commentData.user_id!,
    user: mockTeam.find(m => m.id === commentData.user_id),
    comment: commentData.comment!,
    mentions: commentData.mentions || [],
    created_at: new Date().toISOString()
  };
}

export async function getCriticalPathAnalysis(projectId: string): Promise<CriticalPathAnalysis> {
  console.log('🎯 getCriticalPathAnalysis: Analyzing critical path for project:', projectId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    total_duration: 45,
    critical_tasks: mockTasks.filter(t => t.is_critical_path),
    float_analysis: [
      { task_id: '1', total_float: 0, free_float: 0, impact_days: 3 },
      { task_id: '2', total_float: 0, free_float: 0, impact_days: 5 }
    ],
    bottlenecks: [
      'Payment terminal configuration blocking system testing',
      'Limited technical resources for parallel development'
    ],
    recommendations: [
      'Consider adding additional technical resources',
      'Implement parallel testing where possible',
      'Create contingency plans for critical tasks'
    ]
  };
}

// Integration Functions
export async function syncToJira(projectId: string): Promise<void> {
  console.log('🔗 syncToJira: Syncing project to Jira:', projectId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
}

export async function syncToJUE(projectId: string): Promise<void> {
  console.log('🔗 syncToJUE: Syncing equipment requests to JUE:', projectId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
}

export async function syncToRMS(projectId: string): Promise<void> {
  console.log('🔗 syncToRMS: Syncing resources to RMS:', projectId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));
}

export async function checkResourceConflicts(projectId: string): Promise<ResourceConflict[]> {
  console.log('⚠️ checkResourceConflicts: Checking for conflicts:', projectId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return []; // No conflicts for now
}

export async function generateEquipmentQR(equipmentId: string): Promise<string> {
  console.log('📱 generateEquipmentQR: Generating QR code for equipment:', equipmentId);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Return mock QR code data URL
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}