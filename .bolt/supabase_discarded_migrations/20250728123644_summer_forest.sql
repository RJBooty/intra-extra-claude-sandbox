/*
  # Add missing indexes and optimize database performance

  1. Changes
    - Add missing indexes for better query performance
    - Ensure all foreign key relationships have proper indexes
    - Add composite indexes for common query patterns

  2. Security
    - No changes to RLS policies
*/

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_event_start_date ON projects(event_start_date);
CREATE INDEX IF NOT EXISTS idx_projects_event_end_date ON projects(event_end_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

CREATE INDEX IF NOT EXISTS idx_opportunities_event_date ON opportunities(event_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_decision_date ON opportunities(decision_date);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at);

CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);
CREATE INDEX IF NOT EXISTS idx_clients_classification ON clients(classification);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_projects_client_status ON projects(client_id, status);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner_stage ON opportunities(owner_id, stage);
CREATE INDEX IF NOT EXISTS idx_roi_calculations_project_status ON roi_calculations(project_id, status);