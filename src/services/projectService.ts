// src/services/projectService.ts
// Supabase service for Vite + React + Supabase setup

import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Complete types for ALL Core Info project fields
interface ProjectUpdateData {
  // Basic Information
  project_id: string;
  project_code: string;
  client_id?: string;
  event_location: string;
  event_type: string;
  expected_attendance?: number | string;
  description?: string;
  requirements?: string;
  special_notes?: string;

  // Event Dates
  event_start_date: string;
  event_end_date: string;

  // Key Dates (datetime fields)
  onsite_start_date?: string;
  onsite_end_date?: string;
  show_start_date?: string;
  show_end_date?: string;
  load_in_date?: string;
  load_out_date?: string;

  // Cashless Info
  voucher_sale_start?: string;
  voucher_sale_end?: string;
  topup_start?: string;
  topup_end?: string;

  // Refund Info
  refund_window_start?: string;
  refund_window_end?: string;
  refund_fee?: number | string;

  // Delivery & Deadlines
  wristband_order_deadline?: string;
  hardware_onsite_deadline?: string;
  delivery_address?: string;
  delivery_contact_name?: string;
  delivery_contact_phone?: string;
  delivery_contact_email?: string;
  collection_address?: string;
  collection_contact_name?: string;
  collection_contact_phone?: string;
  collection_contact_email?: string;
  same_as_delivery?: boolean;

  // Configuration Settings
  online_vouchers_enabled?: boolean;
  online_topups_enabled?: boolean;
  refund_window_enabled?: boolean;

  // Visual
  event_image?: string;
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
        .neq('id', projectId)
        .eq('is_deleted', false);

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

      // 6. Sanitize and prepare ALL fields for update
      const sanitizedData: any = {
        // Basic Information
        project_id: updateData.project_id.trim(),
        project_code: updateData.project_code.trim(),
        event_location: updateData.event_location.trim(),
        event_type: updateData.event_type.trim(),
        expected_attendance: updateData.expected_attendance ?
          (typeof updateData.expected_attendance === 'string' ? parseInt(updateData.expected_attendance) : updateData.expected_attendance) : null,
        description: updateData.description?.trim() || null,
        requirements: updateData.requirements?.trim() || null,
        special_notes: updateData.special_notes?.trim() || null,

        // Event Dates
        event_start_date: updateData.event_start_date || null,
        event_end_date: updateData.event_end_date || null,

        // Key Dates (datetime)
        onsite_start_date: updateData.onsite_start_date || null,
        onsite_end_date: updateData.onsite_end_date || null,
        show_start_date: updateData.show_start_date || null,
        show_end_date: updateData.show_end_date || null,
        load_in_date: updateData.load_in_date || null,
        load_out_date: updateData.load_out_date || null,

        // Cashless Info
        voucher_sale_start: updateData.voucher_sale_start || null,
        voucher_sale_end: updateData.voucher_sale_end || null,
        topup_start: updateData.topup_start || null,
        topup_end: updateData.topup_end || null,

        // Refund Info
        refund_window_start: updateData.refund_window_start || null,
        refund_window_end: updateData.refund_window_end || null,
        refund_fee: updateData.refund_fee ?
          (typeof updateData.refund_fee === 'string' ? parseFloat(updateData.refund_fee) : updateData.refund_fee) : null,

        // Delivery & Deadlines
        wristband_order_deadline: updateData.wristband_order_deadline || null,
        hardware_onsite_deadline: updateData.hardware_onsite_deadline || null,
        delivery_address: updateData.delivery_address?.trim() || null,
        delivery_contact_name: updateData.delivery_contact_name?.trim() || null,
        delivery_contact_phone: updateData.delivery_contact_phone?.trim() || null,
        delivery_contact_email: updateData.delivery_contact_email?.trim() || null,
        collection_address: updateData.collection_address?.trim() || null,
        collection_contact_name: updateData.collection_contact_name?.trim() || null,
        collection_contact_phone: updateData.collection_contact_phone?.trim() || null,
        collection_contact_email: updateData.collection_contact_email?.trim() || null,
        same_as_delivery: updateData.same_as_delivery ?? false,

        // Configuration Settings
        online_vouchers_enabled: updateData.online_vouchers_enabled ?? true,
        online_topups_enabled: updateData.online_topups_enabled ?? true,
        refund_window_enabled: updateData.refund_window_enabled ?? true,

        // Visual
        event_image: updateData.event_image?.trim() || null,

        // Audit
        updated_at: new Date().toISOString(),
        updated_by: user.id
      };

      // Only include client_id if provided
      if (updateData.client_id) {
        sanitizedData.client_id = updateData.client_id;
      }

