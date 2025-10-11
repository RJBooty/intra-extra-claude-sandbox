// src/lib/services/roiService.ts
// Service for managing ROI calculations, revenue, costs, and scenarios

import { supabase } from '../supabase';
import toast from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

export interface ROICalculation {
  id: string;
  project_id: string;
  version: number;
  status: 'Draft' | 'In Review' | 'Locked' | 'Completed';
  locked_at?: string;
  locked_by?: string;
  total_revenue_estimate: number;
  total_cost_estimate: number;
  margin_estimate: number;
  margin_percentage_estimate: number;
  total_revenue_actual: number;
  total_cost_actual: number;
  margin_actual: number;
  margin_percentage_actual: number;
  currency: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface RevenueItem {
  id?: string;
  roi_calculation_id: string;
  category: string;
  sub_category?: string;
  description: string;
  estimate: number;
  actual: number;
  notes?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CostItem {
  id?: string;
  roi_calculation_id: string;
  category: string;
  sub_category?: string;
  description: string;
  estimate: number;
  actual: number;
  source_module?: 'Crew' | 'Logistics' | 'Operations' | 'Manual';
  notes?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Scenario {
  id?: string;
  roi_calculation_id: string;
  scenario_type: 'Best' | 'Expected' | 'Worst';
  total_revenue: number;
  total_cost: number;
  margin: number;
  margin_percentage: number;
  assumptions?: string;
  created_at?: string;
  updated_at?: string;
}

interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// ROI CALCULATION METHODS
// ============================================

export class ROIService {
  /**
   * Get or create ROI calculation for a project
   */
  static async getOrCreateROICalculation(projectId: string): Promise<ServiceResponse<ROICalculation>> {
    try {
      // Try to get existing ROI calculation
      const { data: existing, error: fetchError } = await supabase
        .from('project_roi_calculations')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" which is fine
        throw fetchError;
      }

      if (existing) {
        return { success: true, data: existing };
      }

      // Create new ROI calculation if it doesn't exist
      const { data: { user } } = await supabase.auth.getUser();

      const { data: newCalc, error: createError } = await supabase
        .from('project_roi_calculations')
        .insert({
          project_id: projectId,
          created_by: user?.id,
          updated_by: user?.id,
          currency: 'EUR'
        })
        .select()
        .single();

      if (createError) throw createError;

      return { success: true, data: newCalc };
    } catch (error: any) {
      console.error('Error getting/creating ROI calculation:', error);
      return {
        success: false,
        error: error.message || 'Failed to get/create ROI calculation'
      };
    }
  }

  /**
   * Update ROI calculation
   */
  static async updateROICalculation(
    roiId: string,
    updates: Partial<ROICalculation>
  ): Promise<ServiceResponse<ROICalculation>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('project_roi_calculations')
        .update({
          ...updates,
          updated_by: user?.id
        })
        .eq('id', roiId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating ROI calculation:', error);
      return {
        success: false,
        error: error.message || 'Failed to update ROI calculation'
      };
    }
  }

  /**
   * Lock ROI calculation
   */
  static async lockROI(roiId: string): Promise<ServiceResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('project_roi_calculations')
        .update({
          status: 'Locked',
          locked_at: new Date().toISOString(),
          locked_by: user?.id,
          updated_by: user?.id
        })
        .eq('id', roiId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error locking ROI:', error);
      return {
        success: false,
        error: error.message || 'Failed to lock ROI'
      };
    }
  }

  // ============================================
  // REVENUE METHODS
  // ============================================

  /**
   * Get all revenue items for an ROI calculation
   */
  static async getRevenue(roiCalculationId: string): Promise<ServiceResponse<RevenueItem[]>> {
    try {
      const { data, error } = await supabase
        .from('project_roi_revenue')
        .select('*')
        .eq('roi_calculation_id', roiCalculationId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching revenue:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch revenue items',
        data: []
      };
    }
  }

