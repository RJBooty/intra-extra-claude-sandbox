import { RevenueStream, CostStream, ROICalculation } from '../types/roi';

// Revenue Calculation Engine
export function calculateRevenueValue(stream: RevenueStream): number {
  const { unit_price, quantity, fee_percentage, performance_percentage } = stream;
  
  switch (stream.category) {
    case 'ticketing_mains':
    case 'ticketing_addons':
      // Ticketing: unit_price * quantity * fee_percentage * performance_percentage
      return unit_price * quantity * (fee_percentage / 100) * (performance_percentage / 100);
    
    case 'cashless':
      // Cashless: Different calculation for transaction-based fees
      if (stream.item_name.toLowerCase().includes('transaction')) {
        return quantity * unit_price * (fee_percentage / 100);
      }
      return unit_price * quantity * (performance_percentage / 100);
    
    case 'wristbands_devices':
      // Wristbands: unit_price * quantity (rental/purchase)
      return unit_price * quantity;
    
    case 'access_accreditation':
    case 'plans_insurance':
    case 'insights_data':
    case 'commercial_modules':
    default:
      // Standard calculation: unit_price * quantity * fee_percentage * performance_percentage
      return unit_price * quantity * (fee_percentage / 100) * (performance_percentage / 100);
  }
}

// Cost Calculation Engine
export function calculateCostValue(stream: CostStream): number {
  const { unit_cost, quantity, days } = stream;
  
  switch (stream.category) {
    case 'staffing':
      // Staffing: daily rate * quantity * days
      return unit_cost * quantity * days;
    
    case 'hardware':
      // Hardware: rental rate * quantity * days OR purchase price * quantity
      return unit_cost * quantity * (days || 1);
    
    case 'logistics':
    case 'development':
    case 'misc':
    default:
      // Standard calculation: unit_cost * quantity * days
      return unit_cost * quantity * (days || 1);
  }
}

// Scenario Application
export function applyScenario(baseCalculation: ROICalculation, scenario: any): ROICalculation {
  const adjusted = { ...baseCalculation };
  
  // Apply attendance variance to volume-based revenue
  if (scenario.attendance_variance) {
    adjusted.total_revenue_estimate *= (1 + scenario.attendance_variance / 100);
  }
  
  // Apply adoption rate to cashless revenue (simplified - would need more granular calculation)
  if (scenario.adoption_rate_variance) {
    adjusted.total_revenue_estimate *= (1 + scenario.adoption_rate_variance / 100);
  }
  
  // Apply weather impact
  if (scenario.weather_impact) {
    adjusted.total_revenue_estimate *= (1 + scenario.weather_impact / 100);
  }
  
  // Apply technical issues to costs
  if (scenario.technical_issues_allowance) {
    adjusted.total_costs_estimate += adjusted.total_costs_estimate * (scenario.technical_issues_allowance / 100);
  }
  
  // Recalculate margin
  adjusted.margin_percentage = ((adjusted.total_revenue_estimate - adjusted.total_costs_estimate) / adjusted.total_revenue_estimate) * 100;
  
  return adjusted;
}

// Currency Conversion
export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string, exchangeRate: number = 1): number {
  if (fromCurrency === toCurrency) return amount;
  return amount * exchangeRate;
}

// Export Functions
export function generateExcelExport(calculation: ROICalculation, includeInternalMargins: boolean = false) {
  // This would generate Excel export data
  // Implementation would depend on chosen Excel library
  return {
    summary: {
      'Total Revenue': calculation.total_revenue_estimate,
      'Total Costs': calculation.total_costs_estimate,
      'Net Margin': calculation.total_revenue_estimate - calculation.total_costs_estimate,
      'Margin %': calculation.margin_percentage
    },
    revenue_streams: calculation.revenue_streams || [],
    cost_streams: calculation.cost_streams || []
  };
}

export function generateQuickBooksInvoice(calculation: ROICalculation) {
  // Map CASFID revenue streams to QuickBooks line items
  const lineItems: any[] = [];
  
  calculation.revenue_streams?.forEach(stream => {
    if (stream.enabled && stream.estimate_value > 0) {
      lineItems.push({
        ItemRef: { value: stream.category.toUpperCase() },
        Description: stream.item_name,
        Amount: stream.estimate_value,
        DetailType: "SalesItemLineDetail"
      });
    }
  });
  
  return {
    Line: lineItems,
    CustomerRef: { value: 'client_qb_id' }, // Would be mapped from client data
    DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
  };
}