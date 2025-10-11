// src/services/logisticsService.ts
// Service for Project Logistics management

import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Equipment planning types
interface EquipmentPlanningData {
  equipment_item_id?: string | null; // null for custom items
  category: string;
  quantity_planned: number;
  notes?: string;
  equipment_name?: string; // For custom items without equipment_item_id
}

interface EquipmentPlanningItem {
  id: string;
  project_id: string;
  equipment_item_id: string | null;
  category: string;
  quantity_planned: number;
  quantity_allocated: number;
  notes: string | null;
  equipment_name: string | null; // For custom items
  created_at: string;
  updated_at: string;
  equipment_item?: {
    id: string;
    sku: string;
    name: string;
    category_id: string;
  } | null;
}

interface ServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class LogisticsService {
  // Get all equipment planning for a project
  static async getProjectEquipmentPlanning(projectId: string): Promise<EquipmentPlanningItem[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { data: planning, error } = await supabase
        .from('project_equipment_planning')
        .select(`
          *,
          equipment_item:equipment_items(
            id,
            sku,
            name,
            category_id
          )
        `)
        .eq('project_id', projectId)
        .order('category', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching equipment planning:', error);
        throw new Error('Failed to fetch equipment planning');
      }

      return planning || [];
    } catch (error) {
      console.error('Error in getProjectEquipmentPlanning:', error);
      throw error;
    }
  }

  // Add equipment to project planning
  static async addEquipmentToProject(
    projectId: string,
    equipmentData: EquipmentPlanningData
  ): Promise<ServiceResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Validate required fields
      if (!equipmentData.category) {
        return {
          success: false,
          error: 'Category is required'
        };
      }

      if (!equipmentData.quantity_planned || equipmentData.quantity_planned < 1) {
        return {
          success: false,
          error: 'Quantity must be at least 1'
        };
      }

      // Prepare insert data
      const insertData: any = {
        project_id: projectId,
        category: equipmentData.category,
        quantity_planned: equipmentData.quantity_planned,
        notes: equipmentData.notes || null,
        created_by: user.id,
        updated_by: user.id
      };

      // Add equipment_item_id if this is from inventory
      if (equipmentData.equipment_item_id) {
        insertData.equipment_item_id = equipmentData.equipment_item_id;
      } else {
        // For custom items, store the name directly
        insertData.equipment_name = equipmentData.equipment_name;
      }

      const { data: newPlanning, error: insertError } = await supabase
        .from('project_equipment_planning')
        .insert(insertData)
        .select(`
          *,
          equipment_item:equipment_items(
            id,
            sku,
            name,
            category_id
          )
        `)
        .single();

      if (insertError) {
        console.error('Error adding equipment to project:', insertError);
        return {
          success: false,
          error: 'Failed to add equipment to project'
        };
      }

      return {
        success: true,
        data: newPlanning
      };
    } catch (error) {
      console.error('Unexpected error in addEquipmentToProject:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  // Update equipment planning item
  static async updateEquipmentPlanning(
    planningId: string,
    updates: { quantity_planned?: number; notes?: string }
  ): Promise<ServiceResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const updateData: any = {
        updated_by: user.id,
        updated_at: new Date().toISOString()
      };

      if (updates.quantity_planned !== undefined) {
        if (updates.quantity_planned < 1) {
          return {
            success: false,
            error: 'Quantity must be at least 1'
          };
        }
        updateData.quantity_planned = updates.quantity_planned;
      }

      if (updates.notes !== undefined) {
        updateData.notes = updates.notes;
      }

      const { data: updated, error: updateError } = await supabase
        .from('project_equipment_planning')
        .update(updateData)
        .eq('id', planningId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating equipment planning:', updateError);
        return {
          success: false,
          error: 'Failed to update equipment planning'
        };
      }

      return {
        success: true,
        data: updated
      };
    } catch (error) {
      console.error('Unexpected error in updateEquipmentPlanning:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  // Delete equipment planning item
  static async deleteEquipmentPlanning(planningId: string): Promise<ServiceResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      const { error: deleteError } = await supabase
        .from('project_equipment_planning')
        .delete()
        .eq('id', planningId);

      if (deleteError) {
        console.error('Error deleting equipment planning:', deleteError);
        return {
          success: false,
          error: 'Failed to delete equipment planning'
        };
      }

      return {
        success: true,
        data: { id: planningId }
      };
    } catch (error) {
      console.error('Unexpected error in deleteEquipmentPlanning:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }
}

// React hook for easy use in components
export const useLogisticsService = () => {
  const getProjectEquipmentPlanning = async (projectId: string) => {
    return await LogisticsService.getProjectEquipmentPlanning(projectId);
  };

  const addEquipmentToProject = async (projectId: string, equipmentData: EquipmentPlanningData) => {
    const result = await LogisticsService.addEquipmentToProject(projectId, equipmentData);

    if (!result.success) {
      toast.error(result.error || 'Failed to add equipment to project');
      throw new Error(result.error);
    }

    toast.success('Equipment added to project');
    return result.data;
  };

  const updateEquipmentPlanning = async (planningId: string, updates: { quantity_planned?: number; notes?: string }) => {
    const result = await LogisticsService.updateEquipmentPlanning(planningId, updates);

    if (!result.success) {
      toast.error(result.error || 'Failed to update equipment');
      throw new Error(result.error);
    }

    return result.data;
  };

  const deleteEquipmentPlanning = async (planningId: string) => {
    const result = await LogisticsService.deleteEquipmentPlanning(planningId);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete equipment');
      throw new Error(result.error);
    }

    toast.success('Equipment removed from project');
    return result.data;
  };

  return {
    getProjectEquipmentPlanning,
    addEquipmentToProject,
    updateEquipmentPlanning,
    deleteEquipmentPlanning
  };
};
