import React, { useState, useEffect } from 'react';
import { Plus, Filter, Calendar, User, AlertTriangle, CheckCircle, Clock, Flag } from 'lucide-react';
import { Project } from '../../types';
import { ProjectTask, ProjectPhase, CriticalPathAnalysis } from '../../types/operations';
import { getProjectTasks, createTask, updateTask, getCriticalPathAnalysis } from '../../lib/operations-api';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { TaskForm } from './TaskForm';
import { TaskDetails } from './TaskDetails';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface TasksTabProps {
  project?: Project;
  phases: ProjectPhase[];
}

export function TasksTab({ project, phases }: TasksTabProps) {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<{
    status: string;
    priority: string;
    phase: string;
    assignee: string;
  }>({
    status: 'all',
    priority: 'all',
    phase: 'all',
    assignee: 'all'
  });
  const [criticalPath, setCriticalPath] = useState<CriticalPathAnalysis | null>(null);
  const [showCriticalPath, setShowCriticalPath] = useState(false);

  useEffect(() => {
    if (project) {
      loadTasks();
      loadCriticalPath();
    }
  }, [project]);

  const loadTasks = async () => {
    if (!project) return;
    
    try {
      setIsLoading(true);
      const tasksData = await getProjectTasks(project.id);
      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCriticalPath = async () => {
    if (!project) return;
    
    try {
      const criticalPathData = await getCriticalPathAnalysis(project.id);
      setCriticalPath(criticalPathData);
    } catch (error) {
      console.error('Error loading critical path:', error);
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

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (filter.status !== 'all' && task.status !== filter.status) return false;
      if (filter.priority !== 'all' && task.priority !== filter.priority) return false;
      if (filter.phase !== 'all' && task.phase_id !== filter.phase) return false;
      if (filter.assignee !== 'all' && task.assignee_id !== filter.assignee) return false;
      return true;
    });
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

  const filteredTasks = getFilteredTasks();
  const criticalTasks = tasks.filter(task => task.is_critical_path);

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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">All Tasks</h2>
            {criticalTasks.length > 0 && (
              <button
                onClick={() => setShowCriticalPath(!showCriticalPath)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  showCriticalPath 
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-50'
                }`}
              >
                <Flag className="w-4 h-4" />
                Path Error ({criticalTasks.length})
              </button>
            )}
          </div>
          <button
            onClick={() => setShowTaskForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="complete">Complete</option>
          </select>

          <select
            value={filter.priority}
            onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filter.phase}
            onChange={(e) => setFilter(prev => ({ ...prev, phase: e.target.value }))}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">All Phases</option>
            {phases.map(phase => (
              <option key={phase.id} value={phase.id}>
                {phase.phase_name.charAt(0).toUpperCase() + phase.phase_name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Critical Path Banner */}
        {showCriticalPath && criticalPath && (
          <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Flag className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-red-800">Path Error Analysis</h3>
            </div>
            <p className="text-sm text-red-700 mb-2">
              Project duration: {criticalPath.total_duration} days
            </p>
            <div className="space-y-1">
              {criticalPath.bottlenecks.map((bottleneck, index) => (
                <p key={index} className="text-sm text-red-600">• {bottleneck}</p>
              ))}
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
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
                    {filteredTasks.map((task) => (
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
                                <div className="text-xs text-red-600 font-medium">Path Error</div>
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
                          <span className="text-sm text-gray-600">
                            {phases.find(p => p.id === task.phase_id)?.phase_name || 'No phase'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-500">Create your first task to get started.</p>
                </div>
              )}
            </div>
          </div>
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
          phases={phases}
          onClose={() => setShowTaskForm(false)}
          onSubmit={handleTaskCreated}
        />
      )}
    </div>
  );
}