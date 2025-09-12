// src/services/projectService.ts
// Supabase service for Vite + React + Supabase setup

import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Types for the project update
interface ProjectUpdateData {
  project_id: string;
  project_code: string;
  event_location: string;
  event_start_date: string;
  event_end_date: string;
  expected_attendance: string;
  event_type: string;
  description?: string;
  requirements?: string;
  special_notes?: string;
}

interface ProjectUpdateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class ProjectService {
  // Main update function to be called from your frontend
  static async updateProject(
    projectId: string, 
    updateData: ProjectUpdateData
  ): Promise<ProjectUpdateResponse> {
    try {
      // 1. Get current user for permission check
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // 2. Get user role for permission check
      const { data: userProfile, error: profileError } = await supabase
        .from('user_roles')
        .select('role_type, user_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (profileError || !userProfile) {
        return {
          success: false,
          error: 'User profile not found'
        };
      }

      // 3. Check permissions (only Master/Senior can edit)
      if (!['Master', 'Senior'].includes(userProfile.role_type)) {
        return {
          success: false,
          error: 'Insufficient permissions to edit project information'
        };
      }

      // 4. Validate required fields
      if (!updateData.project_id?.trim() || !updateData.project_code?.trim()) {
        return {
          success: false,
          error: 'Project ID and Project Code are required'
        };
      }

      // 5. Check for duplicates (exclude current project)
      const { data: duplicates, error: duplicateError } = await supabase
        .from('projects')
        .select('id, project_id, project_code')
        .or(`project_id.eq.${updateData.project_id},project_code.eq.${updateData.project_code}`)
        .neq('id', projectId);

      if (duplicateError) {
        console.error('Error checking duplicates:', duplicateError);
        return {
          success: false,
          error: 'Error validating project data'
        };
      }

      if (duplicates && duplicates.length > 0) {
        const conflicts = duplicates.map(d => 
          d.project_id === updateData.project_id ? 'Project ID' : 'Project Code'
        );
        return {
          success: false,
          error: `${conflicts.join(' and ')} already exists`
        };
      }

      // 6. Sanitize and prepare data for update
      const sanitizedData = {
        project_id: updateData.project_id.trim(),
        project_code: updateData.project_code.trim(),
        event_location: updateData.event_location.trim(),
        event_start_date: updateData.event_start_date || null,
        event_end_date: updateData.event_end_date || null,
        expected_attendance: updateData.expected_attendance ? parseInt(updateData.expected_attendance) : null,
        event_type: updateData.event_type.trim(),
        description: updateData.description?.trim() || null,
        requirements: updateData.requirements?.trim() || null,
        special_notes: updateData.special_notes?.trim() || null,
        updated_at: new Date().toISOString()
      };

      // 7. Perform the update
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update(sanitizedData)
        .eq('id', projectId)
        .select(`
          *,
          client:clients(
            company,
            name,
            email
          )
        `)
        .single();

      if (updateError) {
        console.error('Error updating project:', updateError);
        return {
          success: false,
          error: 'Failed to update project information'
        };
      }

      // 7. Log the change for audit trail (removed for now - add audit_logs table if needed)
      console.log('Project update completed:', { projectId, user: user.id, changes: updateData });

      // 8. Sync to external systems (optional)
      try {
        await this.syncToExternalSystems(updatedProject);
      } catch (syncError) {
        console.warn('External system sync failed:', syncError);
        // Don't fail the main operation for sync issues
      }

      return {
        success: true,
        data: updatedProject
      };

    } catch (error) {
      console.error('Unexpected error in updateProject:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  // Sync to external systems (placeholder for future integrations)
  private static async syncToExternalSystems(project: any) {
    // Example: Sync to Jira
    // await this.syncToJira(project);
    
    // Example: Sync to JUE
    // await this.syncToJUE(project);
    
    console.log('External systems sync completed for project:', project.id);
  }

  // Get project with permission check
  static async getProjectById(projectId: string) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Get project with client information
      const { data: project, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(
            company,
            name,
            email
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) {
        throw new Error('Project not found');
      }

      return project;
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  }
}

// React hook for easy use in components
export const useProjectService = () => {
  const updateProject = async (projectId: string, updateData: ProjectUpdateData) => {
    const result = await ProjectService.updateProject(projectId, updateData);
    
    if (!result.success) {
      toast.error(result.error || 'Failed to update project');
      throw new Error(result.error);
    }
    
    toast.success('Project updated successfully!');
    return result.data;
  };

  const getProject = async (projectId: string) => {
    return await ProjectService.getProjectById(projectId);
  };

  return {
    updateProject,
    getProject
  };
};