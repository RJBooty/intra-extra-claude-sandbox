// src/services/inventoryService.ts
// Service for Equipment Inventory management

import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Equipment Item Types
// MINIMAL - Only includes fields confirmed to exist in database
interface EquipmentItemData {
  sku: string;
  name: string;
  category_id: string;
}

interface ServiceResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class InventoryService {
  // Get all equipment items with category information
  static async getAllEquipment() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Try to fetch equipment - first attempt without is_deleted filter
      let query = supabase
        .from('equipment_items')
        .select(`
          *,
          category:equipment_categories(
            id,
            name,
            description
          )
        `)
        .order('name', { ascending: true });

      // Only add is_deleted filter if column exists
      // Note: Some versions of the migration may not have is_deleted column
      const { data: equipment, error } = await query;

      if (error) {
        throw new Error('Failed to fetch equipment');
      }

      // Transform the data to include category_name
      const transformedData = equipment.map((item: any) => ({
        ...item,
        category_name: item.category?.name || 'Uncategorized'
      }));

      return transformedData;
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  }

  // Get equipment by ID
  static async getEquipmentById(id: string) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { data: equipment, error } = await supabase
        .from('equipment_items')
        .select(`
          *,
          category:equipment_categories(
            id,
            name,
            description
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error('Equipment not found');
      }

      return equipment;
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  }

  // Get equipment by category
  static async getEquipmentByCategory(categoryId: string) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { data: equipment, error } = await supabase
        .from('equipment_items')
        .select(`
          *,
          category:equipment_categories(
            id,
            name,
            description
          )
        `)
        .eq('category_id', categoryId)
        .order('name', { ascending: true });

      if (error) {
        throw new Error('Failed to fetch equipment');
      }

      return equipment;
    } catch (error) {
      console.error('Error fetching equipment by category:', error);
      throw error;
    }
  }

  // Create new equipment item
  static async createEquipment(equipmentData: EquipmentItemData): Promise<ServiceResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Check permissions (only Master/Senior can create)
      const { data: userProfile } = await supabase
        .from('user_roles')
        .select('role_type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!userProfile || !['Master', 'Senior'].includes(userProfile.role_type)) {
        return {
          success: false,
          error: 'Insufficient permissions to create equipment'
        };
      }

      // Validate required fields
      if (!equipmentData.sku?.trim() || !equipmentData.name?.trim() || !equipmentData.category_id) {
        return {
          success: false,
          error: 'SKU, Name, and Category are required'
        };
      }

      // Check for duplicate SKU
      const { data: existing } = await supabase
        .from('equipment_items')
        .select('id, sku')
        .eq('sku', equipmentData.sku.trim())
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: 'SKU already exists'
        };
      }

      // Prepare data for insert (MINIMAL - only confirmed fields)
      const insertData = {
        sku: equipmentData.sku.trim(),
        name: equipmentData.name.trim(),
        category_id: equipmentData.category_id
      };

      // Insert equipment
      const { data: newEquipment, error: insertError } = await supabase
        .from('equipment_items')
        .insert(insertData)
        .select(`
          *,
          category:equipment_categories(
            id,
            name,
            description
          )
        `)
        .single();

      if (insertError) {
        console.error('Error creating equipment:', insertError);
        return {
          success: false,
          error: 'Failed to create equipment'
        };
      }

      console.log('Equipment created successfully:', newEquipment.id);

      return {
        success: true,
        data: newEquipment
      };

    } catch (error) {
      console.error('Unexpected error in createEquipment:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  // Update equipment item
  static async updateEquipment(id: string, equipmentData: Partial<EquipmentItemData>): Promise<ServiceResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Check permissions (only Master/Senior can update)
      const { data: userProfile } = await supabase
        .from('user_roles')
        .select('role_type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!userProfile || !['Master', 'Senior'].includes(userProfile.role_type)) {
        return {
          success: false,
          error: 'Insufficient permissions to update equipment'
        };
      }

      // If SKU is being updated, check for duplicates
      if (equipmentData.sku) {
        const { data: existing } = await supabase
          .from('equipment_items')
          .select('id, sku')
          .eq('sku', equipmentData.sku.trim())
          .neq('id', id)
          .maybeSingle();

        if (existing) {
          return {
            success: false,
            error: 'SKU already exists'
          };
        }
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // MINIMAL - Only confirmed fields
      if (equipmentData.sku !== undefined) updateData.sku = equipmentData.sku.trim();
      if (equipmentData.name !== undefined) updateData.name = equipmentData.name.trim();
      if (equipmentData.category_id !== undefined) updateData.category_id = equipmentData.category_id;

      // Update equipment
      const { data: updatedEquipment, error: updateError } = await supabase
        .from('equipment_items')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          category:equipment_categories(
            id,
            name,
            description
          )
        `)
        .single();

      if (updateError) {
        console.error('Error updating equipment:', updateError);
        return {
          success: false,
          error: 'Failed to update equipment'
        };
      }

      return {
        success: true,
        data: updatedEquipment
      };

    } catch (error) {
      console.error('Unexpected error in updateEquipment:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  // Soft delete equipment item
  static async deleteEquipment(id: string): Promise<ServiceResponse> {
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
          error: 'Only Master users can delete equipment'
        };
      }

      // Check if equipment is currently in use
      const { data: inUse, error: checkError } = await supabase
        .from('project_equipment_planning')
        .select('id')
        .eq('equipment_item_id', id)
        .limit(1);

      if (checkError) {
        console.error('Error checking equipment usage:', checkError);
      }

      if (inUse && inUse.length > 0) {
        return {
          success: false,
          error: 'Cannot delete equipment that is currently assigned to projects'
        };
      }

      // Delete the equipment item
      // Note: This is a hard delete since is_deleted column may not exist
      const { error: deleteError } = await supabase
        .from('equipment_items')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return {
          success: false,
          error: 'Failed to delete equipment'
        };
      }

      return {
        success: true,
        data: { id }
      };

    } catch (error) {
      console.error('Error deleting equipment:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }

  // Get all equipment categories
  static async getCategories() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { data: categories, error } = await supabase
        .from('equipment_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error('Failed to fetch categories');
      }

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Update equipment availability after project assignment
  static async updateAvailability(equipmentId: string, quantityChange: number): Promise<ServiceResponse> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return {
          success: false,
          error: 'Authentication required'
        };
      }

      // Get current availability
      const { data: equipment, error: fetchError } = await supabase
        .from('equipment_items')
        .select('quantity_available')
        .eq('id', equipmentId)
        .single();

      if (fetchError || !equipment) {
        return {
          success: false,
          error: 'Equipment not found'
        };
      }

      const newAvailability = equipment.quantity_available + quantityChange;

      if (newAvailability < 0) {
        return {
          success: false,
          error: 'Insufficient equipment available'
        };
      }

      // Update availability
      const { error: updateError } = await supabase
        .from('equipment_items')
        .update({
          quantity_available: newAvailability,
          updated_at: new Date().toISOString()
        })
        .eq('id', equipmentId);

      if (updateError) {
        return {
          success: false,
          error: 'Failed to update availability'
        };
      }

      return {
        success: true,
        data: { newAvailability }
      };

    } catch (error) {
      console.error('Error updating availability:', error);
      return {
        success: false,
        error: 'An unexpected error occurred'
      };
    }
  }
}

