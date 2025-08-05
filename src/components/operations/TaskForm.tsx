import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Project } from '../../types';
import { ProjectTask, ProjectPhase, TeamMember } from '../../types/operations';
import { createTask, getProjectTeam } from '../../lib/operations-api';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

const taskSchema = z.object({
  task_name: z.string().min(1, 'Task name is required'),
  description: z.string().min(1, 'Description is required'),
  phase_id: z.string().optional(),
  assignee_id: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(['critical', 'high', 'normal', 'low']),
  estimated_hours: z.number().min(0).optional(),
  dependencies: z.array(z.string()).default([]),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  project?: Project;
  phases: ProjectPhase[];
  onClose: () => void;
  onSubmit: (task: ProjectTask) => void;
  task?: ProjectTask;
}

export function TaskForm({ project, phases, onClose, onSubmit, task }: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);

  React.useEffect(() => {
    if (project) {
      loadTeam();
    }
  }, [project]);

  const loadTeam = async () => {
    if (!project) return;
    try {
      const teamData = await getProjectTeam(project.id);
      setTeam(teamData || []);
    } catch (error) {
      console.error('Error loading team:', error);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      task_name: task.task_name,
      description: task.description,
      phase_id: task.phase_id,
      assignee_id: task.assignee_id,
      due_date: task.due_date,
      priority: task.priority,
      estimated_hours: task.estimated_hours,
      dependencies: task.dependencies,
    } : {
      priority: 'normal',
      dependencies: [],
    },
  });

  const onFormSubmit = async (data: TaskFormData) => {
    if (!project) return;

    setIsSubmitting(true);
    try {
      const taskData = {
        ...data,
        project_id: project.id,
        status: 'not_started' as const,
        is_critical_path: false,
      };

      const newTask = await createTask(taskData);
      onSubmit(newTask as ProjectTask);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <input
              {...register('task_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task name"
            />
            {errors.task_name && (
              <p className="text-red-600 text-sm mt-1">{errors.task_name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task description"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Phase and Assignee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phase
              </label>
              <select
                {...register('phase_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No phase</option>
                {phases.map(phase => (
                  <option key={phase.id} value={phase.id}>
                    {phase.phase_name.charAt(0).toUpperCase() + phase.phase_name.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <select
                {...register('assignee_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {team.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} - {member.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                {...register('due_date')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Hours
            </label>
            <input
              {...register('estimated_hours', { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              {task ? 'Update' : 'Create'} Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}