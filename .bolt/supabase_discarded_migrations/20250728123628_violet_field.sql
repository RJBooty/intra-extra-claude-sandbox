/*
  # Add Document Management Tables

  1. New Tables
    - `document_templates`
      - Reusable document templates for proposals and contracts
    - `project_documents`
      - Documents associated with specific projects

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage documents
*/

-- Create document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('proposal', 'contract', 'custom')),
  template_url text,
  created_at timestamptz DEFAULT now()
);

-- Create project documents table
CREATE TABLE IF NOT EXISTS project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  template_id uuid REFERENCES document_templates(id) ON DELETE SET NULL,
  document_name text NOT NULL,
  document_url text NOT NULL,
  document_type text NOT NULL,
  file_size bigint DEFAULT 0 NOT NULL,
  uploaded_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON project_documents(project_id);

-- Enable RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read document templates" ON document_templates;
DROP POLICY IF EXISTS "Authenticated users can manage document templates" ON document_templates;
DROP POLICY IF EXISTS "Authenticated users can read project documents" ON project_documents;
DROP POLICY IF EXISTS "Authenticated users can manage project documents" ON project_documents;

-- Create policies for document templates table
CREATE POLICY "Authenticated users can read document templates"
  ON document_templates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage document templates"
  ON document_templates
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for project documents table
CREATE POLICY "Authenticated users can read project documents"
  ON project_documents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage project documents"
  ON project_documents
  FOR ALL
  TO authenticated
  USING (true);