// React hook for easy use in components
export const useInventoryService = () => {
  const getAllEquipment = async () => {
    return await InventoryService.getAllEquipment();
  };

  const getEquipmentById = async (id: string) => {
    return await InventoryService.getEquipmentById(id);
  };

  const createEquipment = async (equipmentData: EquipmentItemData) => {
    const result = await InventoryService.createEquipment(equipmentData);

    if (!result.success) {
      toast.error(result.error || 'Failed to create equipment');
      throw new Error(result.error);
    }

    toast.success('Equipment created successfully!');
    return result.data;
  };

  const updateEquipment = async (id: string, equipmentData: Partial<EquipmentItemData>) => {
    const result = await InventoryService.updateEquipment(id, equipmentData);

    if (!result.success) {
      toast.error(result.error || 'Failed to update equipment');
      throw new Error(result.error);
    }

    toast.success('Equipment updated successfully!');
    return result.data;
  };

  const deleteEquipment = async (id: string) => {
    const result = await InventoryService.deleteEquipment(id);

    if (!result.success) {
      toast.error(result.error || 'Failed to delete equipment');
      throw new Error(result.error);
    }

    toast.success('Equipment deleted successfully');
    return result.data;
  };

  const getCategories = async () => {
    return await InventoryService.getCategories();
  };

  return {
    getAllEquipment,
    getEquipmentById,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    getCategories
  };
};
