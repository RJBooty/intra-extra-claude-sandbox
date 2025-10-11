// src/lib/services/siteAllocationService.ts
// Service for managing site allocation (assigning equipment to physical locations)

import { supabase } from '../supabase';
import toast from 'react-hot-toast';

interface SiteAllocationData {
  equipment_item_id: string;
  category: string;
  location_name: string;
  quantity: number;
  notes?: string;
}

interface SiteAllocationItem {
  id: string;
  project_id: string;
  equipment_item_id: string;
  category: string;
  location_name: string;
  quantity: number;
  notes: string | null;
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

export class SiteAllocationService {
  /**
   * Get all site allocations for a project
   */
  static async getProjectSiteAllocations(projectId: string): Promise<SiteAllocationItem[]> {
    try {
      const { data: allocations, error } = await supabase
        .from('project_site_allocation')
        .select(`
          *,
          equipment_item:equipment_items(id, sku, name, category_id)
        `)
        .eq('project_id', projectId)
        .order('category', { ascending: true })
        .order('location_name', { ascending: true });

      if (error) {
        console.error('Error fetching site allocations:', error);
        throw error;
      }

      return allocations || [];
    } catch (error) {
      console.error('Failed to load site allocations:', error);
      throw error;
    }
  }

  /**
   * Add equipment to a specific location
   */
  static async addEquipmentToLocation(
    projectId: string,
    allocationData: SiteAllocationData
  ): Promise<ServiceResponse> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      const insertData = {
        project_id: projectId,
        equipment_item_id: allocationData.equipment_item_id,
        category: allocationData.category,
        location_name: allocationData.location_name,
        quantity: allocationData.quantity,
        notes: allocationData.notes || null,
        created_by: user.id,
        updated_by: user.id
      };

      const { data: newAllocation, error } = await supabase
        .from('project_site_allocation')
        .insert(insertData)
        .select(`
          *,
          equipment_item:equipment_items(id, sku, name, category_id)
        `)
        .single();

      if (error) {
        console.error('Error adding equipment to location:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: newAllocation
      };
    } catch (error: any) {
      console.error('Failed to add equipment to location:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Update site allocation (quantity or notes)
   */
  static async updateSiteAllocation(
    allocationId: string,
    updates: { quantity?: number; notes?: string }
  ): Promise<ServiceResponse> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          error: 'User not authenticated'
        };
      }

      const updateData: any = {
        ...updates,
        updated_by: user.id
      };

      const { data: updatedAllocation, error } = await supabase
        .from('project_site_allocation')
        .update(updateData)
        .eq('id', allocationId)
        .select(`
          *,
          equipment_item:equipment_items(id, sku, name, category_id)
        `)
        .single();

      if (error) {
        console.error('Error updating site allocation:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true,
        data: updatedAllocation
      };
    } catch (error: any) {
      console.error('Failed to update site allocation:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete site allocation
   */
  static async deleteSiteAllocation(allocationId: string): Promise<ServiceResponse> {
    try {
      const { error } = await supabase
        .from('project_site_allocation')
        .delete()
        .eq('id', allocationId);

      if (error) {
        console.error('Error deleting site allocation:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Failed to delete site allocation:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete all allocations for a specific location
   */
  static async clearLocation(
    projectId: string,
    category: string,
    locationName: string
  ): Promise<ServiceResponse> {
    try {
      const { error } = await supabase
        .from('project_site_allocation')
        .delete()
        .eq('project_id', projectId)
        .eq('category', category)
        .eq('location_name', locationName);

      if (error) {
        console.error('Error clearing location:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Failed to clear location:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete all allocations for multiple locations
   */
  static async clearMultipleLocations(
    projectId: string,
    category: string,
    locationNames: string[]
  ): Promise<ServiceResponse> {
    try {
      const { error } = await supabase
        .from('project_site_allocation')
        .delete()
        .eq('project_id', projectId)
        .eq('category', category)
        .in('location_name', locationNames);

      if (error) {
        console.error('Error clearing locations:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Failed to clear locations:', error);
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
}

// React hook wrapper with toast notifications
export function useSiteAllocationService() {
  const getProjectSiteAllocations = async (projectId: string) => {
    try {
      return await SiteAllocationService.getProjectSiteAllocations(projectId);
    } catch (error) {
      toast.error('Failed to load site allocations');
      throw error;
    }
  };

  const addEquipmentToLocation = async (
    projectId: string,
    allocationData: SiteAllocationData
  ) => {
    const result = await SiteAllocationService.addEquipmentToLocation(projectId, allocationData);

    if (!result.success) {
      toast.error(result.error || 'Failed to add equipment to location');
      throw new Error(result.error);
    }

    return result.data;
  };

  const updateSiteAllocation = async (
    allocationId: string,
    updates: { quantity?: number; notes?: string }
  ) => {
    const result = await SiteAllocationService.updateSiteAllocation(allocationId, updates);

    if (!result.success) {
      toast.error(result.error || 'Failed to update allocation');
      throw new Error(result.error);
    }

    return result.data;
  };

  const deleteSiteAllocation = async (allocationId: string) => {
    const result = await SiteAllocationService.deleteSiteAllocation(allocationId);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete allocation');
      throw new Error(result.error);
    }
  };

  const clearLocation = async (projectId: string, category: string, locationName: string) => {
    const result = await SiteAllocationService.clearLocation(projectId, category, locationName);

    if (!result.success) {
      toast.error(result.error || 'Failed to clear location');
      throw new Error(result.error);
    }
  };

  const clearMultipleLocations = async (
    projectId: string,
    category: string,
    locationNames: string[]
  ) => {
    const result = await SiteAllocationService.clearMultipleLocations(projectId, category, locationNames);

    if (!result.success) {
      toast.error(result.error || 'Failed to clear locations');
      throw new Error(result.error);
    }
  };

  return {
    getProjectSiteAllocations,
    addEquipmentToLocation,
    updateSiteAllocation,
    deleteSiteAllocation,
    clearLocation,
    clearMultipleLocations
  };
}
