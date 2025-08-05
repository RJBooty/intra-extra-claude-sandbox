import React, { useState } from 'react';
import { CheckCircle, Clock, AlertTriangle, Users, FileText, Calendar, Plus, Filter, User, Flag } from 'lucide-react';
import { Project } from '../../types';
import { ProjectPhase, ProjectTask } from '../../types/operations';
import { updatePhase, completePhase, getProjectTasks } from '../../lib/operations-api';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { TaskForm } from './TaskForm';
import { TaskDetails } from './TaskDetails';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface PhaseTabProps {
  project?: Project;
  phase?: ProjectPhase;
  onPhaseUpdate: (phase: ProjectPhase) => void;
}

export function PhaseTab({ project, phase, onPhaseUpdate }: PhaseTabProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [checklistItems, setChecklistItems] = useState(
    phase?.checklist_completed || [false, false, false, false, false]
  );

  React.useEffect(() => {
    if (project && phase) {
      loadPhaseTasks();
    }
  }, [project, phase]);

  const loadPhaseTasks = async () => {
    if (!project || !phase) return;
    
    try {
      setIsLoadingTasks(true);
      const allTasks = await getProjectTasks(project.id);
      // Filter tasks for this specific phase
      const phaseTasks = allTasks?.filter(task => task.phase_id === phase.id) || [];
      setTasks(phaseTasks);
    } catch (error) {
      console.error('Error loading phase tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleTaskCreated = (task: ProjectTask) => {
    setTasks(prev => [task, ...prev]);
    setShowTaskForm(false);
    toast.success('Task created successfully!');
  };

  const handleTaskUpdated = (updatedTask: ProjectTask) => {
    setTasks(prev => prev.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
    toast.success('Task updated successfully!');
  };

  if (!phase) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Phase Not Found</h2>
          <p className="text-gray-600">This phase has not been initialized yet.</p>
        </div>
      </div>
    );
  }

  const handleChecklistUpdate = async (index: number, checked: boolean) => {
    const newChecklist = [...checklistItems];
    newChecklist[index] = checked;
    setChecklistItems(newChecklist);

    try {
      setIsUpdating(true);
      const updatedPhase = await updatePhase(phase.id, {
        checklist_completed: newChecklist,
        can_complete: newChecklist.every(item => item === true)
      });
      onPhaseUpdate(updatedPhase);
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast.error('Failed to update checklist');
      // Revert on error
      setChecklistItems(phase.checklist_completed);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompletePhase = async () => {
    if (!phase.can_complete) {
      toast.error('Please complete all checklist items first');
      return;
    }

    try {
      setIsUpdating(true);
      const completedPhase = await completePhase(phase.id);
      onPhaseUpdate(completedPhase);
      toast.success(`${phase.phase_name} phase completed successfully!`);
    } catch (error) {
      console.error('Error completing phase:', error);
      toast.error('Failed to complete phase');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'blocked': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Calendar className="w-4 h-4 text-gray-600" />;
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

  const getPhaseStatusIcon = () => {
    switch (phase.status) {
      case 'complete': return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in_progress': return <Clock className="w-6 h-6 text-blue-600" />;
      case 'blocked': return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default: return <Calendar className="w-6 h-6 text-gray-600" />;
    }
  };

  const getPhaseStatusColor = () => {
    switch (phase.status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 space-y-6">
      {/* Phase Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {getPhaseStatusIcon()}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
              {phase.phase_name} Phase
            </h1>
            <div className="prose prose-sm max-w-none mt-2">
              {phase.phase_name === 'discover' && (
                <p className="text-gray-700">
                  Collect all client requirements, site assessment and custom development to commence planning.
                </p>
              )}
              
              {phase.phase_name === 'build' && (
                <p className="text-gray-700">
                  Detailed planning, system configuration, and preparation of all technical components.
                </p>
              )}
              
              {phase.phase_name === 'prepare' && (
                <p className="text-gray-700">
                  Ensure all systems, assets, operations & logistics are ready for deployment.
                </p>
              )}
              
              {phase.phase_name === 'deliver' && (
                <p className="text-gray-700">
                  The actual event execution and real-time support.
                </p>
              )}
              
              {phase.phase_name === 'roundup' && (
                <p className="text-gray-700">
                  Post-event activities, data collection and general project closure. Used as the basis for renegotiation and/or following events.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getPhaseStatusColor()}`}>
                {phase.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        
        {phase.status !== 'complete' && (
          <button
            onClick={handleCompletePhase}
            disabled={!phase.can_complete || isUpdating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {isUpdating && <LoadingSpinner size="sm" />}
            Complete Phase
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>
            {(() => {
              const totalTasks = tasks.length;
              const completedTasks = tasks.filter(task => task.status === 'complete').length;
              return `${completedTasks}/${totalTasks}`;
            })()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${phase.progress_percentage}%` }}
          />
        </div>
      </div>


      {/* Phase Checklist */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{phase.phase_name} - Key Milestones</h3>
        <div className="space-y-3">
          {phase.checklist_items.map((item, index) => (
            <label key={index} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklistItems[index]}
                onChange={(e) => handleChecklistUpdate(index, e.target.checked)}
                disabled={phase.status === 'complete' || isUpdating}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${
                checklistItems[index] ? 'text-gray-900 line-through' : 'text-gray-700'
              }`}>
                {item}
              </span>
            </label>
          ))}
        </div>
        
        {!phase.can_complete && phase.status !== 'complete' && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Complete all checklist items to finish this phase.
            </p>
          </div>
        )}
      </div>

        </div>

        {/* Tasks Section */}
        <div className="flex-1 overflow-y-auto border-t border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {phase.phase_name.charAt(0).toUpperCase() + phase.phase_name.slice(1)} Tasks
              </h2>
              <button
                onClick={() => setShowTaskForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Task
              </button>
            </div>

            {/* Tasks Table */}
            {isLoadingTasks ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Task</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Priority</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Assignee</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Due Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Phase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tasks.map((task) => (
                        <tr
                          key={task.id}
                          className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                            task.is_critical_path ? 'bg-red-50 border-l-4 border-red-500' : ''
                          }`}
                          onClick={() => setSelectedTask(task)}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <div>
                                <div className="font-medium text-gray-900">{task.task_name}</div>
                                {task.is_critical_path && (
                                  <div className="text-xs text-red-600 font-medium">Critical Path</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              task.status === 'complete' ? 'bg-green-100 text-green-800' :
                              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">
                                {task.assignee?.name || 'Unassigned'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {task.due_date ? (
                              <span className="text-sm text-gray-900">
                                {format(new Date(task.due_date), 'MMM dd, yyyy')}
                              </span>
                            ) : (
                              <span className="text-gray-400">No due date</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-gray-600 capitalize">
                              {phase.phase_name}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {tasks.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks in this phase</h3>
                    <p className="text-gray-500">Create your first task for this phase to get started.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {phase.phase_name.charAt(0).toUpperCase() + phase.phase_name.slice(1)} Comments
          </h2>
          <PhaseComments phaseId={phase.id} />
        </div>
      </div>

      {/* Task Details Sidebar */}
      {selectedTask && (
        <div className="w-96 border-l border-gray-200 bg-white">
          <TaskDetails
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdated}
          />
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <TaskForm
          project={project}
          phases={[phase]}
          onClose={() => setShowTaskForm(false)}
          onSubmit={handleTaskCreated}
        />
      )}
    </div>
  );
}

// Phase Comments Component
interface PhaseCommentsProps {
  phaseId: string;
}

function PhaseComments({ phaseId }: PhaseCommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Mock comment creation - replace with actual API call
      const comment = {
        id: Date.now().toString(),
        phase_id: phaseId,
        user: { name: 'Current User', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
        comment: newComment,
        created_at: new Date().toISOString()
      };
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment... Use @ to mention colleagues"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newComment.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            Add Comment
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <div
              className="w-8 h-8 bg-center bg-no-repeat bg-cover rounded-full flex-shrink-0"
              style={{ backgroundImage: `url("${comment.user.avatar}")` }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-900">{comment.user.name}</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(comment.created_at), 'MMM dd, HH:mm')}
                </span>
              </div>
              <p className="text-sm text-gray-700">{comment.comment}</p>
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-4">No comments yet. Start the discussion!</p>
        )}
      </div>
    </div>
  );
}