  /**
   * Add revenue item
   */
  static async addRevenueItem(item: Omit<RevenueItem, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<RevenueItem>> {
    try {
      const { data, error } = await supabase
        .from('project_roi_revenue')
        .insert(item)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error adding revenue item:', error);
      return {
        success: false,
        error: error.message || 'Failed to add revenue item'
      };
    }
  }

  /**
   * Update revenue item
   */
  static async updateRevenueItem(
    itemId: string,
    updates: Partial<RevenueItem>
  ): Promise<ServiceResponse<RevenueItem>> {
    try {
      const { data, error } = await supabase
        .from('project_roi_revenue')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating revenue item:', error);
      return {
        success: false,
        error: error.message || 'Failed to update revenue item'
      };
    }
  }

  /**
   * Delete revenue item (soft delete by setting is_active to false)
   */
  static async deleteRevenueItem(itemId: string): Promise<ServiceResponse> {
    try {
      const { error } = await supabase
        .from('project_roi_revenue')
        .update({ is_active: false })
        .eq('id', itemId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting revenue item:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete revenue item'
      };
    }
  }

  /**
   * Bulk upsert revenue items (for CSV import or bulk updates)
   */
  static async bulkUpsertRevenue(
    roiCalculationId: string,
    items: Omit<RevenueItem, 'id' | 'roi_calculation_id' | 'created_at' | 'updated_at'>[]
  ): Promise<ServiceResponse<RevenueItem[]>> {
    try {
      const itemsWithROI = items.map(item => ({
        ...item,
        roi_calculation_id: roiCalculationId
      }));

      const { data, error } = await supabase
        .from('project_roi_revenue')
        .upsert(itemsWithROI)
        .select();

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error bulk upserting revenue:', error);
      return {
        success: false,
        error: error.message || 'Failed to bulk upsert revenue items',
        data: []
      };
    }
  }

  // ============================================
  // COST METHODS
  // ============================================

  /**
   * Get all cost items for an ROI calculation
   */
  static async getCosts(roiCalculationId: string): Promise<ServiceResponse<CostItem[]>> {
    try {
      const { data, error } = await supabase
        .from('project_roi_costs')
        .select('*')
        .eq('roi_calculation_id', roiCalculationId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching costs:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch cost items',
        data: []
      };
    }
  }

  /**
   * Add cost item
   */
  static async addCostItem(item: Omit<CostItem, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<CostItem>> {
    try {
      const { data, error } = await supabase
        .from('project_roi_costs')
        .insert(item)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error adding cost item:', error);
      return {
        success: false,
        error: error.message || 'Failed to add cost item'
      };
    }
  }

  /**
   * Update cost item
   */
  static async updateCostItem(
    itemId: string,
    updates: Partial<CostItem>
  ): Promise<ServiceResponse<CostItem>> {
    try {
      const { data, error } = await supabase
        .from('project_roi_costs')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating cost item:', error);
      return {
        success: false,
        error: error.message || 'Failed to update cost item'
      };
    }
  }

  /**
   * Delete cost item (soft delete by setting is_active to false)
   */
  static async deleteCostItem(itemId: string): Promise<ServiceResponse> {
    try {
      const { error } = await supabase
        .from('project_roi_costs')
        .update({ is_active: false })
        .eq('id', itemId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting cost item:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete cost item'
      };
    }
  }

  /**
   * Bulk upsert cost items
   */
  static async bulkUpsertCosts(
    roiCalculationId: string,
    items: Omit<CostItem, 'id' | 'roi_calculation_id' | 'created_at' | 'updated_at'>[]
  ): Promise<ServiceResponse<CostItem[]>> {
    try {
      const itemsWithROI = items.map(item => ({
        ...item,
        roi_calculation_id: roiCalculationId
      }));

      const { data, error } = await supabase
        .from('project_roi_costs')
        .upsert(itemsWithROI)
        .select();

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error bulk upserting costs:', error);
      return {
        success: false,
        error: error.message || 'Failed to bulk upsert cost items',
        data: []
      };
    }
  }

  // ============================================
  // SCENARIO METHODS
  // ============================================

  /**
   * Get all scenarios for an ROI calculation
   */
  static async getScenarios(roiCalculationId: string): Promise<ServiceResponse<Scenario[]>> {
    try {
      const { data, error } = await supabase
        .from('project_roi_scenarios')
        .select('*')
        .eq('roi_calculation_id', roiCalculationId)
        .order('scenario_type', { ascending: true });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error fetching scenarios:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch scenarios',
        data: []
      };
    }
  }

  /**
   * Upsert scenario (create or update)
   */
  static async upsertScenario(scenario: Omit<Scenario, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceResponse<Scenario>> {
    try {
      const { data, error } = await supabase
        .from('project_roi_scenarios')
        .upsert(scenario)
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Error upserting scenario:', error);
      return {
        success: false,
        error: error.message || 'Failed to upsert scenario'
      };
    }
  }

  /**
   * Delete scenario
   */
  static async deleteScenario(scenarioId: string): Promise<ServiceResponse> {
    try {
      const { error } = await supabase
        .from('project_roi_scenarios')
        .delete()
        .eq('id', scenarioId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting scenario:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete scenario'
      };
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Calculate totals from revenue and cost items
   * This recalculates the totals on the ROI calculation
   */
  static async recalculateTotals(roiCalculationId: string): Promise<ServiceResponse> {
    try {
      // Get all revenue items
      const revenueResult = await this.getRevenue(roiCalculationId);
      if (!revenueResult.success) throw new Error(revenueResult.error);

      // Get all cost items
      const costResult = await this.getCosts(roiCalculationId);
      if (!costResult.success) throw new Error(costResult.error);

      const revenue = revenueResult.data || [];
      const costs = costResult.data || [];

      // Calculate totals
      const total_revenue_estimate = revenue.reduce((sum, item) => sum + (item.estimate || 0), 0);
      const total_revenue_actual = revenue.reduce((sum, item) => sum + (item.actual || 0), 0);
      const total_cost_estimate = costs.reduce((sum, item) => sum + (item.estimate || 0), 0);
      const total_cost_actual = costs.reduce((sum, item) => sum + (item.actual || 0), 0);

      // Calculate margins
      const margin_estimate = total_revenue_estimate - total_cost_estimate;
      const margin_actual = total_revenue_actual - total_cost_actual;
      const margin_percentage_estimate = total_cost_estimate > 0
        ? ((total_revenue_estimate - total_cost_estimate) / total_cost_estimate) * 100
        : 0;
      const margin_percentage_actual = total_cost_actual > 0
        ? ((total_revenue_actual - total_cost_actual) / total_cost_actual) * 100
        : 0;

      // Update the ROI calculation
      const updateResult = await this.updateROICalculation(roiCalculationId, {
        total_revenue_estimate,
        total_revenue_actual,
        total_cost_estimate,
        total_cost_actual,
        margin_estimate,
        margin_actual,
        margin_percentage_estimate,
        margin_percentage_actual
      });

      return updateResult;
    } catch (error: any) {
      console.error('Error recalculating totals:', error);
      return {
        success: false,
        error: error.message || 'Failed to recalculate totals'
      };
    }
  }
}

// ============================================
// REACT HOOK WRAPPER
// ============================================

export function useROIService() {
  const getOrCreateROI = async (projectId: string) => {
    const result = await ROIService.getOrCreateROICalculation(projectId);
    if (!result.success) {
      toast.error(result.error || 'Failed to load ROI data');
      throw new Error(result.error);
    }
    return result.data!;
  };

  const updateROI = async (roiId: string, updates: Partial<ROICalculation>) => {
    const result = await ROIService.updateROICalculation(roiId, updates);
    if (!result.success) {
      toast.error(result.error || 'Failed to update ROI');
      throw new Error(result.error);
    }
    return result.data!;
  };

  const lockROI = async (roiId: string) => {
    const result = await ROIService.lockROI(roiId);
    if (!result.success) {
      toast.error(result.error || 'Failed to lock ROI');
      throw new Error(result.error);
    }
    toast.success('ROI locked successfully');
  };

  const getRevenue = async (roiCalculationId: string) => {
    const result = await ROIService.getRevenue(roiCalculationId);
    if (!result.success) {
      toast.error(result.error || 'Failed to load revenue data');
    }
    return result.data || [];
  };

  const addRevenueItem = async (item: Omit<RevenueItem, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await ROIService.addRevenueItem(item);
    if (!result.success) {
      toast.error(result.error || 'Failed to add revenue item');
      throw new Error(result.error);
    }
    toast.success('Revenue item added');
    return result.data!;
  };

  const updateRevenueItem = async (itemId: string, updates: Partial<RevenueItem>) => {
    const result = await ROIService.updateRevenueItem(itemId, updates);
    if (!result.success) {
      toast.error(result.error || 'Failed to update revenue item');
      throw new Error(result.error);
    }
    return result.data!;
  };

  const deleteRevenueItem = async (itemId: string) => {
    const result = await ROIService.deleteRevenueItem(itemId);
    if (!result.success) {
      toast.error(result.error || 'Failed to delete revenue item');
      throw new Error(result.error);
    }
    toast.success('Revenue item deleted');
  };

  const bulkUpsertRevenue = async (
    roiCalculationId: string,
    items: Omit<RevenueItem, 'id' | 'roi_calculation_id' | 'created_at' | 'updated_at'>[]
  ) => {
    const result = await ROIService.bulkUpsertRevenue(roiCalculationId, items);
    if (!result.success) {
      toast.error(result.error || 'Failed to save revenue data');
      throw new Error(result.error);
    }
    toast.success('Revenue data saved successfully');
    return result.data || [];
  };

  const getCosts = async (roiCalculationId: string) => {
    const result = await ROIService.getCosts(roiCalculationId);
    if (!result.success) {
      toast.error(result.error || 'Failed to load cost data');
    }
    return result.data || [];
  };

  const addCostItem = async (item: Omit<CostItem, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await ROIService.addCostItem(item);
    if (!result.success) {
      toast.error(result.error || 'Failed to add cost item');
      throw new Error(result.error);
    }
    toast.success('Cost item added');
    return result.data!;
  };

  const updateCostItem = async (itemId: string, updates: Partial<CostItem>) => {
    const result = await ROIService.updateCostItem(itemId, updates);
    if (!result.success) {
      toast.error(result.error || 'Failed to update cost item');
      throw new Error(result.error);
    }
    return result.data!;
  };

  const deleteCostItem = async (itemId: string) => {
    const result = await ROIService.deleteCostItem(itemId);
    if (!result.success) {
      toast.error(result.error || 'Failed to delete cost item');
      throw new Error(result.error);
    }
    toast.success('Cost item deleted');
  };

  const bulkUpsertCosts = async (
    roiCalculationId: string,
    items: Omit<CostItem, 'id' | 'roi_calculation_id' | 'created_at' | 'updated_at'>[]
  ) => {
    const result = await ROIService.bulkUpsertCosts(roiCalculationId, items);
    if (!result.success) {
      toast.error(result.error || 'Failed to save cost data');
      throw new Error(result.error);
    }
    toast.success('Cost data saved successfully');
    return result.data || [];
  };

  const getScenarios = async (roiCalculationId: string) => {
    const result = await ROIService.getScenarios(roiCalculationId);
    if (!result.success) {
      toast.error(result.error || 'Failed to load scenarios');
    }
    return result.data || [];
  };

  const upsertScenario = async (scenario: Omit<Scenario, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await ROIService.upsertScenario(scenario);
    if (!result.success) {
      toast.error(result.error || 'Failed to save scenario');
      throw new Error(result.error);
    }
    toast.success('Scenario saved');
    return result.data!;
  };

  const deleteScenario = async (scenarioId: string) => {
    const result = await ROIService.deleteScenario(scenarioId);
    if (!result.success) {
      toast.error(result.error || 'Failed to delete scenario');
      throw new Error(result.error);
    }
    toast.success('Scenario deleted');
  };

  const recalculateTotals = async (roiCalculationId: string) => {
    const result = await ROIService.recalculateTotals(roiCalculationId);
    if (!result.success) {
      toast.error(result.error || 'Failed to recalculate totals');
      throw new Error(result.error);
    }
  };

  return {
    getOrCreateROI,
    updateROI,
    lockROI,
    getRevenue,
    addRevenueItem,
    updateRevenueItem,
    deleteRevenueItem,
    bulkUpsertRevenue,
    getCosts,
    addCostItem,
    updateCostItem,
    deleteCostItem,
    bulkUpsertCosts,
    getScenarios,
    upsertScenario,
    deleteScenario,
    recalculateTotals
  };
}
