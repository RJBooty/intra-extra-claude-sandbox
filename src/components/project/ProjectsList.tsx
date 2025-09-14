import React, { useState, useEffect } from 'react';
import { getActiveProjects, softDeleteProject } from '../../lib/supabase';
import { ProjectBinModal } from './ProjectBinModal';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';
import { Toast } from '../ui/Toast';

interface Project {
  id: string;
  project_id: string;
  client_id: string;
  event_location: string;
  event_start_date: string;
  event_end_date: string;
  expected_attendance: number;
  event_type: string;
  current_phase: number;
  phase_progress: number;
  status: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    company: string;
  };
}

interface ProjectsListProps {
  onNavigate: (section: string) => void;
  onProjectSelect: (project: Project) => void;
  userRole: string;
  userId: string;
}

export function ProjectsList({ onNavigate, onProjectSelect, userRole, userId }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBin, setShowBin] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const canCreateProject = ['master', 'senior'].includes(userRole);
  const canManageProjects = ['master', 'senior'].includes(userRole);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectsData = await getActiveProjects(); // Only get non-deleted projects
      setProjects(projectsData);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!canManageProjects || !userId) {
      setToast({ message: 'You do not have permission to delete projects', type: 'error' });
      return;
    }

    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete || !userId) return;

    try {
      setDeleteLoading(true);
      await softDeleteProject(projectToDelete.id, userId, 'Deleted from projects list');
      
      // Remove the project from the current list
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      
      setToast({ 
        message: `Project "${projectToDelete.project_id}" moved to bin`, 
        type: 'success' 
      });
      
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
      setToast({ 
        message: 'Failed to delete project. Please try again.', 
        type: 'error' 
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleProjectRestored = () => {
    // Reload projects when a project is restored from bin
    loadProjects();
    setToast({ 
      message: 'Project restored successfully', 
      type: 'success' 
    });
  };

  const getPhaseLabel = (phase: number) => {
    const phases = ['Discovery', 'Build', 'Prepare', 'Deliver', 'Roundup'];
    return phases[phase - 1] || 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={loadProjects}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white">
        {/* Header */}
        <div className="flex flex-wrap justify-between gap-3 p-4 border-b">
          <div>
            <h1 className="text-[#101418] tracking-light text-[32px] font-bold leading-tight">
              Projects
            </h1>
            <p className="text-[#637488] text-base font-normal leading-normal">
              Manage your event projects and track their progress
            </p>
          </div>
          
          <div className="flex gap-3">
            {canManageProjects && (
              <button
                onClick={() => setShowBin(true)}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-gray-100 text-[#101418] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-gray-200"
              >
                <div className="text-[#101418]" data-icon="Trash" data-size="20px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                  </svg>
                </div>
                <span className="truncate ml-2">View Bin</span>
              </button>
            )}
            
            {canCreateProject && (
              <button
                onClick={() => onNavigate('new-project')}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#1671d9]"
              >
                <div className="text-white" data-icon="Plus" data-size="20px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                  </svg>
                </div>
                <span className="truncate ml-2">Create Project</span>
              </button>
            )}
          </div>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">No projects found</div>
            {canCreateProject && (
              <button
                onClick={() => onNavigate('new-project')}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 p-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => onProjectSelect(project)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-14"
                    style={{
                      backgroundImage: `url("https://cdn.usegalileo.ai/stability/e635b7e8-8f57-4554-9c96-086efff21f36.png")`
                    }}
                  ></div>
                  <div className="flex flex-col justify-center">
                    <p className="text-[#101418] text-base font-medium leading-normal line-clamp-1">
                      {project.project_id}
                    </p>
                    <p className="text-[#637488] text-sm font-normal leading-normal line-clamp-2">
                      {project.event_location} • {project.client?.company || 'No client'} • {project.expected_attendance} attendees
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      Phase {project.current_phase}: {getPhaseLabel(project.current_phase)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProjectSelect(project);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      View
                    </button>
                    
                    {canManageProjects && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project);
                        }}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Bin Modal */}
      <ProjectBinModal
        isOpen={showBin}
        onClose={() => setShowBin(false)}
        onProjectRestored={handleProjectRestored}
        userRole={userRole}
        userId={userId}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Move Project to Bin"
        message={`Are you sure you want to move "${projectToDelete?.project_id}" to the bin? You can restore it later if needed.`}
        confirmText={deleteLoading ? "Moving..." : "Move to Bin"}
        cancelText="Cancel"
        onConfirm={confirmDeleteProject}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        }}
        isDestructive={true}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}