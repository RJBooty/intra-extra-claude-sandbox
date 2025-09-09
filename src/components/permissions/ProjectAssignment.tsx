import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  X, 
  Users, 
  MapPin, 
  Calendar, 
  Building,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { 
  Project, 
  UserWithPermissions, 
  UserProjectAssignment 
} from '../../types';
import { 
  getProjects, 
  assignUserToProject, 
  removeUserFromProject,
  getUserProjectAssignments 
} from '../../lib/supabase';
import { RoleGuard } from './PermissionGuard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

interface ProjectAssignmentProps {
  userId: string;
  userRole: string;
  onAssignmentChange?: () => void;
}

export function ProjectAssignment({ userId, userRole, onAssignmentChange }: ProjectAssignmentProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<UserProjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('technician');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsData, assignmentsData] = await Promise.all([
        getProjects(),
        getUserProjectAssignments(userId)
      ]);
      
      setProjects(projectsData);
      setAssignments(assignmentsData);
    } catch (error) {
      toast.error('Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (projectId: string) => {
    try {
      await assignUserToProject(userId, projectId, selectedRole, 'current-user-id');
      toast.success('User assigned to project successfully');
      setShowModal(false);
      loadData();
      onAssignmentChange?.();
    } catch (error) {
      toast.error('Failed to assign user to project');
    }
  };

  const handleRemove = async (projectId: string) => {
    try {
      await removeUserFromProject(userId, projectId, 'current-user-id');
      toast.success('User removed from project');
      loadData();
      onAssignmentChange?.();
    } catch (error) {
      toast.error('Failed to remove user from project');
    }
  };

  const assignedProjectIds = new Set(assignments.map(a => a.project_id));
  const availableProjects = projects.filter(p => 
    !assignedProjectIds.has(p.id) &&
    p.project_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <RoleGuard minRole="senior">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Project Assignments</h3>
            <p className="text-sm text-gray-500">
              {userRole === 'external' 
                ? 'External users can only access assigned projects' 
                : 'Manage user access to specific projects'
              }
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Assign Project
          </button>
        </div>

        {/* Current Assignments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-md font-medium text-gray-900">Current Assignments</h4>
          </div>
          <div className="divide-y divide-gray-200">
            {assignments.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No project assignments yet</p>
              </div>
            ) : (
              assignments.map((assignment) => {
                const project = projects.find(p => p.id === assignment.project_id);
                if (!project) return null;

                return (
                  <div key={assignment.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{project.project_code}</h5>
                          <p className="text-sm text-gray-600">{project.event_location}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {assignment.role_on_project}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(assignment.assigned_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                        <button
                          onClick={() => handleRemove(assignment.project_id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Assignment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Assign to Project</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role on Project
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="technician">Technician</option>
                    <option value="coordinator">Coordinator</option>
                    <option value="observer">Observer</option>
                    <option value="specialist">Specialist</option>
                  </select>
                </div>

                {/* Project Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Projects
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search by project code or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Available Projects */}
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                  {availableProjects.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm ? 'No projects found matching your search' : 'No available projects to assign'}
                    </div>
                  ) : (
                    availableProjects.map((project) => (
                      <div
                        key={project.id}
                        className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleAssign(project.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{project.project_code}</h5>
                            <p className="text-sm text-gray-600">{project.event_location}</p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {project.event_start_date}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {project.status}
                              </span>
                            </div>
                          </div>
                          <Plus className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}