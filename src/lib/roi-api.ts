import { supabase } from './supabase';
import { ROICalculation, RevenueStream, CostStream, ROIValidationWarning } from '../types/roi';

// ROI Calculations API
export async function getROICalculation(projectId: string): Promise<ROICalculation | null> {
  console.log('📊 getROICalculation: Fetching ROI calculation for project:', projectId);
  
  const { data, error } = await supabase
    .from('roi_calculations')
    .select(`
      *,
      revenue_streams(*),
      cost_streams(*),
      roi_scenarios(*)
    `)
    .eq('project_id', projectId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('❌ Error fetching ROI calculation:', error);
    throw error;
  }

  console.log('✅ ROI calculation fetched:', data);
  return data;
}

export async function createROICalculation(calculationData: Partial<ROICalculation>): Promise<ROICalculation> {
  console.log('📊 createROICalculation: Creating new ROI calculation:', calculationData);
  
  const { data, error } = await supabase
    .from('roi_calculations')
    .insert([calculationData])
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating ROI calculation:', error);
    throw error;
  }

  console.log('✅ ROI calculation created:', data);
  return data;
}

export async function updateROICalculation(id: string, updates: Partial<ROICalculation>): Promise<ROICalculation> {
  console.log('📊 updateROICalculation: Updating ROI calculation:', id, updates);
  
  const { data, error } = await supabase
    .from('roi_calculations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('❌ Error updating ROI calculation:', error);
    throw error;
  }

  console.log('✅ ROI calculation updated:', data);
  return data;
}

// Revenue Streams API
export async function createRevenueStream(streamData: Partial<RevenueStream>): Promise<RevenueStream> {
  const { data, error } = await supabase
    .from('revenue_streams')
    .insert([streamData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRevenueStream(id: string, updates: Partial<RevenueStream>): Promise<RevenueStream> {
  const { data, error } = await supabase
    .from('revenue_streams')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Cost Streams API
export async function createCostStream(streamData: Partial<CostStream>): Promise<CostStream> {
  const { data, error } = await supabase
    .from('cost_streams')
    .insert([streamData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCostStream(id: string, updates: Partial<CostStream>): Promise<CostStream> {
  const { data, error } = await supabase
    .from('cost_streams')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Validation Functions
export function validateROICalculation(calculation: ROICalculation): ROIValidationWarning[] {
  const warnings: ROIValidationWarning[] = [];
  
  // Check margin thresholds
  if (calculation.margin_percentage < 50) {
    warnings.push({
      type: 'approval_required',
      message: `Margin ${calculation.margin_percentage.toFixed(1)}% requires approval from Commercial Director`,
      severity: 'warning'
    });
  }
  
  if (calculation.margin_percentage < 0) {
    const loss = calculation.total_costs_estimate - calculation.total_revenue_estimate;
    warnings.push({
      type: 'loss_warning',
      message: `This project will lose $${loss.toLocaleString()}`,
      severity: 'error'
    });
  }
  
  // Check cost ratios
  const crewCostRatio = (calculation.total_costs_estimate / calculation.total_revenue_estimate) * 100;
  if (crewCostRatio > 60) {
    warnings.push({
      type: 'cost_ratio',
      message: `Total costs are ${crewCostRatio.toFixed(1)}% of revenue (recommended max: 60%)`,
      severity: 'warning'
    });
  }
  
  return warnings;
}

// Template Functions
export async function getROITemplates() {
  const { data, error } = await supabase
    .from('roi_templates')
    .select('*')
    .order('template_name');

  if (error) throw error;
  return data;
}

export async function createROITemplate(templateData: any) {
  const { data, error } = await supabase
    .from('roi_templates')
    .insert([templateData])
    .select()
    .single();

  if (error) throw error;
  return data;
}