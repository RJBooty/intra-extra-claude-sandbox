export interface ROICalculation {
  id: string;
  project_id: string;
  calculation_type: 'quick' | 'detailed' | 'comprehensive';
  version: number;
  status: 'draft' | 'submitted' | 'approved';
  
  // Revenue totals
  total_revenue_estimate: number;
  total_revenue_forecast: number;
  total_revenue_actual: number;
  
  // Cost totals
  total_costs_estimate: number;
  total_costs_forecast: number;
  total_costs_actual: number;
  
  // Calculated metrics
  margin_percentage: number;
  roi_percentage: number;
  
  // Approval tracking
  approved_by?: string;
  approved_at?: string;
  
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Related data
  revenue_streams?: RevenueStream[];
  cost_streams?: CostStream[];
  scenarios?: ROIScenario[];
}

export interface RevenueStream {
  id: string;
  roi_calculation_id: string;
  category: 'ticketing_mains' | 'ticketing_addons' | 'cashless' | 'access_accreditation' | 'wristbands_devices' | 'plans_insurance' | 'insights_data' | 'commercial_modules';
  item_name: string;
  unit_price: number;
  quantity: number;
  fee_percentage: number;
  performance_percentage: number;
  
  // Calculated values
  estimate_value: number;
  forecast_value: number;
  actual_value: number;
  
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CostStream {
  id: string;
  roi_calculation_id: string;
  category: 'hardware' | 'staffing' | 'logistics' | 'development' | 'misc';
  item_name: string;
  unit_cost: number;
  quantity: number;
  days: number;
  
  // Calculated values
  estimate_value: number;
  forecast_value: number;
  actual_value: number;
  
  created_at: string;
  updated_at: string;
}

export interface ROITemplate {
  id: string;
  template_name: string;
  event_type: string;
  event_size: string;
  revenue_presets: Record<string, any>;
  cost_presets: Record<string, any>;
  is_custom: boolean;
  created_by: string;
  created_at: string;
}

export interface ROIScenario {
  id: string;
  roi_calculation_id: string;
  scenario_type: 'best' | 'expected' | 'worst';
  attendance_variance: number;
  adoption_rate_variance: number;
  weather_impact: number;
  technical_issues_allowance: number;
  currency_fluctuation: number;
  created_at: string;
}

export interface ROIValidationWarning {
  type: 'approval_required' | 'loss_warning' | 'cost_ratio' | 'capacity_exceeded';
  message: string;
  severity: 'info' | 'warning' | 'error';
}