      // 7. Perform the update
      const { data: updatedProject, error: updateError } = await supabase
        .from('projects')
        .update(sanitizedData)
        .eq('id', projectId)
        .select(`
          *,
          client:clients(
            id,
            company,
            name,
            email,
            phone,
            classification
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

      // 8. Log the change for audit trail
      console.log('Project update completed:', {
        projectId,
        projectCode: updateData.project_code,
        user: user.id,
        fieldsUpdated: Object.keys(sanitizedData).length
      });

      // 9. Sync to external systems (optional)
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

  // Create a new project
  static async createProject(
    projectData: Omit<ProjectUpdateData, 'project_code'> & { project_code?: string }
  ): Promise<ProjectUpdateResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Check permissions
      const { data: userProfile } = await supabase
        .from('user_roles')
        .select('role_type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!userProfile || !['Master', 'Senior'].includes(userProfile.role_type)) {
        return {
          success: false,
          error: 'Insufficient permissions to create projects'
        };
      }

      // Generate project_code if not provided
      let projectCode = projectData.project_code;
      if (!projectCode) {
        // Auto-generate based on event_location (e.g., GB-0001, US-0001)
        const countryCode = projectData.event_location?.split(',').pop()?.trim().substring(0, 2).toUpperCase() || 'XX';

        // Get count of existing projects with this country code
        const { count } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .like('project_code', `${countryCode}-%`);

        const nextNumber = (count || 0) + 1;
        projectCode = `${countryCode}-${nextNumber.toString().padStart(4, '0')}`;
      }

      // Prepare data for insert
      const insertData: any = {
        project_id: projectData.project_id.trim(),
        project_code: projectCode,
        event_location: projectData.event_location.trim(),
        event_type: projectData.event_type.trim(),
        event_start_date: projectData.event_start_date,
        event_end_date: projectData.event_end_date,
        expected_attendance: projectData.expected_attendance ?
          (typeof projectData.expected_attendance === 'string' ? parseInt(projectData.expected_attendance) : projectData.expected_attendance) : null,
        description: projectData.description?.trim() || null,
        requirements: projectData.requirements?.trim() || null,
        special_notes: projectData.special_notes?.trim() || null,
        client_id: projectData.client_id || null,

        // Defaults
        current_phase: 1,
        phase_progress: 0,
        status: 'Active',
        is_deleted: false,

        // Audit
        created_at: new Date().toISOString(),
        created_by: user.id,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      };

      // Insert project
      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert(insertData)
        .select(`
          *,
          client:clients(
            id,
            company,
            name,
            email,
            phone,
            classification
          )
        `)
        .single();

      if (insertError) {
        console.error('Error creating project:', insertError);
        return {
          success: false,
          error: insertError.message.includes('duplicate') ?
            'Project ID or Project Code already exists' :
            'Failed to create project'
        };
      }

      console.log('Project created successfully:', newProject.id);

      return {
        success: true,
        data: newProject
      };

    } catch (error) {
      console.error('Unexpected error in createProject:', error);
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

    // Example: Create Teams channel
    // await this.createTeamsChannel(project);

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
            id,
            company,
            name,
            email,
            phone,
            classification
          )
        `)
        .eq('id', projectId)
        .eq('is_deleted', false)
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

  // Get all projects
  static async getAllProjects() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { data: projects, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(
            id,
            company,
            name,
            email,
            phone,
            classification
          )
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Failed to fetch projects');
      }

      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  }

  // Soft delete project
  static async deleteProject(projectId: string): Promise<ProjectUpdateResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Check permissions (only Master can delete)
      const { data: userProfile } = await supabase
        .from('user_roles')
        .select('role_type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!userProfile || userProfile.role_type !== 'Master') {
        return {
          success: false,
          error: 'Only Master users can delete projects'
        };
      }

      // Soft delete
      const { error: deleteError } = await supabase
        .from('projects')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: user.id
        })
        .eq('id', projectId);

      if (deleteError) {
        return {
          success: false,
          error: 'Failed to delete project'
        };
      }

      return {
        success: true,
        data: { id: projectId }
      };

    } catch (error) {
      console.error('Error deleting project:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
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

  const createProject = async (projectData: Omit<ProjectUpdateData, 'project_code'> & { project_code?: string }) => {
    const result = await ProjectService.createProject(projectData);

    if (!result.success) {
      toast.error(result.error || 'Failed to create project');
      throw new Error(result.error);
    }

    toast.success('Project created successfully!');
    return result.data;
  };

  const getProject = async (projectId: string) => {
    return await ProjectService.getProjectById(projectId);
  };

  const getAllProjects = async () => {
    return await ProjectService.getAllProjects();
  };

  const deleteProject = async (projectId: string) => {
    const result = await ProjectService.deleteProject(projectId);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete project');
      throw new Error(result.error);
    }

    toast.success('Project deleted successfully');
    return result.data;
  };

  return {
    updateProject,
    createProject,
    getProject,
    getAllProjects,
    deleteProject
  };
};
