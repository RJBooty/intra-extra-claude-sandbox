import React, { useState } from 'react';
import { X, Calendar, User, Flag, Clock, MessageSquare, Edit } from 'lucide-react';
import { ProjectTask, TaskComment } from '../../types/operations';
import { updateTask, getTaskComments, createTaskComment } from '../../lib/operations-api';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TaskDetailsProps {
  task: ProjectTask;
  onClose: () => void;
  onUpdate: (task: ProjectTask) => void;
}

export function TaskDetails({ task, onClose, onUpdate }: TaskDetailsProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  React.useEffect(() => {
    loadComments();
  }, [task.id]);

  const loadComments = async () => {
    try {
      const commentsData = await getTaskComments(task.id);
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleStatusUpdate = async (newStatus: ProjectTask['status']) => {
    setIsUpdatingStatus(true);
    try {
      const updatedTask = await updateTask(task.id, { status: newStatus });
      onUpdate(updatedTask);
      toast.success('Task status updated');
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const comment = await createTaskComment({
        task_id: task.id,
        comment: newComment,
        user_id: 'current_user', // Replace with actual user ID
        mentions: []
      });
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Task Info */}
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.task_name}</h3>
              <p className="text-gray-600">{task.description}</p>
            </div>
            {task.is_critical_path && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                Path Error
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-gray-500" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>{task.assignee?.name || 'Unassigned'}</span>
            </div>
            {task.due_date && (
              <div className="flex items-center gap-2 col-span-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
              </div>
            )}
            {task.estimated_hours && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{task.estimated_hours}h estimated</span>
              </div>
            )}
            {task.jira_ticket_key && (
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-gray-500" />
                <a 
                  href={`https://jira.company.com/browse/${task.jira_ticket_key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {task.jira_ticket_key}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Status Update */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Update Status</h4>
          <div className="grid grid-cols-2 gap-2">
            {['not_started', 'in_progress', 'blocked', 'complete'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status as ProjectTask['status'])}
                disabled={isUpdatingStatus || task.status === status}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  task.status === status
                    ? getStatusColor(status)
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50`}
              >
                {isUpdatingStatus && task.status === status && <LoadingSpinner size="sm" className="mr-1" />}
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Comments */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-900">Comments</h4>
          </div>

          {/* Add Comment */}
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmittingComment && <LoadingSpinner size="sm" />}
                Add Comment
              </button>
            </div>
          </form>

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{comment.user?.name || 'Unknown User'}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.comment}</p>
                </div>
              ))}
              
              {comments.length === 0 && (
                <p className="text-center text-gray-500 py-4">No comments yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}