import React, { useState, useEffect } from 'react';
import { getDeletedProjects, restoreProject, permanentDeleteProject } from '../../lib/supabase';
import { ConfirmationDialog } from '../ui/ConfirmationDialog';

interface Project {
  id: string;
  project_id: string;
  event_location: string;
  event_type: string;
  expected_attendance: number;
  event_start_date: string;
  event_end_date: string;
  status: string;
  deleted_at: string;
  deleted_by: string;
  client?: {
    name: string;
    company: string;
  };
}

interface ProjectBinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectRestored: () => void;
  userRole: string;
  userId: string;
}

export function ProjectBinModal({ 
  isOpen, 
  onClose, 
  onProjectRestored, 
  userRole, 
  userId 
}: ProjectBinModalProps) {
  const [deletedProjects, setDeletedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const canManageProjects = ['master', 'senior'].includes(userRole);

  useEffect(() => {
    if (isOpen) {
      loadDeletedProjects();
    }
  }, [isOpen]);

  const loadDeletedProjects = async () => {
    setLoading(true);
    try {
      const projects = await getDeletedProjects();
      setDeletedProjects(projects);
    } catch (error) {
      console.error('Failed to load deleted projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (projectId: string) => {
    if (!canManageProjects) return;
    
    try {
      setActionLoading(true);
      await restoreProject(projectId, userId);
      await loadDeletedProjects();
      onProjectRestored();
    } catch (error) {
      console.error('Failed to restore project:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async (projectId: string) => {
    if (!canManageProjects) return;
    
    try {
      setActionLoading(true);
      await permanentDeleteProject(projectId, userId);
      await loadDeletedProjects();
      setShowDeleteConfirm(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to permanently delete project:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Bin</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading deleted projects...</p>
            </div>
          ) : deletedProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No deleted projects found
            </div>
          ) : (
            <div className="space-y-4">
              {deletedProjects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{project.project_id}</h3>
                      <p className="text-sm text-gray-600">{project.event_location}</p>
                      <p className="text-sm text-gray-600">{project.event_type} • {project.expected_attendance} attendees</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Deleted {new Date(project.deleted_at).toLocaleDateString()} at {new Date(project.deleted_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowDetails(true);
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        View Details
                      </button>
                      {canManageProjects && (
                        <>
                          <button
                            onClick={() => handleRestore(project.id)}
                            disabled={actionLoading}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
                          >
                            {actionLoading ? 'Restoring...' : 'Restore'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setShowDeleteConfirm(true);
                            }}
                            disabled={actionLoading}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                          >
                            Delete Forever
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Details Modal */}
      {showDetails && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Details (Read-Only)</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div><strong>Project ID:</strong> {selectedProject.project_id}</div>
              <div><strong>Location:</strong> {selectedProject.event_location}</div>
              <div><strong>Event Type:</strong> {selectedProject.event_type}</div>
              <div><strong>Expected Attendance:</strong> {selectedProject.expected_attendance?.toLocaleString()}</div>
              <div><strong>Start Date:</strong> {new Date(selectedProject.event_start_date).toLocaleDateString()}</div>
              <div><strong>End Date:</strong> {new Date(selectedProject.event_end_date).toLocaleDateString()}</div>
              <div><strong>Status:</strong> {selectedProject.status}</div>
              <div><strong>Client:</strong> {selectedProject.client?.company || 'No client assigned'}</div>
              <div><strong>Deleted:</strong> {new Date(selectedProject.deleted_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Permanently Delete Project"
        message={`Are you sure you want to permanently delete "${selectedProject?.project_id}"? This action cannot be undone and all project data will be lost forever.`}
        confirmText={actionLoading ? "Deleting..." : "Delete Permanently"}
        cancelText="Cancel"
        onConfirm={() => handlePermanentDelete(selectedProject?.id)}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedProject(null);
        }}
        isDestructive={true}
      />
    </>
  );
}