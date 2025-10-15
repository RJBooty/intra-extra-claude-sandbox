-- Migration: Add JSON configuration columns for ROI Revenue and Cost builders
-- Description: Adds revenue_config and cost_config JSONB columns to store
-- custom category configurations including columns, formulas, icons, and items

-- Add revenue_config column to store revenue builder configuration
ALTER TABLE project_roi_calculations
ADD COLUMN IF NOT EXISTS revenue_config JSONB DEFAULT NULL;

-- Add cost_config column to store cost builder configuration
ALTER TABLE project_roi_calculations
ADD COLUMN IF NOT EXISTS cost_config JSONB DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN project_roi_calculations.revenue_config IS
'JSON configuration for revenue categories including columns, formulas, icons, colors, and line items';

COMMENT ON COLUMN project_roi_calculations.cost_config IS
'JSON configuration for cost categories including columns, formulas, icons, colors, and line items';

-- Create indexes for better query performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_roi_calculations_revenue_config
ON project_roi_calculations USING GIN (revenue_config);

CREATE INDEX IF NOT EXISTS idx_roi_calculations_cost_config
ON project_roi_calculations USING GIN (cost_config);
