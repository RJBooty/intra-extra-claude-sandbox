export interface ProjectNotification {
  id: string;
  project_id: string;
  type: 'task' | 'warning' | 'info' | 'system';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  due_date?: string;
}

export interface NotificationFilter {
  type: 'all' | 'task' | 'warning' | 'info' | 'system';
  unread_only?: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
}