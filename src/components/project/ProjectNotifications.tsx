import React, { useState, useEffect } from 'react';
import { Bell, List as ListBullets, AlertTriangle, Info, Settings, Eye } from 'lucide-react';
import { ProjectNotification, NotificationFilter } from '../../types/notifications';
import { Project } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { format } from 'date-fns';

interface ProjectNotificationsProps {
  project: Project;
}

// Mock notifications data - in a real app this would come from the API
const mockNotifications: ProjectNotification[] = [
  {
    id: '1',
    project_id: 'project-1',
    type: 'task',
    title: 'Review design proposal',
    description: 'Task assigned to you',
    priority: 'medium',
    is_read: false,
    action_url: '/tasks/1',
    action_label: 'View',
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    project_id: 'project-1',
    type: 'warning',
    title: 'Finalize marketing strategy',
    description: 'High priority',
    priority: 'high',
    is_read: false,
    action_url: '/tasks/2',
    action_label: 'View',
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    project_id: 'project-1',
    type: 'info',
    title: 'Updated analytics dashboard',
    description: 'New feature released',
    priority: 'low',
    is_read: true,
    action_url: '/analytics',
    action_label: 'View',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    project_id: 'project-1',
    type: 'system',
    title: 'Upcoming server upgrade',
    description: 'System maintenance',
    priority: 'medium',
    is_read: true,
    action_url: '/system/maintenance',
    action_label: 'View',
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

export function ProjectNotifications({ project }: ProjectNotificationsProps) {
  const [notifications, setNotifications] = useState<ProjectNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>({ type: 'all' });

  useEffect(() => {
    loadNotifications();
  }, [project.id]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      )
    );
  };

  const getFilteredNotifications = () => {
    return notifications.filter(notification => {
      if (filter.type !== 'all' && notification.type !== filter.type) {
        return false;
      }
      if (filter.unread_only && notification.is_read) {
        return false;
      }
      return true;
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task':
        return ListBullets;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      case 'system':
        return Settings;
      default:
        return Bell;
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'text-blue-600';
      case 'warning':
        return 'text-orange-600';
      case 'info':
        return 'text-green-600';
      case 'system':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDueDateText = (notification: ProjectNotification) => {
    if (!notification.due_date) return null;
    
    const dueDate = new Date(notification.due_date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Breadcrumb */}
        <div className="flex flex-wrap gap-2 p-4">
          <a className="text-[#5c728a] text-base font-medium leading-normal" href="#">Projects</a>
          <span className="text-[#5c728a] text-base font-medium leading-normal">/</span>
          <span className="text-[#101418] text-base font-medium leading-normal">{project.project_id}</span>
        </div>

        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <p className="text-[#101418] tracking-light text-[32px] font-bold leading-tight min-w-72">
              Notifications
            </p>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Recent Updates Section */}
        <h2 className="text-[#101418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Recent Updates
        </h2>

        {/* Filter Buttons */}
        <div className="flex gap-3 p-3 flex-wrap pr-4">
          {[
            { key: 'all', label: 'All' },
            { key: 'task', label: 'Tasks' },
            { key: 'warning', label: 'Warnings' },
            { key: 'info', label: 'Info' },
            { key: 'system', label: 'System' },
          ].map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => setFilter({ type: filterOption.key as any })}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full pl-4 pr-4 transition-colors ${
                filter.type === filterOption.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#eaedf1] text-[#101418] hover:bg-gray-300'
              }`}
            >
              <p className="text-sm font-medium leading-normal">{filterOption.label}</p>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-1">
          {filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const iconColor = getNotificationIconColor(notification.type);
            const dueDateText = getDueDateText(notification);
            
            return (
              <div
                key={notification.id}
                className={`flex gap-4 px-4 py-3 justify-between transition-colors hover:bg-gray-100 ${
                  !notification.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex items-center justify-center rounded-lg bg-[#eaedf1] shrink-0 size-12 ${iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <p className={`text-base font-medium leading-normal ${!notification.is_read ? 'text-[#101418] font-semibold' : 'text-[#101418]'}`}>
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    {dueDateText && (
                      <p className={`text-sm font-normal leading-normal ${
                        dueDateText.includes('Overdue') ? 'text-red-600' : 'text-[#5c728a]'
                      }`}>
                        {dueDateText}
                      </p>
                    )}
                    <p className="text-[#5c728a] text-sm font-normal leading-normal">
                      {notification.description}
                    </p>
                    <p className="text-[#5c728a] text-xs font-normal leading-normal">
                      {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Mark as read"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {notification.action_url && (
                    <button
                      onClick={() => {
                        if (!notification.is_read) {
                          markAsRead(notification.id);
                        }
                        // Navigate to action URL
                        console.log('Navigate to:', notification.action_url);
                      }}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 px-4 bg-[#eaedf1] text-[#101418] text-sm font-medium leading-normal w-fit hover:bg-gray-300 transition-colors"
                    >
                      <span className="truncate">{notification.action_label || 'View'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="flex flex-col px-4 py-6">
            <div className="flex flex-col items-center gap-6">
              <div className="w-full max-w-[360px] aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                <Bell className="w-16 h-16 text-gray-400" />
              </div>
              <div className="flex max-w-[480px] flex-col items-center gap-2">
                <p className="text-[#101418] text-lg font-bold leading-tight tracking-[-0.015em] max-w-[480px] text-center">
                  No notifications yet
                </p>
                <p className="text-[#101418] text-sm font-normal leading-normal max-w-[480px] text-center">
                  Stay tuned for updates and alerts related to your project. We'll notify you of any important changes or tasks.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}